import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormField } from '@/lib/types';

interface NumberInputProps {
  field: FormField;
  // Add prop for handling changes if needed
  // onChange: (value: number | string) => void;
}

const NumberInput: React.FC<NumberInputProps> = ({ field }) => {
  // Access min/max from field.properties
  const minValue = field.properties?.min as number | undefined;
  const maxValue = field.properties?.max as number | undefined;

  // TODO: Implement input change handling
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Handle the change, potentially calling a parent onChange prop
    // if (onChange) {
    //   onChange(value);
    // }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={field.id}>
        {field.label}
        {field.required && <span className="text-red-500"> *</span>}
      </Label>
      <Input
        id={field.id}
        type="number"
        placeholder={field.placeholder || ''}
        required={field.required}
        min={minValue}
        max={maxValue}
        onChange={handleInputChange}
      />
      {/* TODO: Add help text/description if available in field properties */}
      {/* {field.description && <p className="text-sm text-muted-foreground">{field.description}</p>} */}
    </div>
  );
};

export default NumberInput;