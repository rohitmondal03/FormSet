-- Create the forms table
CREATE TABLE forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- Create the form_fields table
CREATE TABLE form_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    label TEXT NOT NULL,
    placeholder TEXT,
    required BOOLEAN DEFAULT false,
    options JSONB,
    "order" INTEGER NOT NULL,
    validation JSONB,
    properties JSONB
);

-- Create the form_responses table
CREATE TABLE form_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- Enable RLS
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;


-- Policies for forms
CREATE POLICY "Allow authenticated users to create forms" ON forms FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow owner to view their forms" ON forms FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow owner to update their forms" ON forms FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow owner to delete their forms" ON forms FOR DELETE USING (auth.uid() = user_id);

-- Policies for form_fields
CREATE POLICY "Allow owner to manage form fields" ON form_fields FOR ALL USING (
  auth.uid() = (SELECT user_id FROM forms WHERE id = form_id)
);
CREATE POLICY "Allow anyone to view form fields" ON form_fields FOR SELECT USING (true);


-- Policies for form_responses
CREATE POLICY "Allow anyone to submit responses" ON form_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow form owner to view responses" ON form_responses FOR SELECT USING (
  auth.uid() = (SELECT user_id FROM forms WHERE id = form_id)
);
CREATE POLICY "Allow form owner to delete responses" ON form_responses FOR DELETE USING (
    auth.uid() = (SELECT user_id FROM forms WHERE id = form_id)
);
