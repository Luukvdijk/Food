"use server"

import { sql } from "@/lib/db"
import { redirect } from "next/navigation"

export async function setupDatabase(): Promise<{ success: boolean; message: string }> {
  try {
    // Check if we already have data
    try {
      const existingData = await sql`SELECT COUNT(*) as count FROM recepten`
      if (existingData[0]?.count > 0) {
        redirect("/")
        return { success: true, message: "Database heeft al data." }
      }
    } catch {
      // Table doesn't exist, continue with setup
    }

    // Create tables
    await sql`
      CREATE TABLE IF NOT EXISTS recepten (
        id SERIAL PRIMARY KEY,
        naam VARCHAR(255) NOT NULL,
        beschrijving TEXT NOT NULL,
        bereidingstijd INTEGER NOT NULL,
        moeilijkheidsgraad VARCHAR(50) NOT NULL,
        type VARCHAR(50) NOT NULL,
        seizoen TEXT[] NOT NULL,
        tags TEXT[] NOT NULL,
        afbeelding_url TEXT,
        bereidingswijze TEXT[] NOT NULL,
        personen INTEGER NOT NULL DEFAULT 4,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS ingredienten (
        id SERIAL PRIMARY KEY,
        recept_id INTEGER NOT NULL REFERENCES recepten(id) ON DELETE CASCADE,
        naam VARCHAR(255) NOT NULL,
        hoeveelheid DECIMAL(10, 2) NOT NULL,
        eenheid VARCHAR(50) NOT NULL,
        notitie VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS bijgerechten (
        id SERIAL PRIMARY KEY,
        recept_id INTEGER NOT NULL REFERENCES recepten(id) ON DELETE CASCADE,
        naam VARCHAR(255) NOT NULL,
        beschrijving TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Add sample recipes
    await sql`
      INSERT INTO recepten (naam, beschrijving, bereidingstijd, moeilijkheidsgraad, type, seizoen, tags, afbeelding_url, bereidingswijze, personen)
      VALUES 
        ('Hollandse Erwtensoep', 'Een klassieke Nederlandse erwtensoep, ook wel snert genoemd. Perfect voor koude winterdagen.', 120, 'Gemiddeld', 'Diner', ARRAY['Herfst', 'Winter'], ARRAY['soep', 'traditioneel', 'comfort food'], '/placeholder.svg?height=600&width=800&text=Erwtensoep', ARRAY['Spoel de spliterwten af in een zeef onder koud stromend water.', 'Doe de spliterwten in een grote soeppan en voeg 2 liter water toe. Breng aan de kook en laat 45 minuten zachtjes koken.', 'Voeg de gesneden groenten, laurierblad en het vlees toe. Laat nog 30 minuten zachtjes koken.', 'Haal het vlees eruit, snijd het in stukjes en doe het terug in de soep.', 'Breng op smaak met peper en zout. Serveer met roggebrood en katenspek.'], 4),
        ('Zomerse Salade met Geitenkaas', 'Een frisse salade met geitenkaas, walnoten en honing. Perfect voor warme zomerdagen.', 20, 'Makkelijk', 'Lunch', ARRAY['Lente', 'Zomer'], ARRAY['salade', 'vegetarisch', 'snel'], '/placeholder.svg?height=600&width=800&text=Zomerse+Salade', ARRAY['Was de sla en droog deze goed.', 'Snijd de tomaten in partjes en de komkommer in plakjes.', 'Meng alle groenten in een grote kom.', 'Verkruimel de geitenkaas erover en strooi de walnoten eroverheen.', 'Maak een dressing van olijfolie, honing, mosterd en citroensap. Breng op smaak met peper en zout.', 'Giet de dressing over de salade en serveer direct.'], 2),
        ('Appeltaart', 'Een traditionele Nederlandse appeltaart met kaneel en rozijnen.', 90, 'Gemiddeld', 'Dessert', ARRAY['Herfst', 'Winter', 'Lente', 'Zomer'], ARRAY['gebak', 'zoet', 'traditioneel'], '/placeholder.svg?height=600&width=800&text=Appeltaart', ARRAY['Meng bloem, suiker, zout en boter tot een kruimelig deeg. Voeg het ei toe en kneed tot een samenhangend deeg.', 'Laat het deeg 30 minuten rusten in de koelkast.', 'Schil de appels, verwijder het klokhuis en snijd ze in stukjes.', 'Meng de appelstukjes met suiker, kaneel, rozijnen en citroensap.', 'Verwarm de oven voor op 175°C.', 'Vet een springvorm in en bekleed deze met 2/3 van het deeg.', 'Vul de vorm met het appelmengsel en dek af met repen van het overgebleven deeg.', 'Bestrijk met losgeklopt ei en bak de taart in ongeveer 60 minuten goudbruin en gaar.'], 8)
    `

    // Add ingredients for the recipes
    await sql`
      INSERT INTO ingredienten (recept_id, naam, hoeveelheid, eenheid, notitie) VALUES 
        (1, 'spliterwten', 500, 'gram', 'gedroogd'),
        (1, 'winterpeen', 2, 'stuks', 'in stukjes gesneden'),
        (1, 'ui', 2, 'stuks', 'gesnipperd'),
        (1, 'prei', 1, 'stuks', 'in ringen'),
        (1, 'rookworst', 1, 'stuks', NULL),
        (2, 'gemengde sla', 100, 'gram', NULL),
        (2, 'tomaten', 2, 'stuks', 'rijp'),
        (2, 'geitenkaas', 100, 'gram', NULL),
        (2, 'walnoten', 30, 'gram', 'grof gehakt'),
        (2, 'olijfolie', 2, 'eetlepel', 'extra vierge'),
        (3, 'bloem', 300, 'gram', 'gezeefd'),
        (3, 'boter', 200, 'gram', 'koud, in blokjes'),
        (3, 'suiker', 150, 'gram', NULL),
        (3, 'appels', 1.5, 'kilo', 'Elstar of Jonagold'),
        (3, 'kaneel', 2, 'theelepel', NULL)
    `

    // Add side dishes
    await sql`
      INSERT INTO bijgerechten (recept_id, naam, beschrijving) VALUES 
        (1, 'Roggebrood met katenspek', 'Een traditionele begeleider bij erwtensoep'),
        (2, 'Stokbrood', 'Knapperig vers stokbrood met kruidenboter'),
        (3, 'Vanille-ijs', 'Een bolletje vanille-ijs bij de warme appeltaart')
    `

    redirect("/")
    return { success: true, message: "Database succesvol opgezet!" }
  } catch (error) {
    console.error("Error setting up database:", error)
    return {
      success: false,
      message: `Fout bij database setup: ${error instanceof Error ? error.message : "Onbekende fout"}`,
    }
  }
}
