'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CaseSensitive,
  CheckSquare,
  ChevronDownSquare,
  CircleDot,
  FileUp,
  Calendar,
  Heading1,
} from 'lucide-react';
import type { FormFieldType } from '@/lib/types';

interface FieldPaletteProps {
  onAddField: (type: FormFieldType) => void;
}

const fieldTypes: { type: FormFieldType; label: string; icon: React.ReactNode }[] = [
  { type: 'text', label: 'Text Input', icon: <CaseSensitive className="h-4 w-4" /> },
  { type: 'textarea', label: 'Paragraph', icon: <Heading1 className="h-4 w-4" /> },
  { type: 'radio', label: 'Multiple Choice', icon: <CircleDot className="h-4 w-4" /> },
  { type: 'checkbox', label: 'Checkboxes', icon: <CheckSquare className="h-4 w-4" /> },
  { type: 'select', label: 'Dropdown', icon: <ChevronDownSquare className="h-4 w-4" /> },
  { type: 'date', label: 'Date Picker', icon: <Calendar className="h-4 w-4" /> },
  { type: 'file', label: 'File Upload', icon: <FileUp className="h-4 w-4" /> },
];

export function FieldPalette({ onAddField }: FieldPaletteProps) {
  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle>Form Fields</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {fieldTypes.map(({ type, label, icon }) => (
            <Button
              key={type}
              variant="outline"
              className="flex flex-col h-20 items-center justify-center text-center p-2"
              onClick={() => onAddField(type)}
            >
              {icon}
              <span className="text-xs mt-1">{label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
