package com.teraquantai.platform.admin;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminBootstrap implements ApplicationRunner {
    private final JdbcTemplate jdbc;
    private final PasswordEncoder encoder;
    private final String email;
    private final String password;

    public AdminBootstrap(JdbcTemplate jdbc, PasswordEncoder encoder,
            @Value("${app.bootstrap-admin.email:}") String email,
            @Value("${app.bootstrap-admin.password:}") String password) {
        this.jdbc=jdbc; this.encoder=encoder; this.email=email; this.password=password;
    }

    @Override public void run(ApplicationArguments args) {
        if (email == null || email.isBlank() || password == null || password.length() < 12) return;
        String normalized = email.trim().toLowerCase();
        Integer exists = jdbc.queryForObject("select count(*) from users where email=?", Integer.class, normalized);
        if (exists != null && exists == 0) {
            jdbc.update("insert into users(email,password_hash,role,email_verified) values (?,?, 'ADMIN', true)",
                normalized, encoder.encode(password));
        }
    }
}
