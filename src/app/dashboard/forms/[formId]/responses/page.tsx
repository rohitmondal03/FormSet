import { notFound } from 'next/navigation';
import { placeholderForms, placeholderResponses } from '@/lib/placeholder-data';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, BarChart2 } from 'lucide-react';
import { ResponseTable } from '@/components/response-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function FormResponsesPage({ params }: { params: { formId: string } }) {
  const form = placeholderForms.find((f) => f.id === params.formId);
  const responses = placeholderResponses[params.formId] || [];

  if (!form) {
    notFound();
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
