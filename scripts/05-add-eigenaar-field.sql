-- Voeg eigenaar kolom toe aan recepten tabel
ALTER TABLE recepten ADD COLUMN IF NOT EXISTS eigenaar VARCHAR(50) DEFAULT 'henk';

-- Update bestaande recepten met eigenaar
UPDATE recepten SET eigenaar = 'henk' WHERE eigenaar IS NULL;

-- Voeg wat recepten toe voor "pepie en luulie"
INSERT INTO recepten (naam, beschrijving, bereidingstijd, moeilijkheidsgraad, type, seizoen, tags, afbeelding_url, bereidingswijze, personen, eigenaar)
VALUES 
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
  );

-- Voeg ingrediënten toe voor Pepie's Pannenkoeken
INSERT INTO ingredienten (recept_id, naam, hoeveelheid, eenheid, notitie)
SELECT 
  r.id,
  unnest(ARRAY['bloem', 'melk', 'eieren', 'zout', 'boter']) as naam,
  unnest(ARRAY[250, 500, 3, 1, 50]) as hoeveelheid,
  unnest(ARRAY['gram', 'milliliter', 'stuks', 'snufje', 'gram']) as eenheid,
  unnest(ARRAY[NULL, NULL, NULL, NULL, 'voor het bakken']) as notitie
FROM recepten r WHERE r.naam = 'Pepie''s Pannenkoeken';

-- Voeg ingrediënten toe voor Luulie's Chocolademuffins  
INSERT INTO ingredienten (recept_id, naam, hoeveelheid, eenheid, notitie)
SELECT 
  r.id,
  unnest(ARRAY['bloem', 'cacaopoeder', 'suiker', 'bakpoeder', 'eieren', 'melk', 'boter', 'chocoladestukjes']) as naam,
  unnest(ARRAY[200, 30, 150, 2, 2, 200, 100, 100]) as hoeveelheid,
  unnest(ARRAY['gram', 'gram', 'gram', 'theelepel', 'stuks', 'milliliter', 'gram', 'gram']) as eenheid,
  unnest(ARRAY[NULL, NULL, NULL, NULL, NULL, NULL, 'gesmolten', NULL]) as notitie
FROM recepten r WHERE r.naam = 'Luulie''s Chocolademuffins';

-- Controleer de update
SELECT naam, eigenaar FROM recepten ORDER BY eigenaar, naam;
