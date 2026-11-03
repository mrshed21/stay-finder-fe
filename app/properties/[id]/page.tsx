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
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-start gap-6 px-4 py-10 sm:px-6 sm:py-14">
        <p role="alert" className="notice-error w-full">{result.error}</p>
        <Link href="/" className="button-secondary">Back to stays</Link>
      </main>
    );
  }
  const property = result.property;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href="/"
        className="w-fit text-sm font-medium text-muted hover:text-foreground"
      >
        <span aria-hidden="true">← </span>All stays
      </Link>
      <div className="flex flex-col items-start gap-3">
        <p className="badge">{property.kind}</p>
        <T.Header size="lg">{property.title}</T.Header>
        <p className="text-muted">{property.location}</p>
      </div>
      <p className="max-w-prose leading-relaxed">{property.description}</p>
      <dl className="glass grid grid-cols-2 divide-x divide-line-soft text-sm">
        <div className="p-5">
          <dt className="text-muted">Price per night</dt>
          <dd className="mt-1 text-2xl font-semibold">
            {property.price_per_night} kr
          </dd>
        </div>
        <div className="p-5">
          <dt className="text-muted">Guests</dt>
          <dd className="mt-1 text-2xl font-semibold">{property.max_guests}</dd>
        </div>
      </dl>
      <PropertyBookerCard property={property}/>
      <PropertyOwnerControls property={property} />
    </main>
  );
}
