<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>data.js — Copy Me</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#0d1117;color:#e2e8f0;font-family:-apple-system,sans-serif;padding:16px}
  h1{font-size:18px;margin-bottom:6px;color:#22c55e}
  button{background:#22c55e;color:#000;border:none;border-radius:8px;padding:12px 24px;font-size:16px;font-weight:700;cursor:pointer;width:100%;margin-bottom:12px}
  button.copied{background:#4ade80}
  textarea{width:100%;height:260px;background:#161b22;border:1px solid #30363d;border-radius:8px;color:#e2e8f0;font-family:monospace;font-size:11px;padding:10px;resize:none}
  .steps{background:#161b22;border:1px solid #30363d;border-radius:8px;padding:14px;margin-bottom:16px}
  .steps ol{padding-left:18px}
  .steps li{font-size:13px;color:#94a3b8;margin-bottom:6px;line-height:1.5}
  .steps li strong{color:#e2e8f0}
  .new{background:#1a2a1a;border:1px solid #22c55e44;border-radius:8px;padding:10px 14px;margin-bottom:16px;font-size:13px;color:#4ade80}
</style>
</head>
<body>
  <h1>data.js — Updated</h1>
  <div class="new">✨ Updated: correct 35 golfers · golfer scores on leaderboard · all golfers tab · scoring rules box · cut penalty logic</div>
  <div class="steps">
    <ol>
      <li>Tap <strong>Copy All Code</strong> below</li>
      <li>Go to <strong>GitHub → open2026-game → src/data.js</strong></li>
      <li>Tap the <strong>pencil ✏️</strong> to edit</li>
      <li>Tap in editor → <strong>Select All</strong> → <strong>Delete</strong></li>
      <li><strong>Paste</strong> the copied code</li>
      <li>Scroll down → <strong>Commit changes</strong> twice</li>
    </ol>
  </div>
  <button id="copyBtn" onclick="copyCode()">📋 Copy All Code</button>
  <textarea id="code" readonly></textarea>
  <script>
    const code = "// The Open Championship 2026 \u2014 Royal Birkdale\n// July 16-19, 2026\n\nexport const TOURNAMENT = {\n  name: \"The Open Championship 2026\",\n  venue: \"Royal Birkdale\",\n  dates: \"July 16\u201319, 2026\",\n  lockDate: \"2026-07-16\",\n}\n\nexport const GROUPS = [\n  {\n    id: 1,\n    name: \"Group 1 \u2014 Favourites\",\n    golfers: [\n      \"Scottie Scheffler\",\n      \"Rory McIlroy\",\n      \"Tommy Fleetwood\",\n      \"Jon Rahm\",\n      \"Xander Schauffele\",\n      \"Matt Fitzpatrick\",\n      \"Tyrrell Hatton\",\n    ],\n  },\n  {\n    id: 2,\n    name: \"Group 2 \u2014 Contenders\",\n    golfers: [\n      \"Collin Morikawa\",\n      \"Ludvig \u00c5berg\",\n      \"Cameron Young\",\n      \"Justin Rose\",\n      \"Viktor Hovland\",\n      \"Chris Gotterup\",\n      \"Wyndham Clark\",\n    ],\n  },\n  {\n    id: 3,\n    name: \"Group 3 \u2014 Each Way\",\n    golfers: [\n      \"Robert MacIntyre\",\n      \"Sam Burns\",\n      \"Hideki Matsuyama\",\n      \"Shane Lowry\",\n      \"Patrick Cantlay\",\n      \"Bryson DeChambeau\",\n      \"Joaquin Niemann\",\n    ],\n  },\n  {\n    id: 4,\n    name: \"Group 4 \u2014 Outsiders\",\n    golfers: [\n      \"Russell Henley\",\n      \"Jordan Spieth\",\n      \"Brian Harman\",\n      \"Brooks Koepka\",\n      \"Aaron Rai\",\n      \"Maverick McNealy\",\n      \"Patrick Reed\",\n    ],\n  },\n  {\n    id: 5,\n    name: \"Group 5 \u2014 Longshots\",\n    golfers: [\n      \"Sepp Straka\",\n      \"Rasmus Hojgaard\",\n      \"Justin Thomas\",\n      \"Keegan Bradley\",\n      \"Si Woo Kim\",\n      \"Tony Finau\",\n      \"Cameron Smith\",\n    ],\n  },\n]\n\nexport const ALL_GOLFERS = GROUPS.flatMap(g => g.golfers)\n\nexport function isPicsLocked() {\n  const lockTime = new Date(\"2026-07-16T05:00:00Z\")\n  return new Date() >= lockTime\n}\n";
    document.getElementById('code').value = code;
    function copyCode() {
      const btn = document.getElementById('copyBtn');
      navigator.clipboard.writeText(code).then(() => {
        btn.textContent = '✅ Copied!';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = '📋 Copy All Code'; btn.classList.remove('copied'); }, 3000);
      }).catch(() => {
        const ta = document.getElementById('code');
        ta.select();
        document.execCommand('copy');
        btn.textContent = '✅ Copied!';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = '📋 Copy All Code'; btn.classList.remove('copied'); }, 3000);
      });
    }
  </script>
</body>
</html>
