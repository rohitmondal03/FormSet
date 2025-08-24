'use client';

import * as React from 'react';

import type { FormField } from '@/lib/types';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DropdownInputProps {
  field: FormField;
  // Add prop for handling value changes, e.g., onValueChange: (value: string) => void;
}

export default function DropdownInput({ field }: DropdownInputProps) {
  // Assuming field.properties.options is an array of strings or objects like { value: string, label: string }
  const options = field.properties?.options || [];

  // Placeholder for handling selection
  const handleValueChange = (value: string) => {
    console.log(`Dropdown value changed for ${field.label}:`, value);
    // Call a prop function to update the form state, e.g., onValueChange(value);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={field.id}>
        {field.label}
        {field.required && <span className="text-red-500"> *</span>}
      </Label>
      {field.placeholder && (
        <p className="text-sm text-muted-foreground">{field.placeholder}</p>
      )}
      <Select onValueChange={handleValueChange}>
        <SelectTrigger id={field.id}>
          <SelectValue placeholder={`Select ${field.label}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option: any, index: number) => (
            <SelectItem key={index} value={option.value || option}>
              {option.label || option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {/* Add validation error display here */}
    </div>
  );
}