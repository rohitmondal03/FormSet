'use client';

import {useEffect, useState} from 'react';
import {createClient} from '@/lib/supabase/client';
import type {Form, FormResponse} from '@/lib/types';
import {Button} from '@/components/ui/button';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Download, BarChart2} from 'lucide-react';
import {ResponseTable} from '@/components/response-table';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Skeleton} from '@/components/ui/skeleton';

export default function FormResponsesPage({params}: {params: {formId: string}}) {
  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchFormAndResponses() {
      // Fetch form details
      const {data: formData, error: formError} = await supabase
        .from('forms')
        .select('*, form_fields(*)')
        .eq('id', params.formId)
        .single();

      if (formError || !formData) {
        console.error('Error fetching form:', formError);
        setError('Form not found.');
        setLoading(false);
        return;
      }

      const transformedForm: Form = {
        id: formData.id,
        title: formData.title,
        description: formData.description ?? '',
        createdAt: new Date(formData.created_at),
        url: `/f/${formData.id}`,
        fields: formData.form_fields,
        responseCount: 0, // This will be updated by response count
      };

      // Fetch responses
      const {data: responseData, error: responseError} = await supabase
        .from('form_responses')
        .select('*')
        .eq('form_id', params.formId)
        .order('created_at', {ascending: false});

      if (responseError) {
        console.error('Error fetching responses:', responseError);
        setError('Could not fetch responses.');
        setLoading(false);
        return;
      }

      const transformedResponses: FormResponse[] = responseData.map(r => ({
        id: r.id,
        submittedAt: new Date(r.created_at),
        data: r.data,
      }));

      setForm({...transformedForm, responseCount: transformedResponses.length});
      setResponses(transformedResponses);
      setLoading(false);
    }

    fetchFormAndResponses();
  }, [params.formId, supabase]);

  if (loading) {
    return (
      <div className="container mx-auto space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold text-destructive">{error || 'An unexpected error occurred.'}</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold">{form.title}</h1>
          <p className="text-muted-foreground">{responses.length} responses</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export to CSV
        </Button>
      </div>

      <Tabs defaultValue="responses">
        <TabsList>
          <TabsTrigger value="summary">
            <BarChart2 className="mr-2 h-4 w-4" />
            Summary
          </TabsTrigger>
          <TabsTrigger value="responses">Responses</TabsTrigger>
        </TabsList>
        <TabsContent value="summary" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Summary view coming soon!</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="responses" className="mt-4">
          <ResponseTable form={form} responses={responses} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
