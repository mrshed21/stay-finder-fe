import PropertyList from "@/components/PropertyList";
import { Suspense } from "react";

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-10 sm:px-6 sm:py-14">
      <Suspense fallback={<p role="status" className="text-muted">Loading stays…</p>}>
        <PropertyList searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
