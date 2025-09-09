
'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import type { FormField } from '@/lib/types';
import type { SelectSingleEventHandler } from 'react-day-picker';

interface DatePickerInputProps {
  field: FormField;
  onValueChange: (value: Date | undefined) => void;
}
const DatePickerInput: React.FC<DatePickerInputProps> = ({ field, onValueChange }) => {
  const [date, setDate] = React.useState<Date>();

  const handleDateSelect: SelectSingleEventHandler = (selectedDate) => {
    setDate(selectedDate);
    if (onValueChange) {
      onValueChange(selectedDate);
    }
  };

  const properties = (field.properties as Record<string, string | number | boolean | Date | undefined>) || {};

  return (
    <div className="space-y-2">
      <Label htmlFor={field.id}>
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={'outline'}
            className={cn(
              'w-full justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, 'PPP') : field.placeholder || 'Pick a date'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {properties?.description && (
        <p className="text-sm text-muted-foreground">{properties.description as string}</p>
      )}
    </div>
  );
};

export default DatePickerInput;
