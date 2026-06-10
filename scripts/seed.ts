import { createClient } from '@supabase/supabase-js'
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

  console.log('Clearing existing fixture data...')
  await supabase.from('predictions').delete().gte('created_at', '2020-01-01')
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

seed().catch(console.error)
