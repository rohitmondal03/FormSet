'use client';

import React, { useCallback } from 'react'
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Star, FileUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import type { Form, FormField } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { submitResponse } from '@/app/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { DatePicker } from '@/components/ui/date-picker';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';

interface PublicFormProps {
  formId: string;
}

export function PublicForm({ formId }: PublicFormProps) {
  const { toast } = useToast();

  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [filePreviews, setFilePreviews] = useState<Record<string, string>>({});

  const supabase = createClient();

  useEffect(() => {
    async function fetchForm() {
      const { data: formData, error: formError } = await supabase
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
        fields: formData.form_fields.sort((a: FormField, b: FormField) => a.order - b.order),
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
    const formData = new FormData(e.currentTarget);

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
      setFilePreviews({});
    }
  };

  const handleValueChange = useCallback((fieldId: string, value: any, type: FormField['type']) => {
    setFormValues(prev => {
      if (type === 'checkbox') {
        const existing: any[] = prev[fieldId] || [];
        if (value.checked) {
          return { ...prev, [fieldId]: [...existing, value.value] };
        } else {
          return { ...prev, [fieldId]: existing.filter(item => item !== value.value) };
        }
      }
      return { ...prev, [fieldId]: value }
    });
  }, [setFormValues]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      setFilePreviews(prev => ({ ...prev, [fieldId]: file.name }));
    } else {
      setFilePreviews(prev => {
        const newPreviews = { ...prev };
        delete newPreviews[fieldId];
        return newPreviews;
      });
    }
  };

  const renderField = (field: FormField) => {
    const id = `field-${field.id}`;
    return (
      <div key={field.id} className="space-y-2">
        <Label className='' htmlFor={id}>
          {field.order + 1}. {field.label}
          {field.required && <span className="text-red-600"> *</span>}
        </Label>
        {
          {
            text: (
              <Input
                id={id}
                name={field.id}
                placeholder={!field.placeholder ? undefined : field.placeholder}
                required={field.required}
                onChange={(e) => handleValueChange(field.id, e.target.value, field.type)}
                value={formValues[field.id] || ''}
              />
            ),
            textarea: (
              <Textarea
                id={id}
                name={field.id}
                placeholder={!field.placeholder ? undefined : field.placeholder}
                required={field.required}
                onChange={(e) => handleValueChange(field.id, e.target.value, field.type)}
                value={formValues[field.id] || ''}
              />
            ),
            date: (
              <div>
                <DatePicker
                  value={formValues[field.id] ? new Date(formValues[field.id]) : undefined}
                  onChange={(date) => handleValueChange(field.id, date ? format(date, 'yyyy-MM-dd') : '', field.type)}
                />
              </div>
            ),
            file: (
              <Label htmlFor={id} className={cn("flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted", filePreviews[field.id] && "border-primary")}>
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FileUp className="w-8 h-8 mb-4 text-muted-foreground" />
                  {filePreviews[field.id] ? (
                    <p className="font-semibold text-primary">{filePreviews[field.id]}</p>
                  ) : (
                    <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  )}
                </div>
                <Input id={id} name={field.id} type="file" required={field.required} className="hidden" accept={field.properties?.accept} onChange={(e) => handleFileChange(e, field.id)} />
              </Label>
            ),
            radio: (
              <RadioGroup id={id} name={field.id} required={field.required} onValueChange={(value) => handleValueChange(field.id, value, field.type)} value={formValues[field.id]} className='space-y-1 mt-5'>
                {field.options?.map(opt => (
                  <div key={opt.value} className="flex items-center space-x-2 mt-2">
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
              <div id={id} className="space-y-3 text-xs">
                {field.options?.map(opt => (
                  <div key={opt.value} className="flex items-center space-x-2 mt-4">
                    <Checkbox
                      id={`${id}-${opt.value}`}
                      name={field.id}
                      value={opt.value}
                      onCheckedChange={(checked) => handleValueChange(field.id, { value: opt.value, checked: checked }, field.type)} checked={(formValues[field.id] || []).includes(opt.value)}
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
                <SelectContent className='space-y-2'>
                  {field.options?.map(opt => (
                    <SelectItem key={opt.value} value={opt.value || "hhh"}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ),
            number: (
              <Input
                id={id}
                name={field.id}
                type="number"
                placeholder={!field.placeholder ? undefined : field.placeholder}
                required={field.required}
                min={field.properties?.min}
                max={field.properties?.max}
                onChange={(e) => handleValueChange(field.id, e.target.value, field.type)}
                value={formValues[field.id] || ''}
              />
            ),
            rating: (
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Star
                    key={value}
                    className={cn(
                      "h-6 w-6 cursor-pointer mt-1",
                      (formValues[field.id] || 0) >= value ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
                    )}
                    onClick={() => handleValueChange(field.id, value, field.type)}
                  />
                ))}
                <Input type="hidden" name={field.id} value={formValues[field.id] || 0} />
              </div>
            ),
            slider: (
              <div className="flex items-center gap-4">
                <Slider
                  id={id}
                  name={field.id}
                  min={field.properties?.min || 0}
                  max={field.properties?.max || 100}
                  step={field.properties?.step || 1}
                  value={[formValues[field.id] || 50]}
                  onValueChange={([value]) => handleValueChange(field.id, value, field.type)}
                />
                <span className="text-sm font-medium w-12 text-center">{formValues[field.id] || 50}</span>
              </div>
            ),
            paragraph: (
              <p className="text-muted-foreground">{field.properties?.description || ''}</p>
            )
          }[field.type]
        }
        {field.properties?.description && <p className="text-sm text-muted-foreground">{field.properties.description}</p>}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-4xl py-12 px-4">
          <div className="bg-card p-8 rounded-lg border shadow-lg space-y-6">
            <Skeleton className="h-10 w-[]" />
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
      <div className="container mx-auto max-w-4xl py-12 px-4">
        <div className="bg-card p-8 rounded-lg border border-zinc-500 shadow-lg space-y-8">
          <header className=" pb-4 space-y-5">
            <h1 className="text-3xl font-bold">{form.title}</h1>
            <p className="text-muted-foreground">{form.description}</p>
            <p className='italic text-zinc-400 text-sm'>&#40;<span className='text-red-500'>*</span> are required&#41;</p>
          </header>
          <Separator className='bg-zinc-400' />
          <form onSubmit={handleSubmit} className="space-y-12">
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
  )
}
