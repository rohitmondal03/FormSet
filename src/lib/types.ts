import type { Database, Json } from "../../supabase/database.types";

type PublicSchema = Database["public"];
type TableType = PublicSchema["Tables"];
type FormRow = TableType["forms"]["Row"];
type FormFieldRow = TableType["form_fields"]["Row"];
type FormResponseRow = TableType["form_responses"]["Row"];

export type FormField = FormFieldRow;

export type Form = Omit<FormRow, "limit_one_response_per_email"> & {
    limit_one_response_per_email: boolean;
    fields: FormField[];
    responseCount: number;
    url: string;
};

// This corresponds to the form_answers table
export type FormAnswer = TableType["form_answers"]["Row"];

// This corresponds to the form_responses table
export type FormResponse = FormResponseRow & {
    data: Record<string, Json | Json[]>;
};

// This corresponds to the profiles table
export type Profile = TableType["profiles"]["Row"];
