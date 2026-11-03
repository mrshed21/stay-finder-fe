"use client";

import AuthGate from "@/components/AuthGate";
import PropertyForm from "@/components/PropertyForm";
import T from "@/components/typography";
import { createProperty } from "@/utils/propertyService";
import { useRouter } from "next/navigation";

export default function NewPropertyPage() {
  const router = useRouter();

  async function onCreate(formData: FormData) {
    const result = await createProperty(formData);
    if (result.propertyId) {
      router.push(`/properties/${result.propertyId}`);
    }
    return result;
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6 sm:py-14">
      <T.Header size="lg">Add stay</T.Header>
      <AuthGate>
        <div className="glass p-5 sm:p-8">
          <PropertyForm action={onCreate} />
        </div>
      </AuthGate>
    </main>
  );
}
