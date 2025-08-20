'use client';

import type { FormField } from '@/lib/types';
import { FormFieldWrapper } from './form-field';

interface FormCanvasProps {
  fields: FormField[];
  updateField: (id: string, updatedField: Partial<FormField>) => void;
  removeField: (id: string) => void;
}

export function FormCanvas({ fields, updateField, removeField }: FormCanvasProps) {
  if (fields.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 rounded-lg border-2 border-dashed">
        <p className="text-muted-foreground">Your form is empty.</p>
        <p className="text-sm text-muted-foreground mt-2">Add fields from the right panel to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {fields.map((field) => (
        <FormFieldWrapper 
          key={field.id}
          field={field}
          onUpdate={updateField}
          onRemove={removeField}
        />
      ))}
    </div>
  );
}
