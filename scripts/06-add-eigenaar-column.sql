-- Add eigenaar column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'recepten' AND column_name = 'eigenaar') THEN
        ALTER TABLE recepten ADD COLUMN eigenaar VARCHAR(50) DEFAULT 'henk';
    END IF;
END $$;

-- Update existing recepten to have eigenaar values
UPDATE recepten SET eigenaar = 'henk' WHERE eigenaar IS NULL;

-- Add some sample recipes for "pepie en luulie" if they don't exist
INSERT INTO recepten (naam, beschrijving, bereidingstijd, moeilijkheidsgraad, type, seizoen, tags, afbeelding_url, bereidingswijze, personen, eigenaar)
SELECT * FROM (VALUES 
  (
    'Pepie''s Pannenkoeken', 
    'Luulie''s favoriete pannenkoeken recept, altijd een hit bij de kinderen!',
    30, 
    'Makkelijk', 
    'Ontbijt', 
    ARRAY['Lente', 'Zomer', 'Herfst', 'Winter'], 
    ARRAY['zoet', 'kinderen', 'weekend'], 
    '/placeholder.svg?height=600&width=800&text=Pannenkoeken',
    ARRAY[
      'Meng bloem, melk, eieren en een snufje zout tot een glad beslag.',
      'Laat het beslag 15 minuten rusten.',
      'Verhit een beetje boter in een koekenpan.',
      'Giet een schepje beslag in de pan en draai de pan rond.',
      'Bak de pannenkoek goudbruin aan beide kanten.',
      'Serveer met stroop, poedersuiker of vers fruit.'
    ],
    4,
    'pepie en luulie'
  ),
  (
    'Luulie''s Chocolademuffins', 
    'Pepie''s geheime recept voor de lekkerste chocolademuffins.',
    45, 
    'Gemiddeld', 
    'Dessert', 
    ARRAY['Herfst', 'Winter'], 
    ARRAY['chocolade', 'zoet', 'bakken'], 
    '/placeholder.svg?height=600&width=800&text=Chocolademuffins',
    ARRAY[
      'Verwarm de oven voor op 180°C.',
      'Meng alle droge ingrediënten in een kom.',
      'Klop eieren, melk en gesmolten boter door elkaar.',
      'Voeg de natte ingrediënten toe aan de droge en roer voorzichtig.',
      'Vul muffinvormen voor 2/3 met het beslag.',
      'Bak 20-25 minuten tot ze veerkrachtig aanvoelen.'
    ],
    6,
    'pepie en luulie'
  )
) AS new_recipes(naam, beschrijving, bereidingstijd, moeilijkheidsgraad, type, seizoen, tags, afbeelding_url, bereidingswijze, personen, eigenaar)
WHERE NOT EXISTS (
  SELECT 1 FROM recepten WHERE naam = new_recipes.naam
);

-- Add ingredients for new recipes
INSERT INTO ingredienten (recept_id, naam, hoeveelheid, eenheid, notitie)
SELECT 
  r.id,
  ingredient_data.naam,
  ingredient_data.hoeveelheid,
  ingredient_data.eenheid,
  ingredient_data.notitie
FROM recepten r
CROSS JOIN (
  VALUES 
    ('Pepie''s Pannenkoeken', 'bloem', 250, 'gram', NULL),
    ('Pepie''s Pannenkoeken', 'melk', 500, 'milliliter', NULL),
    ('Pepie''s Pannenkoeken', 'eieren', 3, 'stuks', NULL),
    ('Pepie''s Pannenkoeken', 'zout', 1, 'snufje', NULL),
    ('Pepie''s Pannenkoeken', 'boter', 50, 'gram', 'voor het bakken'),
    ('Luulie''s Chocolademuffins', 'bloem', 200, 'gram', NULL),
    ('Luulie''s Chocolademuffins', 'cacaopoeder', 30, 'gram', NULL),
    ('Luulie''s Chocolademuffins', 'suiker', 150, 'gram', NULL),
    ('Luulie''s Chocolademuffins', 'bakpoeder', 2, 'theelepel', NULL),
    ('Luulie''s Chocolademuffins', 'eieren', 2, 'stuks', NULL),
    ('Luulie''s Chocolademuffins', 'melk', 200, 'milliliter', NULL),
    ('Luulie''s Chocolademuffins', 'boter', 100, 'gram', 'gesmolten'),
    ('Luulie''s Chocolademuffins', 'chocoladestukjes', 100, 'gram', NULL)
) AS ingredient_data(recept_naam, naam, hoeveelheid, eenheid, notitie)
WHERE r.naam = ingredient_data.recept_naam
AND NOT EXISTS (
  SELECT 1 FROM ingredienten i WHERE i.recept_id = r.id AND i.naam = ingredient_data.naam
);

-- Verify the changes
SELECT naam, eigenaar FROM recepten ORDER BY eigenaar, naam;
