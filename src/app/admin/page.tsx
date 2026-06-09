import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = await createServerSupabaseClient()

  const [{ count: users }, { count: predictions }, { count: matches }, { count: finished }] =
    await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('predictions').select('*', { count: 'exact', head: true }),
      supabase.from('matches').select('*', { count: 'exact', head: true }),
      supabase.from('matches').select('*', { count: 'exact', head: true }).eq('status', 'finished'),
    ])

  const cards = [
    { label: 'Usuarios', value: users ?? 0, color: 'bg-blue-600' },
    { label: 'Pronósticos', value: predictions ?? 0, color: 'bg-green-600' },
    { label: 'Partidos', value: matches ?? 0, color: 'bg-purple-600' },
    { label: 'Finalizados', value: finished ?? 0, color: 'bg-orange-600' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl bg-white/10 border border-white/20 p-6">
            <div className={`w-3 h-3 rounded-full mb-3 ${card.color}`} />
            <p className="text-3xl font-bold tabular-nums">{card.value}</p>
            <p className="text-sm text-gray-400 mt-1">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
