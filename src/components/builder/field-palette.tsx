
'use client';

import { useDraggable } from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import type { FormFieldType } from '@/lib/types';
import { fieldTypes } from '@/lib/form-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DraggablePaletteItemProps {
  type: FormFieldType;
  label: string;
  Icon: React.ElementType;
  onAddField: (type: FormFieldType) => void;
}

interface FieldPaletteProps {
  onAddField: (type: FormFieldType) => void;
}

function DraggablePaletteItem({ type, label, Icon, onAddField }: DraggablePaletteItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: {
      type: type,
      isPaletteItem: true,
    },
  });

  return (
    <Button
      ref={setNodeRef}
      variant="outline"
      className={cn(
        "flex flex-col h-20 items-center justify-center text-center p-2 cursor-grab",
        isDragging && "opacity-50 ring-2 ring-primary"
      )}
      onClick={() => onAddField(type)}
      {...listeners}
      {...attributes}
    >
      <Icon className="size-4" />
      <span className="text-xs mt-1">{label}</span>
    </Button>
  );
}

export function FieldPalette({ onAddField }: FieldPaletteProps) {
  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle>Form Fields</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {fieldTypes.map(({ type, label, Icon }) => (
            <DraggablePaletteItem
              key={type}
              type={type}
              label={label}
              Icon={Icon}
              onAddField={onAddField}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
