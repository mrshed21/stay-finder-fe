import { useAuth } from "@/contexts/auth";
import Link from "next/link";
import { PropsWithChildren } from "react";


export default function AuthGate({ children }: PropsWithChildren) {
    const auth = useAuth()
    if(auth.isPending) {
        return (
            <div className="text-muted">
                Loading...
            </div>
        )
    }
    if(!auth.user) {
        return (
            <div className="glass flex flex-col items-start gap-4 p-6 sm:p-8">
                <p>You have to be logged in to do this</p>
                <Link className="button-primary" href={"/auth/login"}>
                    Go to Login
                </Link>
            </div>
        )
    }
    return children
}
