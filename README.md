# CoWhiteboard

A real-time collaborative whiteboard for brainstorming, wireframing, and visual thinking — built with Next.js, FastAPI, tldraw, and Supabase.

---

## Features

- **Infinite Canvas** — Sketch, draw, and write with the full tldraw toolset
- **Real-time Collaboration** — Changes sync instantly across all users via WebSockets
- **Auto-Save** — Board state is automatically persisted to Supabase at regular intervals
- **Room Sharing** — Create rooms and invite collaborators with a short code or shareable link
- **Google OAuth** — Passwordless sign-in powered by Supabase Auth
- **Dark Mode** — A sleek dark theme applied across the entire app
- **Smart Redirects** — Shared board links work even if the user isn't signed in yet

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript |
| Canvas | tldraw SDK |
| Backend | FastAPI, Python |
| Real-time | WebSockets |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Google OAuth) |
| Hosting | Vercel (frontend), Railway (backend) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- A [Supabase](https://supabase.com) project with Google OAuth configured

### 1. Database Setup

Run the migration in your Supabase SQL Editor:

```sql
-- Copy and execute the contents of supabase/migration.sql
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env from the example and fill in your Supabase credentials
cp .env.example .env

uvicorn app.main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install

# Create .env.local with the following variables:
# NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
# NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
# NEXT_PUBLIC_WS_URL=ws://localhost:8000
# NEXT_PUBLIC_TLDRAW_LICENSE_KEY=<your-tldraw-license-key>

npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start collaborating.

---

## Project Structure

```
CoWhiteboard/
├── frontend/                       # Next.js client
│   ├── app/
│   │   ├── page.tsx                # Landing page
│   │   ├── page.module.css         # Landing page styles
│   │   ├── globals.css             # Global design tokens and utilities
│   │   ├── layout.tsx              # Root layout with auth provider
│   │   ├── icon.svg                # Favicon
│   │   ├── auth/callback/          # OAuth redirect handler
│   │   └── whiteboard/[roomId]/    # Collaborative board (dynamic route)
│   ├── components/
│   │   ├── WhiteboardCanvas.tsx    # tldraw canvas with WebSocket sync
│   │   ├── Toolbar.tsx             # Room toolbar (sharing, status, user)
│   │   ├── Toolbar.module.css      # Toolbar styles
│   │   ├── AuthProvider.tsx        # Auth context provider
│   │   └── AuthGuard.tsx           # Route protection with redirect
│   └── lib/
│       └── supabaseClient.ts       # Supabase browser client
├── backend/                        # FastAPI server
│   ├── app/
│   │   ├── main.py                 # App entry point and CORS config
│   │   ├── config.py               # Environment configuration
│   │   ├── room_manager.py         # WebSocket room and connection manager
│   │   ├── supabase_client.py      # Supabase client singleton
│   │   └── routers/
│   │       ├── rooms.py            # REST endpoints for room CRUD
│   │       └── ws.py               # WebSocket endpoint with auto-save
│   ├── requirements.txt
│   ├── Procfile                    # Railway process definition
│   └── railway.toml                # Railway build config
└── supabase/
    └── migration.sql               # Database schema (rooms + snapshots)
```

---

## Deployment

| Service | Platform | Root Directory |
| --- | --- | --- |
| Frontend | [Vercel](https://vercel.com) | `frontend/` |
| Backend | [Railway](https://railway.app) | `backend/` |
| Database | [Supabase](https://supabase.com) | — |

Set the same environment variables listed in the Getting Started section on each platform.

---

## License

This project uses [tldraw](https://tldraw.dev) under a hobby license.
