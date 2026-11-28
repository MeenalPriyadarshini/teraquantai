package com.teraquantai.platform.admin;

import com.teraquantai.platform.storage.PrivateFileStorage;
import jakarta.validation.constraints.NotBlank;
import java.io.IOException;
import java.security.Principal;
import java.sql.Date;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {
    private final JdbcTemplate jdbc;
    private final PrivateFileStorage storage;

    public AdminController(JdbcTemplate jdbc, PrivateFileStorage storage) {
        this.jdbc = jdbc;
        this.storage = storage;
    }

    @GetMapping("/dashboard")
    public Map<String,Object> dashboard() {
        return Map.of(
            "publishedProducts", count("select count(*) from products where status='PUBLISHED'"),
            "draftProducts", count("select count(*) from products where status='DRAFT'"),
            "archivedProducts", count("select count(*) from products where status='ARCHIVED'"),
            "totalProducts", count("select count(*) from products"),
            "customers", count("select count(*) from users where role='CUSTOMER'"),
            "totalOrders", count("select count(*) from customer_orders"));
    }

    @GetMapping("/categories")
    public List<Map<String,Object>> categories() {
        return jdbc.queryForList(
            "select id,slug,name,coalesce(description,'') as description,display_order as \"displayOrder\",active "
                + "from categories order by display_order,name");
    }

    public record CategoryRequest(@NotBlank String slug, @NotBlank String name, String description, Integer displayOrder) {}

    @PostMapping("/categories")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String,Object> createCategory(@RequestBody CategoryRequest request) {
        String slug = normalizeSlug(request.slug());
        UUID id = UUID.randomUUID();
        jdbc.update("insert into categories(id,slug,name,description,display_order,active) values (?,?,?,?,?,true)",
            id, slug, request.name().trim(), blankToNull(request.description()),
            request.displayOrder() == null ? 0 : request.displayOrder());
        return category(id);
    }

    @PatchMapping("/categories/{id}")
    public Map<String,Object> updateCategory(@PathVariable UUID id, @RequestBody Map<String,Object> body) {
        if (body.containsKey("name")) {
            String name = String.valueOf(body.get("name")).trim();
            if (name.isBlank()) throw new IllegalArgumentException("Category name is required.");
            jdbc.update("update categories set name=? where id=?", name, id);
        }
        if (body.containsKey("description"))
            jdbc.update("update categories set description=? where id=?", blankToNull((String) body.get("description")), id);
        if (body.containsKey("displayOrder"))
            jdbc.update("update categories set display_order=? where id=?", ((Number) body.get("displayOrder")).intValue(), id);
        if (body.containsKey("active"))
            jdbc.update("update categories set active=? where id=?", Boolean.TRUE.equals(body.get("active")), id);
        return category(id);
    }

    @GetMapping("/products")
    public List<Map<String,Object>> products(@RequestParam(required=false) String status,
            @RequestParam(required=false) String search) {
        String normalizedStatus = status == null || status.isBlank() ? null : status.trim().toUpperCase();
        if (normalizedStatus != null && !List.of("DRAFT","PUBLISHED","ARCHIVED").contains(normalizedStatus))
            throw new IllegalArgumentException("Unknown product status.");
        String term = search == null || search.isBlank() ? null : "%" + search.trim().toLowerCase() + "%";
        return jdbc.queryForList(
            "select p.id,p.slug,p.title,p.category_id as \"categoryId\",c.slug as \"categorySlug\",c.name as \"categoryName\","
                + "p.summary,p.market,p.forecast_start_date as \"forecastStartDate\",p.forecast_end_date as \"forecastEndDate\","
                + "p.frequency,p.price_paise as \"pricePaise\",p.currency,p.file_format as format,p.status,"
                + "p.published_at as \"publishedAt\","
                + "(select count(*) from product_versions v where v.product_id=p.id) as \"versionCount\","
                + "(select max(version_number) from product_versions v where v.product_id=p.id) as \"latestVersion\" "
                + "from products p join categories c on c.id=p.category_id "
                + "where (? is null or p.status=?) and (? is null or lower(p.title || ' ' || p.slug) like ?) "
                + "order by p.updated_at desc",
            normalizedStatus, normalizedStatus, term, term);
    }

    public record ProductRequest(
        @NotBlank String title, @NotBlank String slug, @NotBlank String categorySlug,
        @NotBlank String summary, String market, LocalDate forecastStartDate,
        LocalDate forecastEndDate, String frequency, Long pricePaise, String format) {}

    @PostMapping("/products")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public Map<String,Object> createProduct(@RequestBody ProductRequest request) {
        validateProduct(request);
        UUID categoryId = jdbc.queryForObject("select id from categories where slug=? and active=true",
            UUID.class, request.categorySlug().trim());
        UUID id = UUID.randomUUID();
        jdbc.update(
            "insert into products(id,slug,title,category_id,summary,market,forecast_start_date,forecast_end_date,frequency,price_paise,currency,file_format,status) "
                + "values (?,?,?,?,?,?,?,?,?,?,'INR',?,'DRAFT')",
            id, normalizeSlug(request.slug()), request.title().trim(), categoryId, request.summary().trim(),
            blankToNull(request.market()), request.forecastStartDate(), request.forecastEndDate(),
            blankToNull(request.frequency()), request.pricePaise(), normalizeFormat(request.format()));
        return product(id);
    }

    @PatchMapping("/products/{id}")
    @Transactional
    public Map<String,Object> updateProduct(@PathVariable UUID id, @RequestBody ProductRequest request) {
        product(id);
        validateProduct(request);
        UUID categoryId = jdbc.queryForObject("select id from categories where slug=? and active=true",
            UUID.class, request.categorySlug().trim());
        jdbc.update(
            "update products set slug=?,title=?,category_id=?,summary=?,market=?,forecast_start_date=?,forecast_end_date=?,frequency=?,price_paise=?,file_format=?,updated_at=now() where id=?",
            normalizeSlug(request.slug()), request.title().trim(), categoryId, request.summary().trim(),
            blankToNull(request.market()), request.forecastStartDate(), request.forecastEndDate(),
            blankToNull(request.frequency()), request.pricePaise(), normalizeFormat(request.format()), id);
        return product(id);
    }

    @PostMapping("/products/{id}/files")
    @Transactional
    public Map<String,Object> uploadInitialFile(@PathVariable UUID id, @RequestParam("file") MultipartFile file,
            @RequestParam(required=false) String changeSummary, Principal principal) throws IOException {
        Map<String,Object> product = product(id);
        Long versions = jdbc.queryForObject("select count(*) from product_versions where product_id=?", Long.class, id);
        if (versions != null && versions > 0)
            throw new IllegalArgumentException("This product already has a report. Use the add-version action for corrections.");
        return storeVersion(id, file, false, changeSummary, principal);
    }

    @PostMapping("/products/{id}/versions")
    @Transactional
    public Map<String,Object> addVersion(@PathVariable UUID id, @RequestParam("file") MultipartFile file,
            @RequestParam(required=false) String changeSummary, Principal principal) throws IOException {
        product(id);
        return storeVersion(id, file, true, changeSummary, principal);
    }

    private Map<String,Object> storeVersion(UUID productId, MultipartFile file, boolean correction,
            String changeSummary, Principal principal) throws IOException {
        String key = storage.store(file);
        String original = file.getOriginalFilename() == null ? "report" : file.getOriginalFilename();
        String format = original.substring(original.lastIndexOf('.') + 1).toUpperCase();
        if ("PPTX".equals(format)) format = "PPT";
        Integer next = jdbc.queryForObject(
            "select coalesce(max(version_number),0)+1 from product_versions where product_id=?",
            Integer.class, productId);
        UUID userId = jdbc.queryForObject("select id from users where email=?", UUID.class, principal.getName());
        String sha = sha256(storage.resolve(key));
        jdbc.update(
            "insert into product_versions(product_id,version_number,storage_key,file_format,original_filename,file_size_bytes,sha256,is_correction,change_summary,created_by) "
                + "values (?,?,?,?,?,?,?,?,?,?)",
            productId, next, key, format, safeFilename(original), file.getSize(), sha, correction,
            blankToNull(changeSummary), userId);
        jdbc.update("update products set file_format=?,updated_at=now() where id=?", format, productId);
        return Map.of("product", product(productId), "versionNumber", next, "format", format,
            "originalFilename", safeFilename(original), "fileSizeBytes", file.getSize());
    }

    @PostMapping("/products/{id}/publish")
    @Transactional
    public Map<String,Object> publish(@PathVariable UUID id) {
        Map<String,Object> item = product(id);
        Long versionCount = jdbc.queryForObject("select count(*) from product_versions where product_id=?", Long.class, id);
        if (versionCount == null || versionCount == 0)
            throw new IllegalArgumentException("Upload a report file before publishing this product.");
        Object price = item.get("pricePaise");
        if (!(price instanceof Number) || ((Number) price).longValue() <= 0)
            throw new IllegalArgumentException("Set a selling price greater than zero before publishing.");
        jdbc.update("update products set status='PUBLISHED',published_at=coalesce(published_at,now()),updated_at=now() where id=?", id);
        return product(id);
    }

    @PostMapping("/products/{id}/unpublish")
    public Map<String,Object> unpublish(@PathVariable UUID id) {
        product(id);
        jdbc.update("update products set status='DRAFT',published_at=null,updated_at=now() where id=?", id);
        return product(id);
    }

    @PostMapping("/products/{id}/archive")
    public Map<String,Object> archive(@PathVariable UUID id) {
        product(id);
        jdbc.update("update products set status='ARCHIVED',updated_at=now() where id=?", id);
        return product(id);
    }

    @GetMapping("/products/{id}/versions")
    public List<Map<String,Object>> versions(@PathVariable UUID id) {
        product(id);
        return jdbc.queryForList(
            "select version_number as \"versionNumber\",file_format as format,original_filename as \"originalFilename\","
                + "file_size_bytes as \"fileSizeBytes\",is_correction as \"isCorrection\","
                + "change_summary as \"changeSummary\",created_at as \"createdAt\" "
                + "from product_versions where product_id=? order by version_number desc", id);
    }

    private Map<String,Object> product(UUID id) {
        return jdbc.queryForMap(
            "select p.id,p.slug,p.title,p.category_id as \"categoryId\",c.slug as \"categorySlug\",c.name as \"categoryName\","
                + "p.summary,p.market,p.forecast_start_date as \"forecastStartDate\",p.forecast_end_date as \"forecastEndDate\","
                + "p.frequency,p.price_paise as \"pricePaise\",p.currency,p.file_format as format,p.status,"
                + "p.published_at as \"publishedAt\",(select count(*) from product_versions v where v.product_id=p.id) as \"versionCount\" "
                + "from products p join categories c on c.id=p.category_id where p.id=?", id);
    }

    private Map<String,Object> category(UUID id) {
        return jdbc.queryForMap(
            "select id,slug,name,coalesce(description,'') as description,display_order as \"displayOrder\",active from categories where id=?", id);
    }

    private long count(String sql) {
        Long value = jdbc.queryForObject(sql, Long.class);
        return value == null ? 0 : value;
    }

    private void validateProduct(ProductRequest request) {
        if (request == null) throw new IllegalArgumentException("Product details are required.");
        if (request.pricePaise() != null && request.pricePaise() < 0)
            throw new IllegalArgumentException("Price cannot be negative.");
        if (request.forecastStartDate() != null && request.forecastEndDate() != null
                && request.forecastEndDate().isBefore(request.forecastStartDate()))
            throw new IllegalArgumentException("Forecast end date must be on or after the start date.");
        normalizeFormat(request.format());
        normalizeSlug(request.slug());
    }

    private String normalizeFormat(String value) {
        String format = value == null ? "" : value.trim().toUpperCase();
        if (!List.of("PDF","PPT").contains(format)) throw new IllegalArgumentException("Report format must be PDF or PPT.");
        return format;
    }

    private String normalizeSlug(String value) {
        String slug = value == null ? "" : value.trim().toLowerCase();
        if (!slug.matches("[a-z0-9]+(?:-[a-z0-9]+)*"))
            throw new IllegalArgumentException("Slug may contain lowercase letters, numbers and single hyphens only.");
        return slug;
    }

    private String blankToNull(String value) { return value == null || value.isBlank() ? null : value.trim(); }

    private String safeFilename(String value) {
        String name = value.replaceAll("[\\\\/\\r\\n\\t]", "_").trim();
        return name.length() > 255 ? name.substring(name.length() - 255) : name;
    }

    private String sha256(java.nio.file.Path path) throws IOException {
        try {
            byte[] digest = java.security.MessageDigest.getInstance("SHA-256").digest(java.nio.file.Files.readAllBytes(path));
            return java.util.HexFormat.of().formatHex(digest);
        } catch (java.security.NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is unavailable.", ex);
        }
    }
}
