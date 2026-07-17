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

      // ESPN linescores return total strokes per round (e.g. 68, 71)
      // Only store a round if it has a valid score (>= 60 strokes)
      // This prevents storing 0 for rounds not yet started
      function parseRound(linescore) {
        if (!linescore || linescore.value == null) return null
        const val = parseInt(linescore.value)
        if (!val || val < 60) return null // 0 or unrealistic = not played
        return val // raw strokes e.g. 68, 71
      }

      const linescores = comp.linescores || []
      const r1 = parseRound(linescores[0])
      const r2 = parseRound(linescores[1])
      const r3 = parseRound(linescores[2])
      const r4 = parseRound(linescores[3])

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
