import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormField } from '@/lib/types'; // Assuming FormField type is in '@/lib/types'

interface TextInputProps {
  field: FormField;
  // Add a prop for handling input changes, e.g., onInputChange: (value: string) => void;
}

const TextInput: React.FC<TextInputProps> = ({ field }) => {
  // Placeholder for handling input changes
  // const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = event.target.value;
  //   onInputChange(value);
  // };

  return (
    <div className="space-y-2">
      <Label htmlFor={field.id}>
        {field.label}
        {field.required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        id={field.id}
        type="text"
        placeholder={field.placeholder || ''}
        required={field.required}
        // Add onChange handler here
        // onChange={handleInputChange}
      />
      {/* Optional: Display help text if available */}
      {field.properties?.helpText && (
        <p className="text-sm text-muted-foreground">{field.properties.helpText}</p>
      )}
    </div>
  );
};

export default TextInput;