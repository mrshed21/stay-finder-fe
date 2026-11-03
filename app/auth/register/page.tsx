import AuthForm from "@/components/AuthForm";

export default function RegisterPage() {
  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-12 sm:px-6 sm:py-16">
      <AuthForm mode="register" />
    </main>
  );
}
