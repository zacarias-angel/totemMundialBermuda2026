const LOCK_MINUTES = 60

export function isMatchLocked(matchDate: string | null, matchTime: string | null): boolean {
  if (!matchDate || !matchTime) return false
  const [h, m] = matchTime.split(':').map(Number)
  if (isNaN(h) || isNaN(m)) return false
  const matchDateTime = new Date(matchDate + 'T00:00:00')
  matchDateTime.setHours(h, m, 0, 0)
  const lockTime = new Date(matchDateTime.getTime() - LOCK_MINUTES * 60 * 1000)
  return new Date() >= lockTime
}
