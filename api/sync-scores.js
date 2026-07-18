// api/sync-scores.js
// Fetches live scores from ESPN's free golf API

import { createClient } from '@supabase/supabase-js'

const OPEN_EVENT_ID = '401811957'

const SELECTED_GOLFERS = new Set([
  'Scottie Scheffler','Rory McIlroy','Tommy Fleetwood','Matt Fitzpatrick','Jon Rahm','Xander Schauffele','Tyrrell Hatton',
  'Cameron Young','Ludvig Åberg','Aaron Rai','Justin Rose','Chris Gotterup','Robert MacIntyre','Collin Morikawa',
  'Sam Burns','Viktor Hovland','Wyndham Clark','Bryson DeChambeau','Jordan Spieth','Shane Lowry','Patrick Cantlay',
  'Brooks Koepka','Tom Kim','Joaquin Niemann','Russell Henley','Brian Harman','Sepp Straka','Alex Fitzpatrick',
  'Rasmus Hojgaard','Justin Thomas','Keegan Bradley','Cameron Smith','Si Woo Kim',
])

function normaliseName(first, last) {
  const full = `${first} ${last}`.trim()
  const map = {
    'Ludvig Aberg': 'Ludvig Åberg',
    'Rasmus Højgaard': 'Rasmus Hojgaard',
    'Joaquín Niemann': 'Joaquin Niemann',
    'Siwoo Kim': 'Si Woo Kim',
    'Si-Woo Kim': 'Si Woo Kim',
  }
  return map[full] || full
}

function parseRound(linescore) {
  if (!linescore || linescore.value == null) return null
  const val = parseInt(linescore.value)
  if (!val || val < 60) return null
  return val
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
    const response = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/golf/leaderboard?event=${OPEN_EVENT_ID}`,
      { headers: { 'Accept': 'application/json' } }
    )

    if (!response.ok) {
      return res.status(200).json({ error: `ESPN API error: ${response.status}`, synced: 0 })
    }

    const data = await response.json()
    const competitors = data?.events?.[0]?.competitions?.[0]?.competitors || []

    if (competitors.length === 0) {
      return res.status(200).json({ error: 'No competitors found', synced: 0 })
    }

    // Debug: sample status fields from first competitor
    const sample = competitors[0]
    const sampleStatus = {
      statusTypeName: sample?.status?.type?.name,
      statusTypeDesc: sample?.status?.type?.description,
      statusTypeId: sample?.status?.type?.id,
      statusKeys: Object.keys(sample?.status || {}),
      statusTypeKeys: Object.keys(sample?.status?.type || {}),
    }

    let synced = 0

    for (const comp of competitors) {
      const athlete = comp.athlete || {}
      const firstName = athlete.firstName || athlete.displayName?.split(' ')[0] || ''
      const lastName = athlete.lastName || athlete.displayName?.split(' ').slice(1).join(' ') || ''
      const name = normaliseName(firstName, lastName)

      if (!SELECTED_GOLFERS.has(name)) continue

      const linescores = comp.linescores || []
      const r1 = parseRound(linescores[0])
      const r2 = parseRound(linescores[1])
      const r3 = parseRound(linescores[2])
      const r4 = parseRound(linescores[3])

      // Cut status
      const statusName = (comp.status?.type?.name || '').toLowerCase()
      const statusDesc = (comp.status?.type?.description || '').toLowerCase()
      const madeCut = !statusName.includes('cut') &&
                      !statusDesc.includes('cut') &&
                      statusName !== 'wd' &&
                      statusName !== 'mdf'

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
      sampleStatus,
      timestamp: new Date().toISOString()
    })

  } catch (err) {
    return res.status(200).json({ error: err.message, synced: 0 })
  }
}
