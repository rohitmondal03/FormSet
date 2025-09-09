
'use client';

import { useDraggable } from '@dnd-kit/core';
import type { FormField as FormFieldType } from '@/lib/types';
import { fieldTypes } from '@/lib/form-utils';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DraggablePaletteItemProps {
  type: FormFieldType;
  label: string;
  Icon: React.ElementType;
}

function DraggablePaletteItem({ type, label, Icon }: DraggablePaletteItemProps) {
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
      {...listeners}
      {...attributes}
    >
      <Icon className="size-4" />
      <span className="text-xs mt-1">{label}</span>
    </Button>
  );
}

export function FieldPalette() {
  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle>Form Fields</CardTitle>
        <CardDescription>Drag fields from here and drop in the form canvas.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {fieldTypes.map(({ type, label, Icon }) => (
            <DraggablePaletteItem
              key={type}
              type={type}
              label={label}
              Icon={Icon}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
