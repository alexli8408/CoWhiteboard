"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import styles from "./Toolbar.module.css";

interface ToolbarProps {
    roomId: string;
    userCount: number;
    connectionStatus: "connected" | "reconnecting" | "disconnected";
}

export default function Toolbar({
    roomId,
    userCount,
    connectionStatus,
}: ToolbarProps) {
    const router = useRouter();
    const { user, signOut } = useAuth();
    const [copied, setCopied] = useState(false);
    const [codeCopied, setCodeCopied] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(roomId);
        } catch {
            const input = document.createElement("input");
            input.value = roomId;
            document.body.appendChild(input);
            input.select();
            document.execCommand("copy");
            document.body.removeChild(input);
        }
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
    };

    const handleCopyLink = async () => {
        const url = `${window.location.origin}/whiteboard/${roomId}`;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            const input = document.createElement("input");
            input.value = url;
            document.body.appendChild(input);
            input.select();
            document.execCommand("copy");
            document.body.removeChild(input);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const statusLabel =
        connectionStatus === "connected"
            ? "Connected"
            : connectionStatus === "reconnecting"
                ? "Reconnecting..."
                : "Disconnected";

    return (
        <div className={styles.toolbar}>
            <div className={styles.left}>
                <button
                    className={styles.backBtn}
                    onClick={() => router.push("/")}
                    id="back-home-btn"
                >
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                    </svg>
                </button>

                <div className={styles.roomInfo} onClick={handleCopyCode} title="Click to copy room code" style={{ cursor: "pointer" }}>
                    <span className={styles.roomLabel}>Room</span>
                    <code className={styles.roomCode}>
                        {codeCopied ? (
                            <>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", marginRight: "4px" }}>
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                Copied!
                            </>
                        ) : roomId}
                    </code>
                </div>
            </div>

            <div className={styles.center}>
                <span className={styles.brandmark}>CoWhiteboard</span>
            </div>

            <div className={styles.right}>
                <div
                    className={`status-badge ${connectionStatus === "disconnected" ? "disconnected" : ""} ${connectionStatus === "reconnecting" ? "reconnecting" : ""}`}
                    id="connection-status"
                >
                    <span className="status-dot" />
                    {statusLabel}
                </div>

                <div className={styles.userCount} title={`${userCount} user(s) online`}>
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                    {userCount}
                </div>

                <button
                    className={styles.copyBtn}
                    onClick={handleCopyLink}
                    title="Copy room link"
                    id="copy-link-btn"
                >
                    {copied ? (
                        <>
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Copied!
                        </>
                    ) : (
                        <>
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                            </svg>
                            Share Link
                        </>
                    )}
                </button>

                {user && (
                    <div className={styles.toolbarUser}>
                        <button
                            className={styles.avatarBtn}
                            onClick={() => setShowMenu(!showMenu)}
                        >
                            {user.user_metadata?.avatar_url ? (
                                <img
                                    src={user.user_metadata.avatar_url}
                                    alt=""
                                    className={styles.toolbarAvatar}
                                />
                            ) : (
                                <div className={styles.avatarFallback}>
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
                )}
            </div>
        </div>
    );
}
