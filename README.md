# EALumini

Marketplace SaaS de terapias holísticas — conectando pacientes a terapeutas certificados.

---

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 14 (App Router) |
| Backend | Next.js API Routes (Node.js) |
| ORM | Prisma 5 |
| Banco de dados | PostgreSQL via **Supabase** |
| Autenticação | JWT + Refresh Token (httpOnly cookies) |
| UI | TailwindCSS + componentes próprios |
| Estado global | Zustand |
| Formulários | React Hook Form + Zod |
| Storage (avatares) | Supabase Storage |
| Notificações | react-hot-toast |

---

## Deploy na Vercel

1. **Root Directory**: se o repositório tiver pasta pai, em *Settings → General* defina **Root Directory** como a pasta do app Next (ex.: `holosconnect`). Sem isso, a Vercel pode fazer deploy do projeto errado ou falhar o build.
2. **Variáveis de ambiente** (Project → Settings → Environment Variables), **iguais ao `.env` local de produção**: `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `NEXT_PUBLIC_APP_URL` (**obrigatório**: URL exata do site em produção, `https://…vercel.app` ou domínio próprio — afeta links e cookies em alguns fluxos). Opcionais: WhatsApp (`ULTRAMSG_*`, `THERAPIST_WHATSAPP_NUMBER`), SMTP.
3. **Variáveis `NEXT_PUBLIC_*`**: são “gravadas” no build. Se alterar no painel, faça **Redeploy** (ou *Clear build cache* + deploy) para o browser receber os valores novos.
4. **JWT**: trocar `JWT_SECRET` / `JWT_REFRESH_SECRET` na Vercel **desloga todos** os utilizadores (tokens antigos deixam de ser válidos).
5. **Supabase Storage**: buckets `documents` e `avatars` no mesmo projeto Supabase das URLs do `.env`.
6. **Build**: `npm run build` localmente para validar. Na Vercel, `postinstall` roda `prisma generate`.
7. **Produção ≠ local**: use o **mesmo** `DATABASE_URL` (ou um clone com schema atualizado via `prisma migrate deploy`) — banco vazio ou antigo parece “app sem funcionalidades”.

---

## Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com) (gratuita)
- npm ou yarn

---

## Setup Rápido

### 1. Instalar dependências

```bash
cd ealumini
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env.local
```

Preencha o `.env.local` com os dados do seu projeto Supabase:

```
# Acesse: https://app.supabase.com → projeto → Settings → Database
DATABASE_URL="postgresql://postgres:[SENHA]@db.[REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:[SENHA]@db.[REF].supabase.co:5432/postgres"

# Supabase → Connect: URL + Anon key (Legacy JWT eyJ...). Evite sb_publishable_ em ANON_KEY se aparecer erro JWS.
# Settings → API → Secret keys: service_role (JWT legacy ou sb_secret_...) em SUPABASE_SERVICE_ROLE_KEY (só servidor).
NEXT_PUBLIC_SUPABASE_URL="https://[REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."

# Gere com: openssl rand -base64 64
JWT_SECRET="..."
JWT_REFRESH_SECRET="..."
```

### 3. Configurar o banco de dados

```bash
# Gerar o client do Prisma
npm run db:generate

# Aplicar o schema no Supabase (sem migrations)
npm run db:push

# Ou usar migrations (recomendado para produção)
npm run db:migrate
```

### 4. Popular dados de teste

```bash
npm run db:seed
```

### 5. Iniciar o servidor

```bash
npm run dev
```

Acesse: **http://localhost:3000**

---

## Credenciais de Teste

| Role | Email | Senha |
|------|-------|-------|
| Admin | admin@ealumini.com | Admin@123 |
| Terapeuta | ana.ribeiro@ealumini.com | Terapeuta@123 |
| Paciente | marcos.pereira@email.com | Paciente@123 |

---

## Configuração do Supabase

### Buckets de Storage

Sem estes buckets, o upload devolve **Bucket not found**. No Supabase: **Storage → New bucket** (os nomes têm de ser **exatamente** estes):

| Bucket       | Uso                         | Sugestão |
|-------------|-----------------------------|----------|
| `documents` | Certificados PDF/imagem, comprovantes | **Public bucket** ligado, para as URLs públicas geradas pelo app funcionarem no navegador. |
| `avatars`   | Foto de perfil              | **Public bucket** ligado. |

Se o bucket não existir ou o nome tiver typo (`document` vs `documents`), o upload falha.

### Row Level Security (RLS)

Para o bucket `avatars`, adicione esta policy para permitir leitura pública:

```sql
-- Leitura pública
CREATE POLICY "Public avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Upload autenticado
CREATE POLICY "Upload own avatar" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
```

> **Nota:** Como usamos JWT próprio (não Supabase Auth), o storage é acessado via `service_role` no backend, portanto as policies acima são para uploads do lado cliente se necessário futuramente.

---

## Estrutura de Pastas

```
ealumini/
├── prisma/
│   ├── schema.prisma       # Schema completo com todos os modelos
│   └── seed.ts             # Dados iniciais para desenvolvimento
│
├── src/
│   ├── app/
│   │   ├── (auth)/         # Grupo de rotas não autenticadas
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── forgot-password/
│   │   │
│   │   ├── (dashboard)/    # Grupo protegido por autenticação
│   │   │   ├── admin/      # Rotas exclusivas do ADMIN
│   │   │   ├── terapeuta/  # Rotas do TERAPEUTA
│   │   │   └── paciente/   # Rotas do PACIENTE
│   │   │
│   │   ├── api/            # API Routes (backend)
│   │   │   ├── auth/       # login, register, refresh, logout
│   │   │   ├── therapists/ # CRUD + busca com filtros
│   │   │   ├── appointments/ # Agendamentos + mudança de status
│   │   │   ├── reviews/    # Sistema de avaliações
│   │   │   └── admin/      # Dashboard, comissão, gestão de usuários
│   │   │
│   │   ├── layout.tsx      # Layout raiz com Toaster
│   │   └── page.tsx        # Landing page pública
│   │
│   ├── components/
│   │   ├── ui/             # Button, Input, Card, Badge, Modal, StarRating, Spinner
│   │   ├── dashboard/      # Sidebar, Header, StatCard
│   │   ├── therapist/      # TherapistCard, SearchFilters
│   │   └── appointments/   # BookingModal (3 steps: data → hora → confirmar)
│   │
│   ├── hooks/
│   │   └── useAuth.ts      # Zustand store de autenticação
│   │
│   ├── lib/
│   │   ├── prisma.ts       # Singleton do PrismaClient
│   │   ├── auth.ts         # JWT: gerar, verificar, refresh tokens
│   │   ├── supabase.ts     # Clientes Supabase (público e admin)
│   │   └── utils.ts        # Helpers: formatação, comissão, slots de horário
│   │
│   ├── middleware.ts       # Proteção de rotas por role (Edge Runtime)
│   └── types/
│       └── index.ts        # Tipos TypeScript compartilhados
│
├── .env.example            # Template de variáveis de ambiente
├── next.config.js
├── tailwind.config.ts
└── package.json
```

---

## Modelos do Banco de Dados

### Diagrama simplificado

```
User (id, name, email, password, role, active)
  ├── TherapistProfile (bio, therapies[], price, modality, rating, approved)
  │     ├── Availability (dayOfWeek, startTime, endTime, slotDuration)
  │     ├── Appointment[] (date, status, price, commission, therapistNet)
  │     │     └── Review (rating, comment)
  │     └── Review[]
  └── PatientProfile (gender, birthDate, anamnese JSON)
        └── Appointment[]

PlatformConfig (commissionRate, maintenanceMode)
Notification (userId, title, message, type, read)
RefreshToken (userId, token, expiresAt, revoked)
```

---

## Fluxo de Autenticação

1. **Login/Registro** → Gera `accessToken` (15min) + `refreshToken` (7 dias)
2. Ambos são armazenados em **httpOnly cookies** (seguro contra XSS)
3. `accessToken` também é retornado no body para armazenar no Zustand store
4. **Middleware** (`src/middleware.ts`) verifica o cookie em todas as rotas protegidas
5. Quando o `accessToken` expira, o cliente chama `/api/auth/refresh` automaticamente
6. Refresh token é **rotacionado** a cada uso (segurança adicional)

---

## Fluxo de Comissão

```
Agendamento criado → status: PENDENTE
  ↓
Terapeuta confirma → status: CONFIRMADO
  ↓ (automático)
Sistema calcula:
  commission = price × commissionRate / 100
  therapistNet = price - commission
  platformRevenue = commission
```

A taxa de comissão é configurável pelo Admin em tempo real via `/dashboard/admin/commission`.

---

## Funcionalidades por Role

### ADMIN
- Dashboard com KPIs (terapeutas, pacientes, agendamentos, receita)
- Aprovar/reprovar terapeutas
- Ativar/desativar usuários
- Configurar taxa de comissão global

### TERAPEUTA
- Dashboard com agenda, receita e avaliações
- Confirmar/concluir/cancelar agendamentos
- Configurar disponibilidade (em construção)
- Editar perfil profissional

### PACIENTE
- Busca com filtros estilo Gympass (sidebar + cards)
- Agendar sessões (wizard de 3 etapas)
- Histórico de agendamentos
- Avaliar sessões concluídas (1-5 estrelas + comentário)

---

## Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run db:generate  # Regenerar Prisma Client após mudanças no schema
npm run db:push      # Sincronizar schema sem migrations (dev)
npm run db:migrate   # Criar e aplicar migrations (produção)
npm run db:seed      # Popular banco com dados de teste
npm run db:studio    # Abrir Prisma Studio (GUI do banco)
npm run db:reset     # Resetar banco + recriar + seed
```

---

## Deploy

### Vercel (recomendado)

1. Conectar repositório no [Vercel](https://vercel.com)
2. Adicionar as variáveis de ambiente
3. O comando de build (`npm run build`) é detectado automaticamente

### Variáveis obrigatórias para produção

```
DATABASE_URL
DIRECT_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
JWT_SECRET
JWT_REFRESH_SECRET
NEXT_PUBLIC_APP_URL
```

---

## Próximas Funcionalidades (Roadmap)

- [ ] Configuração de disponibilidade visual (calendário drag-and-drop)
- [ ] Chat entre paciente e terapeuta
- [ ] Integração com pagamento (Stripe/PagSeguro)
- [ ] Video-conferência integrada (para sessões online)
- [ ] Sistema de email transacional (Resend)
- [ ] Dashboard financeiro avançado com gráficos
- [ ] App mobile (React Native / Expo)
- [ ] Sistema de assinatura para terapeutas (planos)

---

## Licença

MIT — Desenvolvido para fins educacionais e comerciais.
