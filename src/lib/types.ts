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

// This corresponds to the form_fields table
export interface FormField {
  id: string; // UUID from the database
  form_id?: string;
  type: FormFieldType;
  label: string;
  placeholder?: string | null;
  required: boolean;
  options?: FormFieldOption[] | null;
  order: number;
}

// This corresponds to the forms table
export interface Form {
  id: string; // UUID from the database
  user_id?: string;
  title: string;
  description: string;
  fields: FormField[];
  createdAt: Date;
  responseCount: number;
  url: string;
}

// This corresponds to the form_responses table
export interface FormResponse {
  id: string;
  form_id?: string;
  submittedAt: Date;
  data: Record<string, any>;
}
