
'use client';
import {useEffect, useState} from 'react';
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
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';

export default function PublicFormPage({ params: {formId} }: { params: { formId: string } }) {
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const {toast} = useToast();
  const supabase = createClient();

  useEffect(() => {
    async function fetchForm() {
      const {data: formData, error: formError} = await supabase
        .from('forms')
        .select('*, form_fields(*)')
        .eq('id', formId)
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
  }, [formId, supabase]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData();
    for (const key in formValues) {
        const value = formValues[key];
        if (Array.isArray(value)) {
            value.forEach(item => formData.append(key, item));
        } else if (value) {
            formData.append(key, value);
        }
    }

    const result = await submitResponse(formId, formData);

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
      setFormValues({});
    }
  };

  const handleValueChange = (fieldId: string, value: any, type: FormField['type']) => {
    setFormValues(prev => {
        if (type === 'checkbox') {
            const existing: any[] = prev[fieldId] || [];
            if (value.checked) {
                return {...prev, [fieldId]: [...existing, value.value]};
            } else {
                return {...prev, [fieldId]: existing.filter(item => item !== value.value)};
            }
        }
      return {...prev, [fieldId]: value}
    });
  }

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
                onChange={(e) => handleValueChange(field.id, e.target.value, field.type)}
                value={formValues[field.id] || ''}
              />
            ),
            textarea: (
              <Textarea
                id={id}
                name={field.id}
                placeholder={field.placeholder}
                required={field.required}
                onChange={(e) => handleValueChange(field.id, e.target.value, field.type)}
                value={formValues[field.id] || ''}
              />
            ),
            date: (
              <DatePicker 
                value={formValues[field.id] ? new Date(formValues[field.id]) : undefined}
                onChange={(date) => handleValueChange(field.id, date ? format(date, 'yyyy-MM-dd') : '', field.type)}
              />
            ),
            file: (
              <Input id={id} name={field.id} type="file" required={field.required} />
            ),
            radio: (
              <RadioGroup id={id} required={field.required} onValueChange={(value) => handleValueChange(field.id, value, field.type)} value={formValues[field.id]}>
                {field.options?.map(opt => (
                  <div key={opt.value} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={opt.value}
                      id={`${id}-${opt.value}`}
                      
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
                      onCheckedChange={(checked) => handleValueChange(field.id, {value: opt.value, checked: checked}, field.type)}
                      checked={(formValues[field.id] || []).includes(opt.value)}
                    />
                    <Label htmlFor={`${id}-${opt.value}`}>{opt.label}</Label>
                  </div>
                ))}
              </div>
            ),
            select: (
              <Select name={field.id} required={field.required} onValueChange={(value) => handleValueChange(field.id, value, field.type)} value={formValues[field.id]}>
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
              FormSet
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
