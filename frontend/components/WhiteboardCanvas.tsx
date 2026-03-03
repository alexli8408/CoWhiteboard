"use client";

import { useEffect, useRef, useCallback } from "react";
import { Tldraw, Editor, TLRecord } from "tldraw";
import "tldraw/tldraw.css";

interface WhiteboardCanvasProps {
    roomId: string;
    onUserCountChange: (count: number) => void;
    onConnectionStatusChange: (
        status: "connected" | "reconnecting" | "disconnected"
    ) => void;
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

export default function WhiteboardCanvas({
    roomId,
    onUserCountChange,
    onConnectionStatusChange,
}: WhiteboardCanvasProps) {
    const editorRef = useRef<Editor | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isApplyingRemoteRef = useRef(false);

    // Stable refs for callbacks to avoid re-creating connectWebSocket
    const onUserCountChangeRef = useRef(onUserCountChange);
    const onConnectionStatusChangeRef = useRef(onConnectionStatusChange);
    useEffect(() => { onUserCountChangeRef.current = onUserCountChange; }, [onUserCountChange]);
    useEffect(() => { onConnectionStatusChangeRef.current = onConnectionStatusChange; }, [onConnectionStatusChange]);

    // Track intentional close to prevent auto-reconnect on navigation
    const intentionalCloseRef = useRef(false);

    // Buffer snapshot if it arrives before the editor mounts
    const pendingSnapshotRef = useRef<Record<string, TLRecord> | null>(null);

    const connectWebSocket = useCallback(() => {
        const ws = new WebSocket(`${WS_URL}/ws/${roomId}`);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log(`[CoWhiteboard] Connected to room ${roomId}`);
            onConnectionStatusChangeRef.current("connected");
        };

        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);

                if (message.type === "init") {
                    // Load initial snapshot if available
                    if (message.snapshot) {
                        const records: TLRecord[] = Object.values(message.snapshot);
                        if (records.length > 0) {
                            if (editorRef.current) {
                                // Editor is ready — apply immediately
                                isApplyingRemoteRef.current = true;
                                try {
                                    editorRef.current.store.mergeRemoteChanges(() => {
                                        editorRef.current!.store.put(records);
                                    });
                                } catch (e) {
                                    console.warn("[CoWhiteboard] Failed to apply initial snapshot:", e);
                                } finally {
                                    isApplyingRemoteRef.current = false;
                                }
                            } else {
                                // Editor not mounted yet — buffer the snapshot
                                console.log("[CoWhiteboard] Buffering snapshot until editor mounts");
                                pendingSnapshotRef.current = message.snapshot;
                            }
                        }
                    }
                    if (message.userCount) {
                        onUserCountChangeRef.current(message.userCount);
                    }
                } else if (message.type === "update") {
                    // Apply remote changes from another user
                    if (editorRef.current && message.changes) {
                        isApplyingRemoteRef.current = true;
                        try {
                            const editor = editorRef.current;
                            editor.store.mergeRemoteChanges(() => {
                                const { added, updated, removed } = message.changes;
                                // Add new records
                                if (added && Object.keys(added).length > 0) {
                                    editor.store.put(Object.values(added));
                                }
                                // Update existing records
                                if (updated && Object.keys(updated).length > 0) {
                                    const updates = Object.values(updated).map(
                                        (pair: unknown) => (pair as [TLRecord, TLRecord])[1]
                                    );
                                    editor.store.put(updates);
                                }
                                // Remove deleted records
                                if (removed && Object.keys(removed).length > 0) {
                                    const ids = Object.keys(removed) as TLRecord["id"][];
                                    editor.store.remove(ids);
                                }
                            });
                        } catch (e) {
                            console.warn("[CoWhiteboard] Failed to apply remote changes:", e);
                        } finally {
                            isApplyingRemoteRef.current = false;
                        }
                    }
                } else if (message.type === "user_count") {
                    onUserCountChangeRef.current(message.count);
                }
            } catch (e) {
                console.warn("[CoWhiteboard] Failed to parse message:", e);
            }
        };

        ws.onclose = () => {
            if (intentionalCloseRef.current) {
                // Intentional close (navigation away) — don't reconnect
                console.log("[CoWhiteboard] Disconnected (intentional)");
                onConnectionStatusChangeRef.current("disconnected");
                return;
            }
            console.log("[CoWhiteboard] Disconnected, reconnecting in 2s...");
            onConnectionStatusChangeRef.current("reconnecting");
            reconnectTimeoutRef.current = setTimeout(() => {
                connectWebSocket();
            }, 2000);
        };

        ws.onerror = () => {
            console.warn("[CoWhiteboard] WebSocket error — will retry");
        };

        return ws;
    }, [roomId]);

    // Connect WebSocket on mount
    useEffect(() => {
        intentionalCloseRef.current = false;
        const ws = connectWebSocket();

        return () => {
            intentionalCloseRef.current = true;
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            ws.close();
        };
    }, [connectWebSocket]);

    // Handle editor mount — set up store listener
    const handleMount = useCallback(
        (editor: Editor) => {
            editorRef.current = editor;

            // Apply any buffered snapshot that arrived before the editor mounted
            if (pendingSnapshotRef.current) {
                const records: TLRecord[] = Object.values(pendingSnapshotRef.current);
                if (records.length > 0) {
                    isApplyingRemoteRef.current = true;
                    try {
                        editor.store.mergeRemoteChanges(() => {
                            editor.store.put(records);
                        });
                        console.log("[CoWhiteboard] Applied buffered snapshot");
                    } catch (e) {
                        console.warn("[CoWhiteboard] Failed to apply buffered snapshot:", e);
                    } finally {
                        isApplyingRemoteRef.current = false;
                    }
                }
                pendingSnapshotRef.current = null;
            }

            // Listen for local changes and send them to the server
            const unsubscribe = editor.store.listen(
                (event) => {
                    // Only send user-initiated changes, not remote ones
                    if (isApplyingRemoteRef.current) return;

                    const ws = wsRef.current;
                    if (!ws || ws.readyState !== WebSocket.OPEN) return;

                    ws.send(
                        JSON.stringify({
                            type: "update",
                            changes: event.changes,
                            data: editor.store.serialize(),
                        })
                    );
                },
                { source: "user", scope: "document" }
            );

            return () => {
                unsubscribe();
            };
        },
        []
    );

    return (
        <Tldraw
            onMount={(editor) => {
                editor.user.updateUserPreferences({ colorScheme: "dark" });
                handleMount(editor);
            }}
            autoFocus
        />
    );
}
