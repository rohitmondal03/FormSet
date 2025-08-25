'use client';

import { useEffect, useState } from 'react';
import { FormBuilderClient } from '@/components/builder/form-builder-client';
import { createClient } from '@/lib/supabase/client';
import type { Form, FormField, FormFieldType } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function FormBuilderPage({ params: { formId } }: { params: { formId: string } }) {
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (formId === 'new') {
      setForm({
        id: 'new',
        title: 'Untitled Form',
        description: '',
        fields: [],
        createdAt: new Date(),
        responseCount: 0,
        url: '',
      });
      setLoading(false);
      return;
    }

    async function fetchForm() {
      const { data: form_data, error: form_error } = await supabase
        .from('forms')
        .select(`*, form_fields (*), form_responses(count)`)
        .eq('id', formId)
        .single();

      if (form_error || !form_data) {
        console.error('Error fetching form:', form_error);
        setError('Form not found or you do not have permission to view it.');
        setLoading(false);
        return;
      }

      const fetchedForm: Form = {
        id: form_data.id,
        title: form_data.title,
        description: form_data.description ?? '',
        fields: form_data.form_fields.sort((a: FormField, b: FormField) => a.order - b.order),
        createdAt: new Date(form_data.created_at),
        responseCount: form_data.form_responses[0]?.count || 0,
        url: `/f/${form_data.id}`,
      };

      setForm(fetchedForm);
      setLoading(false);
    }

    fetchForm();
  }, [formId, supabase]);

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-destructive">{error}</div>;
  }

  if (!form) {
    return null; // Should be handled by loading/error state
  }

  return <FormBuilderClient existingForm={form} />;
}
