'use client';

import * as React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { FormField } from '@/lib/types';

interface MultipleChoiceInputProps extends React.ComponentPropsWithoutRef<typeof RadioGroup> {
  field: FormField;
  // Add prop for handling input changes
  // onInputChange: (fieldId: string, value: string) => void;
 onValueChange: (value: string) => void;
}

const MultipleChoiceInput: React.FC<MultipleChoiceInputProps> = ({ field, onValueChange, ...props }) => {
  // Placeholder for handling input changes
  // const handleValueChange = (value: string) => {
  //   onInputChange(field.id, value);
  // };

  const options: { value: string; label: string }[] = field.properties?.options || [];

  return (
    <div className="space-y-2">
      <Label htmlFor={`field-${field.id}`}>
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <RadioGroup
        id={`field-${field.id}`}
 onValueChange={onValueChange}
 {...props}
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupItem value={option.value} id={`option-${option.value}`} />
            <Label htmlFor={`option-${option.value}`}>{option.label}</Label>
          </div>
        ))}
      </RadioGroup>
      {field.placeholder && (
        <p className="text-sm text-muted-foreground">{field.placeholder}</p>
      )}
    </div>
  );
};

export default MultipleChoiceInput;