# ConversãoAI — Documentação Completa

> **SaaS de IA para Marketing Digital** — App Mobile + Backend completo, pronto para produção.

---

## 📁 Estrutura do projeto

```
conversaoai/
├── backend/                    # API Node.js + Express
│   ├── prisma/
│   │   └── schema.prisma       # Esquema completo do banco
│   ├── src/
│   │   ├── server.js           # Servidor principal + middlewares de segurança
│   │   ├── config/
│   │   │   ├── database.js     # Prisma Client
│   │   │   ├── redis.js        # Redis/cache
│   │   │   └── logger.js       # Winston logger
│   │   ├── middleware/
│   │   │   └── auth.middleware.js  # JWT + planos + créditos
│   │   ├── routes/
│   │   │   ├── auth.routes.js  # Login, registro, OAuth, refresh
│   │   │   ├── ai.routes.js    # Chat, análises, geração
│   │   │   ├── analysis.routes.js
│   │   │   ├── copy.routes.js
│   │   │   ├── campaign.routes.js
│   │   │   ├── billing.routes.js   # Stripe
│   │   │   └── user.routes.js
│   │   └── services/
│   │       └── ai.service.js   # Claude API + circuit breaker + anti-injection
│   ├── .env.example
│   └── package.json
│
└── mobile/                     # React Native + Expo
    ├── App.js                  # Navegação + auth flow
    ├── src/
    │   ├── constants/
    │   │   └── theme.js        # Design tokens (cores, fontes, espaçamentos)
    │   ├── store/
    │   │   └── auth.store.js   # Zustand + SecureStore
    │   ├── services/
    │   │   └── api.js          # Axios + interceptors + auto-refresh
    │   └── screens/
    │       ├── auth/
    │       │   ├── LoginScreen.js
    │       │   └── RegisterScreen.js
    │       ├── HomeScreen.js
    │       ├── ChatScreen.js
    │       ├── CopyScreen.js
    │       ├── CreativeScreen.js
    │       ├── CampaignScreen.js
    │       ├── HistoryScreen.js
    │       ├── ProfileScreen.js
    │       └── detail/
    │           ├── ChatSessionScreen.js
    │           ├── AnalysisScreen.js
    │           ├── LandingPageScreen.js
    │           ├── TrafficScreen.js
    │           ├── ValidateScreen.js
    │           ├── SettingsScreen.js
    │           └── PlansScreen.js
    └── package.json
```

---

## 🚀 Setup — Backend

### Pré-requisitos
- Node.js 20+
- PostgreSQL 15+ (ou Supabase)
- Redis 7+

### 1. Instalar dependências
```bash
cd backend
npm install
```

### 2. Configurar variáveis de ambiente
```bash
cp .env.example .env
# Edite o .env com suas credenciais
```

### 3. Configurar banco de dados
```bash
# Criar e aplicar migrations
npx prisma migrate dev --name init

# Gerar Prisma Client
npx prisma generate

# Popular dados iniciais (planos, etc.)
npm run seed
```

### 4. Iniciar servidor
```bash
# Desenvolvimento (com hot reload)
npm run dev

# Produção
npm start
```

**O servidor iniciará em** `http://localhost:3000`

---

## 📱 Setup — Mobile

### Pré-requisitos
- Node.js 20+
- Expo CLI: `npm install -g expo-cli`
- iOS: Xcode 15+ (Mac only)
- Android: Android Studio

### 1. Instalar dependências
```bash
cd mobile
npm install
```

### 2. Configurar URL da API
Crie o arquivo `mobile/.env`:
```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
# Produção: https://api.conversaoai.com.br/api
```

### 3. Rodar o app
```bash
# Expo Go (desenvolvimento rápido)
npx expo start

# Android
npx expo start --android

# iOS
npx expo start --ios
```

---

## 🔐 Segurança implementada

| Proteção | Implementação |
|----------|--------------|
| **Brute force** | Rate limit 10 tentativas/15min + Redis lockout por IP+email |
| **JWT** | Access token 15min + Refresh token 30 dias com rotação |
| **Blacklist** | Refresh tokens invalidados no Redis |
| **XSS** | Middleware xss-clean em todos os inputs |
| **SQL Injection** | Prisma ORM com prepared statements |
| **Prompt Injection** | Regex patterns + sanitização antes de cada chamada à IA |
| **CORS** | Whitelist de origens permitidas |
| **Headers** | Helmet com CSP, HSTS, noSniff, XSS filter |
| **Rate Limit** | Global 100 req/15min + IA 20 req/15min por usuário |
| **Senhas** | Argon2id (mais seguro que bcrypt) |
| **Circuit Breaker** | Desativa chamadas à IA após 5 falhas consecutivas |
| **Tokens** | Armazenados no SecureStore (mobile) |

---

## 🗄️ Banco de dados

### Tabelas principais
| Tabela | Descrição |
|--------|-----------|
| `users` | Usuários + plano + créditos |
| `subscriptions` | Assinaturas Stripe |
| `chat_sessions` | Sessões de chat com especialistas |
| `chat_messages` | Mensagens do chat |
| `analyses` | Análises de criativos, páginas, etc. |
| `copies_generated` | Copies geradas |
| `campaigns` | Campanhas criadas |
| `favorites` | Favoritos do usuário |
| `tokens` | JWT refresh tokens |
| `usage_logs` | Log de uso para billing |
| `user_devices` | Tokens push para notificações |

---

## 💳 Planos SaaS

| Recurso | Free | Pro (R$97/mês) | Premium (R$197/mês) |
|---------|------|----------------|---------------------|
| Análises/mês | 10 | 500 | Ilimitado |
| Chat com IA | Básico | Avançado | Máxima potência |
| Gerador de copy | ✅ | ✅ | ✅ |
| Campanhas | ❌ | ✅ | ✅ |
| Upload imagens | ❌ | ✅ | ✅ |
| Sequência email | ❌ | ❌ | ✅ |
| Script de vendas | ❌ | ❌ | ✅ |
| Avatar (ICP) | ❌ | ❌ | ✅ |
| Análise concorrentes | ❌ | ❌ | ✅ |
| Calculadora ROI | ❌ | ❌ | ✅ |

---

## 🤖 Especialistas de IA

| ID | Nome | Foco |
|----|------|------|
| `COPYWRITER` | Copywriter Expert | AIDA, PAS, gatilhos, reescrita |
| `TRAFFIC_MANAGER` | Gestor de Tráfego | Meta/Google/TikTok Ads, CPA, ROAS |
| `SALES_STRATEGIST` | Estrategista de Vendas | Funis, lançamentos, ofertas |
| `FUNNEL_EXPERT` | Funil Expert | Jornada, automação, nurturing |
| `LANDING_PAGE_EXPERT` | Landing Page Expert | VSL, squeeze page, CTA |
| `CREATIVE_ANALYST` | Analista de Criativos | Hooks, vídeo, imagens, score |
| `INFOPRODUCT_EXPERT` | Infoproduto Expert | Cursos, mentorias, lançamentos |
| `ECOMMERCE_EXPERT` | E-commerce Expert | Drop, Shopping, conversão |

---

## 🌐 Endpoints da API

### Auth
```
POST /api/auth/register     Criar conta
POST /api/auth/login        Login
POST /api/auth/refresh      Renovar token
POST /api/auth/logout       Logout
POST /api/auth/logout-all   Desconectar todos os dispositivos
GET  /api/auth/me           Dados do usuário
POST /api/auth/google       Login com Google
```

### IA
```
POST /api/ai/chat/session          Criar sessão de chat
POST /api/ai/chat                  Mensagem para especialista
POST /api/ai/analyze/creative      Analisar criativo
POST /api/ai/analyze/landing-page  Analisar página de vendas
POST /api/ai/analyze/traffic       Diagnosticar campanha de tráfego
POST /api/ai/analyze/ab-test       Comparar versões A/B
POST /api/ai/generate/copy         Gerar copy
POST /api/ai/create/campaign       Criar campanha (PRO+)
POST /api/ai/validate/idea         Validar ideia
```

### Analyses, Copies, Billing
```
GET    /api/analyses          Listar análises
GET    /api/analyses/:id      Detalhe
DELETE /api/analyses/:id      Deletar
PATCH  /api/analyses/:id/favorite  Favoritar

GET  /api/billing/plans       Planos disponíveis
POST /api/billing/subscribe   Assinar plano
POST /api/billing/cancel      Cancelar assinatura
POST /api/billing/webhook     Stripe webhook
GET  /api/billing/usage       Uso atual
```

---

## 🚀 Deploy — Produção

### Backend (Railway / Render / Fly.io)

```bash
# Railway
npm install -g @railway/cli
railway login
railway new
railway add postgresql
railway add redis
railway up
```

### Variáveis obrigatórias em produção
```env
NODE_ENV=production
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=<min 64 chars, random>
JWT_REFRESH_SECRET=<diferente do JWT_SECRET>
ANTHROPIC_API_KEY=sk-ant-...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Mobile — Build com EAS

```bash
npm install -g eas-cli
eas login
eas build:configure

# Android APK/AAB
eas build --platform android --profile production

# iOS IPA
eas build --platform ios --profile production

# Submeter para lojas
eas submit --platform android
eas submit --platform ios
```

### Arquivo `eas.json` básico
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "production": {
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": false
      }
    }
  }
}
```

---

## 📊 Stack tecnológica

| Camada | Tecnologia |
|--------|-----------|
| **Mobile** | React Native + Expo SDK 51 |
| **Navegação** | React Navigation v6 (Stack + Bottom Tabs) |
| **Estado** | Zustand |
| **Storage seguro** | Expo SecureStore |
| **Backend** | Node.js 20 + Express 4 |
| **ORM** | Prisma 5 |
| **Banco** | PostgreSQL 15 (Supabase) |
| **Cache/Queue** | Redis 7 (ioredis) |
| **IA** | Claude claude-sonnet-4-20250514 (Anthropic) |
| **Auth** | JWT + Argon2id + OAuth Google/Apple |
| **Pagamentos** | Stripe |
| **Logs** | Winston |
| **Segurança** | Helmet + xss-clean + express-rate-limit + mongo-sanitize |

---

## 🔑 Checklist de produção

- [ ] Variáveis de ambiente preenchidas
- [ ] `NODE_ENV=production`
- [ ] HTTPS configurado
- [ ] Banco migrado (`npx prisma migrate deploy`)
- [ ] Redis configurado
- [ ] Stripe webhook registrado
- [ ] Chave Anthropic com limites configurados
- [ ] Rate limiting ajustado
- [ ] Sentry DSN configurado (monitoramento)
- [ ] Domínio CORS atualizado
- [ ] Build mobile gerado com EAS
- [ ] Teste de login/logout
- [ ] Teste de pagamento (Stripe test mode)
- [ ] Teste de chamada à IA

---

*ConversãoAI © 2025 — Todos os direitos reservados*
