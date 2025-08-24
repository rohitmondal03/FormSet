import React from 'react';
import { FormField } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input'; // Or a dedicated time picker component

interface TimePickerInputProps {
  field: FormField;
  // Add a prop to handle changes, e.g.:
  // onInputChange: (value: string) => void;
}

const TimePickerInput: React.FC<TimePickerInputProps> = ({ field /* onInputChange */ }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={`field-${field.id}`}>
        {field.label}
        {field.required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      {/* Replace with a proper time picker component if available in shadcn/ui or another library */}
      <Input
        id={`field-${field.id}`}
        type="time"
        placeholder={field.placeholder || ''}
        required={field.required}
        // Add onChange handler here
        // onChange={(e) => onInputChange(e.target.value)}
      />
      {field.properties?.description && (
        <p className="text-sm text-muted-foreground">{field.properties.description}</p>
      )}
    </div>
  );
};

export default TimePickerInput;
