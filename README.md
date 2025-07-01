# 🍕 Pizza Manager - Sistema Completo

Sistema completo de gerenciamento de pizzaria com frontend React e backend Node.js + PostgreSQL.

## 📁 Estrutura do Projeto

```
pizza-manager-complete/
├── frontend/          # React + TypeScript + Vite
├── backend/           # Node.js + Express + PostgreSQL
└── README.md         # Este arquivo
```

## 🚀 Como Executar

### 📋 Pré-requisitos

- Node.js 18+ 
- PostgreSQL 12+
- npm ou yarn

### 🗄️ 1. Configurar Banco de Dados

```bash
# Criar banco PostgreSQL
createdb pizza_manager

# Ou via psql
psql -U postgres
CREATE DATABASE pizza_manager;
```

### 🔧 2. Backend (API)

```bash
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações de banco

# Executar migrations e seeders
npm run migrate
npm run seed

# Iniciar servidor
npm start
```

**Backend rodará em:** `http://localhost:3001`

### 🎨 3. Frontend (React)

```bash
cd frontend

# Instalar dependências
npm install

# Configurar API URL (se necessário)
# Editar src/config/api.js

# Iniciar desenvolvimento
npm run dev
```

**Frontend rodará em:** `http://localhost:8080`

## 🔐 Credenciais Padrão

### Super Administrador
- **Email:** admin@pizza.com
- **Senha:** admin123
- **Acesso:** Todos os estabelecimentos

### Admin Jukinhas Bar
- **Email:** admin@jukinhas.com  
- **Senha:** admin123
- **Acesso:** Apenas Jukinhas Bar

## ✨ Funcionalidades

### 🏪 Multi-Tenancy
- Suporte a múltiplos estabelecimentos
- Isolamento completo de dados
- Permissões por estabelecimento

### 🔒 Segurança
- Autenticação JWT
- Rate limiting flexível
- Middleware de segurança
- Auditoria completa

### 📊 Dashboard
- Métricas em tempo real
- Gráficos de vendas
- Pedidos recentes
- Top produtos

### 🛒 Gestão de Pedidos
- Criação de pedidos
- Controle de status
- Histórico completo
- Relatórios

### 👥 Gestão de Clientes
- Cadastro de clientes
- Busca por telefone
- Histórico de pedidos

### 🍕 Cardápio
- Gestão de produtos
- Categorias
- Preços e descrições

### 📈 Relatórios
- Vendas por período
- Produtos mais vendidos
- Análise de performance

## 🛠️ Tecnologias

### Frontend
- **React 18** - Framework principal
- **TypeScript** - Tipagem estática
- **Vite** - Build tool
- **Tailwind CSS** - Estilização
- **Shadcn/UI** - Componentes
- **Recharts** - Gráficos

### Backend
- **Node.js** - Runtime
- **Express** - Framework web
- **Sequelize** - ORM
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **Bcrypt** - Hash de senhas

## 📝 Variáveis de Ambiente

### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/pizza_manager
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pizza_manager
DB_USER=postgres
DB_PASSWORD=postgres

# JWT
JWT_SECRET=sua_chave_secreta_super_forte_aqui
JWT_EXPIRES_IN=24h

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:8080

# Security
DISABLE_RATE_LIMIT=false
SECURITY_LEVEL=development
```

## 🔄 Scripts Disponíveis

### Backend
```bash
npm start          # Iniciar servidor
npm run dev        # Desenvolvimento com nodemon
npm run migrate    # Executar migrations
npm run seed       # Executar seeders
npm test           # Executar testes
```

### Frontend
```bash
npm run dev        # Servidor de desenvolvimento
npm run build      # Build para produção
npm run preview    # Preview do build
npm run lint       # Linter
```

## 🚀 Deploy

### Backend
1. Configure variáveis de ambiente de produção
2. Execute migrations: `npm run migrate`
3. Execute seeders: `npm run seed`
4. Inicie: `npm start`

### Frontend
1. Configure API_BASE_URL para produção
2. Build: `npm run build`
3. Sirva arquivos da pasta `dist/`

## 🐛 Troubleshooting

### Erro de CORS
- Verifique se o frontend URL está nas configurações de CORS do backend
- Confirme que as portas estão corretas

### Erro 401 (Credenciais Inválidas)
- Verifique se o banco foi populado com seeders
- Confirme as credenciais padrão
- Verifique se o JWT_SECRET está configurado

### Banco não conecta
- Verifique se PostgreSQL está rodando
- Confirme as credenciais no .env
- Teste conexão: `psql -h localhost -U postgres -d pizza_manager`

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do console
2. Confirme configurações de ambiente
3. Teste APIs diretamente com curl/Postman

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais e comerciais.

---

**Desenvolvido com ❤️ para gestão eficiente de pizzarias**

