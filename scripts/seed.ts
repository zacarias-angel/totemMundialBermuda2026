import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Load .env.local manually (tsx doesn't auto-load it)
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx)
    const value = trimmed.slice(eqIdx + 1)
    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function seed() {
  const fixturePath = path.join(process.cwd(), 'data', 'fixture.json')
  const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'))

  const { count } = await supabase.from('predictions').select('*', { count: 'exact', head: true })
  if (count && count > 0) {
    console.log(`⚠️  Hay ${count} predicciones guardadas. Solo se actualizarán fechas/horarios sin borrar datos.`)
    await updateExistingMatches(supabase, fixture)
    return
  }

  console.log('Clearing existing fixture data...')
  await supabase.from('matches').delete().gte('created_at', '2020-01-01')
  await supabase.from('teams').delete().gte('created_at', '2020-01-01')
  await supabase.from('groups').delete().gte('created_at', '2020-01-01')

  // Insert groups and teams
  for (const group of fixture.groups) {
    const { data: groupData, error: groupErr } = await supabase
      .from('groups')
      .insert({ name: group.name })
      .select('id')
      .single()

    if (groupErr) {
      console.error(`Error creating group ${group.name}:`, groupErr)
      continue
    }

    const teamInserts = group.teams.map((name: string) => ({
      name,
      group_id: groupData.id,
    }))

    const { data: teamsData, error: teamsErr } = await supabase
      .from('teams')
      .insert(teamInserts)
      .select('id, name')

    if (teamsErr) {
      console.error(`Error creating teams for group ${group.name}:`, teamsErr)
      continue
    }

    const teamMap = new Map(teamsData.map((t) => [t.name, t.id]))

    const matchInserts = group.matches.map((m: { matchday: number; home: string; away: string; date?: string; time?: string }) => ({
      round: `Group ${group.name}`,
      group_id: groupData.id,
      home_team_id: teamMap.get(m.home),
      away_team_id: teamMap.get(m.away),
      matchday: m.matchday,
      match_date: m.date ?? null,
      match_time: m.time ?? null,
      status: 'scheduled',
      knockout: false,
    }))

    const { error: matchErr } = await supabase.from('matches').insert(matchInserts)
    if (matchErr) {
      console.error(`Error creating matches for group ${group.name}:`, matchErr)
    }

    console.log(`✓ Group ${group.name}: ${group.teams.length} teams, ${group.matches.length} matches`)
  }

  // Insert knockout matches
  for (const match of fixture.knockout) {
    const { error: knockErr } = await supabase.from('matches').insert({
      round: match.round,
      home_team_id: null,
      away_team_id: null,
      match_date: match.date ?? null,
      match_time: match.time ?? null,
      status: 'scheduled',
      knockout: true,
    })
    if (knockErr) {
      console.error(`Error creating knockout match:`, knockErr)
    }
  }

  console.log(`✓ ${fixture.knockout.length} knockout matches created`)
  console.log('Seed complete!')
}

interface KnockoutEntry {
  round: string
  home: string | null
  away: string | null
  date: string | null
  time: string | null
}

async function updateExistingMatches(supabase: SupabaseClient, fixture: { groups: any[]; knockout: KnockoutEntry[] }) {
  for (const group of fixture.groups) {
    const { data: groupData } = await supabase.from('groups').select('id').eq('name', group.name).single()
    if (!groupData) {
      console.error(`Group ${group.name} not found`)
      continue
    }

    const { data: teams } = await supabase
      .from('teams')
      .select('id, name')
      .eq('group_id', groupData.id)

    const teamMap = new Map((teams ?? []).map((t: { id: string; name: string }) => [t.name, t.id]))

    const { data: dbMatches } = await supabase
      .from('matches')
      .select('id, home_team_id, away_team_id')
      .eq('group_id', groupData.id)
      .eq('knockout', false)

    const typedMatches = (dbMatches ?? []) as { id: string; home_team_id: string | null; away_team_id: string | null }[]
    if (typedMatches.length === 0) {
      console.error(`No matches found for group ${group.name}`)
      continue
    }

    for (const fixtureMatch of group.matches) {
      const homeId = teamMap.get(fixtureMatch.home)
      const awayId = teamMap.get(fixtureMatch.away)
      if (!homeId || !awayId) {
        console.error(`Team not found for match ${fixtureMatch.home} vs ${fixtureMatch.away} in group ${group.name}`)
        continue
      }

      const dbMatch = typedMatches.find(
        (m) => m.home_team_id === homeId && m.away_team_id === awayId
      )
      if (!dbMatch) {
        console.error(`Match not found in DB: ${fixtureMatch.home} vs ${fixtureMatch.away} in group ${group.name}`)
        continue
      }

      const { error } = await supabase
        .from('matches')
        .update({
          match_date: fixtureMatch.date ?? null,
          match_time: fixtureMatch.time ?? null,
        })
        .eq('id', dbMatch.id)

      if (error) console.error(`Error updating match in group ${group.name}:`, error)
    }

    console.log(`✓ Group ${group.name}: dates updated`)
  }

  // Update knockout matches - group by round, order by created_at (not UUID!)
  const { data: allTeams } = await supabase.from('teams').select('id, name')
  const teamNameMap = new Map((allTeams ?? []).map((t: { id: string; name: string }) => [t.name, t.id]))

  const { data: knockMatches } = await supabase
    .from('matches')
    .select('id, round')
    .eq('knockout', true)
    .order('created_at', { ascending: true })

  const dbMatches = (knockMatches ?? []) as { id: string; round: string }[]

  const dbByRound: Record<string, { id: string }[]> = {}
  for (const km of dbMatches) {
    if (!dbByRound[km.round]) dbByRound[km.round] = []
    dbByRound[km.round].push(km)
  }

  const fixtureByRound: Record<string, typeof fixture.knockout> = {}
  for (const fm of fixture.knockout) {
    if (!fixtureByRound[fm.round]) fixtureByRound[fm.round] = []
    fixtureByRound[fm.round].push(fm)
  }

  let updated = 0
  for (const [round, fixtureMatches] of Object.entries(fixtureByRound)) {
    const roundDbMatches = dbByRound[round]
    if (!roundDbMatches) {
      console.error(`  ! Round "${round}" not found in DB`)
      continue
    }

    for (let i = 0; i < Math.min(fixtureMatches.length, roundDbMatches.length); i++) {
      const fm = fixtureMatches[i]
      const km = roundDbMatches[i]

      const updateData: Record<string, unknown> = {
        match_date: fm.date ?? null,
        match_time: fm.time ?? null,
      }

      if (fm.home && fm.away) {
        updateData.home_team_id = teamNameMap.get(fm.home) ?? null
        updateData.away_team_id = teamNameMap.get(fm.away) ?? null
      }

      const { error } = await supabase
        .from('matches')
        .update(updateData)
        .eq('id', km.id)

      if (error) console.error(`  ! Error updating ${round}:`, error)
      else updated++
    }
  }

  console.log(`✓ ${updated} knockout matches updated (dates & teams)`)
  console.log('Seed complete! (predictions preserved)')
}

seed().catch(console.error)
