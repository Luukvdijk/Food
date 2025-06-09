import { RandomRecept } from "@/components/random-recept"
import { getAllRecepten, checkDatabaseStatus } from "./actions"
import { setupDatabase } from "./db-setup"
import { ReceptCard } from "@/components/recept-card"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"
import { sql } from "@/lib/db"

async function handleSetupDatabase() {
  "use server"
  try {
    const result = await setupDatabase()
    if (result.success) {
      redirect("/")
    }
    return result
  } catch (error) {
    console.error("Setup error:", error)
    return { success: false, message: "Database setup failed" }
  }
}

async function handleMigrateDatabase() {
  "use server"
  try {
    // Add eigenaar column if it doesn't exist
    await sql`
      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name = 'recepten' AND column_name = 'eigenaar') THEN
              ALTER TABLE recepten ADD COLUMN eigenaar VARCHAR(50) DEFAULT 'henk';
          END IF;
      END $$;
    `

    // Update existing recepten
    await sql`UPDATE recepten SET eigenaar = 'henk' WHERE eigenaar IS NULL`

    redirect("/")
  } catch (error) {
    console.error("Migration error:", error)
  }
}

export default async function Home() {
  let dbStatus = { hasData: false, tableExists: false }
  let hasEigenaarColumn = false
  let alleRecepten: any[] = []
  let hasError = false

  try {
    // Check database status first
    dbStatus = await checkDatabaseStatus()

    // Check if eigenaar column exists
    try {
      const columnCheck = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'recepten' AND column_name = 'eigenaar'
      `
      hasEigenaarColumn = columnCheck.length > 0
    } catch (error) {
      // Table might not exist yet
      console.log("Column check failed, table might not exist")
    }

    if (dbStatus.hasData) {
      alleRecepten = await getAllRecepten()
    }
  } catch (error) {
    console.error("Error loading page data:", error)
    hasError = true
  }

  // If there's an error, show a simple error state
  if (hasError) {
    return (
      <div className="space-y-12">
        <section className="text-center py-12 bg-red-50 rounded-lg">
          <h2 className="text-2xl font-bold mb-4 text-red-800">Database Connection Error</h2>
          <p className="text-red-600 mb-6">
            There seems to be an issue connecting to the database. Please check your environment variables.
          </p>
          <div className="space-y-2 text-sm text-red-600">
            <p>Make sure you have set up:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>DATABASE_URL environment variable</li>
              <li>Valid Neon database connection</li>
              <li>Proper database permissions</li>
            </ul>
          </div>
          <form action={handleSetupDatabase} className="mt-6">
            <Button type="submit" variant="outline">
              Try Setup Database
            </Button>
          </form>
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      <section className="flex justify-center">
        <RandomRecept />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Alle recepten</h2>
        {alleRecepten.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {alleRecepten.map((recept) => (
              <ReceptCard key={recept.id} recept={recept} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Welkom bij Lekkere Recepten!</h3>
            <p className="text-muted-foreground mb-4">
              {!dbStatus.tableExists
                ? "De database tabellen bestaan nog niet. Klik op de knop hieronder om de database op te zetten."
                : "Er zijn nog geen recepten in de database. Klik op de knop hieronder om voorbeeldrecepten toe te voegen."}
            </p>
            <form action={handleSetupDatabase}>
              <Button type="submit">{!dbStatus.tableExists ? "Database opzetten" : "Voorbeelddata toevoegen"}</Button>
            </form>
            <p className="text-xs text-muted-foreground mt-4">
              Dit voegt 5 heerlijke Nederlandse recepten toe zoals erwtensoep, appeltaart en stamppot.
            </p>
          </div>
        )}

        {/* Show migration button if database exists but eigenaar column is missing */}
        {dbStatus.hasData && !hasEigenaarColumn && (
          <div className="text-center py-6 bg-blue-50 rounded-lg mt-6">
            <h3 className="text-lg font-semibold mb-2">Database Update Beschikbaar</h3>
            <p className="text-muted-foreground mb-4">
              Er is een nieuwe functie beschikbaar! Klik hieronder om de eigenaar functionaliteit toe te voegen.
            </p>
            <form action={handleMigrateDatabase}>
              <Button type="submit">Database Updaten</Button>
            </form>
          </div>
        )}
      </section>
    </div>
  )
}
