// api/sync-scores.js
// Fetches live scores from ESPN's free golf API
// ESPN endpoint: site.api.espn.com/apis/site/v2/sports/golf/leaderboard

import { createClient } from '@supabase/supabase-js'

const OPEN_EVENT_ID = '401811957' // 2026 Open Championship ESPN event ID

function normaliseName(first, last) {
  // Normalise common name variations
  const full = `${first} ${last}`.trim()
  const map = {
    'Ludvig Aberg': 'Ludvig Åberg',
    'Rasmus Hojgaard': 'Rasmus Hojgaard',
  }
  return map[full] || full
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return res.status(200).json({ error: 'Missing Supabase env vars' })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // Try to find The Open Championship event ID if not hardcoded
    let eventId = OPEN_EVENT_ID

    const response = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/golf/leaderboard?event=${eventId}`,
      { headers: { 'Accept': 'application/json' } }
    )

    if (!response.ok) {
      return res.status(200).json({ error: `ESPN API error: ${response.status}`, synced: 0 })
    }

    const data = await response.json()

    // ESPN structure: data.events[0].competitions[0].competitors
    const competitors = data?.events?.[0]?.competitions?.[0]?.competitors || []

    if (competitors.length === 0) {
      return res.status(200).json({ error: 'No competitors found', eventId, synced: 0 })
    }

    let synced = 0

    for (const comp of competitors) {
      const athlete = comp.athlete || {}
      const firstName = athlete.firstName || athlete.displayName?.split(' ')[0] || ''
      const lastName = athlete.lastName || athlete.displayName?.split(' ').slice(1).join(' ') || ''
      const name = normaliseName(firstName, lastName)

      // Round scores — ESPN linescores
      const linescores = comp.linescores || []
      const r1 = linescores[0]?.value != null ? parseInt(linescores[0].value) : null
      const r2 = linescores[1]?.value != null ? parseInt(linescores[1].value) : null
      const r3 = linescores[2]?.value != null ? parseInt(linescores[2].value) : null
      const r4 = linescores[3]?.value != null ? parseInt(linescores[3].value) : null

      // Cut status
      const status = comp.status?.type?.name || ''
      const madeCut = status !== 'cut' && status !== 'WD' && status !== 'MDF'

      const { error } = await supabase.from('golf_scores').upsert({
        golfer_name: name,
        r1, r2, r3, r4,
        made_cut: madeCut,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'golfer_name' })

      if (!error) synced++
    }

    return res.status(200).json({
      synced,
      total: competitors.length,
      eventId,
      timestamp: new Date().toISOString()
    })

  } catch (err) {
    return res.status(200).json({ error: err.message, synced: 0 })
  }
}
