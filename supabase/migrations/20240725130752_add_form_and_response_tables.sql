-- Create the forms table
CREATE TABLE IF NOT EXISTS forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- Create the form_fields table
CREATE TABLE IF NOT EXISTS form_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID REFERENCES forms(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    label TEXT NOT NULL,
    placeholder TEXT,
    required BOOLEAN DEFAULT FALSE,
    options JSONB, -- For select, radio, checkbox
    "order" INTEGER NOT NULL,
    validation JSONB, -- For custom validation rules
    properties JSONB, -- For other field properties (e.g., min/max for number)
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- Create the form_responses table
CREATE TABLE IF NOT EXISTS form_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID REFERENCES forms(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
    data JSONB NOT NULL
);

-- Create the form_answers table
CREATE TABLE IF NOT EXISTS form_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_response_id UUID REFERENCES form_responses(id) ON DELETE CASCADE NOT NULL,
    field_id UUID REFERENCES form_fields(id) ON DELETE CASCADE NOT NULL,
    value JSONB,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- RLS Policies for forms
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to create forms" ON forms FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow owner to view their forms" ON forms FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow owner to update their forms" ON forms FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Allow owner to delete their forms" ON forms FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for form_fields
ALTER TABLE form_fields ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow owner to manage form fields" ON form_fields FOR ALL USING (auth.uid() = (SELECT user_id FROM forms WHERE id = form_id));

-- RLS Policies for form_responses
ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public to submit responses" ON form_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow owner to view form responses" ON form_responses FOR SELECT USING (auth.uid() = (SELECT user_id FROM forms WHERE id = form_id));

-- RLS Policies for form_answers
ALTER TABLE form_answers ENABLE ROW LEVEL SECURITY;

-- Allow users who submitted the response to view their answers
CREATE POLICY "Allow owner to view form_answers" ON public.form_answers FOR SELECT USING (auth.uid() = (SELECT f.user_id FROM public.forms f JOIN public.form_responses fr ON f.id = fr.form_id WHERE fr.id = form_response_id));
