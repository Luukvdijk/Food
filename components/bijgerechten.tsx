import type { Bijgerecht } from "@/types"

interface BijgerechtenProps {
  bijgerechten: Bijgerecht[]
}

export function Bijgerechten({ bijgerechten }: BijgerechtenProps) {
  if (!bijgerechten.length) return null

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2">Past goed bij</h3>
      <ul className="space-y-2">
        {bijgerechten.map((bijgerecht) => (
          <li key={bijgerecht.id}>
            <span className="font-medium">{bijgerecht.naam}:</span> <span>{bijgerecht.beschrijving}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
