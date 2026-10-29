"use client";

import { useState } from "react";
import type {SubmitEvent} from "react"
import T from "./typography";
import { useAuth } from "@/contexts/auth";
import { useRouter } from "next/navigation";
import { register } from "@/utils/authService";

export default function AuthForm({ mode = "login" }: { mode?: "login" | "register" }) {
    const auth = useAuth()
    const router = useRouter()
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [pending, setPending] = useState(false);

  const onSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email")).trim();
    const password = String(formData.get("password"));
    setError(undefined);
    setSuccess(undefined);
    setPending(true);
    try {
      if (mode === "register") {
        if (!await register(email, password)) {
          setError("Could not create account. Check the email and password.");
          return;
        }
        const user = await auth.refreshUser();
        setSuccess(user
          ? "Account created and signed in."
          : "Account created. Confirm your email if required, then log in.");
        return;
      }

      const response = await auth.login(email, password)
      if(typeof response === "string") {
          setError(response)
          return;
      }
      router.push("/")
    } catch {
      setError(mode === "register" ? "Could not create account." : "Could not log in.");
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <T.Header>{mode === "register" ? "Register" : "Log in"}</T.Header>
      <input name="email" type="email" placeholder="Enter email" required />
      <input name="password" type="password" placeholder="Enter Password" minLength={6} required />
      <button type="submit" disabled={pending}>{mode === "register" ? "Register" : "Log in"}</button>
      {error && (
        <p className="text-red-500">{error}</p>
      )}
      {success && <p>{success}</p>}
    </form>
  );
}
