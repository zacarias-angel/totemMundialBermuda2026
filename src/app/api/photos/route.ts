import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() {
  return createClient(supabaseUrl, supabaseKey)
}

const BUCKET = 'fotofigurita'

function uid(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export async function GET() {
  try {
    const supabase = getSupabase()
    const { data: files, error } = await supabase.storage.from(BUCKET).list()

    if (error) {
      console.error('storage list error:', error)
      return NextResponse.json({ error: 'Error al leer fotos' }, { status: 500 })
    }

    const photos = (files ?? [])
      .filter((f) => f.name.endsWith('.webp'))
      .map((f) => {
        const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(f.name)
        return {
          id: f.name.replace('.webp', ''),
          url: publicUrl,
          createdAt: f.created_at ?? f.name.split('_')[0],
        }
      })
      .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))

    return NextResponse.json(photos)
  } catch (err) {
    console.error('get photos error:', err)
    return NextResponse.json({ error: 'Error al leer fotos' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const photo = formData.get('photo') as File | null

    if (!photo) {
      return NextResponse.json({ error: 'Falta photo' }, { status: 400 })
    }

    const id = uid()
    const buffer = Buffer.from(await photo.arrayBuffer())

    const supabase = getSupabase()
    const fileName = `${id}.webp`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, buffer, { contentType: 'image/webp', upsert: false })

    if (uploadError) {
      console.error('storage upload error:', uploadError)
      return NextResponse.json({ error: 'Error al guardar foto' }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(fileName)

    return NextResponse.json({ id, url: publicUrl })
  } catch (err) {
    console.error('save photo error:', err)
    return NextResponse.json({ error: 'Error al guardar foto' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'Falta id' }, { status: 400 })
  }
  try {
    const supabase = getSupabase()
    const { error } = await supabase.storage.from(BUCKET).remove([`${id}.webp`])

    if (error) {
      console.error('storage delete error:', error)
      return NextResponse.json({ error: 'Error al eliminar foto' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error al eliminar foto' }, { status: 500 })
  }
}
