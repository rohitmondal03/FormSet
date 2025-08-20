'use client';
import { notFound, useRouter } from 'next/navigation';
import { placeholderForms } from '@/lib/placeholder-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { FormField } from '@/lib/types';

export default function PublicFormPage({ params }: { params: { formId: string } }) {
  const form = placeholderForms.find((f) => f.id === params.formId);
  const router = useRouter();
  const { toast } = useToast();

  if (!form) {
    notFound();
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast({
        title: "Response Submitted",
        description: "Thank you for filling out the form!",
    });
    // In a real app, you would redirect to a thank you page.
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
                text: <Input id={id} name={field.id} placeholder={field.placeholder} required={field.required} />,
                textarea: <Textarea id={id} name={field.id} placeholder={field.placeholder} required={field.required} />,
                date: <Input id={id} name={field.id} type="date" required={field.required} />,
                file: <Input id={id} name={field.id} type="file" required={field.required} />,
                radio: (
                    <RadioGroup id={id} required={field.required}>
                        {field.options?.map(opt => (
                            <div key={opt.value} className="flex items-center space-x-2">
                                <RadioGroupItem value={opt.value} id={`${id}-${opt.value}`} />
                                <Label htmlFor={`${id}-${opt.value}`}>{opt.label}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                ),
                checkbox: (
                    <div id={id} className="space-y-2">
                        {field.options?.map(opt => (
                             <div key={opt.value} className="flex items-center space-x-2">
                                <Checkbox id={`${id}-${opt.value}`} />
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
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )
            }[field.type]
        }
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
            <Button type="submit" className="w-full">Submit</Button>
          </form>
        </div>
        <footer className="text-center mt-8">
            <p className="text-muted-foreground text-sm">
                Powered by <a href="/" className="font-semibold text-primary hover:underline">FormFlow</a>
            </p>
        </footer>
      </div>
    </div>
  );
}
