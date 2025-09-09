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
  return (
    <div className="space-y-2">
      <Label htmlFor={field.id}>
        {field.label}
        {field.required && <span className="text-red-500"> *</span>}
      </Label>
      {field.placeholder && (
        <p className="text-sm text-muted-foreground">{field.placeholder}</p>
      )}
      <Select>
        <SelectTrigger id={field.id}>
          <SelectValue placeholder={`Select ${field.label}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option, index: number) => (
            <SelectItem
              key={index}
              value={typeof option === 'string' ? option : option.value}
            >
              {option.label || option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {/* Add validation error display here */}
    </div>
  );
}