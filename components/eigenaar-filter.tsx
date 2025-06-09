"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Eigenaar } from "@/types"

interface EigenaarFilterProps {
  selectedEigenaar: Eigenaar | null
  onEigenaarChange: (eigenaar: Eigenaar | null) => void
}

const eigenaren: { value: Eigenaar; label: string; color: string }[] = [
  { value: "henk", label: "Henk", color: "bg-blue-500" },
  { value: "pepie en luulie", label: "Pepie & Luulie", color: "bg-pink-500" },
]

export function EigenaarFilter({ selectedEigenaar, onEigenaarChange }: EigenaarFilterProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Wiens recepten wil je zien?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          {eigenaren.map((eigenaar) => (
            <Button
              key={eigenaar.value}
              variant={selectedEigenaar === eigenaar.value ? "default" : "outline"}
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => onEigenaarChange(eigenaar.value)}
            >
              <div className={`w-4 h-4 rounded-full ${eigenaar.color}`} />
              <span className="font-medium">{eigenaar.label}</span>
            </Button>
          ))}
        </div>

        <div className="text-center">
          <Button variant="ghost" size="sm" onClick={() => onEigenaarChange(null)} disabled={!selectedEigenaar}>
            Alle recepten tonen
          </Button>
        </div>

        {selectedEigenaar && (
          <div className="text-center">
            <Badge variant="secondary">
              Gefilterd op: {eigenaren.find((e) => e.value === selectedEigenaar)?.label}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
