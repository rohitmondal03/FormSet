-- Create users table (managed by Supabase Auth)
-- Create forms table
CREATE TABLE forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add RLS policies for forms table
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to create forms" ON forms
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow owner to view their own forms" ON forms
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow owner to update their own forms" ON forms
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow owner to delete their own forms" ON forms
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Allow public read access to forms" ON forms
    FOR SELECT TO anon USING (true);


-- Create form_fields table
CREATE TABLE form_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    label TEXT NOT NULL,
    placeholder TEXT,
    required BOOLEAN NOT NULL DEFAULT false,
    options JSONB, -- For radio, checkbox, select
    "order" INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add RLS policies for form_fields table
ALTER TABLE form_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow owner to manage fields of their forms" ON form_fields
    FOR ALL USING (
        (SELECT auth.uid() FROM forms WHERE forms.id = form_id) = auth.uid()
    );

CREATE POLICY "Allow public read access to form fields" ON form_fields
    FOR SELECT TO anon USING (true);


-- Create form_responses table
CREATE TABLE form_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add RLS policies for form_responses table
ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow owner to view responses to their forms" ON form_responses
    FOR SELECT USING (
        (SELECT auth.uid() FROM forms WHERE forms.id = form_id) = auth.uid()
    );

CREATE POLICY "Allow anyone to submit a response" ON form_responses
    FOR INSERT WITH CHECK (true);
