package com.teraquantai.platform.catalog;

import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class CatalogController {
    private final JdbcTemplate jdbc;
    public CatalogController(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "UP", "service", "teraquantai-backend");
    }

    @GetMapping("/catalog/categories")
    public List<Map<String,Object>> categories() {
        return jdbc.queryForList(
            "select slug,name,coalesce(description,'') as blurb from categories where active=true order by display_order");
    }

    @GetMapping("/catalog/products")
    public Map<String,Object> products(@RequestParam(defaultValue="0") int page,
            @RequestParam(defaultValue="100") int size,
            @RequestParam(required=false) String category,
            @RequestParam(required=false) String search) {
        int safePage = Math.max(0, page), safeSize = Math.min(100, Math.max(1, size));
        String term = search == null || search.isBlank() ? null : "%" + search.trim().toLowerCase() + "%";
        String joins = " from products p join categories c on c.id=p.category_id "
            + "left join lateral (select file_format,version_number,created_at from product_versions "
            + "where product_id=p.id order by version_number desc limit 1) v on true ";
        String where = " where p.status='PUBLISHED' and (? is null or c.slug=?) "
            + "and (? is null or lower(p.title || ' ' || p.summary) like ?) ";
        Long total = jdbc.queryForObject("select count(*) from products p join categories c on c.id=p.category_id "
            + where, Long.class, category, category, term, term);
        List<Map<String,Object>> content = jdbc.queryForList(
            "select p.id,p.slug,p.title,c.slug as \"categorySlug\",p.summary,p.market,"
            + "p.forecast_start_date as \"forecastStartDate\",p.forecast_end_date as \"forecastEndDate\","
            + "p.frequency,p.price_paise as \"pricePaise\",p.currency,"
            + "coalesce(v.file_format,p.file_format) as format,lower(p.status) as status,"
            + "v.version_number as \"versionNumber\",v.created_at as \"versionCreatedAt\" "
            + joins + where + "order by p.published_at desc nulls last limit ? offset ?",
            category, category, term, term, safeSize, safePage * safeSize);
        long count = total == null ? 0 : total;
        return Map.of("content", content, "page", safePage, "size", safeSize,
            "totalElements", count, "totalPages", (int)Math.ceil((double)count/safeSize),
            "first", safePage == 0, "last", (safePage+1)*safeSize >= count);
    }

    @GetMapping("/catalog/products/featured")
    public List<Map<String,Object>> featured(@RequestParam(defaultValue="6") int limit) {
        int safeLimit = Math.min(12, Math.max(1, limit));
        return jdbc.queryForList(
            "select p.id,p.slug,p.title,c.slug as \"categorySlug\",p.summary,p.market,"
            + "p.forecast_start_date as \"forecastStartDate\",p.forecast_end_date as \"forecastEndDate\","
            + "p.frequency,p.price_paise as \"pricePaise\",p.currency,"
            + "coalesce(v.file_format,p.file_format) as format,lower(p.status) as status "
            + "from products p join categories c on c.id=p.category_id "
            + "left join lateral (select file_format from product_versions where product_id=p.id "
            + "order by version_number desc limit 1) v on true "
            + "where p.status='PUBLISHED' order by p.published_at desc nulls last limit ?",
            safeLimit);
    }

    @GetMapping("/catalog/products/{slug}")
    public Map<String,Object> product(@PathVariable String slug) {
        return jdbc.queryForMap(
            "select p.id,p.slug,p.title,c.slug as \"categorySlug\",p.summary,p.market,"
            + "p.forecast_start_date as \"forecastStartDate\",p.forecast_end_date as \"forecastEndDate\","
            + "p.frequency,p.price_paise as \"pricePaise\",p.currency,"
            + "coalesce(v.file_format,p.file_format) as format,lower(p.status) as status,"
            + "v.version_number as \"versionNumber\",v.created_at as \"versionCreatedAt\" "
            + "from products p join categories c on c.id=p.category_id "
            + "left join lateral (select file_format,version_number,created_at from product_versions "
            + "where product_id=p.id order by version_number desc limit 1) v on true "
            + "where p.slug=? and p.status='PUBLISHED'", slug);
    }
}
