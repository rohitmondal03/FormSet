'use client';

import { useState } from 'react';
import type { FormField } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FormFieldWrapperProps {
  field: FormField;
  onUpdate: (id: string, updatedField: Partial<FormField>) => void;
  onRemove: (id: string) => void;
}

export function FormFieldWrapper({ field, onUpdate, onRemove }: FormFieldWrapperProps) {
  const [isFocused, setIsFocused] = useState(false);

  const renderFieldPreview = () => {
    switch (field.type) {
      case 'textarea':
        return <Textarea placeholder={field.placeholder} disabled />;
      case 'radio':
        return (
          <RadioGroup>
            {field.options?.map((opt) => (
              <div key={opt.value} className="flex items-center space-x-2">
                <RadioGroupItem value={opt.value} id={`${field.id}-${opt.value}`} disabled />
                <Label htmlFor={`${field.id}-${opt.value}`}>{opt.label}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      case 'checkbox':
        return (
            <div className="space-y-2">
                {field.options?.map((opt) => (
                    <div key={opt.value} className="flex items-center space-x-2">
                        <Checkbox id={`${field.id}-${opt.value}`} disabled />
                        <Label htmlFor={`${field.id}-${opt.value}`}>{opt.label}</Label>
                    </div>
                ))}
            </div>
        );
      case 'select':
        return (
            <Select disabled>
                <SelectTrigger>
                    <SelectValue placeholder={field.placeholder || "Select an option"} />
                </SelectTrigger>
            </Select>
        )
      case 'date':
        return <Input type="date" disabled />;
      case 'file':
        return <Input type="file" disabled />;
      default:
        return <Input placeholder={field.placeholder} disabled />;
    }
  };

  return (
    <Card 
        className={cn("transition-all duration-300", isFocused ? 'border-primary shadow-lg' : '')}
        onClick={() => setIsFocused(true)}
    >
        <CardContent className="p-4" onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}>
            <div className="flex gap-4">
                <div className="flex-grow space-y-4">
                    <Input
                        value={field.label}
                        onChange={(e) => onUpdate(field.id, { label: e.target.value })}
                        className="text-base font-medium border-none shadow-none focus-visible:ring-1 focus-visible:ring-ring p-2"
                        placeholder="Your question here"
                    />
                    
                    {renderFieldPreview()}
                    
                    {isFocused && (
                        <div className="border-t pt-4 mt-4 flex items-center justify-end gap-4">
                             <div className="flex items-center space-x-2">
                                <Switch 
                                    id={`required-${field.id}`} 
                                    checked={field.required}
                                    onCheckedChange={(checked) => onUpdate(field.id, { required: checked })}
                                />
                                <Label htmlFor={`required-${field.id}`}>Required</Label>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => onRemove(field.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                                <span className="sr-only">Delete field</span>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
      </CardContent>
    </Card>
  );
}
