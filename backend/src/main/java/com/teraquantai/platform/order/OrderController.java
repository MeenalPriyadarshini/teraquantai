package com.teraquantai.platform.order;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.security.Principal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {
    private final JdbcTemplate jdbc;
    public OrderController(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public record CreateOrderRequest(@NotEmpty List<@NotNull UUID> productIds) {}

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public Map<String,Object> create(@Valid @RequestBody CreateOrderRequest request, Principal principal) {
        List<UUID> ids = request.productIds().stream().distinct().toList();
        if (ids.size() != request.productIds().size()) throw new IllegalArgumentException("Duplicate products are not allowed.");
        if (ids.isEmpty()) throw new IllegalArgumentException("Your cart is empty.");

        List<Map<String,Object>> products = new ArrayList<>();
        for (UUID id : ids) {
            List<Map<String,Object>> found = jdbc.queryForList(
                "select id,title,price_paise from products where id=? and status='PUBLISHED'", id);
            if (found.isEmpty()) throw new IllegalArgumentException("One or more reports are no longer available.");
            products.add(found.get(0));
        }

        long total = 0;
        for (Map<String,Object> product : products) {
            Object price = product.get("price_paise");
            if (!(price instanceof Number)) throw new IllegalArgumentException("A report in your cart has no published price yet.");
            total = Math.addExact(total, ((Number) price).longValue());
        }

        UUID orderId = UUID.randomUUID();
        String orderNumber = "TQ-" + orderId.toString().substring(0, 8).toUpperCase();
        UUID userId = jdbc.queryForObject("select id from users where email=?", UUID.class, principal.getName());
        jdbc.update("insert into customer_orders(id,order_number,user_id,total_paise) values (?,?,?,?)", orderId, orderNumber, userId, total);
        for (Map<String,Object> product : products) {
            jdbc.update("insert into order_items(order_id,product_id,product_title_snapshot,unit_price_paise) values (?,?,?,?)",
                orderId, product.get("id"), product.get("title"), ((Number)product.get("price_paise")).longValue());
        }
        return getOrder(orderId, userId);
    }

    @GetMapping("/me")
    public Map<String,Object> mine(Principal principal,
            @RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="10") int size) {
        UUID userId = jdbc.queryForObject("select id from users where email=?", UUID.class, principal.getName());
        int safePage = Math.max(0, page), safeSize = Math.min(50, Math.max(1, size));
        Long total = jdbc.queryForObject("select count(*) from customer_orders where user_id=?", Long.class, userId);
        List<Map<String,Object>> content = jdbc.queryForList(
            "select id,order_number as \"orderNumber\",status,total_paise as \"totalPaise\",currency,created_at as \"createdAt\" from customer_orders where user_id=? order by created_at desc limit ? offset ?",
            userId, safeSize, safePage * safeSize);
        for (Map<String,Object> order : content) {
            UUID id = (UUID) order.get("id");
            order.put("items", jdbc.queryForList("select product_id as \"productId\",product_title_snapshot as title,unit_price_paise as \"pricePaise\", 'INR' as currency from order_items where order_id=?", id));
        }
        long count = total == null ? 0 : total;
        return Map.of("content", content, "page", safePage, "size", safeSize,
            "totalElements", count, "totalPages", (int)Math.ceil((double)count / safeSize));
    }

    @GetMapping("/me/{orderId}")
    public Map<String,Object> one(@PathVariable UUID orderId, Principal principal) {
        UUID userId = jdbc.queryForObject("select id from users where email=?", UUID.class, principal.getName());
        return getOrder(orderId, userId);
    }

    private Map<String,Object> getOrder(UUID orderId, UUID userId) {
        Map<String,Object> order = jdbc.queryForMap(
            "select id,order_number as \"orderNumber\",status,total_paise as \"totalPaise\",currency,created_at as \"createdAt\" from customer_orders where id=? and user_id=?",
            orderId, userId);
        order.put("items", jdbc.queryForList("select product_id as \"productId\",product_title_snapshot as title,unit_price_paise as \"pricePaise\",'INR' as currency from order_items where order_id=?", orderId));
        return order;
    }
}
