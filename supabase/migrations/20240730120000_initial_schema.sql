-- Create the forms table
CREATE TABLE forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create the form_fields table
CREATE TABLE form_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID REFERENCES forms(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    label TEXT NOT NULL,
    placeholder TEXT,
    required BOOLEAN NOT NULL DEFAULT false,
    options JSONB,
    "order" INTEGER NOT NULL
);

-- Create the form_responses table
CREATE TABLE form_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID REFERENCES forms(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    data JSONB NOT NULL
);

-- RLS Policies for forms
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own forms."
ON forms FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own forms."
ON forms FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own forms."
ON forms FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own forms."
ON forms FOR DELETE
USING (auth.uid() = user_id);

-- Public access for published forms
CREATE POLICY "Public can view published forms"
ON forms FOR SELECT
USING (true);


-- RLS Policies for form_fields
ALTER TABLE form_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view fields for forms they own."
ON form_fields FOR SELECT
USING (auth.uid() = (SELECT user_id FROM forms WHERE id = form_id));

CREATE POLICY "Users can insert fields for forms they own."
ON form_fields FOR INSERT
WITH CHECK (auth.uid() = (SELECT user_id FROM forms WHERE id = form_id));

CREATE POLICY "Users can update fields for forms they own."
ON form_fields FOR UPDATE
USING (auth.uid() = (SELECT user_id FROM forms WHERE id = form_id));

CREATE POLICY "Users can delete fields for forms they own."
ON form_fields FOR DELETE
USING (auth.uid() = (SELECT user_id FROM forms WHERE id = form_id));

-- Public access for fields of published forms
CREATE POLICY "Public can view fields of published forms"
ON form_fields FOR SELECT
USING (true);


-- RLS Policies for form_responses
ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view responses for forms they own."
ON form_responses FOR SELECT
USING (auth.uid() = (SELECT user_id FROM forms WHERE id = form_id));

-- Public can submit responses
CREATE POLICY "Public can insert responses."
ON form_responses FOR INSERT
WITH CHECK (true);
