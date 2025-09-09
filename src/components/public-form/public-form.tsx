
'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState, useTransition } from 'react'
import { format } from 'date-fns';
import { Star, FileUp, Mail, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { submitResponse, checkExistingResponse } from '@/lib/actions';
import type { Form, FormField } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ThemeToggle } from '../theme-toggle';

type EmailStatus = 'idle' | 'checking' | 'exists' | 'does_not_exist' | 'error';

interface PublicFormProps {
  form: Form & { fields: FormField[] };
}
export function PublicForm({ form }: PublicFormProps) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string | number | boolean | string[] | File | null>>({});
  const [filePreviews, setFilePreviews] = useState<Record<string, string>>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [emailStatus, setEmailStatus] = useState<EmailStatus>('idle');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleEmailBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const email = e.target.value;
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailStatus('idle');
      return;
    }
    
    if (form.limit_one_response_per_email) {
      startTransition(async () => {
        setEmailStatus('checking');
        const result = await checkExistingResponse(form.id, email);
        if (result.exists) {
          setEmailStatus('exists');
        } else if (result.error) {
          setEmailStatus('error');
          setEmailError(result.error);
        } else {
          setEmailStatus('does_not_exist');
        }
      });
    } else {
        setEmailStatus('does_not_exist');
    }
  };

  const validateForm = useCallback(() => {
    // Check for submitter email
    if (!formValues.submitter_email || !/\S+@\S+\.\S+/.test(formValues.submitter_email as string)) {
      return false;
    }

    if (form.limit_one_response_per_email && emailStatus !== 'does_not_exist') {
        return false;
    }

    // Check all required fields
    for (const field of form.fields) {
      if (field.required) {
        const value = formValues[field.id];
        if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
          return false;
        }
      }
    }

    return true;
  }, [form.fields, form.limit_one_response_per_email, formValues, emailStatus]);

  useEffect(() => {
    setIsFormValid(validateForm());
  }, [formValues, validateForm]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form) return;
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);

    // Add hidden field values to FormData
    for (const field of form.fields) {
      if (field.type === 'rating' || field.type === 'slider') {
        formData.append(field.id, (formValues[field.id] || '').toString());
      }
    }
    
    formData.append('submitter_email', (formValues.submitter_email || '').toString());

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
      setEmailStatus('idle');
      e.currentTarget.reset();
    }
  };

  const handleValueChange = useCallback((fieldId: string | undefined, value: string | number | boolean | { value: string, checked: boolean } | Date | File | null, type?: FormField['type']) => {
    if (!fieldId) return;

    setFormValues(prev => {
      if (type === 'checkbox') {
        const checkboxValue = value as { value: string; checked: boolean };
        const existing = (prev[fieldId] as string[] | undefined) || [];

        if (checkboxValue.checked) {
          return { ...prev, [fieldId]: [...existing, checkboxValue.value] };
        } else {
          return { ...prev, [fieldId]: existing.filter(item => item !== checkboxValue.value) };
        }
      }
      return { ...prev, [fieldId]: value }
    });
  }, [setFormValues]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      setFilePreviews(prev => ({ ...prev, [fieldId]: file.name }));
      handleValueChange(fieldId, file);
    } else {
      setFilePreviews(prev => {
        const newPreviews = { ...prev };
        delete newPreviews[fieldId];
        return newPreviews;
      });
      handleValueChange(fieldId, null);
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
                onChange={(e) => handleValueChange(field.id, e.target.value)}
              />
            ),
            textarea: (
              <Textarea
                id={id}
                name={field.id}
                placeholder={field.placeholder || ''}
                required={field.required}
                rows={4}
                onChange={(e) => handleValueChange(field?.id, e.target.value)}
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
                <Input id={id} name={field.id} type="file" required={field.required} className="hidden" accept=".pdf,image/*" onChange={(e) => handleFileChange(e, field.id)} />
              </Label>
            ),
            radio: (
              <RadioGroup name={field.id} required={field.required} className='space-y-2 pt-1' onValueChange={(value) => handleValueChange(field.id, value)}>
                {((field.options as {value: string, label: string}[]) || []).map(opt => (
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
                {((field.options as {value: string, label: string}[]) || []).map(opt => (
                  <div key={opt.value} className="flex items-center space-x-3">
                    <Checkbox
                      id={`${id}-${opt.value}`}
                      name={field.id}
                      value={opt.value}
                      onCheckedChange={(checked) => handleValueChange(field.id, { value: opt.value, checked: !!checked }, 'checkbox')}
                    />
                    <Label htmlFor={`${id}-${opt.value}`} className="font-normal">{opt.label}</Label>
                  </div>
                ))}
              </div>
            ),
            select: (
              <Select name={field.id} required={field.required} onValueChange={(value) => handleValueChange(field.id, value)}>
                <SelectTrigger id={id}>
                  <SelectValue placeholder={field.placeholder || 'Select an option'} />
                </SelectTrigger>
                <SelectContent>
                  {((field.options as {value: string, label: string}[]) || []).map(opt => (
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
                min={(field.properties as any)?.min}
                max={(field.properties as any)?.max}
                onChange={(e) => handleValueChange(field.id, e.target.value)}
              />
            ),
            rating: (
              <div className="flex items-center gap-1 pt-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Star
                    key={value}
                    className={cn(
                      "h-8 w-8 cursor-pointer transition-colors",
                      (formValues[field.id] as number || 0) >= value ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/50 hover:text-muted-foreground"
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
                  min={(field.properties as any)?.min || 0}
                  max={(field.properties as any)?.max || 100}
                  step={(field.properties as any)?.step || 1}
                  value={[(formValues[field.id] as number) || (field.properties as any)?.min || 0]}
                  onValueChange={([value]) => handleValueChange(field.id, value, field.type)}
                />
                <span className="text-sm font-semibold w-14 text-center py-1.5 px-2 rounded-md bg-muted text-muted-foreground">
                  {formValues[field.id] || (field.properties as any)?.min || 0}
                </span>
              </div>
            ),
            paragraph: (
              <p className="text-muted-foreground">{(field.properties as any)?.description || ''}</p>
            )
          }[field.type]
        }
        {field.properties?.description && field.type !== 'paragraph' && <p className="text-sm text-muted-foreground pt-1">{(field.properties as any).description}</p>}
      </div>
    );
  };

  const renderEmailStatus = () => {
    switch (emailStatus) {
      case 'checking':
        return <p className="text-sm text-muted-foreground flex items-center mt-2"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Checking...</p>;
      case 'exists':
        return <p className="text-sm text-destructive flex items-center mt-2"><AlertCircle className="mr-2 h-4 w-4" />This email has already submitted a response.</p>;
      case 'does_not_exist':
        return <p className="text-sm text-green-600 flex items-center mt-2"><CheckCircle className="mr-2 h-4 w-4" />You&apos;re good to go!</p>;
      case 'error':
        return <p className="text-sm text-destructive mt-2">{emailError}</p>;
      default:
        return null;
    }
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
            <div className="space-y-2">
                <Label htmlFor="submitter-email" className="flex items-center">
                    <Mail className="mr-2 h-4 w-4" />
                    Your Email Address
                    <span className="text-red-600 ml-1">*</span>
                </Label>
                <Input
                    id="submitter-email"
                    name="submitter_email"
                    type="email"
                    placeholder="your.email@example.com"
                    required
                    onChange={(e) => handleValueChange('submitter_email', e.target.value)}
                    onBlur={handleEmailBlur}
                />
                {renderEmailStatus()}
            </div>
            {form.fields.map(renderField)}
            <Separator className='bg-black dark:bg-zinc-200' />
            <Button type="submit" className="w-full" disabled={submitting || !isFormValid || isPending}>
              {submitting ? 'Submitting...' : 'Submit Response'}
            </Button>
          </form>
        </main>
        <footer className="text-center mt-8">
          <p className="text-muted-foreground text-sm">
            Powered by{' '}
            <Link href="/" className="font-semibold text-primary hover:underline">
              FormSet
            </Link>
          </p>
        </footer>
      </div>
    </div>
  )
}
