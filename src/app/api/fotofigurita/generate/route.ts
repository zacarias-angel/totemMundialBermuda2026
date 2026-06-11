import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import OpenAI, { toFile } from 'openai'
import { getCurrentUser } from '@/lib/supabase/users'

export const maxDuration = 120

const MAX_SELFIE_BYTES = 10 * 1024 * 1024
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 3

const FIGURITA_PROMPT_BASE = `Create a FIFA World Cup 2026 Argentina Panini-style trading card.
Use the first reference image as the exact card template — preserve all layout, colors, jersey, logos, decorative elements, typography, and name bars exactly as shown.
Take the person from the second reference image (selfie) and place their head in the white head cutout area above the jersey collar.
Face style: high-quality modern animated character, inspired by Disney and Pixar character design. Large expressive eyes, simplified facial features, smooth skin, clean shapes, appealing proportions, friendly smile, and polished 3D-cartoon rendering. The face should be clearly recognizable as the person in the selfie while looking like an animated movie character.
Maintain the official Panini sticker aesthetic. The head should blend naturally with the Argentina jersey and card design.
Do not use photorealism. Do not use realistic skin texture, pores, wrinkles, facial hair detail, or photographic lighting. Favor stylized animated character rendering.
Do not alter the card frame, background design, logos, typography, or layout.
The face should look 100% animated-cartoon and 0% photographic.`

const FUNNY_PHRASES = [
  'Jugador de toda la cancha',
  'Crack del potrero',
  'Mejor en el FIFA que en la cancha',
  'Titular indiscutido del asado',
  'Figura del grupo de WhatsApp',
  'Pierna fuerte, ego más fuerte',
  'Campeón moral',
  'Capitán del banco de suplentes',
  'Promesa eterna',
  'Velocidad de tractor',
  'Gambeta solo en la previa',
  'El 10 que nadie pidió',
  'Killer del área… chica',
  'Cabeza de área, pies de utilería',
  'Más vendido que figurita repetida',
  'Crack en modo demo',
  'Desequilibrante en el FIFA',
  'Suplente de lujo (del utilero)',
]

function pickPhrase(): string {
  return FUNNY_PHRASES[Math.floor(Math.random() * FUNNY_PHRASES.length)]
}

function buildFiguritaPrompt(playerName: string | null, phrase: string): string {
  const upperName = playerName?.trim().toUpperCase()
  const namePart = upperName
    ? `In the upper name bar at the bottom of the card, write the player's name exactly as "${upperName}" in all uppercase letters. The name must be perfectly centered both horizontally and vertically inside that bar, on a single line. Do not invent or change the name.`
    : `Leave the upper name bar empty (no name and no invented text).`

  const phrasePart = `In the lower bar (the empty bar directly below the name bar), write the short phrase exactly as "${phrase}". Center it perfectly both horizontally and vertically inside the bar, on a single line, fully legible and fitting within the bar, matching the card's typography style.`

  return `${FIGURITA_PROMPT_BASE}
${namePart}
${phrasePart}`
}

const rateLimitMap = new Map<string, number[]>()

function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() ?? 'unknown'
  return req.headers.get('x-real-ip') ?? 'unknown'
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = (rateLimitMap.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS)

  if (timestamps.length >= RATE_LIMIT_MAX) {
    rateLimitMap.set(ip, timestamps)
    return true
  }

  timestamps.push(now)
  rateLimitMap.set(ip, timestamps)
  return false
}

function getTemplateBuffer(): Buffer {
  const templatePath = path.join(process.cwd(), 'public', 'asset', 'figurita-template.png')
  return fs.readFileSync(templatePath)
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req)
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Esperá un momento e intentá de nuevo.' },
        { status: 429 }
      )
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.error('OPENAI_API_KEY is not configured')
      return NextResponse.json({ error: 'Servicio de generación no configurado' }, { status: 500 })
    }

    const formData = await req.formData()
    const selfie = formData.get('selfie') as File | null
    const playerNameFromForm = (formData.get('playerName') as string | null)?.trim() || null

    if (!selfie) {
      return NextResponse.json({ error: 'Falta la selfie' }, { status: 400 })
    }

    if (selfie.size > MAX_SELFIE_BYTES) {
      return NextResponse.json({ error: 'La selfie es demasiado grande' }, { status: 400 })
    }

    const user = await getCurrentUser()
    const playerName = playerNameFromForm || user?.name || null
    const prompt = buildFiguritaPrompt(playerName, pickPhrase())

    const selfieBuffer = Buffer.from(await selfie.arrayBuffer())
    const templateBuffer = getTemplateBuffer()

    const openai = new OpenAI({ apiKey })

    const [templateFile, selfieFile] = await Promise.all([
      toFile(templateBuffer, 'figurita-template.jpg', { type: 'image/jpeg' }),
      toFile(selfieBuffer, selfie.name || 'selfie.webp', { type: selfie.type || 'image/webp' }),
    ])

    const result = await openai.images.edit({
      model: 'gpt-image-2',
      image: [templateFile, selfieFile],
      prompt,
      size: '1024x1536',
      quality: 'medium',
      output_format: 'webp',
    })

    const imageBase64 = result.data?.[0]?.b64_json
    if (!imageBase64) {
      return NextResponse.json({ error: 'No se pudo generar la figurita' }, { status: 500 })
    }

    return NextResponse.json({ image: imageBase64 })
  } catch (err) {
    console.error('fotofigurita generate error:', err)

    const message =
      err instanceof Error && err.message.includes('moderation')
        ? 'La imagen no pudo ser procesada. Intentá con otra foto.'
        : 'Error al generar la figurita. Intentá de nuevo.'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
