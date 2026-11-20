package com.teraquantai.platform.security;

import java.util.Map;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Forces Spring's deferred CSRF token to be generated and written to XSRF-TOKEN cookie. */
@RestController
@RequestMapping("/api/v1/auth")
public class CsrfController {
    @GetMapping("/csrf")
    public Map<String, String> csrf(CsrfToken token) {
        return Map.of("token", token.getToken());
    }
}
