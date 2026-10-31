import PropertyBookerCard from "@/components/PropertyBookerCard";
import T from "@/components/typography";
import { getPropertyById } from "@/utils/propertyService";
import Link from "next/link";
import { notFound } from "next/navigation";
import PropertyOwnerControls from "@/components/PropertyOwnerControls";

export default async function PropertyPage({
  params,
}: PageProps<"/properties/[id]">) {
  const { id } = await params;
  const result = await getPropertyById(id);
  if ("notFound" in result) {
    notFound();
  }
  if ("error" in result) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">{result.error}</p>
        <Link href="/">Back to stays</Link>
      </main>
    );
  }
  const property = result.property;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
      <Link
        href="/"
        className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        All stays
      </Link>
      <div className="flex flex-col gap-2">
        <p className="text-sm capitalize text-zinc-500">{property.kind}</p>
        <T.Header size="lg">{property.title}</T.Header>
        <p className="text-zinc-600 dark:text-zinc-400">{property.location}</p>
      </div>
      <p className="max-w-prose leading-relaxed">{property.description}</p>
      <dl className="grid grid-cols-2 gap-4 rounded-xl border border-zinc-200 p-5 text-sm dark:border-zinc-800">
        <div>
          <dt className="text-zinc-500">Price per night</dt>
          <dd className="mt-1 text-lg font-semibold">
            {property.price_per_night} kr
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">Guests</dt>
          <dd className="mt-1 text-lg font-semibold">{property.max_guests}</dd>
        </div>
      </dl>
      <PropertyBookerCard property={property}/>
      <PropertyOwnerControls property={property} />
    </main>
  );
}
