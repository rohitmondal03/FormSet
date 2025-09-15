import type { FormField } from '@/lib/types';
import {
  CaseSensitive,
  CheckSquare,
  ChevronDownSquare,
  CircleDot,
  FileUp,
  CalendarDays,
  Hash,
  Star,
  SlidersHorizontal,
  Heading1,
  type LucideIcon
} from 'lucide-react';

export const fieldTypes: { type: FormField['type']; label: string; Icon: LucideIcon }[] = [
  { type: 'text', label: 'Text Input', Icon: CaseSensitive },
  { type: 'textarea', label: 'Paragraph', Icon: Heading1 },
  { type: 'number', label: 'Number', Icon: Hash },
  { type: 'radio', label: 'Multiple Choice', Icon: CircleDot },
  { type: 'checkbox', label: 'Checkboxes', Icon: CheckSquare },
  { type: 'select', label: 'Dropdown', Icon: ChevronDownSquare },
  { type: 'date', label: 'Date Picker', Icon: CalendarDays },
  { type: 'file', label: 'File Upload', Icon: FileUp },
  { type: 'rating', label: 'Rating', Icon: Star },
  { type: 'slider', label: 'Slider', Icon: SlidersHorizontal },
];

