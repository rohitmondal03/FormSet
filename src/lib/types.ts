import { Database } from "../../supabase/database.types";

type TableType = Database["public"]["Tables"];

// This corresponds to the form_fields table
export type FormField = TableType["form_fields"]["Insert"]

// This corresponds to the form_answers table
export type FormAnswer = TableType["form_answers"]["Insert"]

// This corresponds to the forms table
export type Form = TableType["forms"]["Insert"]

// This corresponds to the form_responses table
export type FormResponse = TableType["form_responses"]["Insert"]

// This corresponds to the profiles table
export type Profile = TableType["profiles"]["Insert"]
