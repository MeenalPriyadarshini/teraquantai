package com.teraquantai.platform.notification;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class MailDeliveryService {
    private final JavaMailSender mailSender;
    private final RestClient resendClient;
    private final boolean enabled;
    private final String provider;
    private final String from;
    private final String resendApiKey;

    public MailDeliveryService(JavaMailSender mailSender,
            RestClient.Builder restClientBuilder,
            @Value("${app.mail.enabled:false}") boolean enabled,
            @Value("${app.mail.provider:smtp}") String provider,
            @Value("${app.mail.from}") String from,
            @Value("${app.mail.resend.api-key:}") String resendApiKey,
            @Value("${app.mail.resend.base-url:https://api.resend.com}") String resendBaseUrl) {
        this.mailSender = mailSender;
        this.resendClient = restClientBuilder.baseUrl(resendBaseUrl).build();
        this.enabled = enabled;
        this.provider = provider.trim().toLowerCase(Locale.ROOT);
        this.from = from;
        this.resendApiKey = resendApiKey;
    }

    public void send(String recipient, String subject, String body) {
        if (!enabled) {
            throw new IllegalStateException("Email delivery is disabled. Enable MAIL_ENABLED before requesting email actions.");
        }

        if ("resend".equals(provider)) {
            sendWithResend(recipient, subject, body);
            return;
        }

        if ("smtp".equals(provider)) {
            sendWithSmtp(recipient, subject, body);
            return;
        }

        throw new IllegalStateException("Unsupported email provider. Configure MAIL_PROVIDER as 'smtp' or 'resend'.");
    }

    private void sendWithSmtp(String recipient, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(recipient);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }

    private void sendWithResend(String recipient, String subject, String body) {
        if (resendApiKey == null || resendApiKey.isBlank()) {
            throw new IllegalStateException("Resend is selected but RESEND_API_KEY is not configured.");
        }

        resendClient.post()
            .uri("/emails")
            .headers(headers -> headers.setBearerAuth(resendApiKey))
            .body(Map.of(
                "from", from,
                "to", List.of(recipient),
                "subject", subject,
                "text", body
            ))
            .retrieve()
            .toBodilessEntity();
    }
}
