'use client';

import React from 'react';
import { FormField } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'; // Assuming you'll use a Sheet for the panel
import { Trash2, X } from 'lucide-react';

interface FieldSettingsPanelProps {
  field: FormField;
  updateField: (id: string, updatedField: Partial<FormField>) => void;
  removeField: (id: string) => void;
  onClose: () => void;
}

const FieldSettingsPanel: React.FC<FieldSettingsPanelProps> = ({
  field,
  updateField,
  removeField,
  onClose,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    updateField(field.id, { [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (checked: boolean) => {
    updateField(field.id, { required: checked });
  };

  const handleDeleteField = () => {
    removeField(field.id);
    onClose(); // Close the panel after deleting
  };

  // Function to render type-specific settings
  const renderTypeSpecificSettings = (field: FormField) => {
    switch (field.type) {
      case 'radio':
      case 'checkbox':
      case 'select':
        // Assuming options are stored as an array of strings in field.options
        const options: { value: string; label: string }[] = field.options || [];
        return (
          <div className="space-y-2">
            <Label>Options</Label>
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={option.label}
                  onChange={(e) => {
                    const newOptions = [...options];
                    newOptions[index] = { ...newOptions[index], label: e.target.value, value: e.target.value.toLowerCase().replace(/\s+/g, '-') };
                    updateField(field.id, { options: newOptions });
                  }}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newOptions = options.filter((_, i) => i !== index);
                    updateField(field.id, { options: newOptions });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                 const newOptionNumber = (field.options?.length || 0) + 1;
                 const newOption = { value: `option-${newOptionNumber}`, label: `Option ${newOptionNumber}` };
                 updateField(field.id, { options: [...(field.options || []), newOption] });
              }}
            >
              Add Option
            </Button>
          </div>
        );
      case 'number':
      case 'rating':
      case 'slider':
        // Assuming min/max/step or scale are in field.properties
        return (
          <div className="space-y-2">
            <Label>Properties</Label>
            {/* Implement inputs for min, max, step, or scale */}
            {/* Example for Number Input min/max */}
            {field.type === 'number' && (
              <>
                <div className="flex items-center space-x-2">
                  <Label htmlFor={`${field.id}-min`}>Min</Label>
                  <Input
                    id={`${field.id}-min`}
                    type="number"
                    value={field.properties?.min || ''}
                    onChange={(e) =>
                      updateField(field.id, { properties: { ...field.properties, min: parseFloat(e.target.value) } })
                    }
                    className="flex-1"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor={`${field.id}-max`}>Max</Label>
                  <Input
                    id={`${field.id}-max`}
                    type="number"
                    value={field.properties?.max || ''}
                    onChange={(e) =>
                      updateField(field.id, { properties: { ...field.properties, max: parseFloat(e.target.value) } })
                    }
                    className="flex-1"
                  />
                </div>
              </>
            )}
            {/* Implement settings for Rating (scale) and Slider (min, max, step) similarly */}
          </div>
        );
      case 'file':
        // Implement settings for allowed file types, size limit (using field.validation)
        return <div>File Upload Settings (Validation)</div>;
      default:
        return null; // No type-specific settings for other types
    }
  };

  return (
    <Sheet open={!!field} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-80 sm:w-96">
        <SheetHeader>
          <SheetTitle>Field Settings</SheetTitle>
          <SheetDescription>Configure the properties and validation for this field.</SheetDescription>
        </SheetHeader>
        <div className="py-4 space-y-6">
          {/* General Settings */}
          <div className="space-y-2">
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              name="label"
              value={field.label}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="placeholder">Placeholder</Label>
            <Input
              id="placeholder"
              name="placeholder"
              value={field.placeholder || ''}
              onChange={handleInputChange}
            />
          </div>
           <div className="space-y-2">
            <Label htmlFor="description">Help Text / Description</Label>
            <Textarea
              id="description"
              name="description"
              value={field.properties?.description || ''}
              onChange={(e) => updateField(field.id, { properties: { ...field.properties, description: e.target.value } })}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="required"
              checked={field.required}
              onCheckedChange={handleCheckboxChange}
            />
            <Label htmlFor="required">Required</Label>
          </div>

          {/* Type-Specific Settings */}
          {renderTypeSpecificSettings(field)}

          {/* Validation Settings (Placeholder) */}
          <div className="space-y-2">
            <Label>Validation Rules</Label>
            {/* Implement inputs to configure Zod validation rules based on field type and `field.validation` */}
            <div>Validation settings coming soon...</div>
          </div>

          {/* Delete Button */}
          <Button variant="destructive" onClick={handleDeleteField} className="w-full">
            <Trash2 className="mr-2 h-4 w-4" /> Delete Field
          </Button>
        </div>
        {/* Close Button */}
        <Button variant="ghost" size="icon" className="absolute top-4 right-4" onClick={onClose}>
            <X className="h-4 w-4" />
        </Button>
      </SheetContent>
    </Sheet>
  );
};

export default FieldSettingsPanel;
