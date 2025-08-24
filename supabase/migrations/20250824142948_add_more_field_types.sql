-- Alter the form_fields table
ALTER TABLE public.form_fields
ADD COLUMN validation JSONB,
ADD COLUMN properties JSONB;

COMMENT ON COLUMN public.form_fields.validation IS 'Stores Zod validation schema or rules for the field.';
COMMENT ON COLUMN public.form_fields.properties IS 'Stores type-specific properties like options, min/max, etc.';

-- Create the form_answers table
CREATE TABLE public.form_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_response_id UUID REFERENCES public.form_responses(id) ON DELETE CASCADE,
    form_field_id UUID REFERENCES public.form_fields(id) ON DELETE CASCADE,
    answer_value JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.form_answers IS 'Stores individual answers for each form field in a response.';
COMMENT ON COLUMN public.form_answers.form_response_id IS 'Links to the form response this answer belongs to.';
COMMENT ON COLUMN public.form_answers.form_field_id IS 'Links to the form field this answer is for.';
COMMENT ON COLUMN public.form_answers.answer_value IS 'Stores the answer value (can be different types: string, number, array, etc.).';

-- Add RLS to form_answers (example policies - adjust as needed)
ALTER TABLE public.form_answers ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert answers
CREATE POLICY "Allow authenticated insert for form_answers" ON public.form_answers FOR INSERT TO authenticated WITH CHECK (true);

-- Allow users who submitted the response to view their answers
CREATE POLICY "Allow owner to view form_answers" ON public.form_answers FOR SELECT USING (auth.uid() = (SELECT user_id FROM public.form_responses WHERE id = form_response_id));
