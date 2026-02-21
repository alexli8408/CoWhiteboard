# CoWhiteboard Development Log

This document tracks the development progress, design decisions, and technical challenges encountered while building CoWhiteboard.

---

## Project Overview

CoWhiteboard is a real-time collaborative whiteboard application that allows multiple users to draw, sketch, and brainstorm together on a shared infinite canvas. The project was built as a full-stack web application using Next.js for the frontend, FastAPI for the backend, tldraw for the canvas rendering, and Supabase for authentication and data persistence.

---

## Phase 1: Foundation and Core Architecture

### Project Setup

The project started with a monorepo structure containing two main directories: `frontend/` (Next.js) and `backend/` (FastAPI). This separation keeps concerns clean while allowing both services to live in a single repository for easier version control and deployment.

The frontend was initialized using `create-next-app` with TypeScript and the App Router. The backend was set up as a standard FastAPI application with uvicorn as the ASGI server.

### Canvas Integration with tldraw

The core of the whiteboard functionality is powered by [tldraw](https://tldraw.dev), an open-source infinite canvas SDK. tldraw provides a complete drawing toolkit out of the box, including:

- Freehand drawing, shapes, text, and sticky notes
- Pan, zoom, and infinite canvas navigation
- A polished toolbar with professional drawing tools
- Undo/redo history

The tldraw editor is mounted inside a `WhiteboardCanvas` component that handles the integration between the canvas state and the backend synchronization layer.

### WebSocket Real-time Sync

Real-time collaboration is implemented using WebSockets. The architecture works as follows:

1. When a user opens a board, the frontend establishes a WebSocket connection to the FastAPI backend, identified by the room ID.
2. The backend's `RoomManager` tracks all active connections per room.
3. When a user makes changes on the canvas, tldraw emits store change events. The frontend captures these events and sends the deltas (added, updated, or removed records) to the backend via the WebSocket.
4. The backend broadcasts these deltas to all other connected clients in the same room.
5. Each receiving client applies the incoming changes to their local tldraw store, keeping all canvases in sync.

This delta-based approach minimizes bandwidth usage compared to sending the full canvas state on every change.

### Data Persistence with Supabase

Board data is persisted to Supabase (PostgreSQL) so that users can return to a board later and find their work intact. The backend handles saving and loading:

- On room join, the backend fetches the latest snapshot from Supabase and sends it to the connecting client.
- Periodically and on disconnect, the backend saves the current room state back to Supabase.

---

## Phase 2: Authentication

### Google OAuth via Supabase Auth

Authentication was implemented using Supabase Auth with Google as the OAuth provider. The flow works as follows:

1. The user clicks "Sign in" on the landing page.
2. The frontend initiates a Supabase OAuth flow, which redirects to Google's consent screen.
3. After the user authorizes, Google redirects back to the Supabase callback URL.
4. Supabase exchanges the authorization code for session tokens and redirects to the application's `/auth/callback` route.
5. The callback route handler (a Next.js Route Handler using `@supabase/ssr`) exchanges the code for a session and sets cookies.
6. The user is redirected to the homepage, now authenticated.

An `AuthProvider` component wraps the entire application and provides user state via React Context. An `AuthGuard` component protects the board routes, redirecting unauthenticated users to the homepage.

### Post-Login Redirect

A common user flow issue was identified: when a user receives a shared board link but isn't signed in, they'd be redirected to the homepage and lose the original link after authentication. This was solved by:

1. The `AuthGuard` saves the intended board path to `localStorage` before redirecting.
2. After sign-in, the homepage checks for a saved redirect and automatically navigates the user to their intended board.

This also powers the "Sign in to Create a Whiteboard" button, which pre-generates a room code and saves it as the redirect target before initiating the OAuth flow.

---

## Phase 3: UI/UX Design

### Landing Page

The landing page follows a clean, centered layout with a top navigation bar. The design uses a dark theme with purple accent gradients throughout, consistent with modern developer tool aesthetics.

Key elements:
- **Navbar**: Brand name with hexagon icon, user avatar with dropdown menu (or sign-in button)
- **Hero**: Large title, descriptive subtitle, and primary action button
- **Join Section**: Input field for entering room codes to join existing rooms
- **Footer**: Minimal branding and tech attribution

### Board Page

The board page consists of two main elements:
- **Custom Toolbar**: Positioned at the top, displaying the room code (clickable to copy), connection status, user count, share link button, and user avatar with dropdown menu.
- **tldraw Canvas**: Fills the remaining viewport below the toolbar.

### Design Decisions

- **Dark mode enforced**: tldraw's color scheme is forced to dark mode on all devices via `editor.user.updateUserPreferences({ colorScheme: "dark" })`, ensuring a consistent experience regardless of the device's system theme preference.
- **Avatar dropdown consistency**: Both the landing page and board toolbar use the same avatar dropdown pattern (click to open, showing name/email and sign-out) for a seamless transition between pages.
- **Short room codes**: Room IDs were changed from UUIDs (36 characters) to 8-character alphanumeric codes generated with `crypto.getRandomValues()`, making them easier to share verbally or type manually.

---

## Phase 4: Deployment

### Frontend — Vercel

The frontend is deployed to Vercel with the root directory set to `frontend/`. Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_TLDRAW_LICENSE_KEY`
- `NEXT_PUBLIC_WS_URL`

Vercel automatically builds and deploys on every push to the `main` branch.

### Backend — Railway

The backend is deployed to Railway with the root directory set to `backend/`. A `Procfile` and `railway.toml` configure the start command:

```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Required environment variables:
- `SUPABASE_URL`
- `SUPABASE_KEY`

### Production OAuth Configuration

For production, the Google OAuth redirect URIs were updated in both Google Cloud Console and Supabase Dashboard to include the production domain's callback URL.

---

## Phase 5: Code Cleanup

A cleanup pass was performed to remove dead code and unused assets:

- Removed unused CSS classes from `globals.css`: `.glass-card`, `.btn-secondary`, `.input`, `.animate-in` variants, `@keyframes fadeInUp`, `.bg-glow`
- Removed unused `.titleGradient` from `page.module.css`
- Deleted default Next.js placeholder SVG assets (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`)
- Removed the `uuid` dependency in favor of a lightweight custom room code generator

The build was verified to compile cleanly with zero errors after all removals.

---

## Technical Challenges

### OAuth Callback Cookie Handling

The initial OAuth callback implementation used `createBrowserClient` from Supabase, which doesn't have access to set cookies in a server-side Route Handler. This was resolved by switching to `createServerClient` from `@supabase/ssr`, which properly manages cookie-based session persistence during the OAuth code exchange.

### tldraw Favicon Format

Next.js Turbopack requires ICO favicons to contain PNG data in RGBA format. The initial favicon generation produced a non-RGBA PNG inside the ICO, causing build failures. This was resolved by switching to an SVG favicon (`icon.svg`), which Next.js App Router natively supports and renders at any resolution.

### Git Submodule Conflict

The frontend directory was initially a separate Git repository, which caused it to be treated as a Git submodule when added to the parent repository. The fix involved removing the nested `.git` directory and resetting the commit history to include the frontend files directly.

---

## Future Improvements

- Room access controls and permissions
- Board thumbnails on the landing page for returning users
- Export boards as images or PDFs
- Cursor presence indicators showing collaborator positions
- Room expiration and cleanup for inactive boards
