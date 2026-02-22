# CoWhiteboard

A real-time collaborative whiteboard for brainstorming, wireframing, and visual thinking. Built with Next.js, FastAPI, tldraw, and Supabase.

## Features

- **Infinite Canvas** — Draw, write, and sketch with professional tools powered by tldraw
- **Real-time Sync** — See everyone's changes instantly via WebSockets
- **Auto-Save** — Boards are automatically persisted to Supabase
- **Shareable Rooms** — Create a room and invite others with a short room code or link
- **Google OAuth** — Sign in with Google via Supabase Auth
- **Dark Mode** — Consistent dark theme across all devices
- **Post-Login Redirect** — Shared board links work seamlessly, even when not signed in

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript |
| Canvas | tldraw SDK |
| Backend | FastAPI, Python |
| Real-time | WebSockets |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Google OAuth) |
| Hosting | Vercel (frontend), Railway (backend) |

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- A [Supabase](https://supabase.com) project with Google OAuth configured

### 1. Database Setup

Run the SQL migration in your Supabase SQL Editor:

```sql
-- Copy contents of supabase/migration.sql
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env with your Supabase credentials
cp .env.example .env

uvicorn app.main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install

# Create .env.local with your environment variables:
# NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
# NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
# NEXT_PUBLIC_WS_URL=ws://localhost:8000
# NEXT_PUBLIC_TLDRAW_LICENSE_KEY=<your-tldraw-license-key>

npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start collaborating.

## Project Structure

```
CoWhiteboard/
├── frontend/                     # Next.js app
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── page.module.css       # Landing page styles
│   │   ├── globals.css           # Global design system
│   │   ├── icon.svg              # Favicon
│   │   ├── layout.tsx            # Root layout
│   │   ├── auth/callback/        # OAuth callback handler
│   │   └── whiteboard/[roomId]/    # Board page (dynamic route)
│   ├── components/
│   │   ├── WhiteboardCanvas.tsx  # tldraw canvas + WebSocket sync
│   │   ├── Toolbar.tsx           # Room toolbar with sharing
│   │   ├── Toolbar.module.css    # Room toolbar styles
│   │   ├── AuthProvider.tsx      # Auth context provider
│   │   └── AuthGuard.tsx         # Route protection with redirect
│   └── lib/
│       └── supabaseClient.ts     # Supabase browser client
├── backend/                      # FastAPI app
│   ├── app/
│   │   ├── main.py               # Entry point + CORS config
│   │   ├── config.py             # Environment config
│   │   ├── room_manager.py       # WebSocket connection tracking
│   │   ├── supabase_client.py    # Supabase DB client
│   │   └── routers/
│   │       ├── rooms.py          # REST API for room operations
│   │       └── ws.py             # WebSocket endpoint
│   ├── requirements.txt
│   ├── Procfile                  # Railway deployment
│   └── railway.toml              # Railway config
└── supabase/
    └── migration.sql             # Database schema
```

## Deployment

- **Frontend**: Deployed to [Vercel](https://vercel.com) from the `frontend/` root directory
- **Backend**: Deployed to [Railway](https://railway.app) from the `backend/` root directory
- **Database**: Hosted on [Supabase](https://supabase.com)

Environment variables must be configured on each platform. See the Getting Started section for the required variables.

## License

This project uses [tldraw](https://tldraw.dev) under a hobby license.
