import React from 'react';

import type { FormField } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface CheckboxInputProps {
  field: FormField;
  // Add a prop for handling changes if needed
  // onChange: (value: string[]) => void;
}

const CheckboxInput: React.FC<CheckboxInputProps> = ({ field }) => {
  // Assuming options are stored in field.properties as an array of { value: string, label: string }
  const options: { value: string; label: string }[] = field.properties?.options || [];

  // Placeholder for managing selected values
  // const [selectedValues, setSelectedValues] = React.useState<string[]>([]);

  // Placeholder for handling checkbox changes
  // const handleCheckedChange = (value: string, checked: boolean) => {
  //   if (checked) {
  //     setSelectedValues([...selectedValues, value]);
  //   } else {
  //     setSelectedValues(selectedValues.filter(v => v !== value));
  //   }
  //   // Call onChange prop if provided
  //   // if (onChange) {
  //   //   onChange(selectedValues);
  //   // }
  // };

  return (
    <div className="space-y-2">
      <Label>
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="space-y-2">
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <Checkbox
              id={`${field.id}-${option.value}`}
              value={option.value}
              // checked={selectedValues.includes(option.value)}
              // onCheckedChange={(checked) => handleCheckedChange(option.value, checked as boolean)}
            />
            <label
              htmlFor={`${field.id}-${option.value}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
      {field.placeholder && (
        <p className="text-sm text-muted-foreground">{field.placeholder}</p>
      )}
    </div>
  );
};

export default CheckboxInput;