
"use client"

import { useEffect, useState } from 'react';
import type { Form, FormResponse as FormResponseType } from '@/lib/types';
import { exportResponses } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, BarChart2, FileText, FileSpreadsheet, FileType, FileUp } from 'lucide-react';
import { ResponseTable } from '@/components/response-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

interface FormResponseProps {
  responses: FormResponseType[];
  formData: Form;
}

export function FormResponse({ responses, formData }: FormResponseProps) {
  const { toast } = useToast();
  const [form, setForm] = useState<Form | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    setForm({ ...formData, responseCount: responses.length });
  }, [formData, responses.length]);

  const handleExport = async (format: 'csv' | 'xlsx' | 'pdf' | 'docx') => {
    if (!form) return;
    setIsExporting(true);
    toast({ 
      title: 'Exporting...', 
      description: `Your ${format.toUpperCase()} file is being generated.` 
    });

    try {
      const { data, contentType, filename } = await exportResponses(form.id, format);

      const blob = new Blob([Buffer.from(data, 'base64')], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast({ title: 'Success!', description: `Your responses have been exported as ${filename}.` });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold">{form?.title}</h1>
          <p className="text-muted-foreground">{responses.length} responses</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" disabled={isExporting}>
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? 'Exporting...' : 'Export Responses'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleExport('csv')}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Download as CSV</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('xlsx')}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              <span>Download as XLSX</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('pdf')}>
              <FileType className="mr-2 h-4 w-4" />
              <span>Download as PDF</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('docx')}>
              <FileUp className="mr-2 h-4 w-4" />
              <span>Download as DOCX</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
