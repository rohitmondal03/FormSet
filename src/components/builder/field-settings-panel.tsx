'use client';

import { Trash2, Undo } from 'lucide-react';
import { FormField } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
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
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';

interface FieldSettingsPanelProps {
  field: FormField;
  updateField: (id: string, updatedField: Partial<FormField>) => void;
  removeField: (id: string) => void;
  onClose: () => void;
  onUndo: (field: FormField) => void;
}

const FieldSettingsPanel: React.FC<FieldSettingsPanelProps> = ({
  field,
  updateField,
  removeField,
  onClose,
  onUndo,
}) => {
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    updateField(field.id, { [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (checked: boolean) => {
    updateField(field.id, { required: checked });
  };

  const handleDeleteField = () => {
    const fieldToDelete = { ...field };
    removeField(field.id);
    onClose();

    toast({
      title: "Field Deleted",
      description: `The field "${fieldToDelete.label}" has been deleted.`,
      action: (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            onUndo(fieldToDelete);
            toast({
              title: "Field Restored",
              description: `The field "${fieldToDelete.label}" has been restored.`,
            });
          }}
        >
          <Undo className="mr-2 h-4 w-4" /> Undo
        </Button>
      ),
    });
  };

  const renderTypeSpecificSettings = (field: FormField) => {
    switch (field.type) {
      case 'radio':
      case 'checkbox':
      case 'select':
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
        return (
          <div className="space-y-4">
            <Label>Number Range (Optional)</Label>
            <div className="flex items-center space-x-2">
                <Input
                  id={`${field.id}-min`}
                  type="number"
                  placeholder='Min'
                  value={field.properties?.min ?? ''}
                  onChange={(e) =>
                    updateField(field.id, { properties: { ...field.properties, min: e.target.value ? parseFloat(e.target.value) : undefined } })
                  }
                  className="flex-1"
                />
                <Input
                  id={`${field.id}-max`}
                  type="number"
                  placeholder='Max'
                  value={field.properties?.max ?? ''}
                  onChange={(e) =>
                    updateField(field.id, { properties: { ...field.properties, max: e.target.value ? parseFloat(e.target.value) : undefined } })
                  }
                  className="flex-1"
                />
            </div>
          </div>
        );
      case 'slider':
          return (
            <div className="space-y-4">
              <Label>Slider Properties</Label>
              <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    placeholder='Min'
                    value={field.properties?.min ?? 0}
                    onChange={(e) => updateField(field.id, { properties: { ...field.properties, min: parseFloat(e.target.value) } })}
                  />
                  <Input
                    type="number"
                    placeholder='Max'
                    value={field.properties?.max ?? 100}
                    onChange={(e) => updateField(field.id, { properties: { ...field.properties, max: parseFloat(e.target.value) } })}
                  />
                  <Input
                    type="number"
                    placeholder='Step'
                    value={field.properties?.step ?? 1}
                    onChange={(e) => updateField(field.id, { properties: { ...field.properties, step: parseFloat(e.target.value) } })}
                  />
              </div>
            </div>
          );
      case 'file':
        return (
          <div className="space-y-2">
            <Label htmlFor={`${field.id}-file-types`}>Accepted File Types</Label>
            <Input
              id={`${field.id}-file-types`}
              name="accept"
              placeholder="e.g., image/*, .pdf, .docx"
              value={field.properties?.accept || ''}
              onChange={(e) =>
                updateField(field.id, { properties: { ...field.properties, accept: e.target.value } })
              }
            />
             <p className="text-xs text-muted-foreground">
                Comma-separated list of file types.
              </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Sheet open={!!field} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-80 sm:w-96 flex flex-col">
        <SheetHeader>
          <SheetTitle>Field Settings</SheetTitle>
          <SheetDescription>Configure the properties and validation for this field.</SheetDescription>
        </SheetHeader>
        <div className="py-4 space-y-6 flex-grow overflow-y-auto pr-6">
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
          {renderTypeSpecificSettings(field)}
        </div>
        <SheetFooter className="mt-auto">
            <Button variant="destructive" onClick={handleDeleteField}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
             <SheetClose asChild>
                <Button variant="default">Save</Button>
            </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default FieldSettingsPanel;
