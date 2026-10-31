import PropertyList from "@/components/PropertyList";
import { Suspense } from "react";

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-10">
      <Suspense fallback={<p>Loading stays…</p>}>
        <PropertyList searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
