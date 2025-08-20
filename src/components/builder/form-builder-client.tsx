'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FieldPalette } from './field-palette';
import { FormCanvas } from './form-canvas';
import { AISuggester } from './ai-suggester';
import type { Form, FormField } from '@/lib/types';
import { Save, Eye, Share2 } from 'lucide-react';

interface FormBuilderClientProps {
  existingForm?: Form;
}

export function FormBuilderClient({ existingForm }: FormBuilderClientProps) {
  const [title, setTitle] = useState(existingForm?.title || 'Untitled Form');
  const [description, setDescription] = useState(existingForm?.description || '');
  const [fields, setFields] = useState<FormField[]>(existingForm?.fields || []);

  const addField = (type: FormField['type']) => {
    const newField: FormField = {
      id: crypto.randomUUID(),
      type,
      label: `New ${type} field`,
      required: false,
    };
    if (type === 'radio' || type === 'select' || type === 'checkbox') {
      newField.options = [{ value: 'option1', label: 'Option 1' }];
    }
    setFields([...fields, newField]);
  };

  const updateField = (id: string, updatedField: Partial<FormField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updatedField } : f));
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      <header className="flex items-center justify-between p-4 border-b bg-card rounded-t-lg">
        <Input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            className="text-2xl font-bold w-1/2 border-none shadow-none focus-visible:ring-0"
            placeholder="Form Title"
        />
        <div className="flex items-center gap-2">
          <AISuggester fields={fields} setFields={setFields} />
          <Button variant="outline" size="sm"><Eye className="mr-2 h-4 w-4" /> Preview</Button>
          <Button variant="outline" size="sm"><Share2 className="mr-2 h-4 w-4" /> Share</Button>
          <Button size="sm"><Save className="mr-2 h-4 w-4" /> Save</Button>
        </div>
      </header>

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-6 p-4">
        <main className="lg:col-span-3 h-full">
            <div className="bg-card p-4 rounded-lg border h-full overflow-y-auto">
                <FormCanvas fields={fields} updateField={updateField} removeField={removeField} />
            </div>
        </main>
        <aside className="lg:col-span-1 h-full">
          <FieldPalette onAddField={addField} />
        </aside>
      </div>
    </div>
  );
}
