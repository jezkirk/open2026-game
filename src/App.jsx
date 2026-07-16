import { useState, useEffect } from "react"
import { supabase } from "./supabase"
import { GROUPS, ALL_GOLFERS, TOURNAMENT, isPicsLocked } from "./data"

const PAR = 70 // Royal Birkdale

function formatVsPar(n) {
  if (n === null || n === undefined) return "–"
  if (n === 0) return "E"
  return n > 0 ? `+${n}` : `${n}`
}

function golferVsPar(score) {
  if (!score) return null
  const rounds = [score.r1, score.r2, score.r3, score.r4].filter(r => r != null)
  if (rounds.length === 0) return null
  return rounds.reduce((a, b) => a + b, 0) - (PAR * rounds.length)
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
    if (s.r1 != null) total += (s.r1 - PAR)
    if (completedRounds >= 2 && s.r2 != null) total += (s.r2 - PAR)
    if (completedRounds >= 3) {
      if (!s.made_cut && worstR3vp !== null) total += worstR3vp
      else if (s.r3 != null) total += (s.r3 - PAR)
    }
    if (completedRounds >= 4) {
      if (!s.made_cut && worstR4vp !== null) total += worstR4vp
      else if (s.r4 != null) total += (s.r4 - PAR)
    }
  })
  return total
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const S = {
  root: { minHeight: "100vh", background: "#07140a", color: "#e2e8f0", fontFamily: "'Outfit', sans-serif", maxWidth: 600, margin: "0 auto", paddingBottom: 40 },
  hero: { background: "linear-gradient(135deg, #0f241a 0%, #102a16 50%, #0a1f10 100%)", padding: "32px 24px 28px", textAlign: "center", borderBottom: "1px solid #1e3a2a" },
  heroIcon: { fontSize: 48, marginBottom: 8, display: "block" },
  title: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 46, lineHeight: 1.0, letterSpacing: 4, color: "#fff", margin: 0 },
  titleAccent: { color: "#4ade80" },
  subtitle: { marginTop: 8, color: "#86a08f", fontSize: 13, letterSpacing: 2 },
  pageTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 34, lineHeight: 1.1, letterSpacing: 3, color: "#fff", margin: 0 },
  section: { padding: "20px 20px 0" },
  sectionTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 2, color: "#4ade80", marginBottom: 4 },
  sectionSub: { fontSize: 13, color: "#86a08f", marginBottom: 12 },
  navTabs: { display: "flex", gap: 6, padding: "14px 20px 8px", overflowX: "auto" },
  navTab: { padding: "6px 14px", borderRadius: 20, border: "1px solid #1e3a2a", background: "#0f241a", color: "#86a08f", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" },
  navTabActive: { background: "#14532d", border: "1px solid #4ade80", color: "#86efac" },
  leaderRow: { background: "#0d1a12", border: "1px solid #1e3a2a", borderRadius: 10, padding: "14px 16px", marginBottom: 10 },
  leaderRowLead: { background: "linear-gradient(135deg,#1a2e00,#0a1500)", border: "1px solid #4ade8077" },
  leaderTop: { display: "flex", alignItems: "center", gap: 12, marginBottom: 10 },
  rankBadge: { width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, background: "#1e293b", color: "#94a3b8", flexShrink: 0 },
  rankBadgeLead: { background: "#4ade80", color: "#052e16" },
  playerName: { flex: 1, fontSize: 16, fontWeight: 700, color: "#e2e8f0" },
  totalScore: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: "#4ade80" },
  totalScoreOver: { color: "#f87171" },
  totalScoreE: { color: "#94a3b8" },
  totalLabel: { fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, textAlign: "right" },
  golferLine: { display: "flex", alignItems: "center", gap: 6, paddingTop: 4, paddingBottom: 4, borderTop: "1px solid #1e3a2a", fontSize: 12 },
  golferLineName: { flex: 1, color: "#94a3b8" },
  golferLineScore: { fontWeight: 700, color: "#4ade80", minWidth: 28, textAlign: "right" },
  golferLineScoreOver: { color: "#f87171" },
  golferLineScoreE: { color: "#64748b" },
  golferLineCut: { color: "#f87171", textDecoration: "line-through", opacity: 0.7 },
  cutBadge: { fontSize: 10, color: "#f87171", marginLeft: 4 },
  allGolferRow: { display: "flex", alignItems: "center", background: "#0d1a12", border: "1px solid #1e3a2a", borderRadius: 8, padding: "10px 14px", marginBottom: 6 },
  allGolferName: { flex: 1, fontSize: 13, fontWeight: 600 },
  allGolferRound: { fontSize: 12, minWidth: 28, textAlign: "center" },
  allGolferTotal: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, minWidth: 36, textAlign: "right" },
  card: { background: "#0d1a12", border: "1px solid #1e3a2a", borderRadius: 10, padding: "14px 16px", marginBottom: 10 },
  input: { width: "100%", background: "#0f241a", border: "1px solid #1e3a2a", borderRadius: 8, color: "#fff", fontSize: 16, padding: "12px 14px", outline: "none", boxSizing: "border-box" },
  label: { display: "block", color: "#86a08f", fontSize: 13, marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 },
  btnPrimary: { background: "linear-gradient(135deg,#4ade80,#16a34a)", color: "#052e16", fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2, fontSize: 18, padding: "12px 32px", borderRadius: 8, border: "none", cursor: "pointer", width: "100%" },
  btnSmall: { background: "transparent", color: "#86a08f", border: "1px solid #1e3a2a", padding: "8px 20px", borderRadius: 6, fontSize: 13, cursor: "pointer" },
  groupCard: { background: "#0d1a12", border: "1px solid #1e3a2a", borderRadius: 10, marginBottom: 12, overflow: "hidden" },
  groupHeader: { background: "#1e3a2a", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  groupName: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 1, color: "#86a08f" },
  groupPicked: { fontSize: 12, color: "#4ade80", fontWeight: 600 },
  golferRow: { display: "flex", alignItems: "center", padding: "10px 14px", cursor: "pointer" },
  golferRowSelected: { background: "#0a1a0a" },
  golferRadio: { width: 18, height: 18, borderRadius: "50%", border: "2px solid #334155", marginRight: 12, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" },
  golferRadioSelected: { border: "2px solid #4ade80", background: "#4ade80" },
  golferName: { fontSize: 14, color: "#e2e8f0", flex: 1 },
  golferNameSelected: { color: "#4ade80", fontWeight: 600 },
  infoBox: { background: "#0d1a12", border: "1px solid #4ade8033", borderRadius: 10, padding: 16, marginTop: 16 },
  infoTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 2, color: "#4ade80", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 },
  infoRow: { fontSize: 13, color: "#86a08f", marginBottom: 8, lineHeight: 1.6 },
  toast: { position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#1a3a1a", color: "#4ade80", border: "1px solid #22c55e44", padding: "10px 24px", borderRadius: 8, fontSize: 14, fontWeight: 600, zIndex: 999, whiteSpace: "nowrap", pointerEvents: "none" },
  spinner: { display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#07140a", color: "#fff", fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 4 },
}

function GS() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;600;700&display=swap');
      *{box-sizing:border-box;margin:0;padding:0}
      body{background:#07140a}
      ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#111}::-webkit-scrollbar-thumb{background:#333}
    `}</style>
  )
}

function Toast({ msg }) {
  if (!msg) return null
  return <div style={S.toast}>{msg}</div>
}

function scoreColor(vp) {
  if (vp === null || vp === undefined) return "#334155"
  if (vp < 0) return "#4ade80"
  if (vp > 0) return "#f87171"
  return "#64748b"
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

export default function App() {
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState("leaderboard") // leaderboard | allgolfers | mypicks | register | picks | scores
  const [scoreInputs, setScoreInputs] = useState({})
  const [myName, setMyName] = useState("")
  const [myPicks, setMyPicks] = useState({})
  const [allPlayers, setAllPlayers] = useState([])
  const [scores, setScores] = useState({})
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState("")
  const [toast, setToast] = useState("")
  const [nameInput, setNameInput] = useState("")
  const locked = isPicsLocked()

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(""), 2500) }

  async function refresh() {
    const [players, sc] = await Promise.all([loadAllPlayers(), loadScores()])
    setAllPlayers(players)
    setScores(sc)
  }

  async function handleSyncSilent() {
    try {
      const res = await fetch("/api/sync-scores")
      const data = await res.json()
      if (data.synced > 0) await refresh()
    } catch { /* silent fail */ }
  }

  useEffect(() => {
    async function init() {
      await refresh()
      const saved = localStorage.getItem("open2026_name")
      if (saved) setMyName(saved)
      setLoading(false)
    }
    init()

    // Auto-refresh scores every 15 minutes while app is open
    const interval = setInterval(() => {
      handleSyncSilent()
    }, 15 * 60 * 1000)

    return () => clearInterval(interval)
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
    setTab("leaderboard")
  }

  async function handleUpdatePicks() {
    if (locked) return
    if (!GROUPS.every(g => myPicks[g.id])) { showToast("Please pick one golfer from each group!"); return }
    const picksArray = GROUPS.map(g => myPicks[g.id])
    await savePlayer(myName, picksArray)
    await refresh()
    showToast("Picks updated! ✓")
    setTab("leaderboard")
  }

  function openPicksScreen() {
    const existing = allPlayers.find(p => p.name === myName)
    if (existing) {
      const picks = JSON.parse(existing.picks || "[]")
      const pickMap = {}
      GROUPS.forEach((g, i) => { if (picks[i]) pickMap[g.id] = picks[i] })
      setMyPicks(pickMap)
    }
    setTab("picks")
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

  const allGolfersSorted = ALL_GOLFERS
    .map(name => ({ name, score: scores[name], total: golferVsPar(scores[name]), madeCut: scores[name]?.made_cut ?? null }))
    .sort((a, b) => {
      if (a.total === null && b.total === null) return 0
      if (a.total === null) return 1
      if (b.total === null) return -1
      return a.total - b.total
    })

  if (loading) return <><GS /><div style={S.spinner}>LOADING…</div></>

  // ── REGISTER ──
  if (tab === "register" || tab === "picks") {
    const isEditing = tab === "picks"
    return (
      <div style={S.root}>
        <GS />
        <div style={{ textAlign: "center", padding: "16px 20px 12px", borderBottom: "1px solid #1e3a2a", background: "linear-gradient(135deg, #0f1a0f 0%, #0a1a2e 50%, #1a0f0a 100%)" }}>
          <img src="/logo.png" alt="The Open Championship 2026" style={{ maxHeight: 70, objectFit: "contain" }} />
          <h2 style={{ ...S.pageTitle, marginTop: 8 }}>{isEditing ? "EDIT YOUR PICKS" : "REGISTER & PICK"}</h2>
        </div>
        <div style={{ ...S.section, paddingTop: 20 }}>
          {!isEditing && (
            <div style={{ marginBottom: 20 }}>
              <label style={S.label}>Your Name</label>
              <input style={S.input} value={nameInput} onChange={e => setNameInput(e.target.value)} placeholder="e.g. Jiz" />
            </div>
          )}
          <p style={{ fontSize: 13, color: "#86a08f", marginBottom: 16 }}>Pick one golfer from each group. Picks lock on July 16 at 6am BST.</p>
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
                    style={{ ...S.golferRow, ...(selected ? S.golferRowSelected : {}), borderBottom: idx === group.golfers.length - 1 ? "none" : "1px solid #1e3a2a" }}
                    onClick={() => !locked && setMyPicks(prev => ({ ...prev, [group.id]: golfer }))}>
                    <div style={{ ...S.golferRadio, ...(selected ? S.golferRadioSelected : {}) }}>
                      {selected && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#052e16" }} />}
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
            <button style={S.btnSmall} onClick={() => setTab("leaderboard")}>← Back</button>
          </div>
        </div>
        <Toast msg={toast} />
      </div>
    )
  }

  // ── MAIN APP ──
  return (
    <div style={S.root}>
      <GS />
      <div style={{ textAlign: "center", padding: "20px 20px 16px", borderBottom: "1px solid #1e3a2a", background: "linear-gradient(135deg, #0f1a0f 0%, #0a1a2e 50%, #1a0f0a 100%)" }}>
        <img src="/logo.png" alt="The Open Championship 2026" style={{ maxWidth: "100%", height: "auto", maxHeight: 120, objectFit: "contain" }} />
      </div>

      {/* Nav tabs */}
      <div style={S.navTabs}>
        <button style={{ ...S.navTab, ...(tab === "leaderboard" ? S.navTabActive : {}) }} onClick={() => setTab("leaderboard")}>🏆 Leaderboard</button>
        <button style={{ ...S.navTab, ...(tab === "allgolfers" ? S.navTabActive : {}) }} onClick={() => setTab("allgolfers")}>⛳ All Golfers</button>
        <button style={{ ...S.navTab, ...(tab === "scores" ? S.navTabActive : {}) }} onClick={() => setTab("scores")}>📝 Scores</button>
        {myName && <button style={{ ...S.navTab, ...(tab === "mypicks" ? S.navTabActive : {}) }} onClick={() => setTab("mypicks")}>👤 {myName}</button>}
        <button style={{ ...S.navTab, ...(tab === "register" || tab === "picks" ? S.navTabActive : {}) }} onClick={() => { if (myName) { openPicksScreen() } else { setTab("register") } }}>✏️ {locked ? "🔒 Picks Locked" : myName ? "Change Picks" : "Register"}</button>
      </div>

      <div style={{ padding: "0 20px" }}>

        {/* ── LEADERBOARD TAB ── */}
        {tab === "leaderboard" && (
          <>
            <div style={{ ...S.sectionTitle, paddingTop: 12 }}>🏆 LEADERBOARD</div>
            <div style={S.sectionSub}>Lowest score vs par wins</div>
            {leaderboard.length === 0 && (
              <div style={{ ...S.card, textAlign: "center", color: "#64748b", padding: 32 }}>
                No players registered yet — be the first!
              </div>
            )}
            {leaderboard.map((player, i) => (
              <div key={player.name} style={{ ...S.leaderRow, ...(i === 0 && player.total !== null ? S.leaderRowLead : {}) }}>
                <div style={S.leaderTop}>
                  <div style={{ ...S.rankBadge, ...(i === 0 && player.total !== null ? S.rankBadgeLead : {}) }}>{i + 1}</div>
                  <div style={S.playerName}>{player.name} {player.name === myName ? "👤" : ""}</div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ ...S.totalScore, color: scoreColor(player.total) }}>{player.total !== null ? formatVsPar(player.total) : "–"}</div>
                    <div style={S.totalLabel}>total</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", paddingTop: 8, borderTop: "1px solid #1e3a2a" }}>
                  {player.picks.map(name => {
                    const s = scores[name]
                    const vp = golferVsPar(s)
                    const cut = s && !s.made_cut
                    return (
                      <span key={name} style={{ fontSize: 12, color: "#94a3b8" }}>
                        <span style={{ textDecoration: cut ? "line-through" : "none", opacity: cut ? 0.6 : 1 }}>{name.split(" ").pop()}</span>
                        {" "}
                        <span style={{ fontWeight: 700, color: scoreColor(vp) }}>{vp !== null ? formatVsPar(vp) : "–"}</span>
                      </span>
                    )
                  })}
                </div>
              </div>
            ))}

            {/* Sync button */}
            <div style={{ textAlign: "center", marginTop: 8, paddingBottom: 16 }}>
              <button style={{ ...S.btnSmall, borderColor: syncing ? "#334155" : "#4ade8044", color: syncing ? "#475569" : "#4ade80" }}
                onClick={handleSync} disabled={syncing}>
                {syncing ? "⏳ Syncing…" : "🔄 Sync Scores"}
              </button>
            </div>
            {syncMsg && <div style={{ textAlign: "center", fontSize: 12, color: "#4ade80", marginBottom: 12 }}>{syncMsg}</div>}

            {/* Scoring rules */}
            <div style={S.infoBox}>
              <div style={S.infoTitle}>📐 HOW SCORING WORKS</div>
              <div style={S.infoRow}>Each player picks 1 golfer from each of the 5 groups (based on betting odds tiers).</div>
              <div style={S.infoRow}>Your score = the sum of all 5 golfers' scores vs par (Royal Birkdale par 70).</div>
              <div style={S.infoRow}>Lowest score wins — most under par wins!</div>
              <div style={S.infoRow}>If one of your golfers misses the cut, their Round 3 & 4 scores are replaced with the <strong style={{ color: "#f87171" }}>worst</strong> Round 3 / Round 4 scores vs par among all golfers selected by anyone in the game who made the cut.</div>
            </div>
          </>
        )}

        {/* ── ALL GOLFERS TAB ── */}
        {tab === "allgolfers" && (
          <>
            <div style={{ ...S.sectionTitle, paddingTop: 12 }}>⛳ ALL GOLFERS</div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingRight: 4, marginBottom: 8 }}>
              {["R1","R2","R3","R4","TOT"].map(l => (
                <span key={l} style={{ minWidth: l === "TOT" ? 32 : 22, textAlign: "center", fontSize: 11, color: "#64748b" }}>{l}</span>
              ))}
            </div>
            {GROUPS.map(group => {
              const groupGolfers = group.golfers
                .map(name => {
                  const score = scores[name]
                  const total = golferVsPar(score)
                  return { name, score, total, madeCut: score?.made_cut ?? null }
                })
                .sort((a, b) => {
                  if (a.total === null && b.total === null) return 0
                  if (a.total === null) return 1
                  if (b.total === null) return -1
                  return a.total - b.total
                })
              return (
                <div key={group.id} style={{ marginBottom: 16 }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, letterSpacing: 1, color: "#4ade80", padding: "6px 0 4px", borderBottom: "1px solid #1e3a2a", marginBottom: 4 }}>
                    {group.name}
                  </div>
                  {groupGolfers.map(g => {
                    const cut = g.madeCut === false
                    return (
                      <div key={g.name} style={S.allGolferRow}>
                        <span style={{ ...S.allGolferName, color: cut ? "#f87171" : "#e2e8f0", textDecoration: cut ? "line-through" : "none" }}>{g.name}</span>
                        {cut && <span style={{ fontSize: 10, color: "#f87171", marginRight: 4 }}>CUT</span>}
                        {[1,2,3,4].map(r => {
                          const rs = g.score ? g.score[`r${r}`] : null
                          const vp = rs != null ? rs - PAR : null
                          return <span key={r} style={{ ...S.allGolferRound, color: scoreColor(vp) }}>{vp != null ? formatVsPar(vp) : "–"}</span>
                        })}
                        <span style={{ ...S.allGolferTotal, color: scoreColor(g.total) }}>{g.total != null ? formatVsPar(g.total) : "–"}</span>
                      </div>
                    )
                  })}
                </div>
              )
            })}
            <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
              <button style={S.btnSmall} onClick={() => setTab("leaderboard")}>← Back</button>
            </div>
          </>
        )}

        {/* ── SCORES ENTRY TAB ── */}
        {tab === "scores" && (
          <>
            <div style={{ ...S.sectionTitle, paddingTop: 12 }}>📝 ENTER SCORES</div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>Enter round scores (total strokes) for each golfer. Par 70.</div>
            {GROUPS.map(group => (
              <div key={group.id} style={{ marginBottom: 16 }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, letterSpacing: 1, color: "#4ade80", padding: "6px 0 4px", borderBottom: "1px solid #1e3a2a", marginBottom: 6 }}>
                  {group.name}
                </div>
                {group.golfers.map(name => {
                  const s = scores[name] || {}
                  const inp = scoreInputs[name] || {}
                  return (
                    <div key={name} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      <span style={{ flex: 1, fontSize: 12, color: "#cbd5e1" }}>{name}</span>
                      {[1,2,3,4].map(r => (
                        <div key={r} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                          <input
                            type="number" min="55" max="100"
                            style={{ width: 36, height: 30, textAlign: "center", background: "#1e293b", border: "1px solid #334155", borderRadius: 4, color: "#fff", fontSize: 13 }}
                            value={inp[`r${r}`] !== undefined ? inp[`r${r}`] : (s[`r${r}`] ?? "")}
                            onChange={e => setScoreInputs(prev => ({ ...prev, [name]: { ...prev[name], [`r${r}`]: e.target.value } }))}
                            placeholder={`R${r}`}
                          />
                        </div>
                      ))}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                        <select
                          style={{ width: 44, height: 30, background: "#1e293b", border: "1px solid #334155", borderRadius: 4, color: inp.cut !== undefined ? (inp.cut === "cut" ? "#f87171" : "#4ade80") : (s.made_cut === false ? "#f87171" : "#64748b"), fontSize: 10 }}
                          value={inp.cut !== undefined ? inp.cut : (s.made_cut === false ? "cut" : "in")}
                          onChange={e => setScoreInputs(prev => ({ ...prev, [name]: { ...prev[name], cut: e.target.value } }))}>
                          <option value="in">✓</option>
                          <option value="cut">✂</option>
                        </select>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
            <button style={{ ...S.btnPrimary, marginTop: 8, marginBottom: 16 }} onClick={async () => {
              for (const name of ALL_GOLFERS) {
                const inp = scoreInputs[name]
                if (!inp || Object.keys(inp).length === 0) continue
                const existing = scores[name] || {}
                await supabase.from("golf_scores").upsert({
                  golfer_name: name,
                  r1: inp.r1 !== undefined ? (inp.r1 === "" ? null : parseInt(inp.r1)) : (existing.r1 ?? null),
                  r2: inp.r2 !== undefined ? (inp.r2 === "" ? null : parseInt(inp.r2)) : (existing.r2 ?? null),
                  r3: inp.r3 !== undefined ? (inp.r3 === "" ? null : parseInt(inp.r3)) : (existing.r3 ?? null),
                  r4: inp.r4 !== undefined ? (inp.r4 === "" ? null : parseInt(inp.r4)) : (existing.r4 ?? null),
                  made_cut: inp.cut !== undefined ? inp.cut !== "cut" : (existing.made_cut ?? true),
                  updated_at: new Date().toISOString(),
                }, { onConflict: "golfer_name" })
              }
              await refresh()
              setScoreInputs({})
              showToast("Scores saved ✓")
            }}>
              💾 Save All Scores
            </button>
          </>
        )}
        {tab === "mypicks" && myName && (
          <>
            <div style={{ ...S.sectionTitle, paddingTop: 12 }}>👤 {myName.toUpperCase()}'S PICKS</div>
            {(() => {
              const myData = allPlayers.find(p => p.name === myName)
              const myPicksArr = myData ? JSON.parse(myData.picks || "[]") : []
              const myTotal = playerTotalVsPar(myPicksArr, scores, allPlayers)
              return (
                <>
                  <div style={{ ...S.card, marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <span style={{ fontSize: 13, color: "#86a08f" }}>Your total vs par</span>
                      <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, color: scoreColor(myTotal) }}>{myTotal !== null ? formatVsPar(myTotal) : "–"}</span>
                    </div>
                    {myPicksArr.map((name, i) => {
                      const s = scores[name]
                      const vp = golferVsPar(s)
                      const cut = s && !s.made_cut
                      return (
                        <div key={name} style={S.golferLine}>
                          <span style={{ fontSize: 10, color: "#64748b", marginRight: 6 }}>G{i + 1}</span>
                          <span style={{ ...S.golferLineName, ...(cut ? S.golferLineCut : {}) }}>{name}</span>
                          {cut && <span style={S.cutBadge}>✂ CUT</span>}
                          {s && (
                            <span style={{ display: "flex", gap: 6, marginRight: 8 }}>
                              {[1,2,3,4].map(r => {
                                const rs = s[`r${r}`]
                                const rvp = rs != null ? rs - PAR : null
                                return <span key={r} style={{ fontSize: 11, color: scoreColor(rvp), minWidth: 22, textAlign: "center" }}>{rvp != null ? formatVsPar(rvp) : "–"}</span>
                              })}
                            </span>
                          )}
                          <span style={{ ...S.golferLineScore, color: scoreColor(vp) }}>{vp !== null ? formatVsPar(vp) : "–"}</span>
                        </div>
                      )
                    })}
                  </div>
                  {!locked && (
                    <button style={S.btnPrimary} onClick={openPicksScreen}>✏️ Edit My Picks</button>
                  )}
                  {locked && <div style={{ ...S.card, textAlign: "center", color: "#f59e0b" }}>🔒 Picks locked — tournament underway</div>}
                  <div style={{ marginTop: 12, textAlign: "center" }}>
                    <button style={S.btnSmall} onClick={() => { setMyName(""); localStorage.removeItem("open2026_name") }}>Switch Player</button>
                  </div>
                </>
              )
            })()}
          </>
        )}

      </div>
      <Toast msg={toast} />
    </div>
  )
}
