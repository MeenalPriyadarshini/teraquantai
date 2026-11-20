package com.teraquantai.platform.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Map;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    private final JdbcTemplate jdbc;
    private final PasswordEncoder encoder;
    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository contextRepository;
    private final SecureRandom random = new SecureRandom();
    private final String frontendUrl;
    private final int expiryMinutes;

    public AuthController(JdbcTemplate jdbc, PasswordEncoder encoder,
            AuthenticationManager authenticationManager, SecurityContextRepository contextRepository,
            @Value("${app.frontend-url}") String frontendUrl,
            @Value("${app.security.token-expiry-minutes:30}") int expiryMinutes) {
        this.jdbc = jdbc; this.encoder = encoder; this.authenticationManager = authenticationManager;
        this.contextRepository = contextRepository; this.frontendUrl = frontendUrl; this.expiryMinutes = expiryMinutes;
    }

    public record RegisterRequest(@Email @NotBlank String email, @Size(min=8,max=100) String password) {}
    public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}
    public record TokenRequest(@NotBlank String token) {}
    public record ResetRequest(@NotBlank String token, @Size(min=8,max=100) String newPassword) {}
    public record EmailRequest(@Email @NotBlank String email) {}
    public record UserView(String id, String email, String displayName, boolean emailVerified, String role) {}
    public record SessionResponse(UserView user) {}
    public record MessageResponse(String message) {}

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public MessageResponse register(@Valid @RequestBody RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (request.password() == null || request.password().length() < 8)
            throw new IllegalArgumentException("Password must contain at least 8 characters.");
        if (jdbc.queryForObject("select count(*) from users where email = ?", Integer.class, email) > 0)
            throw new IllegalArgumentException("An account with this email may already exist. Try signing in.");
        UUID id = UUID.randomUUID();
        jdbc.update("insert into users(id,email,password_hash,role,email_verified) values (?,?,?,'CUSTOMER',false)",
            id, email, encoder.encode(request.password()));
        issueToken(id, "EMAIL_VERIFY", "verify-email");
        return new MessageResponse("Account created. A verification link has been generated; check the backend console in local development.");
    }

    @PostMapping("/login")
    public SessionResponse login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest,
                                 HttpServletResponse response) {
        String email = request.email().trim().toLowerCase();
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(email, request.password()));
        Boolean verified = jdbc.queryForObject("select email_verified from users where email = ?", Boolean.class, email);
        if (!Boolean.TRUE.equals(verified)) throw new IllegalArgumentException("Please verify your email address before signing in.");
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        contextRepository.saveContext(context, httpRequest, response);
        return new SessionResponse(findUser(email));
    }

    @GetMapping("/me")
    public SessionResponse me(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) throw new org.springframework.security.access.AccessDeniedException("Not signed in");
        return new SessionResponse(findUser(authentication.getName()));
    }

    @PostMapping("/logout")
    public MessageResponse logout(HttpServletRequest request) {
        SecurityContextHolder.clearContext();
        HttpSession session = request.getSession(false);
        if (session != null) session.invalidate();
        return new MessageResponse("Signed out.");
    }

    @PostMapping("/email/verify")
    public MessageResponse verify(@Valid @RequestBody TokenRequest request) {
        UUID userId = consumeToken(request.token(), "EMAIL_VERIFY");
        jdbc.update("update users set email_verified=true, updated_at=now() where id=?", userId);
        return new MessageResponse("Your email address has been verified. You can now sign in.");
    }

    @PostMapping("/email/verification/resend")
    public MessageResponse resend(@Valid @RequestBody EmailRequest request) {
        jdbc.query("select id from users where email=? and email_verified=false", rs -> {
            if (rs.next()) issueToken(rs.getObject("id", UUID.class), "EMAIL_VERIFY", "verify-email");
        }, request.email().trim().toLowerCase());
        return new MessageResponse("If the account needs verification, a new link has been generated.");
    }

    @PostMapping("/password/forgot")
    public MessageResponse forgot(@Valid @RequestBody EmailRequest request) {
        jdbc.query("select id from users where email=?", rs -> {
            if (rs.next()) issueToken(rs.getObject("id", UUID.class), "PASSWORD_RESET", "reset-password");
        }, request.email().trim().toLowerCase());
        return new MessageResponse("If an account exists for that email, password reset instructions will be sent.");
    }

    @PostMapping("/password/reset")
    public MessageResponse reset(@Valid @RequestBody ResetRequest request) {
        if (request.newPassword() == null || request.newPassword().length() < 8)
            throw new IllegalArgumentException("Password must contain at least 8 characters.");
        UUID userId = consumeToken(request.token(), "PASSWORD_RESET");
        jdbc.update("update users set password_hash=?, updated_at=now() where id=?", encoder.encode(request.newPassword()), userId);
        return new MessageResponse("Your password has been updated. You can now sign in.");
    }

    private UserView findUser(String email) {
        return jdbc.queryForObject("select id,email,display_name,email_verified,role from users where email=?",
            (rs, row) -> new UserView(rs.getString("id"), rs.getString("email"), rs.getString("display_name"),
                rs.getBoolean("email_verified"), rs.getString("role")), email);
    }

    private void issueToken(UUID userId, String type, String route) {
        byte[] bytes = new byte[32]; random.nextBytes(bytes);
        String raw = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        jdbc.update("insert into auth_tokens(user_id,token_hash,token_type,expires_at) values (?,?,?,?)",
            userId, hash(raw), type, OffsetDateTime.now().plusMinutes(expiryMinutes));
        // Development-only delivery. Replace with the configured mail sender before production.
        log.warn("DEV ONLY {} link: {}/{}?token={}", type, frontendUrl, route, raw);
    }

    private UUID consumeToken(String raw, String type) {
        return jdbc.query("select user_id,id from auth_tokens where token_hash=? and token_type=? and used_at is null and expires_at>now()",
            rs -> {
                if (!rs.next()) throw new IllegalArgumentException("This link is invalid or has expired.");
                UUID userId = rs.getObject("user_id", UUID.class);
                UUID tokenId = rs.getObject("id", UUID.class);
                jdbc.update("update auth_tokens set used_at=now() where id=?", tokenId);
                return userId;
            }, hash(raw), type);
    }

    private String hash(String value) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8))); }
        catch (Exception ex) { throw new IllegalStateException("Token hashing is unavailable.", ex); }
    }
}
