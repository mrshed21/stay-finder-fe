import type { Property } from "@/types/property";
import { cn } from "@/utils/cn";
import Link from "next/link";
import T from "./typography";

type PropertyCardProps = {
  property: Property;
  className?: string;
};

export default function PropertyCard({
  property,
  className,
}: PropertyCardProps) {
  return (
    <Link
      href={`/properties/${property.property_id}`}
      className={cn(
        "glass flex h-full flex-col gap-1 p-5 hover:border-olive hover:bg-[#45342c]/95 motion-safe:hover:-translate-y-0.5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <T.Header size="md">{property.title}</T.Header>
        <span className="badge mt-0.5 shrink-0">{property.kind}</span>
      </div>
      <p className="mb-5 text-sm text-muted">
        {property.location}
      </p>
      <p className="mt-auto border-t border-line-soft pt-4 text-lg font-semibold">
        {property.price_per_night} kr
        <span className="text-sm font-normal text-muted"> / night</span>
      </p>
    </Link>
  );
}
