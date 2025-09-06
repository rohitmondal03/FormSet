import { createClient } from "@/lib/supabase/server";
import { FormResponse } from "@/components/form-response/form-response";
import { Form, FormResponse as FormResponseType } from "@/lib/types";

interface FormResponsePageProps {
  params: Promise<{ formId: string }>;
}

export default async function FormResponsesPage({ params }: FormResponsePageProps) {
  const formId = (await params).formId;

  const supabase = await createClient();

  // Fetch form details
  const { data: formData, error: formError } = await supabase
    .from('forms')
    .select('*, form_fields(*)')
    .eq('id', formId)
    .single();

  const transformedForm: Form = {
    id: formData.id,
    title: formData.title,
    description: formData.description ?? '',
    createdAt: new Date(formData.created_at),
    url: `/f/${formData.id}`,
    fields: formData.form_fields,
    responseCount: 0, // This will be updated by response count
    limit_one_response_per_email: formData.limit_one_response_per_email,
  };

  // Fetch responses
  const { data: responseData, error: responseError } = await supabase
    .from('form_responses')
    .select('*')
    .eq('form_id', formId)
    .order('created_at', { ascending: false });

  const transformedResponses: FormResponseType[] = responseData?.map(r => ({
    id: r.id,
    submittedAt: new Date(r.created_at),
    data: r.data,
  })) ?? [];

  if (formError || responseError || !formData) {
    return (
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold text-destructive">{formError?.message || responseError?.message || 'An unexpected error occurred.'}</h1>
      </div>
    );
  }

  return <FormResponse responses={transformedResponses} formData={transformedForm} />;
}
