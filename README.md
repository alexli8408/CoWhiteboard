# CoWhiteboard — Collaborative Whiteboard

A real-time collaborative whiteboard for brainstorming, wireframing, and visual thinking. Built with **Next.js**, **FastAPI**, **tldraw**, and **Supabase**.

## Features

- 🎨 **Infinite Canvas** — Draw, write, and sketch with professional tools (powered by tldraw)
- ⚡ **Real-time Sync** — See everyone's changes instantly via WebSockets
- 💾 **Auto-Save** — Boards are automatically persisted to Supabase
- 🔗 **Share via Link** — Create a room and invite others with a shareable URL
- 🔐 **Google OAuth** — Sign in with Google via Supabase Auth
- 🌙 **Dark Mode** — Modern, premium dark UI

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React, TypeScript |
| Canvas | tldraw SDK |
| Backend | FastAPI, Python |
| Real-time | WebSockets |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Google OAuth) |

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- A [Supabase](https://supabase.com) project

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

# Create .env from the example
cp .env.example .env
# Edit .env with your Supabase credentials

uvicorn app.main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start collaborating!

## Project Structure

```
CoWhiteboard/
├── frontend/                     # Next.js app
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── globals.css           # Design system
│   │   ├── auth/callback/        # OAuth callback
│   │   └── board/[roomId]/       # Board page
│   ├── components/
│   │   ├── WhiteboardCanvas.tsx  # tldraw + WebSocket sync
│   │   ├── Toolbar.tsx           # Room toolbar
│   │   ├── AuthProvider.tsx      # Auth context
│   │   └── AuthGuard.tsx         # Route protection
│   └── lib/
│       └── supabaseClient.ts     # Supabase browser client
├── backend/                      # FastAPI app
│   ├── app/
│   │   ├── main.py               # Entry point
│   │   ├── room_manager.py       # Connection tracking
│   │   ├── supabase_client.py    # DB client
│   │   └── routers/
│   │       ├── rooms.py          # REST API
│   │       └── ws.py             # WebSocket endpoint
│   └── requirements.txt
└── supabase/
    └── migration.sql             # DB schema
```

## License

This project uses [tldraw](https://tldraw.dev) under a hobby license.
