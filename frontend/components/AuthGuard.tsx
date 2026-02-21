"use client";

import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            // Save the intended destination so we can redirect after sign-in
            const currentPath = window.location.pathname;
            if (currentPath !== "/") {
                localStorage.setItem("redirectAfterLogin", currentPath);
            }
            router.replace("/");
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div
                style={{
                    height: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "var(--bg-primary)",
                    color: "var(--text-secondary)",
                    fontSize: "1.1rem",
                }}
            >
                Loading...
            </div>
        );
    }

    if (!user) return null;

    return <>{children}</>;
}
