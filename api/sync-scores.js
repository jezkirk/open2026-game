// api/sync-scores.js
// Fetches live scores from ESPN's free golf API
// ESPN endpoint: site.api.espn.com/apis/site/v2/sports/golf/leaderboard

import { createClient } from '@supabase/supabase-js'

const OPEN_EVENT_ID = '401811957' // 2026 Open Championship ESPN event ID

const SELECTED_GOLFERS = new Set([
  'Scottie Scheffler','Rory McIlroy','Tommy Fleetwood','Matt Fitzpatrick','Jon Rahm','Xander Schauffele','Tyrrell Hatton',
  'Cameron Young','Ludvig Åberg','Aaron Rai','Justin Rose','Chris Gotterup','Robert MacIntyre','Collin Morikawa',
  'Sam Burns','Viktor Hovland','Wyndham Clark','Bryson DeChambeau','Jordan Spieth','Shane Lowry','Patrick Cantlay',
  'Brooks Koepka','Tom Kim','Joaquin Niemann','Russell Henley','Brian Harman','Sepp Straka','Alex Fitzpatrick',
  'Rasmus Hojgaard','Justin Thomas','Keegan Bradley','Cameron Smith','Si Woo Kim',
])
  // Normalise common name variations
  const full = `${first} ${last}`.trim()
  const map = {
    'Ludvig Aberg': 'Ludvig Åberg',
    'Rasmus Højgaard': 'Rasmus Hojgaard',
    'Rasmus Hojgaard': 'Rasmus Hojgaard',
    'Joaquín Niemann': 'Joaquin Niemann',
    'Joaquin Niemann': 'Joaquin Niemann',
    'Si Woo Kim': 'Si Woo Kim',
    'Siwoo Kim': 'Si Woo Kim',
    'Si-Woo Kim': 'Si Woo Kim',
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

      // Only sync golfers in our selected groups
      if (!SELECTED_GOLFERS.has(name)) continue

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

      // Cut status — ESPN uses various status indicators
      const status = (comp.status?.type?.name || '').toLowerCase()
      const statusDesc = (comp.status?.type?.description || '').toLowerCase()
      const statusId = comp.status?.type?.id || ''
      const madeCut = !status.includes('cut') && 
                      !statusDesc.includes('cut') && 
                      status !== 'wd' && 
                      status !== 'mdf' &&
                      statusId !== 'C' &&
                      !(comp.status?.cut === true)

      const { error } = await supabase.from('golf_scores').upsert({
        golfer_name: name,
        r1, r2, r3, r4,
        made_cut: madeCut,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'golfer_name' })

      if (!error) synced++
    }

    // Sample first competitor's status for debugging
    const sampleStatus = competitors[0] ? {
      statusName: competitors[0].status?.type?.name,
      statusDesc: competitors[0].status?.type?.description,
      statusId: competitors[0].status?.type?.id,
      statusKeys: Object.keys(competitors[0].status || {})
    } : null

    return res.status(200).json({
      synced,
      total: competitors.length,
      eventId,
      sampleStatus,
      timestamp: new Date().toISOString()
    })

  } catch (err) {
    return res.status(200).json({ error: err.message, synced: 0 })
  }
}
