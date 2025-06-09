-- Voeg voorbeeldrecepten toe
INSERT INTO recepten (naam, beschrijving, bereidingstijd, moeilijkheidsgraad, type, seizoen, tags, afbeelding_url, bereidingswijze, personen)
VALUES 
  (
    'Hollandse Erwtensoep', 
    'Een klassieke Nederlandse erwtensoep, ook wel snert genoemd. Perfect voor koude winterdagen.',
    120, 
    'Gemiddeld', 
    'Diner', 
    ARRAY['Herfst', 'Winter'], 
    ARRAY['soep', 'traditioneel', 'comfort food'], 
    '/placeholder.svg?height=600&width=800&text=Erwtensoep',
    ARRAY[
      'Spoel de spliterwten af in een zeef onder koud stromend water.',
      'Doe de spliterwten in een grote soeppan en voeg 2 liter water toe. Breng aan de kook en laat 45 minuten zachtjes koken.',
      'Voeg de gesneden groenten, laurierblad en het vlees toe. Laat nog 30 minuten zachtjes koken.',
      'Haal het vlees eruit, snijd het in stukjes en doe het terug in de soep.',
      'Breng op smaak met peper en zout. Serveer met roggebrood en katenspek.'
    ],
    4
  ),
  (
    'Zomerse Salade met Geitenkaas', 
    'Een frisse salade met geitenkaas, walnoten en honing. Perfect voor warme zomerdagen.',
    20, 
    'Makkelijk', 
    'Lunch', 
    ARRAY['Lente', 'Zomer'], 
    ARRAY['salade', 'vegetarisch', 'snel'], 
    '/placeholder.svg?height=600&width=800&text=Zomerse+Salade',
    ARRAY[
      'Was de sla en droog deze goed.',
      'Snijd de tomaten in partjes en de komkommer in plakjes.',
      'Meng alle groenten in een grote kom.',
      'Verkruimel de geitenkaas erover en strooi de walnoten eroverheen.',
      'Maak een dressing van olijfolie, honing, mosterd en citroensap. Breng op smaak met peper en zout.',
      'Giet de dressing over de salade en serveer direct.'
    ],
    2
  ),
  (
    'Appeltaart', 
    'Een traditionele Nederlandse appeltaart met kaneel en rozijnen.',
    90, 
    'Gemiddeld', 
    'Dessert', 
    ARRAY['Herfst', 'Winter', 'Lente', 'Zomer'], 
    ARRAY['gebak', 'zoet', 'traditioneel'], 
    '/placeholder.svg?height=600&width=800&text=Appeltaart',
    ARRAY[
      'Meng bloem, suiker, zout en boter tot een kruimelig deeg. Voeg het ei toe en kneed tot een samenhangend deeg.',
      'Laat het deeg 30 minuten rusten in de koelkast.',
      'Schil de appels, verwijder het klokhuis en snijd ze in stukjes.',
      'Meng de appelstukjes met suiker, kaneel, rozijnen en citroensap.',
      'Verwarm de oven voor op 175°C.',
      'Vet een springvorm in en bekleed deze met 2/3 van het deeg.',
      'Vul de vorm met het appelmengsel en dek af met repen van het overgebleven deeg.',
      'Bestrijk met losgeklopt ei en bak de taart in ongeveer 60 minuten goudbruin en gaar.'
    ],
    8
  ),
  (
    'Stamppot Boerenkool', 
    'Een traditionele Nederlandse stamppot met boerenkool en rookworst.',
    45, 
    'Makkelijk', 
    'Diner', 
    ARRAY['Herfst', 'Winter'], 
    ARRAY['stamppot', 'comfort food', 'traditioneel'], 
    '/placeholder.svg?height=600&width=800&text=Stamppot+Boerenkool',
    ARRAY[
      'Schil de aardappelen en snijd ze in stukken. Was de boerenkool grondig.',
      'Kook de aardappelen met wat zout in ongeveer 20 minuten gaar.',
      'Voeg na 10 minuten de boerenkool toe aan de aardappelen.',
      'Verwarm ondertussen de rookworst volgens de aanwijzingen op de verpakking.',
      'Giet de aardappelen en boerenkool af en stamp ze fijn met een stamper.',
      'Voeg boter, melk, peper en zout toe en stamp tot een smeuïge stamppot.',
      'Serveer met de rookworst en jus.'
    ],
    4
  ),
  (
    'Ontbijtmuffins met Blauwe Bessen', 
    'Gezonde muffins met havermout en blauwe bessen, perfect voor een snel ontbijt.',
    30, 
    'Makkelijk', 
    'Ontbijt', 
    ARRAY['Lente', 'Zomer'], 
    ARRAY['bakken', 'gezond', 'fruit'], 
    '/placeholder.svg?height=600&width=800&text=Ontbijtmuffins',
    ARRAY[
      'Verwarm de oven voor op 180°C en vet een muffinvorm in.',
      'Meng in een kom de havermout, bloem, bakpoeder, kaneel en zout.',
      'Klop in een andere kom de eieren, yoghurt, honing en olie door elkaar.',
      'Voeg de natte ingrediënten toe aan de droge ingrediënten en roer tot een glad beslag.',
      'Vouw voorzichtig de blauwe bessen door het beslag.',
      'Verdeel het beslag over de muffinvormen en bak in ongeveer 20-25 minuten goudbruin en gaar.'
    ],
    6
  );

-- Voeg ingrediënten toe voor Hollandse Erwtensoep
INSERT INTO ingredienten (recept_id, naam, hoeveelheid, eenheid, notitie)
VALUES 
  (1, 'spliterwten', 500, 'gram', 'gedroogd'),
  (1, 'winterpeen', 2, 'stuks', 'in stukjes gesneden'),
  (1, 'ui', 2, 'stuks', 'gesnipperd'),
  (1, 'prei', 1, 'stuks', 'in ringen'),
  (1, 'knolselderij', 100, 'gram', 'in blokjes'),
  (1, 'rookworst', 1, 'stuks', NULL),
  (1, 'varkenspootje', 1, 'stuks', 'optioneel'),
  (1, 'laurierblad', 2, 'stuks', NULL),
  (1, 'zout', 1, 'theelepel', 'naar smaak'),
  (1, 'peper', 1, 'theelepel', 'naar smaak');

-- Voeg ingrediënten toe voor Zomerse Salade met Geitenkaas
INSERT INTO ingredienten (recept_id, naam, hoeveelheid, eenheid, notitie)
VALUES 
  (2, 'gemengde sla', 100, 'gram', NULL),
  (2, 'tomaten', 2, 'stuks', 'rijp'),
  (2, 'komkommer', 0.5, 'stuks', NULL),
  (2, 'geitenkaas', 100, 'gram', NULL),
  (2, 'walnoten', 30, 'gram', 'grof gehakt'),
  (2, 'olijfolie', 2, 'eetlepel', 'extra vierge'),
  (2, 'honing', 1, 'eetlepel', NULL),
  (2, 'mosterd', 1, 'theelepel', 'Dijon'),
  (2, 'citroensap', 1, 'eetlepel', 'vers geperst');

-- Voeg ingrediënten toe voor Appeltaart
INSERT INTO ingredienten (recept_id, naam, hoeveelheid, eenheid, notitie)
VALUES 
  (3, 'bloem', 300, 'gram', 'gezeefd'),
  (3, 'boter', 200, 'gram', 'koud, in blokjes'),
  (3, 'suiker', 150, 'gram', NULL),
  (3, 'ei', 1, 'stuks', 'plus 1 extra om te bestrijken'),
  (3, 'zout', 1, 'snufje', NULL),
  (3, 'appels', 1.5, 'kilo', 'Elstar of Jonagold'),
  (3, 'kaneel', 2, 'theelepel', NULL),
  (3, 'rozijnen', 75, 'gram', 'geweld'),
  (3, 'citroensap', 1, 'eetlepel', NULL);

-- Voeg ingrediënten toe voor Stamppot Boerenkool
INSERT INTO ingredienten (recept_id, naam, hoeveelheid, eenheid, notitie)
VALUES 
  (4, 'aardappelen', 1, 'kilo', 'kruimig'),
  (4, 'boerenkool', 600, 'gram', 'gesneden'),
  (4, 'rookworst', 1, 'stuks', NULL),
  (4, 'boter', 50, 'gram', NULL),
  (4, 'melk', 100, 'milliliter', 'warm'),
  (4, 'zout', 1, 'theelepel', 'naar smaak'),
  (4, 'peper', 1, 'theelepel', 'naar smaak');

-- Voeg ingrediënten toe voor Ontbijtmuffins
INSERT INTO ingredienten (recept_id, naam, hoeveelheid, eenheid, notitie)
VALUES 
  (5, 'havermout', 150, 'gram', NULL),
  (5, 'bloem', 100, 'gram', 'volkoren'),
  (5, 'bakpoeder', 2, 'theelepel', NULL),
  (5, 'kaneel', 1, 'theelepel', NULL),
  (5, 'zout', 0.5, 'theelepel', NULL),
  (5, 'eieren', 2, 'stuks', NULL),
  (5, 'yoghurt', 200, 'gram', 'Griekse'),
  (5, 'honing', 4, 'eetlepel', NULL),
  (5, 'olie', 3, 'eetlepel', 'zonnebloem'),
  (5, 'blauwe bessen', 150, 'gram', 'vers of bevroren');

-- Voeg bijgerechten toe
INSERT INTO bijgerechten (recept_id, naam, beschrijving)
VALUES 
  (1, 'Roggebrood met katenspek', 'Een traditionele begeleider bij erwtensoep'),
  (1, 'Augurken', 'Voor een friszure smaak naast de hartige soep'),
  (2, 'Stokbrood', 'Knapperig vers stokbrood met kruidenboter'),
  (2, 'Balsamico glazuur', 'Een zoete balsamico reductie voor extra smaak'),
  (4, 'Augurken', 'Friszure augurken als contrast bij de stamppot'),
  (4, 'Piccalilly', 'Pittige piccalilly voor extra smaak'),
  (5, 'Vers fruit', 'Een kom vers fruit voor een complete ontbijtervaring'),
  (5, 'Yoghurt', 'Griekse yoghurt met een beetje honing');
