# Aegix - Next-Generation AI-Powered B2B SaaS CRM Architecture

## 1. Executive Summary & Core Principles

Aegix is an enterprise-grade, AI-first sales operating system designed to replace legacy CRMs through autonomous workflows, proactive revenue intelligence, and zero-touch data entry. 

**Core Principles:**
1. **AI-First:** AI is not an add-on; it orchestrates data flow, memory, and UX.
2. **Multi-Tenant by Design:** Strict logical isolation with row-level security (RLS) for enterprise trust.
3. **Event-Driven & Realtime:** Every state mutation broadcasts via Pub/Sub, updating connected clients instantly.
4. **Modular Monolith to Microservices:** Start with a well-bounded NestJS modular monolith that can easily split into microservices (K8s) at scale.
5. **Mobile-First Productivity:** React Native field-sales companion app with offline-first sync.

---

## 2. Folder Structure & Modularization Strategy

A modern Nx Turborepo (Monorepo) approach is recommended to share types, schemas, and UI components across Web, Mobile, and Backend.

```text
/aegix-platform
├── /apps
│   ├── /web-app          (Next.js 14 Web Application)
│   ├── /mobile-app       (React Native / Expo Companion App)
│   ├── /api-server       (NestJS Backend API & Websockets)
│   └── /ai-worker        (Python or Node.js heavy AI processing worker)
├── /packages
│   ├── /ui               (Shared Tailwind/ShadCN UI components)
│   ├── /database         (Prisma schema, migrations, and seeders)
│   ├── /ai-core          (LangChain/LlamaIndex configurations, Prompts)
│   ├── /auth             (Clerk/Auth.js configuration and middleware)
│   └── /types            (Shared Zod schemas and TypeScript interfaces)
├── docker-compose.yml
└── turbo.json
```

---

## 3. Tech Stack & Infrastructure

### 3.1 Core Technologies
- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, ShadCN UI, Zustand (State), TanStack Query (Data Fetching), Framer Motion.
- **Backend:** NestJS (TypeScript), GraphQL/REST hybrid.
- **Database:** PostgreSQL (Relational + pgvector for embeddings).
- **ORM:** Prisma.
- **Caching & Queues:** Redis, BullMQ.
- **Realtime:** WebSockets (Socket.io with Redis Adapter).
- **Storage:** AWS S3 (Files, Attachments, Avatars).
- **Identity:** Clerk (B2B SaaS optimized, SAML, SSO integrations).

### 3.2 DevOps & Infrastructure
- **Containerization:** Docker & Kubernetes (EKS/GKE).
- **CI/CD:** GitHub Actions (Lint, Test, Build, Push to ECR, Deploy to K8s).
- **Infrastructure as Code:** Terraform.
- **Monitoring & Logging:** Datadog / Prometheus + Grafana, Sentry (Error tracking), Winston/Pino (Structured JSON logging).

---

## 4. Multi-Tenant SaaS & RBAC Architecture

### 4.1 Multi-Tenancy Strategy
Strict multi-tenancy implemented on the **Application Level + Database Level (RLS)**.
- **Workspace/Organization ID:** Every database table (except global tables like Users) has a mandatory `tenantId`.
- **NestJS Middleware:** Intercepts requests, extracts `tenantId` from the JWT/Session, and scopes the Prisma Client instance (using Prisma Client Extensions) to automatically append `{ where: { tenantId: req.tenantId } }`.
- **API Keys:** Scoped to `tenantId` with granular scopes.

### 4.2 Role-Based Access Control (RBAC)
- **Roles:** Super Admin, Org Admin, Sales Manager, Rep, Support, Read-Only.
- **Permissions Framework:** CASL (Attribute-Based Access Control) integrated into NestJS Guards.
- **Resolution:** `can('update', 'Deal', { ownerId: user.id })` or `can('manage', 'all')`.

---

## 5. Database Schema Design (Prisma)

```prisma
// This schema represents the highly relational foundation of the CRM.

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// --- TENANT & USERS ---
model Tenant {
  id          String   @id @default(cuid())
  name        String
  domain      String?  @unique
  plan        PlanTier @default(FREE)
  users       User[]
  contacts    Contact[]
  deals       Deal[]
  // AI Configs, Custom Fields, etc.
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id])
  role      Role     @default(REP)
  // Audit & relations
}

// --- CORE CRM ENTITIES ---
model Contact {
  id          String   @id @default(cuid())
  tenantId    String
  name        String
  email       String?
  companyId   String?
  healthScore Float?   // AI generated
  aiSummary   String?  // AI generated timeline summary
  deals       Deal[]
}

model Deal {
  id          String   @id @default(cuid())
  tenantId    String
  title       String
  amount      Float
  stageId     String
  ownerId     String
  probability Float?   // AI predicted close probability
  closeDate   DateTime?
}

// --- ENGAGEMENT & AI ---
model Activity {
  id          String   @id @default(cuid())
  tenantId    String
  type        ActivityType // CALL, EMAIL, MEETING, NOTE
  ownerId     String
  dealId      String?
  contactId   String?
  content     String   @db.Text
  transcript  String?  @db.Text // AI Transcribed
  aiInsights  Json?    // Sentiment, Action Items
}

model AiMemory {
  id          String   @id @default(cuid())
  tenantId    String
  entityType  String   // "DEAL", "CONTACT"
  entityId    String
  vector      Unsupported("vector(1536)") // pgvector
  context     String   @db.Text
}
```

---

## 6. AI-First System Architecture

The AI layer operates as an asynchronous intelligence loop to prevent blocking the main request threads.

### 6.1 Architected Components
1. **AI Gateway (API Abstraction):** Routes requests to OpenAI, Anthropic, or local LLMs. Handles rate limiting and fallback.
2. **AI Action Engine:** Analyzes Webhook/Queue events (e.g., "New Call Transcript Saved") and triggers async jobs (e.g., "Extract Action Items and Update Deal Score").
3. **Vector Database (PgVector/Pinecone):** Stores embeddings of old emails, call transcripts, and meeting notes to provide LLMs with Context (RAG).
4. **Natural Language Search Adapter:** Converts user intent ("Show deals closing this week") into SQL/Prisma schemas using an LLM.

### 6.2 Data Enrichment & Memory Pipeline
- **Webhook Ingestion -> BullMQ Queue -> AI Worker (Node/Python) -> Update PG Database -> Emit Websocket Event -> Next.js Realtime UI Update.**

---

## 7. Realtime & Notification Architecture

### 7.1 WebSocket Stack
- **Socket.io + Redis Adapter:** Enables Horizontal scaling across multiple K8s pods.
- **Namespaces & Rooms:** Clients connect to a namespace (`/tenant`) and join rooms (`org_123`, `deal_456`).
- **Events:** When a Deal moves stages, the NestJS service emits `deal.updated` to the `org_123` room. Zustand catches this and updates the kanban board instantly without a page refresh.

---

## 8. Mobile Architecture (React Native)

- **Framework:** Expo (React Native).
- **Offline-First:** WatermelonDB or Expo SQLite. Field reps must be able to view contacts and log voice notes offline.
- **Sync Protocol:** Async queue that syncs with the REST API once a connection is re-established.
- **Native Features:** GPS (logging visit locations), Audio Recording (voice notes -> AI transcription pipeline).

---

## 9. Security architecture

- **Authentication:** OAuth2 / OIDC via Clerk.
- **Encryption:** AES-256 for sensitive fields (API Keys, OAuth tokens) at rest. TLS 1.3 in transit.
- **Rate Limiting:** Redis-backed rate limiting per IP and per Tenant to prevent noisy neighbors.
- **Audit Logs:** Immutable audit log table recording `Who, What, When, Where (IP/UserAgent)` for all mutations.

---

## 10. API & Background Jobs Architecture

- **Background Workers:** BullMQ processing image compression, AI embeddings, massive CSV imports, and scheduled email sending.
- **Webhooks System:** Outbound webhooks to integrate with Zapier/Slack. Uses signature verification (`HMAC-SHA256`).
- **API Versioning:** `/api/v1/deals`. Strict DTO validation using `class-validator` (NestJS).

---

## 11. Scalability Strategy

- **Database:** Read-replicas for analytical queries (Dashboards). Partitioning large tables like `Activities` and `AuditLogs` by date.
- **Caching:** Redis edge caching for heavily accessed, rarely mutated data (Roles, Permissions, Configuration).
- **Stateless Backend:** Ensure API servers hold no state, strictly relying on Redis/PG, allowing infinite horizontal scaling under the load balancer.
