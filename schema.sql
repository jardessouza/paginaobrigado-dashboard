-- Tabela de configurações do Google Ads Pixel
CREATE TABLE IF NOT EXISTS pixel_config (
    id SERIAL PRIMARY KEY,
    conversion_id VARCHAR(255) NOT NULL,
    conversion_label VARCHAR(255) NOT NULL,
    redirect_url VARCHAR(500) NOT NULL,
    purchase_value DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    delay_redirect INTEGER NOT NULL,
    avatar_text VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir configuração padrão
INSERT INTO pixel_config (
    conversion_id,
    conversion_label,
    redirect_url,
    purchase_value,
    currency,
    company_name,
    delay_redirect,
    avatar_text
) VALUES (
    'AW-123456789',
    'AbC123DeFg_K',
    'https://seusite.com/produto',
    99.90,
    'BRL',
    'Sua Empresa',
    3000,
    'Processando sua compra...'
) ON CONFLICT DO NOTHING;
