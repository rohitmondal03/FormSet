import Link from "next/link";
import type { Form, FormField } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import { PublicForm } from "@/components/public-form/public-form";
import { Button } from "@/components/ui/button";

interface PublicFormPageProps {
  params: Promise<{ formId: string; }>;
}

export default async function PublicFormPage({ params }: PublicFormPageProps) {
  const formId = (await params).formId;
  const supabase = await createClient();

  const { data: formData, error: formError } = await supabase
    .from('forms')
    .select('*, form_fields(*)')
    .eq('id', formId)
    .single();

  if (formError || !formData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="bg-card p-8 rounded-lg border shadow-lg text-center">
          <h2 className="text-2xl font-bold text-destructive">Form Not Found</h2>
          <p className="text-muted-foreground mt-2">{formError?.details}</p>
          <Button asChild className="mt-6">
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  const fetchedForm: Form = {
    id: formData.id,
    title: formData.title,
    description: formData.description ?? '',
    fields: formData.form_fields.sort((a: FormField, b: FormField) => a.order - b.order),
    createdAt: new Date(formData.created_at),
    responseCount: 0,
    url: '',
    limit_one_response_per_email: formData.limit_one_response_per_email,
  };

  return <PublicForm form={fetchedForm} />;
}