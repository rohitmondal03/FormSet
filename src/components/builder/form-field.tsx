
'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Settings } from 'lucide-react';
import type { FormField } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { fieldTypes } from '@/lib/form-utils';

interface FormFieldWrapperProps {
  field: FormField;
  onSelect: (field: FormField) => void;
}

export function FormFieldWrapper({ field, onSelect }: FormFieldWrapperProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  const { Icon } = fieldTypes.find(ft => ft.type === field.type) || {};

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? 'relative' : ''}>
      <Card className={cn(
          "transition-all duration-300 relative group/field min-w-64", // min-w added here
          isDragging ? "shadow-2xl ring-2 ring-primary" : "shadow-md"
      )}>
          <div {...attributes} {...listeners} className="absolute top-1/2 -translate-y-1/2 left-2 cursor-grab p-1 text-muted-foreground hover:bg-accent rounded-md">
              <GripVertical className="h-5 w-5" />
          </div>
          <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover/field:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="size-7" onClick={() => onSelect(field)}>
              <Settings className="size-4" />
            </Button>
          </div>
          <CardContent className="p-4 pl-12">
             <div className="flex items-center gap-4">
                {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
                <div className="flex-grow">
                    <p className="font-semibold whitespace-nowrap">{field.label}</p>
                    {field.required && <span className="text-xs text-destructive">Required</span>}
                </div>
            </div>
             {field.placeholder && <p className="text-sm text-muted-foreground mt-2 ml-9">{field.placeholder}</p>}
          </CardContent>
        </Card>
    </div>
  );
}
