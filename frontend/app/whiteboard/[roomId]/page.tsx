"use client";

import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Toolbar from "@/components/Toolbar";
import AuthGuard from "@/components/AuthGuard";
import { useState } from "react";

// Dynamically import tldraw component (client-side only — no SSR)
const WhiteboardCanvas = dynamic(() => import("@/components/WhiteboardCanvas"), {
    ssr: false,
    loading: () => (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: 'var(--bg-primary)',
            color: 'var(--text-secondary)',
            fontSize: '15px',
        }}>
            Loading canvas...
        </div>
    ),
});

export default function BoardPage() {
    const params = useParams();
    const roomId = params.roomId as string;
    const [userCount, setUserCount] = useState(1);
    const [connectionStatus, setConnectionStatus] = useState<
        "connected" | "reconnecting" | "disconnected"
    >("disconnected");

    return (
        <AuthGuard>
            <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
                <Toolbar
                    roomId={roomId}
                    userCount={userCount}
                    connectionStatus={connectionStatus}
                />
                <div className="tldraw-container">
                    <WhiteboardCanvas
                        roomId={roomId}
                        onUserCountChange={setUserCount}
                        onConnectionStatusChange={setConnectionStatus}
                    />
                </div>
            </div>
        </AuthGuard>
    );
}
