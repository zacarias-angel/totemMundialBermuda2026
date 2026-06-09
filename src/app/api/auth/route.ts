import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { userId } = await req.json()

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  }

  const response = NextResponse.json({ ok: true })

  response.cookies.set('prode_user_id', userId, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  })

  return response
}
