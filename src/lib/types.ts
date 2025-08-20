import type { LucideIcon } from 'lucide-react';

export type FormFieldType =
  | 'text'
  | 'textarea'
  | 'radio'
  | 'checkbox'
  | 'select'
  | 'date'
  | 'file';

export interface FormFieldOption {
  value: string;
  label: string;
}

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: FormFieldOption[];
}

export interface Form {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  createdAt: Date;
  responseCount: number;
  url: string;
}

export interface FormResponse {
  id: string;
  submittedAt: Date;
  data: Record<string, any>;
}
