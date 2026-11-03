"use client";

import { SubmitEvent, useState, type FormEvent } from "react";
import type { CreatePropertyState } from "@/utils/propertyService";

const fieldClassName = "field text-sm";

export type PropertyFormValues = {
  title?: string;
  description?: string;
  location?: string;
  kind?: string;
  max_guests?: number;
  price_per_night?: number;
};

type PropertyFormProps = {
  action: (formData: FormData) => Promise<CreatePropertyState>;
  values?: PropertyFormValues;
  submitLabel?: string;
  pendingLabel?: string;
};

export default function PropertyForm({
  action,
  values,
  submitLabel = "Create stay",
  pendingLabel = "Creating…",
}: PropertyFormProps) {
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(undefined);
    setPending(true);
    try {
      const result = await action(formData);
      setError(result.error);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <label className="field-label">
        Title
        <input
          name="title"
          required
          defaultValue={values?.title}
          className={fieldClassName}
        />
      </label>
      <label className="field-label">
        Description
        <textarea
          name="description"
          required
          rows={4}
          defaultValue={values?.description}
          className={fieldClassName}
        />
      </label>
      <label className="field-label">
        Location
        <input
          name="location"
          required
          defaultValue={values?.location}
          className={fieldClassName}
        />
      </label>
      <label className="field-label">
        Kind
        <select
          name="kind"
          required
          defaultValue={values?.kind ?? ""}
          className={fieldClassName}
        >
          <option value="" disabled>
            Choose a kind
          </option>
          <option value="apartment">Apartment</option>
          <option value="villa">Villa</option>
        </select>
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label className="field-label">
          Max guests
          <input
            name="max_guests"
            type="number"
            min={1}
            required
            defaultValue={values?.max_guests}
            className={fieldClassName}
          />
        </label>
        <label className="field-label">
          Price per night
          <input
            name="price_per_night"
            type="number"
            min={100}
            required
            defaultValue={values?.price_per_night}
            className={fieldClassName}
          />
        </label>
      </div>
      {error ? (
        <p role="alert" className="notice-error">{error}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="button-primary w-full sm:w-fit sm:px-6"
      >
        {pending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}
