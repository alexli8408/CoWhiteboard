"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import styles from "./page.module.css";

function generateRoomCode(length = 8) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    code += chars[array[i] % chars.length];
  }
  return code;
}

export default function Home() {
  const router = useRouter();
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const [joinCode, setJoinCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Redirect to saved URL after sign-in
  useEffect(() => {
    if (!loading && user) {
      const redirect = localStorage.getItem("redirectAfterLogin");
      if (redirect) {
        localStorage.removeItem("redirectAfterLogin");
        router.push(redirect);
      }
    }
  }, [user, loading, router]);

  const handleCreateBoard = async () => {
    setIsCreating(true);
    const roomId = generateRoomCode();
    router.push(`/board/${roomId}`);
  };

  const handleJoinBoard = (e: React.FormEvent) => {
    e.preventDefault();
    const code = joinCode.trim();
    if (code) {
      router.push(`/board/${code}`);
    }
  };

  return (
    <div className={styles.page}>
      {/* Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.navBrand}>
          <span className={styles.navLogo}>⬡</span>
          <span className={styles.navName}>CoWhiteboard</span>
        </div>

        <div className={styles.navRight}>
          {loading ? null : user ? (
            <div className={styles.navUser}>
              <button
                className={styles.avatarBtn}
                onClick={() => setShowMenu(!showMenu)}
              >
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt=""
                    className={styles.navAvatar}
                  />
                ) : (
                  <div className={styles.navAvatarFallback}>
                    {(user.user_metadata?.full_name?.[0] || user.email?.[0] || "?").toUpperCase()}
                  </div>
                )}
              </button>
              {showMenu && (
                <>
                  <div className={styles.menuOverlay} onClick={() => setShowMenu(false)} />
                  <div className={styles.dropdownMenu}>
                    <div className={styles.menuUser}>
                      <span className={styles.menuName}>
                        {user.user_metadata?.full_name || "User"}
                      </span>
                      <span className={styles.menuEmail}>{user.email}</span>
                    </div>
                    <div className={styles.menuDivider} />
                    <button
                      className={styles.menuSignOut}
                      onClick={() => { signOut(); setShowMenu(false); }}
                    >
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button onClick={signInWithGoogle} className={styles.navSignIn} id="google-signin-btn">
              Sign in
            </button>
          )}
        </div>
      </nav>

      {/* Main content */}
      <main className={styles.main}>
        <h1 className={styles.title}>
          <span className={styles.titleIcon}>⬡</span>{" "}CoWhiteboard
        </h1>

        <p className={styles.subtitle}>
          Create a whiteboard, invite your friends, and collaborate together in real time.
        </p>

        <div className={styles.actions}>
          {user ? (
            <button
              className="btn-primary"
              onClick={handleCreateBoard}
              disabled={isCreating}
              id="create-board-btn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              {isCreating ? "Creating..." : "Create a Whiteboard"}
            </button>
          ) : (
            <button
              className="btn-primary"
              onClick={signInWithGoogle}
              id="signin-to-create-btn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Sign in to Create a Whiteboard
            </button>
          )}
        </div>

        {/* Join section */}
        <div className={styles.joinSection}>
          <form onSubmit={handleJoinBoard} className={styles.joinForm}>
            <input
              type="text"
              className={styles.joinInput}
              placeholder="Enter a room code to join..."
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              id="join-code-input"
            />
            <button
              type="submit"
              className={styles.joinBtn}
              disabled={!joinCode.trim()}
              id="join-board-btn"
            >
              Join Room
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <span>CoWhiteboard</span>
        <span>Powered by FastAPI &amp; Supabase</span>
      </footer>
    </div>
  );
}
