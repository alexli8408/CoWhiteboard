# CoWhiteboard

A real-time collaborative whiteboard for brainstorming, wireframing, and visual thinking — built with Next.js, FastAPI, tldraw, and Supabase.

---

## Features

- **Infinite Canvas** — Draw, write, and sketch with professional tools powered by tldraw
- **Real-time Sync** — See collaborators' changes instantly via WebSockets
- **Auto-Save** — Board state is automatically persisted to Supabase every 30 seconds
- **Shareable Rooms** — Create a room and invite others with a short 8-character code or link
- **Google OAuth** — Sign in with Google via Supabase Auth
- **Dark Mode** — Consistent dark theme with a purple accent gradient
- **Post-Login Redirect** — Shared board links work seamlessly, even when not signed in

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript |
| Canvas | tldraw v4 SDK |
| Backend | FastAPI, Python 3.11+ |
| Real-time | WebSockets (native) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Google OAuth) |
| Hosting | Vercel (frontend), Railway (backend) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- A [Supabase](https://supabase.com) project with Google OAuth configured

### 1. Clone the Repository

```bash
git clone https://github.com/alexli8408/CoWhiteboard.git
cd CoWhiteboard
```

### 2. Database Setup

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

# Create .env with your Supabase credentials
cp .env.example .env

uvicorn app.main:app --reload --port 8000
```

**Required environment variables** (`backend/.env`):

| Variable | Description |
| --- | --- |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Your Supabase service role key |

### 4. Frontend

```bash
cd frontend
npm install

# Create .env.local with your environment variables
npm run dev
```

**Required environment variables** (`frontend/.env.local`):

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |
| `NEXT_PUBLIC_WS_URL` | WebSocket server URL (default: `ws://localhost:8000`) |
| `NEXT_PUBLIC_TLDRAW_LICENSE_KEY` | Your tldraw license key |

Open [http://localhost:3000](http://localhost:3000) and start collaborating.

---

## Project Structure

```
CoWhiteboard/
├── frontend/                      # Next.js app
│   ├── app/
│   │   ├── page.tsx               # Landing page
│   │   ├── page.module.css        # Landing page styles
│   │   ├── globals.css            # Global design tokens and shared styles
│   │   ├── layout.tsx             # Root layout with AuthProvider
│   │   ├── auth/callback/         # OAuth callback handler
│   │   └── whiteboard/[roomId]/   # Whiteboard page (dynamic route)
│   ├── components/
│   │   ├── WhiteboardCanvas.tsx   # tldraw canvas + WebSocket sync
│   │   ├── Toolbar.tsx            # Room toolbar (sharing, user count, status)
│   │   ├── Toolbar.module.css     # Toolbar styles
│   │   ├── AuthProvider.tsx       # Auth context provider
│   │   └── AuthGuard.tsx          # Route protection with redirect
│   └── lib/
│       └── supabaseClient.ts      # Supabase browser client
├── backend/                       # FastAPI app
│   ├── app/
│   │   ├── main.py                # Entry point, CORS, router registration
│   │   ├── config.py              # Environment variable config
│   │   ├── room_manager.py        # WebSocket room/connection management
│   │   ├── supabase_client.py     # Supabase client singleton
│   │   └── routers/
│   │       ├── rooms.py           # REST endpoints (CRUD, snapshots)
│   │       └── ws.py              # WebSocket endpoint + auto-save
│   ├── requirements.txt
│   ├── Procfile                   # Railway deployment
│   └── railway.toml               # Railway config
└── supabase/
    └── migration.sql              # Database schema (rooms + snapshots)
```

---

## How It Works

1. **Create or Join** — Users sign in with Google and create a new whiteboard or join an existing room via a short code.
2. **Draw** — The tldraw SDK provides a full-featured canvas with drawing tools, shapes, text, and more.
3. **Sync** — Local changes are captured via a tldraw store listener and sent over a WebSocket connection to the FastAPI backend, which broadcasts them to all other users in the room.
4. **Persist** — The backend auto-saves a snapshot of the board to Supabase (PostgreSQL) every 30 seconds. When a user joins a room, the latest snapshot is loaded and merged into the canvas.

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
