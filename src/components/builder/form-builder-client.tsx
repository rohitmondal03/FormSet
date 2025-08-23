'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {FieldPalette} from './field-palette';
import {FormCanvas} from './form-canvas';
import {AISuggester} from './ai-suggester';
import type {Form, FormField} from '@/lib/types';
import {Save, Eye, Share2} from 'lucide-react';
import {useToast} from '@/hooks/use-toast';
import {saveForm} from '@/app/actions';

interface FormBuilderClientProps {
  existingForm: Form;
}

export function FormBuilderClient({existingForm}: FormBuilderClientProps) {
  const router = useRouter();
  const {toast} = useToast();
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
    };
    if (type === 'radio' || type === 'select' || type === 'checkbox') {
      newField.options = [{value: 'option1', label: 'Option 1'}];
    }
    setFields([...fields, newField]);
  };

  const updateField = (id: string, updatedField: Partial<FormField>) => {
    setFields(fields.map(f => (f.id === id ? {...f, ...updatedField} : f)));
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
      fields: fields.map((f, index) => ({...f, order: index})),
    };

    try {
      const {formId} = await saveForm(formToSave);
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
  
  const handleShare = () => {
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
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      <header className="flex items-center justify-between p-4 border-b bg-card rounded-t-lg">
        <Input
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="text-2xl font-bold w-1/2 border-none shadow-none focus-visible:ring-0"
          placeholder="Form Title"
        />
        <div className="flex items-center gap-2">
          <AISuggester fields={fields} setFields={setFields} />
          <Button variant="outline" size="sm" asChild disabled={existingForm.id === 'new'}>
            <a href={`/f/${existingForm.id}`} target='_blank'><Eye className="mr-2 h-4 w-4" /> Preview</a>
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" /> {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </header>

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-6 p-4">
        <main className="lg:col-span-3 h-full">
          <div className="bg-card p-4 rounded-lg border h-full overflow-y-auto">
            <FormCanvas
              fields={fields}
              updateField={updateField}
              removeField={removeField}
            />
          </div>
        </main>
        <aside className="lg:col-span-1 h-full">
          <FieldPalette onAddField={addField} />
        </aside>
      </div>
    </div>
  );
}
