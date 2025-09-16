// main.go
package main

import (
	"encoding/json"
	"html/template"
	"log"
	"net/http"
	"time"
)

var indexTmpl = template.Must(template.New("index").Parse(indexHTML))

func main() {
	http.HandleFunc("/", indexHandler)
	http.HandleFunc("/time", timeHandler)

	addr := ":8000"
	log.Printf("Starting server at %s — open http://localhost%s\n", addr, addr)
	if err := http.ListenAndServe(addr, nil); err != nil {
		log.Fatal(err)
	}
}

func indexHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	if err := indexTmpl.Execute(w, nil); err != nil {
		log.Println("template execute:", err)
	}
}

// timeHandler returns the server's current time in milliseconds since epoch (UTC).
// The client uses this to compute an offset and then render smoothly locally.
func timeHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	type resp struct {
		ServerUnixMs int64  `json:"server_unix_ms"`
		ISO          string `json:"iso"`
		UTCOffset    int   `json:"utc_offset_seconds"`
	}
	now := time.Now().UTC()
	js := resp{
		ServerUnixMs: now.UnixNano() / int64(time.Millisecond),
		ISO:          now.Format(time.RFC3339Nano),
		UTCOffset:    0,
	}
	_ = json.NewEncoder(w).Encode(js)
}

const indexHTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Time Display</title>
<style>
  :root{
    --bg: #0f1720;
    --card: #0b1220;
    --muted: #9aa4b2;
    --accent: #60a5fa;
    --accent-2: #7c3aed;
    --glass: rgba(255,255,255,0.03);
    color-scheme: dark;
  }
  html,body{height:100%;margin:0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial;}
  body{
    display:flex;align-items:center;justify-content:center;
    background: linear-gradient(180deg,#071126 0%, #051025 100%);
    color: #e6eef8;
    padding:24px;
  }
  .card{
    width: 680px;
    max-width:100%;
    background: linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 6px 30px rgba(2,6,23,0.6);
    backdrop-filter: blur(6px);
    display:grid; gap:14px;
  }
  .header{display:flex;align-items:center;justify-content:space-between;gap:12px;}
  .title{font-size:20px;font-weight:600;letter-spacing:0.2px}
  .subtitle{font-size:12px;color:var(--muted)}
  .display{
    display:flex;align-items:center;gap:20px;flex-wrap:wrap;
  }
  .clock{
    flex:1 1 320px;
    padding:18px;border-radius:10px;background:var(--glass);
    display:flex;align-items:center;justify-content:space-between;gap:12px;
  }
  .timeBig{font-variant-numeric:tabular-nums;font-size:44px;font-weight:700;}
  .meta{display:flex;flex-direction:column;gap:6px;align-items:flex-end;}
  .meta .tz{font-size:13px;color:var(--muted);}
  .controls{display:flex;gap:8px;flex-wrap:wrap;align-items:center;}
  .btn, select, input[type="text"]{
    background:transparent;border:1px solid rgba(255,255,255,0.06);padding:8px 10px;border-radius:8px;color:inherit;
    font-size:13px;
  }
  .btn:hover{border-color:rgba(255,255,255,0.12);cursor:pointer}
  .small{font-size:12px;color:var(--muted)}
  .options{display:flex;gap:8px;align-items:center;}
  .secondary{background:linear-gradient(90deg,var(--accent),var(--accent-2));border:none;color:white}
  footer.small{font-size:11px;color:var(--muted);text-align:right}
  @media (max-width:520px){ .meta{align-items:flex-start} .clock{flex-direction:column;align-items:flex-start} .timeBig{font-size:32px}}
</style>
</head>
<body>
  <main class="card" role="main" aria-labelledby="pageTitle">
    <div class="header">
      <div>
        <div id="pageTitle" class="title">Time display</div>
        <div class="subtitle">Server-synced, timezone-aware, 12/24 mode, optional seconds</div>
      </div>
      <div class="small">Server time sync endpoint: <code>/time</code></div>
    </div>

    <section class="display" aria-live="polite">
      <div class="clock" role="region" aria-label="Digital clock">
        <div>
          <div id="time" class="timeBig">--:--:--</div>
          <div id="date" class="small" style="margin-top:6px;color:var(--muted)">Loading…</div>
        </div>

        <div class="meta">
          <div class="tz" id="tzLabel">Zone: Local</div>
          <div class="controls" style="justify-content:flex-end">
            <button id="toggle12" class="btn" title="Toggle 12/24">12/24</button>
            <button id="toggleSeconds" class="btn" title="Toggle seconds">Seconds</button>
            <button id="copyBtn" class="btn" title="Copy time">Copy</button>
          </div>
        </div>
      </div>

      <div style="flex:0 1 260px;display:flex;flex-direction:column;gap:8px">
        <label class="small" for="tzSelect">Choose timezone</label>
        <select id="tzSelect" aria-label="Timezone chooser">
          <option value="local">Local</option>
          <option value="UTC">UTC</option>
          <option value="America/New_York">America/New_York</option>
          <option value="Europe/London">Europe/London</option>
          <option value="Asia/Tokyo">Asia/Tokyo</option>
        </select>

        <label class="small" for="customTz">Or enter IANA timezone (e.g. Europe/Berlin)</label>
        <input id="customTz" type="text" placeholder="Leave blank to use selected or local" />

        <div style="display:flex;gap:8px">
          <button id="applyTz" class="btn secondary">Apply</button>
          <button id="syncBtn" class="btn" title="Fetch server time">Sync now</button>
        </div>

        <div style="margin-top:8px" class="small">Hints: The client performs one fetch to /time to compute a clock offset. The UI then runs locally for smooth updates.</div>
      </div>
    </section>

    <footer class="small">Made with Go on the server and the Intl Date API in the browser.</footer>
  </main>

<script>
(() => {
  // Elements
  const timeEl = document.getElementById('time');
  const dateEl = document.getElementById('date');
  const tzLabel = document.getElementById('tzLabel');
  const tzSelect = document.getElementById('tzSelect');
  const customTz = document.getElementById('customTz');
  const applyTz = document.getElementById('applyTz');
  const syncBtn = document.getElementById('syncBtn');
  const toggle12 = document.getElementById('toggle12');
  const toggleSeconds = document.getElementById('toggleSeconds');
  const copyBtn = document.getElementById('copyBtn');

  // State
  let tz = 'local'; // 'local' or an IANA timezone string
  let use12 = false;
  let showSeconds = true;
  let offsetMs = 0; // server_time_ms - client_now_ms. Positive => server ahead.

  // Helper: fetch server time and compute offset
  async function syncServerTime() {
    try {
      syncBtn.disabled = true;
      syncBtn.textContent = 'Syncing...';
      const resp = await fetch('/time', {cache: 'no-store'});
      if (!resp.ok) throw new Error('bad response');
      const j = await resp.json();
      // server_unix_ms is milliseconds since epoch (UTC)
      const serverMs = Number(j.server_unix_ms);
      const nowMs = Date.now();
      offsetMs = serverMs - nowMs;
      console.log('Synced offset (ms):', offsetMs, 'serverISO:', j.iso);
      syncBtn.textContent = 'Synced';
      setTimeout(()=> syncBtn.textContent = 'Sync now', 1200);
    } catch (err) {
      console.error('Time sync failed:', err);
      syncBtn.textContent = 'Sync failed';
      setTimeout(()=> syncBtn.textContent = 'Sync now', 1200);
    } finally {
      syncBtn.disabled = false;
    }
  }

  // Format function using Intl
  function formatDate(d, tzName) {
    const opts = {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric',
      hour12: use12
    };
    if (tzName && tzName !== 'local') opts.timeZone = tzName;
    // produce two strings: time and date separated for layout
    const timeFmt = new Intl.DateTimeFormat(undefined, Object.assign({}, opts, {year: undefined, month: undefined, day: undefined}));
    const dateFmt = new Intl.DateTimeFormat(undefined, {year: 'numeric', month: 'long', day: 'numeric'});
    return {time: timeFmt.format(d), date: dateFmt.format(d)};
  }

  // Render loop
  function render() {
    const now = new Date(Date.now() + offsetMs);
    const zone = (tz && tz !== 'local') ? tz : undefined;
    const out = formatDate(now, zone);
    // Optionally hide seconds
    if (!showSeconds) {
      // remove :ss or seconds depending on locale formatting
      // We'll use a robust approach: create a date object with seconds forced to zero for display of hh:mm
      const truncated = new Date(now.getTime());
      truncated.setSeconds(0);
      const fmt = formatDate(truncated, zone).time;
      // If fmt has AM/PM we need to preserve it. Most locales put AM/PM at end.
      // We'll use the formatted time from truncated (which will show :00) and then strip :00.
      // Find ":00" or ".00" occurrences and remove them carefully.
      const cleaned = fmt.replace(/(:|\.|,)\s?00\b/, '').replace(/\s+0{1,2}\b/,'');
      timeEl.textContent = cleaned;
    } else {
      timeEl.textContent = out.time;
    }
    dateEl.textContent = out.date;
    tzLabel.textContent = 'Zone: ' + (tz === 'local' ? 'Local' : tz);
    requestAnimationFrame(render);
  }

  // Controls
  toggle12.addEventListener('click', ()=> {
    use12 = !use12;
    toggle12.textContent = use12 ? '12h' : '24h';
  });

  toggleSeconds.addEventListener('click', ()=> {
    showSeconds = !showSeconds;
    toggleSeconds.textContent = showSeconds ? 'Seconds' : 'No seconds';
  });

  applyTz.addEventListener('click', ()=> {
    const custom = customTz.value.trim();
    if (custom) {
      tz = custom;
    } else {
      tz = tzSelect.value || 'local';
    }
    // Immediately update label
    tzLabel.textContent = 'Zone: ' + (tz === 'local' ? 'Local' : tz);
  });

  syncBtn.addEventListener('click', ()=> syncServerTime());

  copyBtn.addEventListener('click', async ()=> {
    try {
      await navigator.clipboard.writeText(timeEl.textContent + ' ' + tzLabel.textContent);
      copyBtn.textContent = 'Copied!';
      setTimeout(()=> copyBtn.textContent = 'Copy', 900);
    } catch(e){
      console.warn('copy failed', e);
      copyBtn.textContent = 'Copy (failed)';
      setTimeout(()=> copyBtn.textContent = 'Copy', 900);
    }
  });

  // Initial sync and start render
  syncServerTime().finally(()=> requestAnimationFrame(render));

  // Keyboard shortcuts for power users
  window.addEventListener('keydown', (e) => {
    if (e.key === 's' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); syncServerTime(); }
    if (e.key === 't' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); toggle12.click(); }
  });
})();
</script>
</body>
</html>
`
