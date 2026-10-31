import PropertyCard from "./PropertyCard";
import { getProperties, PropertiesFilter } from "@/utils/propertyService";
import PropertyFilter from "./PropertyFilter";
import T from "./typography";

type PropertyListProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PropertyList({
  searchParams,
}: PropertyListProps) {
  const params = await searchParams;
  const propertiesFilter: PropertiesFilter = {
    location: firstValue(params.location) || "",
    maxprice: firstValue(params.maxprice) || "",
    maxguests: firstValue(params.maxguests) || "",
    sort: firstValue(params.sort) === "asc" || firstValue(params.sort) === "desc"
      ? firstValue(params.sort) as "asc" | "desc"
      : undefined,
  };
  const result = await getProperties(propertiesFilter);
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <T.Header size="lg">Places to stay</T.Header>
        <PropertyFilter filter={propertiesFilter} />
      </div>
      {result.error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">{result.error}</p>
      ) : result.properties.length === 0 ? (
        <p>No stays match your search yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {result.properties.map((property) => (
            <PropertyCard key={property.property_id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}
