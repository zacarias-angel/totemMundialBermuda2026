import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const PHOTOS_DIR = path.join(process.cwd(), 'public', 'photos')

function uid(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export async function GET() {
  try {
    await fs.mkdir(PHOTOS_DIR, { recursive: true })
    const files = await fs.readdir(PHOTOS_DIR)
    const photos = files
      .filter((f) => f.endsWith('.png'))
      .map((f) => ({
        id: f.replace('.png', ''),
        url: `/photos/${f}`,
        createdAt: f.split('_')[0],
      }))
      .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
    return NextResponse.json(photos)
  } catch {
    return NextResponse.json({ error: 'Error al leer fotos' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { data } = await req.json()
    if (!data || typeof data !== 'string') {
      return NextResponse.json({ error: 'Falta data' }, { status: 400 })
    }

    await fs.mkdir(PHOTOS_DIR, { recursive: true })

    const id = uid()
    const base64 = data.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64, 'base64')
    const filePath = path.join(PHOTOS_DIR, `${id}.png`)
    await fs.writeFile(filePath, buffer)

    return NextResponse.json({ id, url: `/photos/${id}.png` })
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
    const filePath = path.join(PHOTOS_DIR, `${id}.png`)
    await fs.unlink(filePath)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error al eliminar foto' }, { status: 500 })
  }
}
