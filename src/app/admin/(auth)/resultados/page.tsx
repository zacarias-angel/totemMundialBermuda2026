import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ResultForm } from '@/components/admin/ResultForm'

export default async function AdminResultados() {
  const supabase = await createServerSupabaseClient()
  const { data: matches } = await supabase
    .from('matches')
    .select('*, home_team:teams!home_team_id(name), away_team:teams!away_team_id(name)')
    .order('round')
    .order('matchday', { ascending: true, nullsFirst: false })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Carga de Resultados</h1>
      <p className="text-gray-400 text-sm mb-6">Actualizá los resultados de los partidos</p>

      <div className="flex flex-col gap-3">
        {matches?.map((match) => (
          <ResultForm key={match.id} match={match} />
        ))}
        {(!matches || matches.length === 0) && (
          <p className="text-gray-500 text-center py-8">No hay partidos cargados</p>
        )}
      </div>
    </div>
  )
}
