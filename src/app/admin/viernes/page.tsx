'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'

interface Question {
  id: string
  question: string
  active: boolean
  created_at: string
}

export default function AdminViernes() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [newQuestion, setNewQuestion] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('viernes_questions')
        .select('*')
        .order('created_at', { ascending: false })
      if (data) setQuestions(data)
    }
    load()
  }, [])

  const handleCreate = async () => {
    if (!newQuestion.trim()) return
    setSaving(true)
    const supabase = createClient()

    await supabase.from('viernes_questions').update({ active: false }).neq('active', false)

    const { data } = await supabase
      .from('viernes_questions')
      .insert({ question: newQuestion.trim(), active: true })
      .select('*')
      .single()

    if (data) {
      setQuestions((prev) => [data, ...prev])
      setNewQuestion('')
    }
    setSaving(false)
  }

  const handleToggle = async (id: string, active: boolean) => {
    const supabase = createClient()

    if (active) {
      await supabase.from('viernes_questions').update({ active: false }).neq('id', id)
    }

    await supabase.from('viernes_questions').update({ active: !active }).eq('id', id)

    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, active: !active } : { ...q, active: q.id === id ? !active : false }))
    )
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    await supabase.from('viernes_answers').delete().eq('question_id', id)
    await supabase.from('viernes_questions').delete().eq('id', id)
    setQuestions((prev) => prev.filter((q) => q.id !== id))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Viernes de Qué</h1>
      <p className="text-gray-400 text-sm mb-6">Gestioná las preguntas semanales</p>

      <div className="rounded-2xl bg-white/10 border border-white/20 p-4 mb-8">
        <h2 className="font-semibold mb-3">Nueva pregunta</h2>
        <div className="flex gap-3">
          <Input
            placeholder="Escribí la pregunta..."
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleCreate} disabled={saving || !newQuestion.trim()}>
            {saving ? 'Creando...' : 'Crear'}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {questions.map((q) => (
          <div
            key={q.id}
            className={`rounded-2xl border p-4 flex items-center justify-between gap-3 ${
              q.active ? 'bg-blue-600/20 border-blue-500/40' : 'bg-white/10 border-white/20'
            }`}
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{q.question}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {new Date(q.created_at).toLocaleDateString()}
                {q.active && <span className="text-green-400 ml-2">Activa</span>}
              </p>
            </div>

            <div className="flex gap-2 shrink-0">
              <Button
                variant={q.active ? 'secondary' : 'primary'}
                size="sm"
                onClick={() => handleToggle(q.id, q.active)}
              >
                {q.active ? 'Desactivar' : 'Activar'}
              </Button>
              <Button variant="danger" size="sm" onClick={() => handleDelete(q.id)}>
                Eliminar
              </Button>
            </div>
          </div>
        ))}

        {questions.length === 0 && (
          <p className="text-gray-500 text-center py-8">No hay preguntas todavía</p>
        )}
      </div>
    </div>
  )
}
