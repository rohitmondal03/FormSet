
-- Create forms table
CREATE TABLE forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create form_fields table
CREATE TABLE form_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    label TEXT NOT NULL,
    placeholder TEXT,
    required BOOLEAN NOT NULL DEFAULT false,
    options JSONB,
    "order" INTEGER NOT NULL
);

-- Create form_responses table
CREATE TABLE form_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;

-- Policies for `forms` table
CREATE POLICY "Users can create their own forms."
ON forms FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own forms."
ON forms FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own forms."
ON forms FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own forms."
ON forms FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Policies for `form_fields` table
CREATE POLICY "Users can manage fields on their own forms."
ON form_fields FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM forms WHERE forms.id = form_fields.form_id AND forms.user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can view fields for a public form."
ON form_fields FOR SELECT TO anon USING (true);


-- Policies for `form_responses` table
CREATE POLICY "Users can view responses to their own forms."
ON form_responses FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM forms WHERE forms.id = form_responses.form_id AND forms.user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can submit a response to a form."
ON form_responses FOR INSERT WITH CHECK (true);


-- Public access for forms
CREATE POLICY "Public forms are viewable by everyone."
ON forms FOR SELECT TO anon USING (true);
