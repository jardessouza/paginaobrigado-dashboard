# 📊 Dashboard Service

Serviço de dashboard para gerenciar as configurações do Google Ads Pixel.

## 🚀 Como Rodar

```bash
npm install
npm start
```

Acesse em: http://localhost:3000

## 📝 Features

- Gerenciar Conversion ID
- Gerenciar Conversion Label
- Configurar URL de redirecionamento
- Definir valor e moeda da compra
- Personalizar texto do avatar
- Salvar/resetar configurações via API

## 🔗 API Endpoints

- `GET /api/config` - Obter configurações
- `POST /api/config` - Salvar configurações
- `POST /api/config/reset` - Resetar para padrão
- `GET /health` - Health check

## 🚀 Deploy no Railway

1. Conecte ao GitHub
2. Railway detectará automaticamente
3. Deploy automático a cada push
