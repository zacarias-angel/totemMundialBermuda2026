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

/*const FIGURITA_PROMPT_BASE = `Create a FIFA World Cup 2026 Argentina Panini-style trading card.
Use the first reference image as the exact card template — preserve all layout, colors, jersey, logos, decorative elements, typography, and name bars exactly as shown.
Take the person from the second reference image (selfie) and place their head in the white head cutout area above the jersey collar.
Face style: photorealistic Argentine gaucho inspired by the classic illustrations of Florencio Molina Campos. Preserve the person's identity and facial likeness from the selfie, but reinterpret their expression, facial proportions, and character with the charm, warmth, and rural Argentine personality seen in traditional gaucho artwork.
The person should have a friendly, charismatic, slightly mischievous expression typical of Argentine countryside characters. Subtle stylization is allowed, but the result must remain highly realistic and believable as a real photograph.
Use natural skin texture, realistic lighting, realistic hair, and authentic facial details. Avoid cartoon, animation, Pixar, Disney, comic-book, or caricature rendering.
The overall feeling should evoke Argentine gaucho culture and the visual spirit of classic rural Argentine illustrations while maintaining a premium, photorealistic Panini World Cup sticker appearance.
Maintain the official Panini sticker aesthetic. The head should blend naturally with the Argentina jersey and card design.
Do not alter the card frame, background design, logos, typography, or layout.`*/


function buildFiguritaPrompt(playerName?: string | null): string {
  if (playerName?.trim()) {
    return `${FIGURITA_PROMPT_BASE}
Write the player's name exactly as "${playerName.trim()}" in the bottom name bar of the card. Do not invent or change the name.`
  }

  return `${FIGURITA_PROMPT_BASE}
Leave the bottom name bars empty. Do not write any name or invented text on the card.`
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
    const prompt = buildFiguritaPrompt(playerName)

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
