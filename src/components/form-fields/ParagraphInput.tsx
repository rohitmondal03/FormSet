import React, { useState } from 'react';
import type { FormField } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ParagraphInputProps {
  field: FormField;
  // Add prop for handling input changes, e.g., onInputChange: (value: string) => void;
  onValueChange: (value: string) => void;
}

const ParagraphInput: React.FC<ParagraphInputProps> = ({ field, onValueChange }) => {
  const [value, setValue] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    onValueChange(e.target.value);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={field.id}>{field.label}{field.required && <span className="text-red-500 ml-1">*</span>}</Label>
      <Textarea
        id={field.id}
        placeholder={field.placeholder || ''}
        value={value}
        onChange={handleChange}
      />
      {field.properties?.helpText && (
        <p className="text-sm text-muted-foreground">{field.properties.helpText}</p>
      )}
    </div>
  );
};

export default ParagraphInput;