-- Create the table to store user-specific test blueprint presets
CREATE TABLE public.test_blueprint_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Using UUID for unique, secure IDs
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Link to the user who created it, and delete presets if user is deleted
  name TEXT NOT NULL, -- The name of the preset
  blueprint JSONB NOT NULL, -- The complex blueprint rules object, stored as efficient JSONB
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS) for the table - IMPORTANT FOR SECURITY
ALTER TABLE public.test_blueprint_presets ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies: Users can only see and manage their OWN presets
CREATE POLICY "Allow users to manage their own presets"
ON public.test_blueprint_presets
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Optional: Add a function to automatically update the 'updated_at' timestamp
CREATE OR REPLACE FUNCTION handle_preset_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_preset_update
BEFORE UPDATE ON public.test_blueprint_presets
FOR EACH ROW
EXECUTE FUNCTION handle_preset_update();
