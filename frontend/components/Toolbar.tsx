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

    const shortCode = roomId.slice(0, 8);

    const handleCopyLink = async () => {
        const url = `${window.location.origin}/board/${roomId}`;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for older browsers
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
                    title="Back to home"
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

                <div className={styles.roomInfo}>
                    <span className={styles.roomLabel}>Room</span>
                    <code className={styles.roomCode}>{shortCode}</code>
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
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                            Share
                        </>
                    )}
                </button>

                {user && (
                    <div className={styles.toolbarUser}>
                        {user.user_metadata?.avatar_url && (
                            <img
                                src={user.user_metadata.avatar_url}
                                alt=""
                                className={styles.toolbarAvatar}
                            />
                        )}
                        <button
                            className={styles.signOutBtn}
                            onClick={signOut}
                            title="Sign out"
                        >
                            Sign out
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
