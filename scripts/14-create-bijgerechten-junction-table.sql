-- Create junction table for recipe-bijgerechten relationships
CREATE TABLE IF NOT EXISTS public.recept_bijgerechten (
    id SERIAL PRIMARY KEY,
    recept_id INTEGER REFERENCES public.recepten(id) ON DELETE CASCADE,
    bijgerecht_id INTEGER REFERENCES public.bijgerechten(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(recept_id, bijgerecht_id)
);

-- Enable RLS on the junction table
ALTER TABLE public.recept_bijgerechten ENABLE ROW LEVEL SECURITY;

-- Create policies for the junction table
CREATE POLICY "Enable read access for all users" ON public.recept_bijgerechten
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.recept_bijgerechten
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.recept_bijgerechten
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON public.recept_bijgerechten
    FOR DELETE USING (auth.role() = 'authenticated');

-- Insert some sample data to link recipes with bijgerechten
-- This assumes you have recipes and bijgerechten in your database
INSERT INTO public.recept_bijgerechten (recept_id, bijgerecht_id)
SELECT r.id, b.id 
FROM public.recepten r, public.bijgerechten b 
WHERE r.id <= 3 AND b.id <= 2
ON CONFLICT (recept_id, bijgerecht_id) DO NOTHING;
