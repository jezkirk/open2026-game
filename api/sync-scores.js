// api/sync-scores.js
// Vercel serverless function — fetches live scores from RapidAPI golf leaderboard
// and saves to Supabase golf_scores table.

import { createClient } from '@supabase/supabase-js'

function unwrapNumber(val) {
  if (val === null || val === undefined) return null
  if (typeof val === 'number') return val
  if (typeof val === 'object') {
    if ('$numberInt' in val) return parseInt(val.$numberInt)
    if ('$numberDouble' in val) return parseFloat(val.$numberDouble)
  }
  if (typeof val === 'string') {
    const n = Number(val)
    return isNaN(n) ? null : n
  }
  return null
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  const rapidApiKey = process.env.RAPIDAPI_GOLF_KEY
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

  if (!rapidApiKey || !supabaseUrl || !supabaseKey) {
    return res.status(200).json({ error: 'Missing env vars' })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // First find The Open Championship 2026 tournament ID
    let tournamentId = 832 // fallback
    try {
      const fixturesRes = await fetch(
        'https://golf-leaderboard-data.p.rapidapi.com/fixtures/2026',
        { headers: { 'x-rapidapi-host': 'golf-leaderboard-data.p.rapidapi.com', 'x-rapidapi-key': rapidApiKey } }
      )
      if (fixturesRes.ok) {
        const fixturesData = await fixturesRes.json()
        const fixtures = fixturesData?.results?.fixtures || fixturesData?.results || []
        const openTourney = fixtures.find(f => {
          const name = (f.name || f.tournament_name || '').toLowerCase()
          return name.includes('open championship') || name.includes('british open') || name.includes('the open')
        })
        if (openTourney) tournamentId = openTourney.id || openTourney.tournament_id || tournamentId
      }
    } catch { /* use fallback ID */ }

    const response = await fetch(
      `https://golf-leaderboard-data.p.rapidapi.com/leaderboard/${tournamentId}`,
      {
        headers: {
          'x-rapidapi-host': 'golf-leaderboard-data.p.rapidapi.com',
          'x-rapidapi-key': rapidApiKey,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const text = await response.text()
      return res.status(200).json({ error: `API error: ${text}` })
    }

    const data = await response.json()
    const leaderboard = data?.results?.leaderboard || []

    let synced = 0

    for (const player of leaderboard) {
      const name = player.first_name + ' ' + player.last_name
      const rounds = player.rounds || []
      const r1 = rounds[0]?.strokes ? parseInt(rounds[0].strokes) : null
      const r2 = rounds[1]?.strokes ? parseInt(rounds[1].strokes) : null
      const r3 = rounds[2]?.strokes ? parseInt(rounds[2].strokes) : null
      const r4 = rounds[3]?.strokes ? parseInt(rounds[3].strokes) : null
      const madeCut = player.status !== 'cut'

      const { error } = await supabase.from('golf_scores').upsert(
        {
          golfer_name: name,
          r1, r2, r3, r4,
          made_cut: madeCut,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'golfer_name' }
      )

      if (!error) synced++
    }

    return res.status(200).json({ synced, tournamentId, timestamp: new Date().toISOString() })
  } catch (err) {
    return res.status(200).json({ error: err.message })
  }
}
