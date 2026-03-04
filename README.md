# ⬡ CoWhiteboard

Create a whiteboard, invite your friends, and collaborate together in real time.

**[Live Demo →](https://cowhiteboard.vercel.app)**

---

## Features

- **Infinite Canvas** — Draw, write, and sketch with professional tools powered by [tldraw](https://tldraw.dev)
- **Real-time Sync** — See collaborators' changes instantly via WebSockets
- **Persistent State** — Board state is cached in-memory for instant loading and auto-saved to Supabase
- **Shareable Rooms** — Create a room and share it with a short code or a direct link
- **Google OAuth** — Sign in with Google via Supabase Auth
- **Smart Redirects** — Shared links work seamlessly even when not signed in
- **Dark Mode** — Clean dark theme with a purple accent palette

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js, React, TypeScript |
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

### 1. Clone

```bash
git clone https://github.com/alexli8408/CoWhiteboard.git
cd CoWhiteboard
```

### 2. Database

Run the migration in your [Supabase SQL Editor](https://supabase.com/dashboard):

```sql
-- Copy and paste the contents of supabase/migration.sql
```

This creates the `rooms` and `snapshots` tables with Row Level Security enabled.

### 3. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env   # Fill in your Supabase credentials

uvicorn app.main:app --reload --port 8000
```

| Variable | Description |
| --- | --- |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Your Supabase service role key |

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |
| `NEXT_PUBLIC_WS_URL` | WebSocket server URL (default: `ws://localhost:8000`) |

Open [http://localhost:3000](http://localhost:3000) and start collaborating.

---

## Project Structure

```
CoWhiteboard/
├── frontend/                      # Next.js app
│   ├── app/
│   │   ├── layout.tsx             # Root layout with AuthProvider + OG meta
│   │   ├── page.tsx               # Landing / hero page
│   │   ├── auth/callback/         # OAuth callback handler
│   │   └── whiteboard/[roomId]/   # Whiteboard page (dynamic route)
│   ├── components/
│   │   ├── WhiteboardCanvas.tsx   # tldraw canvas + WebSocket sync
│   │   ├── Toolbar.tsx            # Room toolbar (share, user count, status)
│   │   ├── AuthProvider.tsx       # Auth context provider
│   │   └── AuthGuard.tsx          # Route protection with redirect
│   └── lib/
│       └── supabaseClient.ts      # Supabase browser client
├── backend/                       # FastAPI app
│   ├── app/
│   │   ├── main.py                # Entry point, CORS, router registration
│   │   ├── config.py              # Environment variable config
│   │   ├── room_manager.py        # Room/connection + in-memory snapshot management
│   │   ├── supabase_client.py     # Supabase client singleton
│   │   └── routers/
│   │       └── ws.py              # WebSocket endpoint + auto-save
│   ├── requirements.txt
│   └── Procfile                   # Railway deployment
└── supabase/
    └── migration.sql              # Database schema (rooms + snapshots)
```

---

## How It Works

1. **Create or Join** — Sign in with Google, then create a new whiteboard or join an existing room with a code.
2. **Draw** — The tldraw SDK provides a full-featured canvas with drawing tools, shapes, text, and more.
3. **Sync** — Local changes are captured via a tldraw store listener and sent over WebSockets to the backend, which broadcasts them to all other users in the room.
4. **Persist** — Every update is cached in-memory on the backend for instant loading. Snapshots are also periodically saved to Supabase and persisted when the last user leaves.

---

## Deployment

| Service | Platform | Root Directory |
| --- | --- | --- |
| Frontend | [Vercel](https://vercel.com) | `frontend/` |
| Backend | [Railway](https://railway.app) | `backend/` |
| Database | [Supabase](https://supabase.com) | — |

Configure the environment variables listed above on each platform.

---

## License

This project uses [tldraw](https://tldraw.dev) under a hobby license.
