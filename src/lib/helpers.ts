import {
  CaseSensitive,
  CheckSquare,
  ChevronDownSquare,
  CircleDot,
  FileUp,
  CalendarDays,
  Hash,
  Clock,
  Star,
  SlidersHorizontal,
  Heading1,
  type LucideIcon
} from 'lucide-react';
import type { FormFieldType } from '@/lib/types';

export const fieldTypes: { type: FormFieldType; label: string; Icon: LucideIcon }[] = [
  { type: 'text', label: 'Text Input', Icon: CaseSensitive },
  { type: 'textarea', label: 'Paragraph', Icon: Heading1 },
  { type: 'radio', label: 'Multiple Choice', Icon: CircleDot },
  { type: 'checkbox', label: 'Checkboxes', Icon: CheckSquare },
  { type: 'select', label: 'Dropdown', Icon: ChevronDownSquare },
  { type: 'date', label: 'Date Picker', Icon: CalendarDays },
  { type: 'file', label: 'File Upload', Icon: FileUp },
  { type: 'number', label: 'Number', Icon: Hash },
  { type: 'rating', label: 'Rating', Icon: Star },
  { type: 'slider', label: 'Slider', Icon: SlidersHorizontal },
];