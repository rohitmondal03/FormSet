'use client';
import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {createClient} from '@/lib/supabase/client';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group';
import {Checkbox} from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {useToast} from '@/hooks/use-toast';
import type {Form, FormField} from '@/lib/types';
import {submitResponse} from '@/app/actions';
import {Skeleton} from '@/components/ui/skeleton';

export default function PublicFormPage({params}: {params: {formId: string}}) {
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const {toast} = useToast();
  const supabase = createClient();

  useEffect(() => {
    async function fetchForm() {
      const {data: formData, error: formError} = await supabase
        .from('forms')
        .select('*, form_fields(*)')
        .eq('id', params.formId)
        .single();

      if (formError || !formData) {
        console.error('Error fetching form:', formError);
        setError('This form could not be found or is no longer available.');
        setLoading(false);
        return;
      }
      
      const fetchedForm: Form = {
        id: formData.id,
        title: formData.title,
        description: formData.description ?? '',
        fields: formData.form_fields.sort((a, b) => a.order - b.order),
        createdAt: new Date(formData.created_at),
        responseCount: 0,
        url: '',
      };
      setForm(fetchedForm);
      setLoading(false);
    }
    fetchForm();
  }, [params.formId, supabase]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const result = await submitResponse(params.formId, formData);

    setSubmitting(false);

    if (result.error) {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Response Submitted',
        description: 'Thank you for filling out the form!',
      });
      // Optionally, you can reset the form or redirect to a thank you page
      (e.target as HTMLFormElement).reset();
    }
  };

  const renderField = (field: FormField) => {
    const id = `field-${field.id}`;
    return (
      <div key={field.id} className="space-y-2">
        <Label htmlFor={id}>
          {field.label}
          {field.required && <span className="text-destructive">*</span>}
        </Label>
        {
          {
            text: (
              <Input
                id={id}
                name={field.id}
                placeholder={field.placeholder}
                required={field.required}
              />
            ),
            textarea: (
              <Textarea
                id={id}
                name={field.id}
                placeholder={field.placeholder}
                required={field.required}
              />
            ),
            date: (
              <Input id={id} name={field.id} type="date" required={field.required} />
            ),
            file: (
              <Input id={id} name={field.id} type="file" required={field.required} />
            ),
            radio: (
              <RadioGroup id={id} required={field.required}>
                {field.options?.map(opt => (
                  <div key={opt.value} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={opt.value}
                      id={`${id}-${opt.value}`}
                      name={field.id}
                    />
                    <Label htmlFor={`${id}-${opt.value}`}>{opt.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            ),
            checkbox: (
              <div id={id} className="space-y-2">
                {field.options?.map(opt => (
                  <div key={opt.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${id}-${opt.value}`}
                      name={field.id}
                      value={opt.value}
                    />
                    <Label htmlFor={`${id}-${opt.value}`}>{opt.label}</Label>
                  </div>
                ))}
              </div>
            ),
            select: (
              <Select name={field.id} required={field.required}>
                <SelectTrigger id={id}>
                  <SelectValue placeholder={field.placeholder || 'Select an option'} />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ),
          }[field.type]
        }
      </div>
    );
  };
  
  if (loading) {
    return (
        <div className="min-h-screen bg-background">
          <div className="container mx-auto max-w-2xl py-12 px-4">
            <div className="bg-card p-8 rounded-lg border shadow-lg space-y-6">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-6 w-full" />
                <hr />
                <div className="space-y-8">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
            </div>
          </div>
        </div>
      );
  }

  if (error || !form) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <p className="text-destructive text-lg">{error}</p>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-2xl py-12 px-4">
        <div className="bg-card p-8 rounded-lg border shadow-lg">
          <header className="mb-8 border-b pb-4">
            <h1 className="text-3xl font-bold">{form.title}</h1>
            <p className="text-muted-foreground mt-2">{form.description}</p>
          </header>
          <form onSubmit={handleSubmit} className="space-y-6">
            {form.fields.map(renderField)}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit'}
            </Button>
          </form>
        </div>
        <footer className="text-center mt-8">
          <p className="text-muted-foreground text-sm">
            Powered by{' '}
            <a href="/" className="font-semibold text-primary hover:underline">
              FormFlow
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
