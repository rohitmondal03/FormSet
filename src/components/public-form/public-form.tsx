'use client';

import React, { useCallback } from 'react'
import { useState } from 'react';
import { format } from 'date-fns';
import { Star, FileUp } from 'lucide-react';
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
import { DatePicker } from '@/components/ui/date-picker';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '../theme-toggle';

interface PublicFormProps {
  form: Form;
}

export function PublicForm({ form }: PublicFormProps) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [filePreviews, setFilePreviews] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form) return;
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);

    // Add hidden field values to FormData
    for (const field of form.fields) {
      if (field.type === 'rating' || field.type === 'slider') {
        formData.append(field.id, formValues[field.id] || '');
      }
    }

    const result = await submitResponse(form.id, formData);

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
      // Reset form state
      setFormValues({});
      setFilePreviews({});
      e.currentTarget.reset();
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
                placeholder={field.placeholder || ''}
                required={field.required}
              />
            ),
            textarea: (
              <Textarea
                id={id}
                name={field.id}
                placeholder={field.placeholder || ''}
                required={field.required}
                rows={4}
              />
            ),
            date: (
              <div>
                <DatePicker
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
              <RadioGroup name={field.id} required={field.required} className='space-y-2 pt-1'>
                {field.options?.map(opt => (
                  <div key={opt.value} className="flex items-center space-x-3">
                    <RadioGroupItem
                      value={opt.value}
                      id={`${id}-${opt.value}`}
                    />
                    <Label htmlFor={`${id}-${opt.value}`} className="font-normal">{opt.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            ),
            checkbox: (
              <div className="space-y-2 pt-1">
                {field.options?.map(opt => (
                  <div key={opt.value} className="flex items-center space-x-3">
                    <Checkbox
                      id={`${id}-${opt.value}`}
                      name={field.id}
                      value={opt.value}
                    />
                    <Label htmlFor={`${id}-${opt.value}`} className="font-normal">{opt.label}</Label>
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
            number: (
              <Input
                id={id}
                name={field.id}
                type="number"
                placeholder={field.placeholder || ''}
                required={field.required}
                min={field.properties?.min}
                max={field.properties?.max}
              />
            ),
            rating: (
              <div className="flex items-center gap-1 pt-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Star
                    key={value}
                    className={cn(
                      "h-8 w-8 cursor-pointer transition-colors",
                      (formValues[field.id] || 0) >= value ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/50 hover:text-muted-foreground"
                    )}
                    onClick={() => handleValueChange(field.id, value, field.type)}
                  />
                ))}
              </div>
            ),
            slider: (
              <div className="flex items-center gap-4 pt-2">
                <Slider
                  id={id}
                  min={field.properties?.min || 0}
                  max={field.properties?.max || 100}
                  step={field.properties?.step || 1}
                  value={[formValues[field.id] || field.properties?.min || 0]}
                  onValueChange={([value]) => handleValueChange(field.id, value, field.type)}
                />
                <span className="text-sm font-semibold w-14 text-center py-1.5 px-2 rounded-md bg-muted text-muted-foreground">
                  {formValues[field.id] || field.properties?.min || 0}
                </span>
              </div>
            ),
            paragraph: (
              <p className="text-muted-foreground">{field.properties?.description || ''}</p>
            )
          }[field.type]
        }
        {field.properties?.description && field.type !== 'paragraph' && <p className="text-sm text-muted-foreground pt-1">{field.properties.description}</p>}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-muted/20 dark:bg-background">
      <div className="container mx-auto max-w-2xl py-12 px-4">
        <main className="bg-card p-8 sm:p-12 rounded-2xl border-2 dark:border-zinc-500 shadow-lg space-y-8">
          <header className="space-y-4">
            <div className="flex justify-between items-start">
              <h1 className="text-4xl font-bold tracking-tight text-foreground">{form.title}</h1>
              <ThemeToggle />
            </div>
            {form.description && <p className="text-lg text-muted-foreground">{form.description}</p>}
            <p className='text-sm text-muted-foreground/80 pt-2'>
              Fields marked with <span className='text-destructive'>*</span> are required.
            </p>
          </header>
          <Separator className='bg-black dark:bg-zinc-200' />
          <form onSubmit={handleSubmit} className="space-y-8">
            {form.fields.map(renderField)}
            <Button type="submit" size="lg" className="w-full text-lg" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Response'}
            </Button>
          </form>
        </main>
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
