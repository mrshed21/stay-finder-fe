"use client";

import { useAuth } from "@/contexts/auth";
import Link from "next/link";
import { useState } from "react";

export default function AuthHeader(){
    const auth = useAuth()
    const [error, setError] = useState<string>();
    const [pending, setPending] = useState(false);

    const onLogout = async () => {
        setPending(true);
        setError(undefined);
        const result = await auth.logout();
        if (result) setError(result);
        setPending(false);
    }

    return (
        <div>
            {auth.isPending ? "Checking login..." : auth.user ? (
                <div className="flex items-center gap-3">
                    <span>{auth.user.email}</span>
                    <button type="button" onClick={onLogout} disabled={pending}>Logout</button>
                </div>
            ) : (
                <div className="flex gap-3">
                    <Link href="/auth/login">Login</Link>
                    <Link href="/auth/register">Register</Link>
                </div>
            )}
            {error && <p className="text-red-500">{error}</p>}
        </div>
    )
}
