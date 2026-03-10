# AGENTS.md — AI Agent Operating Manual

> **IMPORTANT**: Every AI agent (GitHub Copilot, Cursor, Claude, GPT, etc.) working on this codebase MUST read and follow this document entirely before making any changes. No exceptions.

---

## 1. Project Overview

A modern, full-stack personal branding platform:
- **Resume Builder** – structured, editable, multi-template
- **Portfolio** – project showcase, skills, timeline
- **Cover Letter Editor** – company-targeted, template-based

### Core Principles
1. **Editor-first UX** – every field is directly editable in-place
2. **Template system** – swap templates without losing content (content ≠ presentation)
3. **Export-ready** – PDF/DOCX exports require zero post-processing
4. **Access control without accounts** – password or share-link; admin via Google OAuth
5. **Clean, extensible architecture** – follow patterns already in place, never invent new ones

---

## 2. Monorepo Structure

```
/                          ← repo root
├── apps/
│   ├── api/               ← NestJS backend
│   └── web/               ← Vite + React frontend
├── packages/
│   └── shared/            ← shared TypeScript types & constants (zod schemas, DTOs)
├── AGENTS.md              ← YOU ARE HERE
├── README.md
└── package.json           ← root workspace (npm workspaces)
```

### apps/api/ (NestJS)
```
apps/api/src/
├── main.ts
├── app.module.ts
├── auth/                  ← Google OAuth, JWT session, admin guard
├── documents/             ← resume / cover-letter / portfolio CRUD
├── sharing/               ← share links, password verification
├── export/                ← PDF & DOCX generation
├── templates/             ← template metadata registry
└── common/
    ├── guards/
    ├── interceptors/
    ├── filters/
    └── decorators/
```

### apps/web/ (Vite React)
```
apps/web/src/
├── main.tsx
├── App.tsx
├── routes/                ← TanStack Router file-based routes
│   ├── index.tsx          ← public landing / password gate
│   ├── view.$shareId.tsx  ← public view via share link
│   ├── admin/
│   │   ├── index.tsx      ← admin dashboard
│   │   ├── resume.tsx
│   │   ├── portfolio.tsx
│   │   └── cover-letter.tsx
├── components/
│   ├── editor/            ← section editors (InlineEdit, RichTextSection, etc.)
│   ├── templates/         ← template renderers
│   ├── export/            ← export trigger buttons
│   └── ui/                ← shadcn/ui auto-generated (DO NOT EDIT MANUALLY)
├── hooks/
├── lib/
│   ├── api.ts             ← typed API client (ky or axios)
│   ├── query.ts           ← react-query client
│   └── utils.ts
├── stores/                ← zustand stores
└── types/                 ← re-exports from packages/shared
```

---

## 3. Tech Stack — Non-Negotiable Choices

| Layer | Library | Why |
|-------|---------|-----|
| Backend framework | **NestJS** (latest) | decorators, DI, modules |
| Database ORM | **Drizzle ORM** + **better-sqlite3** | lightweight, type-safe, SQLite |
| Auth | **@nestjs/passport** + **passport-google-oauth20** + **JWT** | standard |
| Frontend bundler | **Vite** (latest) | fastest HMR |
| Frontend framework | **React 19** | concurrent features |
| Routing | **TanStack Router** (file-based) | type-safe routes |
| Data fetching | **TanStack Query v5** | caching, background refetch |
| UI components | **shadcn/ui** (New York style) | only allowed component source |
| Styling | **Tailwind CSS v4** (CSS variables for palette) | zero inline styles |
| State management | **Zustand** | simple, scalable |
| Rich text | **Tiptap** | headless, extensible |
| PDF export | **@react-pdf/renderer** | React-based, no layout breaks |
| DOCX export | **docx** (npm) | programmatic Word generation |
| Validation | **Zod** | shared between api & web |
| HTTP client | **ky** | modern fetch wrapper |
| Date handling | **date-fns** | tree-shakeable |
| Icons | **lucide-react** | ships with shadcn |

> **DO NOT** introduce any library not listed above without updating this file and getting approval. If you need a new library, add it here first.

---

## 4. Colour Palette — Mandatory

All colours live in `apps/web/src/index.css` as CSS custom properties and are consumed via Tailwind. **No inline styles. No hardcoded hex/rgb.**

```css
/* Primary palette — indigo/slate professional tone */
--color-primary:       224 71% 42%;    /* indigo-600 */
--color-primary-light: 226 71% 55%;    /* indigo-400 */
--color-accent:        262 83% 58%;    /* violet-500 */
--color-accent-light:  259 94% 73%;    /* violet-400 */

/* Neutral */
--color-bg:            222 47% 11%;    /* slate-900  (dark default) */
--color-surface:       217 33% 17%;    /* slate-800 */
--color-border:        215 28% 25%;    /* slate-700 */
--color-muted:         215 20% 65%;    /* slate-400 */
--color-text:          210 40% 98%;    /* slate-50  */

/* Semantic */
--color-success:       142 76% 36%;
--color-warning:       38  92% 50%;
--color-danger:        0   84% 60%;
```

Light mode overrides these same variables inside `[data-theme="light"]`.

Tailwind classes map: `bg-primary`, `text-accent`, `border-border`, etc. — configured in `tailwind.config.ts`.

---

## 5. Database Schema Rules

- File: `apps/api/src/db/schema.ts` (Drizzle schema)
- Database file: `apps/api/data/app.db` (gitignored)
- **Never store**: user emails, Google IDs, names, or any PII
- **Allowed tables**:

```
documents        id, type(resume|portfolio|cover_letter), title, content(JSON), templateId, createdAt, updatedAt
share_links      id(ULIDv2), documentId, passwordHash(nullable), expiresAt(nullable), createdAt
templates        id, name, type, previewUrl, isDefault
```

- `content` column is always JSON (stored as TEXT in SQLite, parsed with Zod at service layer)
- All IDs: ULID (use `ulid` package)
- Migrations: Drizzle Kit (`npm run db:migrate`)

---

## 6. Authentication & Access Model

### Public viewer
- GET `/view/:shareId` → returns document if no password set
- POST `/view/:shareId/unlock` + body `{password}` → returns short-lived JWT if password correct
- Frontend stores JWT in memory (not localStorage)

### Admin
- GET `/auth/google` → redirect to Google OAuth
- Callback → verify email is in `ADMIN_EMAILS` env var (comma-separated)
- Issue HttpOnly cookie with JWT (15 min access + 7 day refresh)
- **Never store email or name in DB**

### Guards naming
- `@Public()` decorator → no auth needed
- `@AdminOnly()` decorator → requires admin JWT cookie
- `@ShareAccess()` decorator → requires share JWT or valid share link

---

## 7. API Design Rules

- All routes: `/api/v1/...`
- Response envelope:
```typescript
{ data: T, meta?: PaginationMeta }  // success
{ error: string, details?: unknown } // error
```
- DTOs: always in `packages/shared/src/dtos/` with Zod schema → inferred TypeScript type
- Versioning: URL-based (`v1`). Breaking changes → `v2` new module, keep `v1` until deprecated
- HTTP codes: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict

---

## 8. Frontend Editor Architecture

### Editor principle
Every section of a document is a **Section Component** that:
1. Renders in **view mode** by default (clean, print-friendly)
2. On click (when admin) → switches to **edit mode** (Tiptap or structured form)
3. On blur/save → calls `PATCH /api/v1/documents/:id/sections/:sectionKey`
4. Optimistic update via TanStack Query

### Template system
- Template = React component that receives `DocumentContent` as props
- Template ID stored in document; content is template-agnostic
- Adding a new template = add one file in `apps/web/src/components/templates/`
- Templates must also export a `PDFTemplate` variant for `@react-pdf/renderer`

### Section key convention
```typescript
// resume sections
"personal" | "summary" | "experience" | "education" | "skills" | "certifications" | "projects"
// portfolio sections  
"hero" | "about" | "projects" | "techStack" | "timeline" | "contact"
// cover letter sections
"header" | "opening" | "body" | "closing"
```

---

## 9. Code Style Rules

1. **TypeScript strict mode everywhere** — no `any`, use `unknown` + type guards
2. **No barrel files** (`index.ts` re-exports) — import directly to avoid circular deps
3. **File naming**: `kebab-case.ts`, `PascalCase.tsx` for React components
4. **NestJS**: one service per module, keep controllers thin (delegate to service)
5. **React**: no class components, hooks only, no prop-drilling > 2 levels (use Zustand)
6. **shadcn only**: zero custom CSS classes outside of shadcn's generated files
7. **No inline styles** — CSS variables through Tailwind classes only
8. **Zod schemas** first, TypeScript types inferred: `type Foo = z.infer<typeof fooSchema>`
9. **Error handling**: all async functions wrapped, NestJS filters catch and format
10. **Exports**: named exports only (no default exports except route files for TanStack Router)

---

## 10. File & Env Configuration

### Required `.env` files
```
apps/api/.env
```
```dotenv
# Server
PORT=3000
NODE_ENV=development

# SQLite
DATABASE_URL=./data/app.db

# JWT
JWT_SECRET=change-me-in-production
JWT_REFRESH_SECRET=change-me-in-production
ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES=7d

# Google OAuth  
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/callback

# Admin whitelist (comma-separated, no spaces)
ADMIN_EMAILS=you@gmail.com,colleague@gmail.com

# Share links
SHARE_BASE_URL=http://localhost:5173
```

```
apps/web/.env
```
```dotenv
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

---

## 11. Scripts (root package.json)

```json
"dev"          : "concurrently \"npm run --workspace=apps/api dev\" \"npm run --workspace=apps/web dev\"",
"build"        : "npm run --workspace=apps/api build && npm run --workspace=apps/web build",
"db:migrate"   : "npm run --workspace=apps/api db:migrate",
"db:studio"    : "npm run --workspace=apps/api db:studio",
"lint"         : "npm run --workspaces lint",
"typecheck"    : "npm run --workspaces typecheck"
```

---

## 12. Adding Features — Checklist for Agents

When adding any new feature:
- [ ] Add/update Zod schema in `packages/shared/src/dtos/`
- [ ] Add NestJS module/service/controller in `apps/api/src/`
- [ ] Register module in `app.module.ts`
- [ ] Add API route to `apps/web/src/lib/api.ts`
- [ ] Add TanStack Query hook in `apps/web/src/hooks/`
- [ ] Build UI exclusively with shadcn components
- [ ] Use only palette CSS variables for colours
- [ ] Write migration if schema changes: `npm run db:migrate`
- [ ] Update this AGENTS.md if new conventions are introduced

---

## 13. Forbidden Patterns

| Pattern | Why forbidden |
|---------|--------------|
| `<div style={{...}}>` | inline styles banned |
| Custom CSS classes | only Tailwind + shadcn |
| `localStorage` for auth tokens | XSS risk; use httpOnly cookies or memory |
| Storing user PII | privacy; not in DB, not in code |
| `any` TypeScript type | defeats type safety |
| Default exports (non-route files) | poor refactoring experience |
| Direct DB queries in controllers | always go through service |
| Hardcoded secrets | always use `.env` |
| New UI library imports | shadcn/lucide-react only |

---

## 14. Performance Targets

- Lighthouse performance ≥ 90 on view pages
- API response < 200ms for document reads (SQLite is fast)
- PDF generation < 3s
- HMR < 100ms in dev

---

*Last updated: 2026-03-10 by project bootstrap agent.*
