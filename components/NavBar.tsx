"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth";
import AuthHeader from "./AuthHeader";

export default function NavBar() {
  const auth = useAuth();
  const pathname = usePathname();

  // Explore covers the stay list and every stay page.
  const exploreActive = pathname === "/" || pathname.startsWith("/properties");
  const addStayActive = pathname === "/host/properties/new";

  return (
    <header className="glass-nav relative z-20 border-b sm:sticky sm:top-0">
      <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:flex-nowrap sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground sm:text-xl">
          <span aria-hidden="true" className="size-2.5 rounded-full bg-accent shadow-[0_0_12px_var(--accent)]" />
          Stay Finder
        </Link>

        {/* On phones the links get their own row under the logo. */}
        <nav aria-label="Main" className="order-last flex w-full gap-1 sm:order-none sm:ml-4 sm:mr-auto sm:w-auto">
          <Link href="/" className="nav-link" aria-current={exploreActive ? "page" : undefined}>
            Explore
          </Link>
          {auth.user ? (
            <Link href="/host/properties/new" className="nav-link" aria-current={addStayActive ? "page" : undefined}>
              Add stay
            </Link>
          ) : null}
        </nav>

        <AuthHeader />
      </div>
    </header>
  );
}
