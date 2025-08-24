'use client';

import type { FormField } from '@/lib/types';
import { FormFieldWrapper } from './form-field';
import { DndContext, closestCorners, useSensor, KeyboardSensor, MouseSensor } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface FormCanvasProps {
  fields: FormField[];
  updateField: (id: string, updatedField: Partial<FormField>) => void;
  removeField: (id: string) => void;
}

export function FormCanvas({ fields, updateField, removeField }: FormCanvasProps) {
  if (fields.length === 0) {
  }
  const sensors = [
    useSensor(MouseSensor),
    useSensor(KeyboardSensor),
  ];

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = fields.findIndex(field => field.id === active.id);
      const newIndex = fields.findIndex(field => field.id === over.id);
      const newFields = arrayMove(fields, oldIndex, newIndex);
      // Update the order of fields based on newFields
      // This assumes the order is updated in the parent state and persisted to the backend
      newFields.forEach((field, index) => updateField(field.id, { order: index }));
    }
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 rounded-lg border-2 border-dashed">
        <p className="text-muted-foreground">Your form is empty.</p>
        <p className="text-sm text-muted-foreground mt-2">Add fields from the right panel to get started.</p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <SortableContext items={fields.map(field => field.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-6">
          {fields.map((field) => (
            <FormFieldWrapper
              key={field.id}
              field={field}
              onUpdate={updateField}
              onRemove={removeField}
            // TODO: Implement field selection logic (e.g., onClick to set selected field state)
            // TODO: Implement delete functionality within FormFieldWrapper or here
            >
              {/* TODO: Conditionally render different components based on field.type */}
              {/* You'll need to create/import components for each field type */}
              {/* Example: */}
              {/* {field.type === 'text' && <TextInput field={field} />} */}
              {/* {field.type === 'paragraph' && <ParagraphInput field={field} />} */}
            </FormFieldWrapper>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
