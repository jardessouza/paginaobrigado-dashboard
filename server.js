const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

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
};

// Armazenamento em memória
let config = { ...DEFAULT_CONFIG };

// ============================================
// ROTAS API
// ============================================

// GET configurações
app.get('/api/config', (req, res) => {
    res.json(config);
});

// POST salvar configurações
app.post('/api/config', (req, res) => {
    try {
        const newConfig = { ...DEFAULT_CONFIG, ...req.body };
        config = newConfig;
        res.json({ success: true, config });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Reset para padrão
app.post('/api/config/reset', (req, res) => {
    config = { ...DEFAULT_CONFIG };
    res.json({ success: true, config });
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

process.on('uncaughtException', (error) => {
    console.error('Erro não capturado:', error);
    process.exit(1);
});

module.exports = app;
