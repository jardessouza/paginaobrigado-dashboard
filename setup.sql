-- Drop tabela se existir (para limpeza)
DROP TABLE IF EXISTS pixel_config CASCADE;

-- Criar tabela
CREATE TABLE pixel_config (
    id SERIAL PRIMARY KEY,
    conversion_id VARCHAR(255) NOT NULL,
    conversion_label VARCHAR(255) NOT NULL,
    redirect_url VARCHAR(500) NOT NULL,
    purchase_value DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    delay_redirect INTEGER NOT NULL,
    avatar_text VARCHAR(500) NOT NULL,
    avatar_image TEXT,
    auto_redirect BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índice para melhor performance
CREATE INDEX idx_pixel_config_updated_at ON pixel_config(updated_at DESC);

-- Inserir configuração padrão
INSERT INTO pixel_config (
    conversion_id,
    conversion_label,
    redirect_url,
    purchase_value,
    currency,
    company_name,
    delay_redirect,
    avatar_text,
    updated_at
) VALUES (
    'AW-123456789',
    'AbC123DeFg_K',
    'https://seusite.com/produto',
    99.90,
    'BRL',
    'Sua Empresa',
    3000,
    'Processando sua compra...',
    NOW()
);
