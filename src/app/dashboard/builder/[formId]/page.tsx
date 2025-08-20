import { FormBuilderClient } from '@/components/builder/form-builder-client';
import { placeholderForms } from '@/lib/placeholder-data';
import { notFound } from 'next/navigation';

export default function FormBuilderPage({ params }: { params: { formId: string } }) {
  if (params.formId === 'new') {
    return <FormBuilderClient />;
  }

  const form = placeholderForms.find((f) => f.id === params.formId);

  if (!form) {
    notFound();
  }

  return <FormBuilderClient existingForm={form} />;
}
