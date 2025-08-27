'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import type { Form, FormField } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { FieldPalette } from './field-palette';
import { FormCanvas } from './form-canvas';
import { AISuggester } from './ai-suggester';
import { Save, Eye, Share2, CopyIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveForm } from '@/app/actions';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';

interface FormBuilderClientProps {
  existingForm: Form;
}

export function FormBuilderClient({ existingForm }: FormBuilderClientProps) {
  const router = useRouter();
  const { toast } = useToast();  
  const [title, setTitle] = useState(existingForm.title);
  const [description, setDescription] = useState(existingForm.description);
  const [fields, setFields] = useState<FormField[]>(existingForm.fields);
  const [isSaving, setIsSaving] = useState(false);

  const addField = (type: FormField['type']) => {
    const newField: FormField = {
      id: crypto.randomUUID(),
      type,
      label: `New ${type} field`,
      required: false,
      order: fields.length,
      options: [],
    };
    if (type === 'radio' || type === 'select' || type === 'checkbox') {
      newField.options = [{ value: 'option1', label: 'Option 1' }];
    }
    setFields([...fields, newField]);
  };

  const updateField = (id: string, updatedField: Partial<FormField>) => {
    setFields(fields.map(f => (f.id === id ? { ...f, ...updatedField } : f)));
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const formToSave: Form = {
      ...existingForm,
      title,
      description,
      fields: fields.map((f, index) => ({ ...f, order: index })),
    };

    try {
      const { formId } = await saveForm(formToSave);
      toast({
        title: 'Success!',
        description: 'Your form has been saved.',
      });
      if (existingForm.id === 'new' && formId) {
        router.push(`/dashboard/builder/${formId}`);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save form. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = useCallback(() => {
    if (existingForm.id === 'new') {
      toast({
        title: 'Save your form first',
        description: 'You must save your form before you can share it.',
        variant: 'destructive',
      });
      return;
    }
    const formUrl = `${window.location.origin}/f/${existingForm.id}`;
    navigator.clipboard.writeText(formUrl);
    toast({
      title: 'Copied to clipboard!',
      description: 'The form link has been copied to your clipboard.',
    });
  }, [existingForm.id, toast]);

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-10rem)]">
      <header className="p-4 space-y-4 bg-card rounded-t-lg">
        <div className='flex flex-col gap-2 lg:flex-row
       items-center justify-around'>
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="font-bold border border-zinc-600 w-full"
            placeholder="Form Title"
          />
          <div className="flex items-center gap-2 w-full">
            <AISuggester fields={fields} setFields={setFields} />
            <Button variant="outline" size="sm" asChild disabled={existingForm.id === 'new'}>
              <a href={`/f/${existingForm.id}`} target='_blank'><Eye className="mr-2 h-4 w-4" /> Preview</a>
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <CopyIcon className="mr-2 h-4 w-4" /> Copy Link
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" /> {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
        <div className='w-full mt-2 lg:mt-0'>
          <Textarea id="form-description" value={description} onChange={e => setDescription(e.target.value)} className="border border-zinc-600 w-full" placeholder='Enter form description' />
        </div>
      </header>
      <Separator />
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-6 p-4">
        <main className="lg:col-span-3 h-full">
          <div className="bg-card p-4 rounded-lg border border-zinc-600 h-full overflow-y-auto">
            <ScrollArea className="h-screen pr-4">
              <FormCanvas
                fields={fields}
                updateField={updateField}
                removeField={removeField}
              />
            </ScrollArea>
          </div>
        </main>
        <aside className="lg:col-span-1 h-full">
          <FieldPalette onAddField={addField} />
        </aside>
      </div>
    </div>
  );
}
