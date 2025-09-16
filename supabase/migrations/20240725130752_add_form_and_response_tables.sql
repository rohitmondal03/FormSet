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
    "order" INT NOT NULL,
    type TEXT NOT NULL,
    label TEXT NOT NULL,
    placeholder TEXT,
    required BOOLEAN DEFAULT false,
    options JSONB,
    validation JSONB,
    properties JSONB,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- Create the form_responses table
CREATE TABLE IF NOT EXISTS form_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID REFERENCES forms(id) ON DELETE CASCADE NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);


-- RLS Policies for forms
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to create forms" ON forms FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow owner to view forms" ON forms FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow owner to update forms" ON forms FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Allow owner to delete forms" ON forms FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for form_fields
ALTER TABLE form_fields ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow owner to manage form_fields" ON form_fields FOR ALL USING (auth.uid() = (SELECT user_id FROM forms WHERE id = form_id));
CREATE POLICY "Allow anyone to view form_fields" ON form_fields FOR SELECT USING (true);


-- RLS Policies for form_responses
ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anyone to submit responses" ON form_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow form owner to view responses" ON form_responses FOR SELECT USING (auth.uid() = (SELECT user_id FROM forms WHERE id = form_id));

-- Note: The form_answers table and its policies were removed from this file as they were added in a later migration.
-- Leaving them here would cause "already exists" errors.
