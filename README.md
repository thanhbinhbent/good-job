# binh-tran — Personal Branding Platform

A modern, editor-first platform to manage and share your **Resume**, **Portfolio**, and **Cover Letters** — all in one place.

---

## Features

- **Inline editor** — click any section to edit it directly, no separate edit pages
- **Template switcher** — swap visual templates without touching your content
- **Export** — download PDF or DOCX ready for job applications (no reformatting needed)
- **Password-protected sharing** — generate a share link with optional password
- **Admin via Google OAuth** — only whitelisted emails can edit (configured via env)
- **No account system** for viewers — just a link or password
- **Zero PII stored** — no user data in the database ever

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS + Drizzle ORM + SQLite (better-sqlite3) |
| Frontend | Vite + React 19 + TanStack Router + TanStack Query |
| UI | shadcn/ui (New York) + Tailwind CSS v4 |
| State | Zustand |
| Rich text | Tiptap |
| PDF | @react-pdf/renderer |
| DOCX | docx |
| Auth | Google OAuth 2.0 + JWT (HttpOnly cookie) |
| Validation | Zod (shared between front & back) |
| Package manager | npm workspaces |

---

## Project Structure

```
/
├── apps/
│   ├── api/          # NestJS REST API (port 3000)
│   └── web/          # Vite React SPA  (port 5173)
├── packages/
│   └── shared/       # Zod schemas, DTOs, shared types
├── AGENTS.md         # AI agent operating manual
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js ≥ 20
- npm ≥ 10 (ships with Node.js)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
# → fill in GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, ADMIN_EMAILS in api/.env
# → set ADMIN_BYPASS=true in api/.env to skip Google login during local dev

# 3. Run database migrations
npm run db:migrate

# 4. Start development servers (both simultaneously)
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Environment Variables

### `apps/api/.env`

| Variable | Description | Required |
|----------|-------------|----------|
| `ADMIN_BYPASS` | Set `true` to skip Google OAuth in dev (blocked in production) | No |
| `PORT` | API server port (default `3000`) | No |
| `DATABASE_URL` | Path to SQLite file | Yes |
| `JWT_SECRET` | Secret for access tokens | Yes |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes |
| `GOOGLE_CALLBACK_URL` | OAuth callback URL | Yes |
| `ADMIN_EMAILS` | Comma-separated allowed admin emails | Yes |
| `SHARE_BASE_URL` | Frontend base URL for share links | Yes |

### `apps/web/.env`

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Full URL to API (`http://localhost:3000/api/v1`) |

---

## Access Control

```
Public user
  └── visits /view/:shareId
        ├── No password set → immediate access (read-only)
        └── Password set → enter password → short-lived JWT → read-only

Admin user
  └── visits /admin
        └── Google OAuth login
              └── Email in ADMIN_EMAILS env → full editor access
```

---

## Content Architecture

Documents (`resume`, `portfolio`, `cover_letter`) store content as structured JSON. The selected `templateId` is separate from content, so switching templates never loses data.

```
Document
├── id          (ULID)
├── type        (resume | portfolio | cover_letter)
├── title       (string)
├── templateId  (string — references template registry)
├── content     (JSON — section data, template-agnostic)
└── shareLinks[]
      ├── id           (ULID → share URL)
      ├── passwordHash (bcrypt, nullable)
      └── expiresAt    (nullable)
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both API and web in dev mode |
| `npm run build` | Production build for both apps |
| `npm run db:migrate` | Run Drizzle migrations |
| `npm run db:studio` | Open Drizzle Studio (DB GUI) |
| `npm run lint` | Lint all packages |
| `npm run typecheck` | TypeScript check all packages |

---

## Adding a New Template

1. Create `apps/web/src/components/templates/MyTemplate.tsx` — receives `DocumentContent` props
2. Create matching `apps/web/src/components/templates/MyTemplatePDF.tsx` for PDF export
3. Register it in `apps/web/src/lib/templates.registry.ts`
4. Add metadata row to `templates` table in migration

---

## Extending the API

1. Add Zod schema to `packages/shared/src/dtos/`
2. Generate NestJS module: `cd apps/api && npx nest g module feature-name`
3. Implement service + controller following existing patterns
4. Register in `app.module.ts`
5. Add typed client method to `apps/web/src/lib/api.ts`

---

## Colour Palette

All colours are defined as CSS custom properties in `apps/web/src/index.css` and mapped to Tailwind classes. See [AGENTS.md](./AGENTS.md#4-colour-palette--mandatory) for the full palette specification.

Dark mode is on by default; light mode overrides the same CSS variables.

---

## Package Manager

This project uses **npm workspaces** (built into npm ≥ 7). No additional package manager installation required.

---

## Contributing / AI Agents

Before making any changes, read [AGENTS.md](./AGENTS.md) in full. It defines architecture decisions, forbidden patterns, and the checklist for adding features.

---

## License

MIT
