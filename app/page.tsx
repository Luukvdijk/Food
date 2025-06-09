import { RandomRecept } from "@/components/random-recept"
import { getAllRecepten, checkDatabaseStatus } from "./actions"
import { setupDatabase } from "./db-setup"
import { ReceptCard } from "@/components/recept-card"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"

async function handleSetupDatabase() {
  "use server"
  const result = await setupDatabase()
  if (result.success) {
    redirect("/")
  }
  return result
}

export default async function Home() {
  // Check database status first
  const dbStatus = await checkDatabaseStatus()

  let alleRecepten: any[] = []

  if (dbStatus.hasData) {
    alleRecepten = await getAllRecepten().catch(() => [])
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
      </section>
    </div>
  )
}
