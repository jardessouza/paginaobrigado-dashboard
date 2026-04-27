const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// PostgreSQL Connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// CONFIG PADRÃO
const DEFAULT_CONFIG = {
    conversionId: 'AW-123456789',
    conversionLabel: 'AbC123DeFg_K',
    redirectUrl: 'https://seusite.com/produto',
    purchaseValue: '99.90',
    currency: 'BRL',
    companyName: 'Sua Empresa',
    delayRedirect: 3000,
    avatarText: 'Processando sua compra...',
    avatarImage: null,
};

// ============================================
// INICIALIZAR BANCO DE DADOS
// ============================================

const initDatabase = async () => {
    try {
        await pool.query(`
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
                avatar_image TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_pixel_config_updated_at
            ON pixel_config(updated_at DESC);
        `);

        const result = await pool.query('SELECT COUNT(*) FROM pixel_config');
        if (result.rows[0].count === '0') {
            await pool.query(`
                INSERT INTO pixel_config (
                    conversion_id, conversion_label, redirect_url,
                    purchase_value, currency, company_name,
                    delay_redirect, avatar_text, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
            `, [
                DEFAULT_CONFIG.conversionId,
                DEFAULT_CONFIG.conversionLabel,
                DEFAULT_CONFIG.redirectUrl,
                parseFloat(DEFAULT_CONFIG.purchaseValue),
                DEFAULT_CONFIG.currency,
                DEFAULT_CONFIG.companyName,
                DEFAULT_CONFIG.delayRedirect,
                DEFAULT_CONFIG.avatarText,
            ]);
        }

        console.log('✅ Database initialized successfully');
    } catch (error) {
        console.error('❌ Database initialization error:', error);
    }
};

// ============================================
// ROTAS API
// ============================================

// GET configurações
app.get('/api/config', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM pixel_config ORDER BY updated_at DESC LIMIT 1'
        );

        if (result.rows.length === 0) {
            return res.json(DEFAULT_CONFIG);
        }

        const row = result.rows[0];
        res.json({
            conversionId: row.conversion_id,
            conversionLabel: row.conversion_label,
            redirectUrl: row.redirect_url,
            purchaseValue: row.purchase_value.toString(),
            currency: row.currency,
            companyName: row.company_name,
            delayRedirect: row.delay_redirect,
            avatarText: row.avatar_text,
            avatarImage: row.avatar_image,
        });
    } catch (error) {
        console.error('Erro ao buscar config:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST salvar configurações
app.post('/api/config', async (req, res) => {
    try {
        console.log('POST /api/config recebido:', req.body);

        const {
            conversionId,
            conversionLabel,
            redirectUrl,
            purchaseValue,
            currency,
            companyName,
            delayRedirect,
            avatarText,
            avatarImage,
        } = req.body;

        console.log('Valores extraídos:', {
            conversionId, conversionLabel, redirectUrl, purchaseValue,
            currency, companyName, delayRedirect, avatarText
        });

        const result = await pool.query(
            `INSERT INTO pixel_config (
                conversion_id, conversion_label, redirect_url,
                purchase_value, currency, company_name,
                delay_redirect, avatar_text, avatar_image, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
            RETURNING *`,
            [
                conversionId,
                conversionLabel,
                redirectUrl,
                parseFloat(purchaseValue),
                currency,
                companyName,
                delayRedirect,
                avatarText,
                avatarImage || null,
            ]
        );

        const row = result.rows[0];
        res.json({
            success: true,
            config: {
                conversionId: row.conversion_id,
                conversionLabel: row.conversion_label,
                redirectUrl: row.redirect_url,
                purchaseValue: row.purchase_value.toString(),
                currency: row.currency,
                companyName: row.company_name,
                delayRedirect: row.delay_redirect,
                avatarText: row.avatar_text,
                avatarImage: row.avatar_image,
            },
        });
    } catch (error) {
        console.error('Erro ao salvar config:', error);
        res.status(400).json({ success: false, error: error.message });
    }
});

// Reset para padrão
app.post('/api/config/reset', async (req, res) => {
    try {
        const result = await pool.query(
            `INSERT INTO pixel_config (
                conversion_id, conversion_label, redirect_url,
                purchase_value, currency, company_name,
                delay_redirect, avatar_text, avatar_image, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NULL, NOW())
            RETURNING *`,
            [
                DEFAULT_CONFIG.conversionId,
                DEFAULT_CONFIG.conversionLabel,
                DEFAULT_CONFIG.redirectUrl,
                parseFloat(DEFAULT_CONFIG.purchaseValue),
                DEFAULT_CONFIG.currency,
                DEFAULT_CONFIG.companyName,
                DEFAULT_CONFIG.delayRedirect,
                DEFAULT_CONFIG.avatarText,
            ]
        );

        res.json({ success: true, config: { ...DEFAULT_CONFIG, avatarImage: null } });
    } catch (error) {
        console.error('Erro ao resetar config:', error);
        res.status(400).json({ success: false, error: error.message });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'dashboard', uptime: process.uptime() });
});

// Rota raiz serve dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// ============================================
// START SERVER
// ============================================

(async () => {
    await initDatabase();

    app.listen(PORT, () => {
        console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   📊 DASHBOARD SERVICE                                        ║
║                                                                ║
║   Server rodando em http://localhost:${PORT}                    ║
║                                                                ║
║   🔗 http://localhost:${PORT}                                  ║
║   💚 Health: http://localhost:${PORT}/health                   ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
        `);
    });
})();

process.on('uncaughtException', (error) => {
    console.error('Erro não capturado:', error);
    process.exit(1);
});

module.exports = app;
