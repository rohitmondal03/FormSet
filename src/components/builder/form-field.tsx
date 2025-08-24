
'use client';

import type { FormField, FormFieldOption } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Trash2, PlusCircle, FileUp, Star, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { DatePicker } from '../ui/date-picker';
import { Slider } from '@/components/ui/slider';

interface FormFieldWrapperProps {
  field: FormField;
  onUpdate: (id: string, updatedField: Partial<FormField>) => void;
  onRemove: (id: string) => void;
}

export function FormFieldWrapper({ field, onUpdate, onRemove }: FormFieldWrapperProps) {

  const handleOptionChange = (optionIndex: number, newLabel: string) => {
    const newOptions = [...(field.options || [])];
    newOptions[optionIndex] = { ...newOptions[optionIndex], label: newLabel, value: newLabel.toLowerCase().replace(/\s+/g, '-') };
    onUpdate(field.id, { options: newOptions });
  };

  const addOption = () => {
    const newOptions = [...(field.options || [])];
    const newOptionNumber = newOptions.length + 1;
    newOptions.push({ value: `option-${newOptionNumber}`, label: `Option ${newOptionNumber}` });
    onUpdate(field.id, { options: newOptions });
  };

  const removeOption = (optionIndex: number) => {
    const newOptions = (field.options || []).filter((_, i) => i !== optionIndex);
    onUpdate(field.id, { options: newOptions });
  };


  const renderFieldPreview = () => {
    switch (field.type) {
      case 'textarea':
        return <Textarea placeholder={field.placeholder} disabled />;
      case 'radio':
      case 'checkbox':
      case 'select':
        return (
            <div className='space-y-2'>
            {(field.options || []).map((opt, index) => (
              <div key={index} className="flex items-center space-x-2 group">
                <Input
                    value={opt.label}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="flex-1 text-sm"
                    placeholder={`Option ${index + 1}`}
                />
                <Button variant="ghost" size="icon" className="shrink-0" onClick={() => removeOption(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addOption} className="mt-2">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Option
            </Button>
          </div>
        );
      case 'date':
        return <DatePicker disabled/>;
      case 'file':
        return (
          <div className="flex items-center justify-center w-full">
            <Label htmlFor={`file-upload-preview-${field.id}`} className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FileUp className="w-8 h-8 mb-4 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                </div>
                <Input id={`file-upload-preview-${field.id}`} type="file" className="hidden" disabled />
            </Label>
          </div>
        );
      case 'number':
        return <Input type="number" placeholder={field.placeholder} disabled />;
      case 'time':
        return (
            <div className="relative">
                <Input type="time" disabled className="pr-10" />
                <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
        );
      case 'rating':
        return (
            <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 text-yellow-400" />
                ))}
            </div>
        );
      case 'slider':
          return <Slider defaultValue={[50]} max={100} step={1} disabled/>;
      default:
        return <Input placeholder={field.placeholder} disabled />;
    }
  };

  return (
    <Card className="transition-all duration-300 border-primary shadow-lg">
        <CardContent className="p-4">
            <div className="flex gap-4">
                <div className="flex-grow space-y-4">
                    <Input
                        value={field.label}
                        onChange={(e) => onUpdate(field.id, { label: e.target.value })}
                        className="text-base font-medium border-none shadow-none focus-visible:ring-1 focus-visible:ring-ring p-2"
                        placeholder="Your question here"
                    />

                    {renderFieldPreview()}

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
                </div>
            </div>
      </CardContent>
    </Card>
  );
}
