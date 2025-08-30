
'use client';

import type { FormField } from '@/lib/types';
import { FormFieldWrapper } from './form-field';
import { DndContext, closestCorners, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';

interface FormCanvasProps {
  fields: FormField[];
  updateField: (id: string, updatedField: Partial<FormField>) => void;
  removeField: (id: string) => void;
}

export function FormCanvas({ fields, updateField, removeField }: FormCanvasProps) {
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
    <div ref={setNodeRef} className={cn("h-full", isOver && "bg-primary/5 rounded-lg")}>
      <SortableContext items={fields.map(field => field.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {fields.map((field) => (
            <FormFieldWrapper
              key={field.id}
              field={field}
              onUpdate={updateField}
              onRemove={removeField}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
