-- Maak de recepten tabel
CREATE TABLE IF NOT EXISTS recepten (
  id SERIAL PRIMARY KEY,
  naam VARCHAR(255) NOT NULL,
  beschrijving TEXT NOT NULL,
  bereidingstijd INTEGER NOT NULL,
  moeilijkheidsgraad VARCHAR(50) NOT NULL,
  type VARCHAR(50) NOT NULL,
  seizoen VARCHAR(50)[] NOT NULL,
  tags VARCHAR(50)[] NOT NULL,
  afbeelding_url TEXT,
  bereidingswijze TEXT[] NOT NULL,
  personen INTEGER NOT NULL DEFAULT 4,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Maak de ingredienten tabel
CREATE TABLE IF NOT EXISTS ingredienten (
  id SERIAL PRIMARY KEY,
  recept_id INTEGER NOT NULL REFERENCES recepten(id) ON DELETE CASCADE,
  naam VARCHAR(255) NOT NULL,
  hoeveelheid DECIMAL(10, 2) NOT NULL,
  eenheid VARCHAR(50) NOT NULL,
  notitie VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Maak de bijgerechten tabel
CREATE TABLE IF NOT EXISTS bijgerechten (
  id SERIAL PRIMARY KEY,
  recept_id INTEGER NOT NULL REFERENCES recepten(id) ON DELETE CASCADE,
  naam VARCHAR(255) NOT NULL,
  beschrijving TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
