"use client";

import { useAuth } from "@/contexts/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function AuthHeader(){
    const auth = useAuth()
    const pathname = usePathname()
    const [error, setError] = useState<string>();
    const [pending, setPending] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const avatarRef = useRef<HTMLButtonElement>(null);

    // While the menu is open: a click outside it or the Escape key closes it.
    useEffect(() => {
        if (!menuOpen) return;
        const onPointerDown = (event: PointerEvent) => {
            if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setMenuOpen(false);
                avatarRef.current?.focus();
            }
        };
        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [menuOpen]);

    const onLogout = async () => {
        setPending(true);
        setError(undefined);
        const result = await auth.logout();
        if (result) setError(result);
        setPending(false);
    }

    if (auth.isPending) {
        return (
            <div className="size-10 rounded-full border border-line-soft bg-glass motion-safe:animate-pulse">
                <span className="sr-only">Checking login...</span>
            </div>
        )
    }

    if (!auth.user) {
        return (
            <div className="flex items-center gap-2">
                <Link className="button-secondary px-3 sm:px-4" href="/auth/login" aria-current={pathname === "/auth/login" ? "page" : undefined}>
                    Login
                </Link>
                <Link className="button-primary px-3 sm:px-4" href="/auth/register" aria-current={pathname === "/auth/register" ? "page" : undefined}>
                    Sign up
                </Link>
            </div>
        )
    }

    return (
        <div ref={menuRef} className="relative">
            <button
                ref={avatarRef}
                type="button"
                className="avatar"
                aria-label={`Account menu for ${auth.user.email}`}
                aria-expanded={menuOpen}
                aria-controls={menuOpen ? "account-menu" : undefined}
                onClick={() => setMenuOpen((open) => !open)}
            >
                {auth.user.email.charAt(0).toUpperCase()}
            </button>

            {menuOpen ? (
                <div id="account-menu" className="menu-panel absolute right-0 top-full z-30 mt-2 w-64 p-2">
                    <div className="px-3 py-2">
                        <p className="text-xs text-muted">Signed in as</p>
                        <p className="truncate text-sm font-medium" title={auth.user.email}>{auth.user.email}</p>
                    </div>
                    <div className="my-1 border-t border-line-soft" />
                    <button className="menu-item" type="button" onClick={onLogout} disabled={pending}>
                        {pending ? "Logging out..." : "Logout"}
                    </button>
                    {error && <p role="alert" className="notice-error m-1 mt-2">{error}</p>}
                </div>
            ) : null}
        </div>
    )
}
