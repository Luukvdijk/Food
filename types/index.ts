export type Recept = {
  id: number
  naam: string
  beschrijving: string
  bereidingstijd: number
  moeilijkheidsgraad: string
  type: GerechtsType
  seizoen: Seizoen[]
  tags: string[]
  afbeelding_url: string
  bereidingswijze: string[]
  personen: number
  created_at: string
}

export type Ingredient = {
  id: number
  recept_id: number
  naam: string
  hoeveelheid: number
  eenheid: string
  notitie?: string
}

export type Bijgerecht = {
  id: number
  recept_id: number
  naam: string
  beschrijving: string
}

export type GerechtsType = "Ontbijt" | "Lunch" | "Diner" | "Dessert" | "Snack"

export type Seizoen = "Lente" | "Zomer" | "Herfst" | "Winter"

export type FilterOptions = {
  type?: GerechtsType
  seizoen?: Seizoen
  zoekterm?: string
}
