
'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { FormField } from '@/lib/types';
import { cn } from '@/lib/utils';
import { FormFieldWrapper } from './form-field';

interface FormCanvasProps {
  fields: FormField[];
  setSelectedField: (field: FormField | null) => void;
  removeField: (id: string) => void;
}

export function FormCanvas({ fields, setSelectedField, removeField }: FormCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'form-canvas-droppable',
  });

  if (fields.length === 0) {
    return (
      <div
        ref={setNodeRef}
        className={cn(
          "flex flex-col items-center justify-center h-full text-center p-8 rounded-lg border-2 border-dashed transition-colors",
          isOver ? "border-primary bg-primary/10" : "border-muted-foreground/30"
        )}
      >
        <p className="text-muted-foreground">Your form is empty.</p>
        <p className="text-sm text-muted-foreground mt-2">Drag fields from the right panel to get started.</p>
      </div>
    )
  }

  return (
    <div ref={setNodeRef} className={cn("h-full space-y-4", isOver && "bg-primary/5 rounded-lg")}>
      <SortableContext items={fields.map(field => field.id)} strategy={verticalListSortingStrategy}>
        {fields.map((field) => (
          <FormFieldWrapper
            key={field.id}
            field={field}
            onSelect={setSelectedField}
            removeField={removeField}
          />
        ))}
      </SortableContext>
    </div>
  );
}
