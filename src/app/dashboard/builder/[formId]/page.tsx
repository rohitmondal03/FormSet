
import type { Form, FormField } from '@/lib/types';
import { createClient } from '@/lib/supabase/server';
import { FormBuilderClient } from '@/components/builder/form-builder-client';

interface FormBuilderPageProps {
  params: Promise<{ formId: string }>;
}

export default async function FormBuilderPage({ params }: FormBuilderPageProps) {
  const formId = (await params).formId;

  let form: Form & { fields: FormField[], responseCount: number, url: string };
  const supabase = await createClient();

  if (formId === "new") {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // or handle redirect
      return <div>You must be logged in to create a form.</div>;
    }
    form = {
      id: 'new',
      title: 'Untitled Form',
      description: '',
      fields: [],
      created_at: new Date().toISOString(),
      responseCount: 0,
      url: '',
      limit_one_response_per_email: false,
      user_id: user.id,
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
      return <div>Form not found or an error occurred.</div>;
    }

    const fieldsData = form_data.form_fields as FormField[] || [];

    form = {
      id: form_data.id,
      title: form_data.title,
      description: form_data.description ?? '',
      fields: fieldsData.sort((a, b) => a.order - b.order),
      created_at: new Date(form_data.created_at).toISOString(),
      responseCount: form_data.form_responses[0]?.count || 0,
      url: `/f/${form_data.id}`,
      limit_one_response_per_email: form_data.limit_one_response_per_email ?? false,
      user_id: form_data.user_id
    }
  }

  return <FormBuilderClient form={form} />;
}
