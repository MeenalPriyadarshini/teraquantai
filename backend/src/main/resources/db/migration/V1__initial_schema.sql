CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(254) NOT NULL,
    password_hash VARCHAR(100) NOT NULL,
    display_name VARCHAR(120),
    role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER' CHECK (role IN ('CUSTOMER','ADMIN')),
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_users_email UNIQUE (email)
);

CREATE TABLE auth_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash CHAR(64) NOT NULL UNIQUE,
    token_type VARCHAR(30) NOT NULL CHECK (token_type IN ('EMAIL_VERIFY','PASSWORD_RESET')),
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ix_auth_tokens_user_type ON auth_tokens(user_id, token_type, expires_at);

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(180) NOT NULL UNIQUE,
    title VARCHAR(240) NOT NULL,
    category_id UUID NOT NULL REFERENCES categories(id),
    summary TEXT NOT NULL,
    market VARCHAR(180),
    forecast_start_date DATE,
    forecast_end_date DATE,
    frequency VARCHAR(100),
    price_paise BIGINT CHECK (price_paise IS NULL OR price_paise >= 0),
    currency CHAR(3) NOT NULL DEFAULT 'INR' CHECK (currency = 'INR'),
    file_format VARCHAR(10) CHECK (file_format IN ('PDF','PPT')),
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    published_at TIMESTAMPTZ
);

CREATE TABLE product_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id),
    version_number INTEGER NOT NULL,
    storage_key TEXT NOT NULL,
    file_format VARCHAR(10) NOT NULL CHECK (file_format IN ('PDF','PPT')),
    original_filename VARCHAR(255) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    sha256 CHAR(64) NOT NULL,
    is_correction BOOLEAN NOT NULL DEFAULT FALSE,
    change_summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES users(id),
    UNIQUE(product_id, version_number)
);

CREATE TABLE customer_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(40) NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_PAYMENT'
      CHECK (status IN ('PENDING_PAYMENT','PAYMENT_UNDER_REVIEW','PAID','REJECTED','CANCELLED')),
    total_paise BIGINT NOT NULL CHECK (total_paise >= 0),
    currency CHAR(3) NOT NULL DEFAULT 'INR',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES customer_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    product_title_snapshot VARCHAR(240) NOT NULL,
    unit_price_paise BIGINT NOT NULL CHECK (unit_price_paise >= 0),
    product_version_id UUID REFERENCES product_versions(id),
    UNIQUE(order_id, product_id)
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES customer_orders(id),
    utr_reference VARCHAR(100) NOT NULL,
    screenshot_storage_key TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED','APPROVED','REJECTED')),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES users(id),
    review_reason TEXT
);
CREATE INDEX ix_payments_status_submitted ON payments(status, submitted_at);

CREATE TABLE download_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    order_item_id UUID NOT NULL REFERENCES order_items(id),
    downloaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ip_address INET
);

CREATE TABLE notification_outbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    event_type VARCHAR(60) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    sent_at TIMESTAMPTZ
);

INSERT INTO categories(slug, name, description, display_order) VALUES
('agricultural-ai','Agricultural AI','Forecasts and analytics for agriculture.',1),
('energy-ai','Energy AI','Analytics for energy markets and operations.',2),
('market-ai','Market AI','Market intelligence and forecasting.',3),
('industrial-ai','Industrial AI','Industrial analytics and intelligence.',4);
