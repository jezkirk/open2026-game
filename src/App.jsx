import { useState, useEffect } from "react"
import { supabase } from "./supabase"
import { GROUPS, ALL_GOLFERS, TOURNAMENT, isPicsLocked } from "./data"

const S = {
  root: { minHeight: "100vh", background: "#07080f", color: "#e2e8f0", fontFamily: "'Outfit', sans-serif", maxWidth: 600, margin: "0 auto", paddingBottom: 40 },
  hero: { background: "linear-gradient(135deg, #0f1a0f 0%, #0a1a2e 50%, #1a0f0a 100%)", padding: "32px 24px 28px", textAlign: "center", borderBottom: "1px solid #1e293b" },
  heroIcon: { fontSize: 48, marginBottom: 8, display: "block" },
  title: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 44, lineHeight: 1.0, letterSpacing: 3, color: "#fff", margin: 0 },
  titleAccent: { color: "#22c55e" },
  subtitle: { marginTop: 8, color: "#64748b", fontSize: 13, letterSpacing: 2 },
  pageTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 34, lineHeight: 1.1, letterSpacing: 3, color: "#fff", margin: 0 },
  section: { padding: "20px 20px 0" },
  sectionTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 2, color: "#22c55e", marginBottom: 12 },
  card: { background: "#0d1117", border: "1px solid #1e293b", borderRadius: 10, padding: "14px 16px", marginBottom: 10 },
  cardGreen: { border: "1px solid #22c55e44", background: "#0a1a0a" },
  label: { display: "block", color: "#94a3b8", fontSize: 13, marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 },
  input: { width: "100%", background: "#0f1624", border: "1px solid #1e293b", borderRadius: 8, color: "#fff", fontSize: 16, padding: "12px 14px", outline: "none", boxSizing: "border-box" },
  btnPrimary: { background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#000", fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2, fontSize: 18, padding: "12px 32px", borderRadius: 8, border: "none", cursor: "pointer", width: "100%" },
  btnSmall: { background: "transparent", color: "#64748b", border: "1px solid #1e293b", padding: "8px 20px", borderRadius: 6, fontSize: 13, cursor: "pointer" },
  badge: { background: "#1e293b", color: "#94a3b8", fontSize: 10, padding: "2px 6px", borderRadius: 4, textTransform: "uppercase", letterSpacing: 0.5 },
  badgeGreen: { background: "#1a3a1a", color: "#4ade80", fontSize: 10, padding: "2px 6px", borderRadius: 4 },
  badgeAmber: { background: "#3a2a00", color: "#f59e0b", fontSize: 10, padding: "2px 6px", borderRadius: 4 },
  toast: { position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#1a3a1a", color: "#4ade80", border: "1px solid #22c55e44", padding: "10px 24px", borderRadius: 8, fontSize: 14, fontWeight: 600, zIndex: 999, whiteSpace: "nowrap", pointerEvents: "none" },
  spinner: { display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#07080f", color: "#fff", fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 4 },
  lbRow: { background: "#0d1117", border: "1px solid #1e293b", borderRadius: 10, padding: "12px 14px", marginBottom: 8 },
  lbRowTop: { background: "linear-gradient(135deg,#1a1200,#0a0a0a)", border: "1px solid #f59e0b77" },
  lbName: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 1, color: "#fff" },
  lbScore: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: "#22c55e" },
  lbPicks: { marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 },
  lbGolfer: { fontSize: 12, color: "#94a3b8", background: "#1e293b", padding: "3px 8px", borderRadius: 4 },
  lbGolferScore: { color: "#e2e8f0", fontWeight: 600 },
  lbGolferCut: { color: "#f87171", textDecoration: "line-through", opacity: 0.6 },
  groupCard: { background: "#0d1117", border: "1px solid #1e293b", borderRadius: 10, marginBottom: 12, overflow: "hidden" },
  groupHeader: { background: "#1e293b", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  groupName: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 1, color: "#94a3b8" },
  groupPicked: { fontSize: 12, color: "#22c55e", fontWeight: 600 },
  golferRow: { display: "flex", alignItems: "center", padding: "10px 14px", borderBottom: "1px solid #1e293b", cursor: "pointer" },
  golferRowSelected: { background: "#0a1a0a" },
  golferRadio: { width: 18, height: 18, borderRadius: "50%", border: "2px solid #334155", marginRight: 12, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" },
  golferRadioSelected: { border: "2px solid #22c55e", background: "#22c55e" },
  golferName: { fontSize: 14, color: "#e2e8f0", flex: 1 },
  golferNameSelected: { color: "#4ade80", fontWeight: 600 },
  roundTabs: { display: "flex", gap: 6, padding: "14px 20px 8px", overflowX: "auto" },
  roundTab: { padding: "6px 14px", borderRadius: 20, border: "1px solid #1e293b", background: "#0f1624", color: "#64748b", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" },
  roundTabActive: { background: "#1e3a1e", border: "1px solid #22c55e", color: "#4ade80" },
  rulesBox: { background: "#0d1117", border: "1px solid #22c55e33", borderRadius: 10, padding: 16, marginTop: 16 },
  rulesTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 2, color: "#22c55e", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 },
  ruleRow: { fontSize: 13, color: "#64748b", marginBottom: 8, lineHeight: 1.6 },
}

function GS() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;600;700&display=swap');
      *{box-sizing:border-box;margin:0;padding:0}
      body{background:#07080f}
      ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#111}::-webkit-scrollbar-thumb{background:#333}
    `}</style>
  )
}

function Toast({ msg }) {
  if (!msg) return null
  return <div style={S.toast}>{msg}</div>
}

async function loadAllPlayers() {
  const { data } = await supabase.from("open_players").select("*")
  return data || []
}

async function savePlayer(name, picks) {
  await supabase.from("open_players").upsert(
    { name, picks: JSON.stringify(picks), updated_at: new Date().toISOString() },
    { onConflict: "name" }
  )
}

async function loadScores() {
  const { data } = await supabase.from("golf_scores").select("*")
  const map = {}
  if (data) data.forEach(r => { map[r.golfer_name] = r })
  return map
}

const PAR = 70 // Royal Birkdale par 70

function formatVsPar(n) {
  if (n === null || n === undefined) return "–"
  if (n === 0) return "E"
  return n > 0 ? `+${n}` : `${n}`
}

function golferVsPar(score) {
  // Returns total vs par for completed rounds only
  if (!score) return null
  const rounds = [score.r1, score.r2, score.r3, score.r4].filter(r => r != null)
  if (rounds.length === 0) return null
  return rounds.reduce((a, b) => a + b, 0) - (PAR * rounds.length)
}

function golferRoundVsPar(score, round) {
  if (!score) return null
  const r = score[`r${round}`]
  if (r == null) return null
  return r - PAR
}

// Cut penalty: worst vs-par total among all picked golfers who made the cut
function getWorstVsPar(allPlayers, scores) {
  let worst = null
  allPlayers.forEach(p => {
    const picks = JSON.parse(p.picks || "[]")
    picks.forEach(name => {
      const s = scores[name]
      if (!s || !s.made_cut) return
      const vp = golferVsPar(s)
      if (vp != null && (worst === null || vp > worst)) worst = vp
    })
  })
  return worst
}

function getWorstRoundVsPar(allPlayers, scores, round) {
  let worst = null
  allPlayers.forEach(p => {
    const picks = JSON.parse(p.picks || "[]")
    picks.forEach(name => {
      const s = scores[name]
      if (!s || !s.made_cut) return
      const r = s[`r${round}`]
      if (r != null) {
        const vp = r - PAR
        if (worst === null || vp > worst) worst = vp
      }
    })
  })
  return worst
}

function playerTotalVsPar(picks, scores, allPlayers) {
  const worstR3vp = getWorstRoundVsPar(allPlayers, scores, 3)
  const worstR4vp = getWorstRoundVsPar(allPlayers, scores, 4)
  let total = null
  picks.forEach(name => {
    const s = scores[name]
    if (!s) return
    const completedRounds = [s.r1, s.r2, s.r3, s.r4].filter(r => r != null).length
    if (completedRounds === 0) return
    if (total === null) total = 0
    // R1 and R2 always use actual score
    if (s.r1 != null) total += (s.r1 - PAR)
    if (completedRounds >= 2 && s.r2 != null) total += (s.r2 - PAR)
    // R3: use actual if made cut, else worst
    if (completedRounds >= 3) {
      if (!s.made_cut && worstR3vp !== null) total += worstR3vp
      else if (s.r3 != null) total += (s.r3 - PAR)
    }
    // R4: use actual if made cut, else worst
    if (completedRounds >= 4) {
      if (!s.made_cut && worstR4vp !== null) total += worstR4vp
      else if (s.r4 != null) total += (s.r4 - PAR)
    }
  })
  return total
}

export default function App() {
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState("home")
  const [myName, setMyName] = useState("")
  const [myPicks, setMyPicks] = useState({})
  const [allPlayers, setAllPlayers] = useState([])
  const [scores, setScores] = useState({})
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState("")
  const [toast, setToast] = useState("")
  const [activeRound, setActiveRound] = useState(0)
  const [nameInput, setNameInput] = useState("")
  const locked = isPicsLocked()

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(""), 2500) }

  async function refresh() {
    const [players, sc] = await Promise.all([loadAllPlayers(), loadScores()])
    setAllPlayers(players)
    setScores(sc)
  }

  useEffect(() => {
    async function init() {
      await refresh()
      const saved = localStorage.getItem("open2026_name")
      if (saved) { setMyName(saved); setView("home") }
      setLoading(false)
    }
    init()
  }, [])

  async function handleSync() {
    setSyncing(true)
    setSyncMsg("Syncing scores…")
    try {
      const res = await fetch("/api/sync-scores")
      const data = await res.json()
      setSyncMsg(data.synced ? `Synced ${data.synced} golfers ✓` : "No updates")
      await refresh()
    } catch { setSyncMsg("Sync failed") }
    setSyncing(false)
    setTimeout(() => setSyncMsg(""), 3000)
  }

  async function handleRegister() {
    const name = nameInput.trim()
    if (!name) return
    if (!GROUPS.every(g => myPicks[g.id])) { showToast("Please pick one golfer from each group!"); return }
    const picksArray = GROUPS.map(g => myPicks[g.id])
    await savePlayer(name, picksArray)
    localStorage.setItem("open2026_name", name)
    setMyName(name)
    await refresh()
    showToast("Picks saved! Good luck! 🏌️")
    setView("home")
  }

  async function handleUpdatePicks() {
    if (locked) return
    if (!GROUPS.every(g => myPicks[g.id])) { showToast("Please pick one golfer from each group!"); return }
    const picksArray = GROUPS.map(g => myPicks[g.id])
    await savePlayer(myName, picksArray)
    await refresh()
    showToast("Picks updated! ✓")
    setView("home")
  }

  function openPicksScreen() {
    const existing = allPlayers.find(p => p.name === myName)
    if (existing) {
      const picks = JSON.parse(existing.picks || "[]")
      const pickMap = {}
      GROUPS.forEach((g, i) => { if (picks[i]) pickMap[g.id] = picks[i] })
      setMyPicks(pickMap)
    }
    setView("picks")
  }

  const leaderboard = allPlayers
    .map(p => {
      const picks = JSON.parse(p.picks || "[]")
      const total = playerTotalVsPar(picks, scores, allPlayers)
      return { name: p.name, picks, total }
    })
    .sort((a, b) => {
      if (a.total === null && b.total === null) return 0
      if (a.total === null) return 1
      if (b.total === null) return -1
      return a.total - b.total
    })

  if (loading) return <><GS /><div style={S.spinner}>LOADING…</div></>

  // ── REGISTER / PICKS SCREEN ──
  if (view === "register" || view === "picks") {
    const isEditing = view === "picks"
    return (
      <div style={S.root}>
        <GS />
        <div style={S.hero}>
          <span style={S.heroIcon}>⛳</span>
          <h2 style={S.pageTitle}>{isEditing ? "EDIT YOUR PICKS" : "REGISTER & PICK"}</h2>
          <p style={S.subtitle}>{TOURNAMENT.name} · {TOURNAMENT.venue}</p>
        </div>
        <div style={{ ...S.section, paddingTop: 20 }}>
          {!isEditing && (
            <div style={{ marginBottom: 20 }}>
              <label style={S.label}>Your Name</label>
              <input style={S.input} value={nameInput} onChange={e => setNameInput(e.target.value)} placeholder="e.g. Jiz" />
            </div>
          )}
          <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>Pick one golfer from each group. Picks lock on July 16 at 6am BST.</p>
          {GROUPS.map(group => (
            <div key={group.id} style={S.groupCard}>
              <div style={S.groupHeader}>
                <span style={S.groupName}>{group.name}</span>
                {myPicks[group.id] && <span style={S.groupPicked}>✓ {myPicks[group.id].split(" ").pop()}</span>}
              </div>
              {group.golfers.map((golfer, idx) => {
                const selected = myPicks[group.id] === golfer
                return (
                  <div key={golfer}
                    style={{ ...S.golferRow, ...(selected ? S.golferRowSelected : {}), borderBottom: idx === group.golfers.length - 1 ? "none" : "1px solid #1e293b" }}
                    onClick={() => !locked && setMyPicks(prev => ({ ...prev, [group.id]: golfer }))}>
                    <div style={{ ...S.golferRadio, ...(selected ? S.golferRadioSelected : {}) }}>
                      {selected && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
                    </div>
                    <span style={{ ...S.golferName, ...(selected ? S.golferNameSelected : {}) }}>{golfer}</span>
                  </div>
                )
              })}
            </div>
          ))}
          {!locked && (
            <button style={{ ...S.btnPrimary, marginTop: 8, opacity: (GROUPS.every(g => myPicks[g.id]) && (isEditing || nameInput.trim())) ? 1 : 0.5 }}
              onClick={isEditing ? handleUpdatePicks : handleRegister}>
              {isEditing ? "💾 Save Changes" : "🏌️ Save My Picks"}
            </button>
          )}
          {locked && <div style={{ ...S.card, textAlign: "center", color: "#f59e0b", marginTop: 8 }}>🔒 Picks are locked — tournament has started!</div>}
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <button style={S.btnSmall} onClick={() => setView("home")}>← Back</button>
          </div>
        </div>
        <Toast msg={toast} />
      </div>
    )
  }

  // ── LEADERBOARD ──
  if (view === "leaderboard") {
    const rounds = [1, 2, 3, 4]
    // All golfers sorted by total strokes
    const allGolfersSorted = ALL_GOLFERS
      .map(name => ({ name, score: scores[name] }))
      .map(({ name, score }) => ({ name, score, total: golferTotalStrokes(score), madeCut: score?.made_cut ?? null }))
      .sort((a, b) => {
        if (a.total === null && b.total === null) return 0
        if (a.total === null) return 1
        if (b.total === null) return -1
        return a.total - b.total
      })

    return (
      <div style={S.root}>
        <GS />
        <div style={S.hero}>
          <span style={S.heroIcon}>🏆</span>
          <h2 style={S.pageTitle}>LEADERBOARD</h2>
          <p style={S.subtitle}>{TOURNAMENT.venue} · {TOURNAMENT.dates}</p>
        </div>

        <div style={S.roundTabs}>
          <button style={{ ...S.roundTab, ...(activeRound === 0 ? S.roundTabActive : {}) }} onClick={() => setActiveRound(0)}>Total</button>
          {rounds.map(r => (
            <button key={r} style={{ ...S.roundTab, ...(activeRound === r ? S.roundTabActive : {}) }} onClick={() => setActiveRound(r)}>Round {r}</button>
          ))}
          <button style={{ ...S.roundTab, ...(activeRound === 99 ? S.roundTabActive : {}) }} onClick={() => setActiveRound(99)}>All Golfers</button>
        </div>

        <div style={{ padding: "0 20px" }}>
          {activeRound === 99 ? (
            // All golfers scoreboard
            <>
              <div style={{ ...S.sectionTitle, paddingTop: 12 }}>All Golfers</div>
              {allGolfersSorted.map((g, i) => (
                <div key={g.name} style={{ ...S.card, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 11, color: "#64748b", minWidth: 20 }}>#{i + 1}</span>
                    <span style={{ fontSize: 14, color: g.madeCut === false ? "#f87171" : "#e2e8f0", textDecoration: g.madeCut === false ? "line-through" : "none", fontWeight: 600 }}>{g.name}</span>
                    {g.madeCut === false && <span style={{ fontSize: 10, color: "#f87171", background: "#3a1a1a", padding: "1px 5px", borderRadius: 3 }}>CUT</span>}
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {[1,2,3,4].map(r => {
                      const rs = g.score ? g.score[`r${r}`] : null
                      const vp = rs != null ? rs - PAR : null
                      return <span key={r} style={{ fontSize: 12, color: vp != null ? (vp < 0 ? "#4ade80" : vp > 0 ? "#f87171" : "#94a3b8") : "#334155", minWidth: 22, textAlign: "center" }}>{vp != null ? formatVsPar(vp) : "–"}</span>
                    })}
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: g.total != null ? (g.total < 0 ? "#22c55e" : g.total > 0 ? "#f87171" : "#94a3b8") : "#334155", minWidth: 32, textAlign: "right" }}>{g.total != null ? formatVsPar(g.total) : "–"}</span>
                  </div>
                </div>
              ))}
            </>
          ) : (
            // Player leaderboard
            <>
              {leaderboard.length === 0 && <div style={{ ...S.card, textAlign: "center", color: "#64748b", padding: 32 }}>No players registered yet</div>}
              {leaderboard.map((player, i) => (
                <div key={player.name} style={{ ...S.lbRow, ...(i === 0 && player.total > 0 ? S.lbRowTop : {}), ...(player.name === myName ? { border: "1px solid #2563eb44" } : {}) }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div>
                      <span style={{ fontSize: 11, color: "#64748b", marginRight: 8 }}>#{i + 1}</span>
                      <span style={{ ...S.lbName, ...(i === 0 && player.total > 0 ? { color: "#f59e0b" } : {}), ...(player.name === myName ? { color: "#93c5fd" } : {}) }}>
                        {player.name} {player.name === myName ? "👤" : ""}
                      </span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={S.lbScore}>
                        {activeRound === 0
                          ? (player.total !== null ? formatVsPar(player.total) : "–")
                          : (() => {
                              let sum = 0; let any = false
                              player.picks.forEach(name => {
                                const s = scores[name]
                                if (!s) return
                                const r = s[`r${activeRound}`]
                                if (r != null) { sum += r - PAR; any = true }
                              })
                              return any ? formatVsPar(sum) : "–"
                            })()}
                      </span>
                      <div style={{ fontSize: 10, color: "#64748b" }}>{activeRound === 0 ? "total" : `round ${activeRound}`}</div>
                    </div>
                  </div>
                  {/* Golfer breakdown */}
                  <div style={S.lbPicks}>
                    {player.picks.map(name => {
                      const s = scores[name]
                      const total = golferVsPar(s)
                      const cut = s && !s.made_cut
                      const roundScore = activeRound > 0 && s ? s[`r${activeRound}`] : null
                      return (
                        <span key={name} style={{ ...S.lbGolfer, ...(cut ? { color: "#f87171", opacity: 0.7 } : {}) }}>
                          <span style={{ textDecoration: cut ? "line-through" : "none" }}>{name.split(" ").pop()}</span>
                          {activeRound === 0 && total != null && !cut && <span style={S.lbGolferScore}> {formatVsPar(total)}</span>}
                          {activeRound > 0 && roundScore != null && <span style={S.lbGolferScore}> {formatVsPar(roundScore - PAR)}</span>}
                          {cut && <span style={{ color: "#f87171", fontSize: 10 }}> ✂</span>}
                        </span>
                      )
                    })}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        <div style={{ padding: "16px 20px 0", display: "flex", gap: 8, justifyContent: "center" }}>
          <button style={S.btnSmall} onClick={() => setView("home")}>← Back</button>
          <button style={{ ...S.btnSmall, borderColor: syncing ? "#334155" : "#22c55e44", color: syncing ? "#475569" : "#4ade80" }}
            onClick={handleSync} disabled={syncing}>
            {syncing ? "⏳ Syncing…" : "🔄 Sync Scores"}
          </button>
        </div>
        {syncMsg && <div style={{ textAlign: "center", fontSize: 12, color: "#4ade80", marginTop: 8 }}>{syncMsg}</div>}
        <Toast msg={toast} />
      </div>
    )
  }

  // ── HOME ──
  const myPlayerData = allPlayers.find(p => p.name === myName)
  const myPicksArray = myPlayerData ? JSON.parse(myPlayerData.picks || "[]") : []

  return (
    <div style={S.root}>
      <GS />
      <div style={S.hero}>
        <span style={S.heroIcon}>⛳</span>
        <h1 style={S.title}>THE OPEN<br /><span style={S.titleAccent}>2026</span></h1>
        <p style={S.subtitle}>ROYAL BIRKDALE · JULY 16–19</p>
      </div>

      {!myName ? (
        <div style={{ ...S.section, maxWidth: 400, margin: "0 auto", paddingTop: 32 }}>
          <p style={{ color: "#94a3b8", fontSize: 15, textAlign: "center", marginBottom: 24 }}>Enter your name and pick one golfer from each group to join the game.</p>
          <button style={S.btnPrimary} onClick={() => setView("register")}>🏌️ Register & Pick Golfers</button>
          <div style={{ marginTop: 12, textAlign: "center" }}>
            <button style={S.btnSmall} onClick={() => setView("leaderboard")}>View Leaderboard</button>
          </div>
        </div>
      ) : (
        <>
          {/* My picks */}
          <div style={S.section}>
            <div style={S.sectionTitle}>My Picks — {myName}</div>
            <div style={{ ...S.card, ...S.cardGreen }}>
              {myPicksArray.length === 0 ? (
                <p style={{ color: "#64748b", fontSize: 13 }}>No picks saved yet.</p>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {myPicksArray.map((name, i) => {
                    const s = scores[name]
                    const total = golferVsPar(s)
                    const cut = s && !s.made_cut
                    return (
                      <div key={name} style={{ background: "#1e293b", borderRadius: 6, padding: "6px 10px", fontSize: 13 }}>
                        <span style={{ color: "#64748b", fontSize: 10 }}>G{i + 1} </span>
                        <span style={{ color: cut ? "#f87171" : "#e2e8f0", fontWeight: 600, textDecoration: cut ? "line-through" : "none" }}>{name}</span>
                        {total != null && !cut && <span style={{ color: "#4ade80", marginLeft: 6, fontWeight: 700 }}>{formatVsPar(total)}</span>}
                        {cut && <span style={{ color: "#f87171", marginLeft: 4, fontSize: 10 }}>CUT</span>}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Top 3 preview */}
          {leaderboard.length > 0 && (
            <div style={S.section}>
              <div style={S.sectionTitle}>Leaderboard</div>
              {leaderboard.slice(0, 3).map((player, i) => (
                <div key={player.name} style={{ ...S.card, display: "flex", justifyContent: "space-between", alignItems: "center", ...(player.name === myName ? { border: "1px solid #2563eb44" } : {}) }}>
                  <div>
                    <span style={{ fontSize: 11, color: "#64748b", marginRight: 8 }}>#{i + 1}</span>
                    <span style={{ fontWeight: 600, color: i === 0 && player.total > 0 ? "#f59e0b" : "#e2e8f0" }}>
                      {player.name} {player.name === myName ? "👤" : ""}
                    </span>
                  </div>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: "#22c55e" }}>
  {player.total !== null ? formatVsPar(player.total) : "–"}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div style={{ ...S.section, paddingTop: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button style={S.btnPrimary} onClick={() => setView("leaderboard")}>🏆 Full Leaderboard</button>
              {!locked && <button style={{ ...S.btnSmall, width: "100%", borderColor: "#22c55e44", color: "#4ade80" }} onClick={openPicksScreen}>✏️ Edit My Picks</button>}
              <button style={{ ...S.btnSmall, width: "100%", borderColor: "#22c55e44", color: "#4ade80" }} onClick={() => { setMyName(""); localStorage.removeItem("open2026_name") }}>🔄 Switch Player</button>
            </div>
            <div style={{ marginTop: 12, textAlign: "center" }}>
              <button style={{ ...S.btnSmall, borderColor: syncing ? "#334155" : "#22c55e44", color: syncing ? "#475569" : "#4ade80" }}
                onClick={handleSync} disabled={syncing}>
                {syncing ? "⏳ Syncing…" : "🔄 Sync Scores"}
              </button>
            </div>
            {syncMsg && <div style={{ textAlign: "center", fontSize: 12, color: "#4ade80", marginTop: 8 }}>{syncMsg}</div>}
          </div>

          {/* Scoring rules */}
          <div style={{ padding: "0 20px" }}>
            <div style={S.rulesBox}>
              <div style={S.rulesTitle}>📐 HOW SCORING WORKS</div>
              <div style={S.ruleRow}>Each player picks 1 golfer from each of the 5 groups (based on betting odds tiers).</div>
              <div style={S.ruleRow}>Your score = the sum of all 5 golfers' scores vs par (Royal Birkdale par 70).</div>
              <div style={S.ruleRow}>Lowest score wins — most under par wins!</div>
              <div style={S.ruleRow}>If one of your golfers misses the cut, their Round 3 & 4 scores are replaced with the <strong style={{ color: "#f87171" }}>worst</strong> Round 3 / Round 4 scores among all golfers selected by anyone in the game who made the cut.</div>
            </div>
          </div>
        </>
      )}
      <Toast msg={toast} />
    </div>
  )
}
