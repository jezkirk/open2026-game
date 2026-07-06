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
    const response = await fetch(
      'https://golf-leaderboard-data.p.rapidapi.com/leaderboard/832',
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
      const r1 = unwrapNumber(player.round_one_strokes)
      const r2 = unwrapNumber(player.round_two_strokes)
      const r3 = unwrapNumber(player.round_three_strokes)
      const r4 = unwrapNumber(player.round_four_strokes)
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

    return res.status(200).json({ synced, timestamp: new Date().toISOString() })
  } catch (err) {
    return res.status(200).json({ error: err.message })
  }
}
