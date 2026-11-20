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
    public Map<String, String> health() { return Map.of("status", "UP", "service", "teraquantai-backend"); }

    @GetMapping("/catalog/categories")
    public List<Map<String,Object>> categories() {
        return jdbc.queryForList("select slug,name,coalesce(description,'') as blurb from categories where active=true order by display_order");
    }

    @GetMapping("/catalog/products")
    public Map<String,Object> products(@RequestParam(defaultValue="0") int page,
            @RequestParam(defaultValue="100") int size,
            @RequestParam(required=false) String category,
            @RequestParam(required=false) String search) {
        int safePage = Math.max(0, page), safeSize = Math.min(100, Math.max(1, size));
        String term = search == null ? null : "%" + search.trim().toLowerCase() + "%";
        String where = " from products p join categories c on c.id=p.category_id where p.status='PUBLISHED' "
            + "and (? is null or c.slug=?) and (? is null or lower(p.title || ' ' || p.summary) like ?) ";
        Long total = jdbc.queryForObject("select count(*)" + where, Long.class, category, category, term, term);
        List<Map<String,Object>> content = jdbc.queryForList(
            "select p.id,p.slug,p.title,p.summary,p.market,p.forecast_start_date as \"forecastStartDate\","
            + "p.forecast_end_date as \"forecastEndDate\",p.frequency,p.price_paise as \"pricePaise\","
            + "p.currency,p.file_format as format,lower(p.status) as status "
            + where + "order by p.published_at desc nulls last limit ? offset ?",
            category, category, term, term, safeSize, safePage * safeSize);
        long count = total == null ? 0 : total;
        return Map.of("content", content, "page", safePage, "size", safeSize,
            "totalElements", count, "totalPages", (int)Math.ceil((double)count/safeSize),
            "first", safePage == 0, "last", (safePage+1)*safeSize >= count);
    }

    @GetMapping("/catalog/products/{slug}")
    public Map<String,Object> product(@PathVariable String slug) {
        return jdbc.queryForMap("select p.id,p.slug,p.title,p.summary,p.market,p.forecast_start_date as \"forecastStartDate\","
            + "p.forecast_end_date as \"forecastEndDate\",p.frequency,p.price_paise as \"pricePaise\",p.currency,"
            + "p.file_format as format,lower(p.status) as status from products p where p.slug=? and p.status='PUBLISHED'", slug);
    }
}
