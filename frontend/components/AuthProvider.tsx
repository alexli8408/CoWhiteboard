"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    ReactNode,
} from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabaseClient";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signInWithGoogle: async () => { },
    signOut: async () => { },
});

export function useAuth() {
    return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const signInWithGoogle = useCallback(async () => {
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const signOut = useCallback(async () => {
        await supabase.auth.signOut();
        setUser(null);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <AuthContext.Provider
            value={{ user, loading, signInWithGoogle, signOut }}
        >
            {children}
        </AuthContext.Provider>
    );
}
