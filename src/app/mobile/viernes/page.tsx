'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'

export default function MobileViernes() {
  const [user, setUser] = useState<{ id: string; name: string } | null>(null)
  const [question, setQuestion] = useState<string | null>(null)
  const [questionId, setQuestionId] = useState<string | null>(null)
  const [answer, setAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('prode_user')
    if (stored) setUser(JSON.parse(stored))
  }, [])

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: q } = await supabase
        .from('viernes_questions')
        .select('id, question')
        .eq('active', true)
        .maybeSingle()

      if (q) {
        setQuestion(q.question)
        setQuestionId(q.id)

        if (user) {
          const { data: existing } = await supabase
            .from('viernes_answers')
            .select('answer')
            .eq('user_id', user.id)
            .eq('question_id', q.id)
            .maybeSingle()

          if (existing) {
            setAnswer(existing.answer)
            setSubmitted(true)
          }
        }
      }
    }
    load()
  }, [user])

  const handleSubmit = async () => {
    if (!questionId || !answer.trim() || !user) return

    setSaving(true)
    setError('')

    const supabase = createClient()
    const { error: err } = await supabase.from('viernes_answers').upsert(
      {
        user_id: user.id,
        question_id: questionId,
        answer: answer.trim().toLowerCase(),
      },
      { onConflict: 'user_id,question_id' }
    )

    setSaving(false)

    if (err) {
      setError(`Error: ${err.message}`)
      return
    }

    setSubmitted(true)
  }

  if (!question) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-1">Viernes de Qué</h1>
        <p className="text-gray-500 text-center py-12">No hay pregunta activa esta semana</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Viernes de Qué</h1>
      <p className="text-gray-400 text-sm mb-6">Respondé la pregunta de la semana</p>

      <div className="rounded-2xl bg-white/10 border border-white/20 p-6">
        <h2 className="text-xl font-semibold mb-4">{question}</h2>

        {submitted ? (
          <div className="text-center">
            <p className="text-green-400 font-semibold mb-2">¡Respuesta registrada!</p>
            <p className="text-gray-400 text-sm capitalize">Respondiste: {answer}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Escribí tu respuesta..."
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-blue-500"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button
              onClick={handleSubmit}
              disabled={saving || !answer.trim()}
              size="lg"
              className="w-full"
            >
              {saving ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
