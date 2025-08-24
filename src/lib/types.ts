
export type FormFieldType =
  | 'text'
  | 'paragraph'
  | 'number'
  | 'time'
  | 'textarea'
  | 'radio'
  | 'checkbox'
  | 'select'
  | 'date'
  | 'file'
  | 'slider'
  | 'rating'


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
  options?: FormFieldOption[] | null; // Make options optional and nullable
  order: number;
  // New fields based on schema update
  validation?: any; // JSONB for Zod validation rules (can be more specific later)
  properties?: any; // JSONB for type-specific properties (e.g., min/max, steps)
}

// This corresponds to the form_answers table
export interface FormAnswer {
  id: string; // UUID from the database
  response_id: string; // References form_responses(id)
  field_id: string; // References form_fields(id)
  value: any; // JSONB to accommodate different answer data types
  created_at: string; // TIMESTAMPTZ from the database
  updated_at: string; // TIMESTAMPTZ from the database

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
  submittedAt: Date;
  data: Record<string, any>;
}

// This corresponds to the profiles table
export interface Profile {
  id: string; // This is the profile's own id
  user_id: string; // This is the user_id from auth.users
  full_name: string | null;
  avatar_url: string | null;
}
