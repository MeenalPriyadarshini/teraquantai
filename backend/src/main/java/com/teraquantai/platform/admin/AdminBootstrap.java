package com.teraquantai.platform.admin;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Provisions only the explicitly configured administrator email.
 * Existing customer accounts keep their current password when promoted.
 */
@Component
public class AdminBootstrap implements ApplicationRunner {
    private final JdbcTemplate jdbc;
    private final PasswordEncoder encoder;
    private final String email;
    private final String password;

    public AdminBootstrap(JdbcTemplate jdbc, PasswordEncoder encoder,
            @Value("${app.bootstrap-admin.email:}") String email,
            @Value("${app.bootstrap-admin.password:}") String password) {
        this.jdbc = jdbc;
        this.encoder = encoder;
        this.email = email;
        this.password = password;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (email == null || email.isBlank()) return;

        String normalized = email.trim().toLowerCase();
        Integer exists = jdbc.queryForObject(
            "select count(*) from users where email = ?", Integer.class, normalized);

        if (exists != null && exists > 0) {
            jdbc.update(
                "update users set role='ADMIN', email_verified=true, enabled=true, updated_at=now() "
                    + "where email=? and role <> 'ADMIN'",
                normalized);
            return;
        }

        if (password == null || password.length() < 12) {
            throw new IllegalStateException(
                "ADMIN_EMAIL is configured but no account exists. Set ADMIN_PASSWORD to at least 12 characters to create it.");
        }

        jdbc.update(
            "insert into users(email,password_hash,role,email_verified,enabled) values (?,?, 'ADMIN', true, true)",
            normalized, encoder.encode(password));
    }
}
