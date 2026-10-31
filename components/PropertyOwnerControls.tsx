"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import PropertyForm from "@/components/PropertyForm";
import { useAuth } from "@/contexts/auth";
import type { Property } from "@/types/property";
import { deleteProperty, updateProperty } from "@/utils/propertyService";

type PropertyOwnerControlsProps = {
  property: Property;
};

export default function PropertyOwnerControls({
  property,
}: PropertyOwnerControlsProps) {
  const auth = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  if (auth.isPending || auth.user?.id !== property.user_id) {
    return null;
  }

  async function saveProperty(formData: FormData) {
    const result = await updateProperty(property.property_id, formData);
    if (result.propertyId) {
      setEditing(false);
      router.refresh();
    }
    return result;
  }

  async function removeProperty() {
    if (!window.confirm("Delete this stay?")) {
      return;
    }

    setPending(true);
    setError(undefined);
    const result = await deleteProperty(property.property_id);
    if (result.error) {
      setError(result.error);
    } else {
      router.push("/");
    }
    setPending(false);
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
      <h2 className="font-semibold">Manage this stay</h2>
      {editing ? (
        <>
          <PropertyForm
            action={saveProperty}
            values={property}
            submitLabel="Save changes"
            pendingLabel="Saving…"
          />
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="w-fit text-sm underline"
          >
            Cancel
          </button>
        </>
      ) : (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
          >
            Edit stay
          </button>
          <button
            type="button"
            onClick={removeProperty}
            disabled={pending}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-700 disabled:opacity-60 dark:border-red-900 dark:text-red-400"
          >
            {pending ? "Deleting…" : "Delete stay"}
          </button>
        </div>
      )}
      {error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </section>
  );
}
