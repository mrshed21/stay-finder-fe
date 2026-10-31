import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-10">
      <h1 className="text-2xl font-semibold">Stay not found</h1>
      <p>This stay may have been removed or the address may be incorrect.</p>
      <Link href="/" className="w-fit underline">
        Back to stays
      </Link>
    </main>
  );
}
