import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function AdminUsuarios() {
  const supabase = await createServerSupabaseClient()
  const { data: users } = await supabase
    .from('users')
    .select('id, name, email, created_at')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Usuarios</h1>

      <div className="rounded-2xl bg-white/10 border border-white/20 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-gray-400 border-b border-white/10">
              <th className="p-4 font-medium">Nombre</th>
              <th className="p-4 font-medium hidden sm:table-cell">Email</th>
              <th className="p-4 font-medium hidden md:table-cell">Registro</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((u) => (
              <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="p-4 font-medium">{u.name}</td>
                <td className="p-4 text-gray-400 hidden sm:table-cell">{u.email}</td>
                <td className="p-4 text-gray-500 text-sm hidden md:table-cell">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!users || users.length === 0) && (
          <p className="p-8 text-center text-gray-500">No hay usuarios registrados</p>
        )}
      </div>
    </div>
  )
}
