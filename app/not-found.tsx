import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-10 sm:px-6 sm:py-14">
      <div className="glass flex flex-col items-start gap-4 p-6 sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight">Stay not found</h1>
        <p className="text-muted">This stay may have been removed or the address may be incorrect.</p>
        <Link href="/" className="button-secondary">
          Back to stays
        </Link>
      </div>
    </main>
  );
}
