package com.teraquantai.platform.notification;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class NotificationOutboxService {
    private final JdbcTemplate jdbc;
    private final ObjectMapper objectMapper;

    public NotificationOutboxService(JdbcTemplate jdbc, ObjectMapper objectMapper) {
        this.jdbc = jdbc;
        this.objectMapper = objectMapper;
    }

    /** Adds an in-app/email notification event to the durable outbox for later processing. */
    public void enqueue(UUID userId, String eventType, Map<String, ?> payload) {
        try {
            String json = objectMapper.writeValueAsString(payload);
            jdbc.update("""
                insert into notification_outbox(user_id, event_type, payload, status)
                values (?, ?, cast(? as jsonb), 'PENDING')
                """, userId, eventType, json);
        } catch (JsonProcessingException ex) {
            throw new IllegalArgumentException("Notification payload could not be serialized.", ex);
        }
    }
}
