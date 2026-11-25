package com.teraquantai.platform.notification;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class MailDeliveryService {
    private final JavaMailSender mailSender;
    private final boolean enabled;
    private final String from;

    public MailDeliveryService(JavaMailSender mailSender,
            @Value("${app.mail.enabled:false}") boolean enabled,
            @Value("${app.mail.from}") String from) {
        this.mailSender = mailSender;
        this.enabled = enabled;
        this.from = from;
    }

    public void send(String recipient, String subject, String body) {
        if (!enabled) {
            throw new IllegalStateException("Email delivery is disabled. Configure MAIL_* settings before requesting email actions.");
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(recipient);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }
}
