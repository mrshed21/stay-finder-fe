import type { Property, PropertyKind } from "@/types/property";

export type PropertiesFilter = {
  location?: string;
  maxprice?: string;
  maxguests?: string;
  sort?: "asc" | "desc";
};

export type CreatePropertyState = {
  error?: string;
  propertyId?: string;
};

export type PropertiesResult = {
  properties: Property[];
  error?: string;
};

export type PropertyResult =
  | { property: Property }
  | { notFound: true }
  | { error: string };

const kinds: PropertyKind[] = ["apartment", "villa"];

function isPropertyKind(value: string): value is PropertyKind {
  return kinds.includes(value as PropertyKind);
}

export async function getProperties(
  filters: PropertiesFilter = {},
): Promise<PropertiesResult> {
  const url = new URL(`${process.env.NEXT_PUBLIC_BACKEND_URL}/properties/`);
  if (filters.location) {
    url.searchParams.set("location", filters.location);
  }
  if (filters.maxprice) {
    url.searchParams.set("maxprice", filters.maxprice);
  }
  if (filters.maxguests) {
    url.searchParams.set("maxguests", filters.maxguests);
  }
  if (filters.sort) {
    url.searchParams.set("sort", filters.sort);
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return { properties: [], error: "Could not load stays. Please try again." };
    }
    const properties: Property[] = await response.json();
    return { properties };
  } catch {
    return { properties: [], error: "Could not connect to Stay Finder. Please try again." };
  }
}

export async function getPropertyById(id: string): Promise<PropertyResult> {
  try {
    const url = new URL(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/properties/${id}`,
    );
    const response = await fetch(url);
    if (response.status === 404) {
      return { notFound: true };
    }
    if (!response.ok) {
      return { error: "Could not load this stay. Please try again." };
    }
    const property: Property = await response.json();
    return { property };
  } catch {
    return { error: "Could not connect to Stay Finder. Please try again." };
  }
}

export async function createProperty(
  formData: FormData,
): Promise<CreatePropertyState> {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const kind = String(formData.get("kind") ?? "");
  const maxGuests = Number(formData.get("max_guests"));
  const pricePerNight = Number(formData.get("price_per_night"));

  if (!isPropertyKind(kind)) {
    return { error: "Choose apartment or villa." };
  }
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/properties/`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        location,
        kind,
        max_guests: maxGuests,
        price_per_night: pricePerNight,
      }),
    });

    if (response.status === 401) {
      return { error: "You need to be signed in to list a stay." };
    }

    if (!response.ok) {
      return { error: "Could not create the stay. Check the fields and try again." };
    }

    const property: Property = await response.json();
    return { propertyId: property.property_id };
  } catch {
    return { error: "Could not connect to Stay Finder. Please try again." };
  }
}

export async function updateProperty(
  id: string,
  formData: FormData,
): Promise<CreatePropertyState> {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const kind = String(formData.get("kind") ?? "");
  const maxGuests = Number(formData.get("max_guests"));
  const pricePerNight = Number(formData.get("price_per_night"));

  if (!isPropertyKind(kind)) {
    return { error: "Choose apartment or villa." };
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/properties/${id}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          location,
          kind,
          max_guests: maxGuests,
          price_per_night: pricePerNight,
        }),
      },
    );

    if (response.status === 401) {
      return { error: "You need to be signed in to edit this stay." };
    }
    if (response.status === 403) {
      return { error: "Only the owner can edit this stay." };
    }
    if (!response.ok) {
      return { error: "Could not update the stay. Check the fields and try again." };
    }

    const property: Property = await response.json();
    return { propertyId: property.property_id };
  } catch {
    return { error: "Could not connect to Stay Finder. Please try again." };
  }
}

export async function deleteProperty(id: string): Promise<CreatePropertyState> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/properties/${id}`,
      { method: "DELETE", credentials: "include" },
    );

    if (response.status === 401) {
      return { error: "You need to be signed in to delete this stay." };
    }
    if (response.status === 403) {
      return { error: "Only the owner can delete this stay." };
    }
    if (!response.ok) {
      return { error: "Could not delete this stay. Please try again." };
    }
    return { propertyId: id };
  } catch {
    return { error: "Could not connect to Stay Finder. Please try again." };
  }
}
