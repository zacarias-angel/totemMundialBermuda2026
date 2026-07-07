const LOCK_MINUTES = 5

export function isMatchLocked(matchDate: string | null, matchTime: string | null): boolean {
  if (!matchDate || !matchTime) return false
  const matchDateTime = parseDateTime(matchDate, matchTime)
  if (!matchDateTime) return false
  const lockTime = new Date(matchDateTime.getTime() - LOCK_MINUTES * 60 * 1000)
  return new Date() >= lockTime
}

export function isMatchPast(matchDate: string | null, matchTime: string | null): boolean {
  if (!matchDate || !matchTime) return false
  const matchDateTime = parseDateTime(matchDate, matchTime)
  if (!matchDateTime) return false
  return new Date() > matchDateTime
}

function parseDateTime(date: string, time: string): Date | null {
  const [h, m] = time.split(':').map(Number)
  if (isNaN(h) || isNaN(m)) return null
  const pad2 = (n: number) => String(n).padStart(2, '0')
  return new Date(`${date}T${pad2(h)}:${pad2(m)}:00-03:00`)
}
