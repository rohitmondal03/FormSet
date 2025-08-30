
import type { Form, FormField } from '@/lib/types';
import { createClient } from '@/lib/supabase/server';
import { FormBuilderClient } from '@/components/builder/form-builder-client';

interface FormBuilderPageProps {
  params: Promise<{ formId: string }>;
}

export default async function FormBuilderPage({ params }: FormBuilderPageProps) {
  const { formId } = (await params);

  let form: Form | null = null;
  let error: Error | null = null;
  const supabase = await createClient();

  if (formId === "new") {
    form = {
      id: 'new',
      title: 'Untitled Form',
      description: '',
      fields: [],
      createdAt: new Date(),
      responseCount: 0,
      url: '',
      limit_one_response_per_email: false,
    }
  }
  else {
    const { data: form_data, error: form_error } = await supabase
      .from('forms')
      .select(`*, form_fields (*), form_responses(count)`)
      .eq('id', formId)
      .single();

    if (form_error || !form_data) {
      console.error('Error fetching form:', form_error);
      return;
    }

    form = {
      id: form_data.id,
      title: form_data.title,
      description: form_data.description ?? '',
      fields: form_data.form_fields.sort((a: FormField, b: FormField) => a.order - b.order),
      createdAt: new Date(form_data.created_at),
      responseCount: form_data.form_responses[0]?.count || 0,
      url: `/f/${form_data.id}`,
      limit_one_response_per_email: form_data.limit_one_response_per_email,
    }
  }

  if (error) {
    return <div className="p-8 text-destructive">{error}</div>;
  }

  if (!form) {
    return null; // Should be handled by loading/error state
  }

  return <FormBuilderClient form={form} />;
}

    