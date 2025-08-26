
'use client';

import { Button } from '@/components/ui/button';
import type { FormFieldType } from '@/lib/types';
import { fieldTypes } from '@/lib/form-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FieldPaletteProps {
  onAddField: (type: FormFieldType) => void;
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
            <Button
              key={type}
              variant="outline"
              className="flex flex-col h-20 items-center justify-center text-center p-2"
              onClick={() => onAddField(type)}
            >
              {<Icon className="size-4" />}
              <span className="text-xs mt-1">{label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
