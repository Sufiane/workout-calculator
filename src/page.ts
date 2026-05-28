export const PAGE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Workout Calculator</title>
<style>
  :root {
    --bg: #0f1115;
    --card: #1a1d24;
    --line: #2a2e38;
    --text: #e7e9ee;
    --muted: #8b909c;
    --accent: #4f8cff;
    --input-bg: #0f1115;
  }
  :root[data-theme="light"] {
    --bg: #f4f5f7;
    --card: #ffffff;
    --line: #e2e5ea;
    --text: #1a1d24;
    --muted: #6b7280;
    --accent: #2f6fed;
    --input-bg: #f4f5f7;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: var(--bg);
    color: var(--text);
    display: flex;
    justify-content: center;
    padding: 32px 16px;
  }
  main { width: 100%; max-width: 540px; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  p.sub { color: var(--muted); margin: 0 0 24px; font-size: 14px; }
  .card {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
  }
  label { display: block; font-size: 13px; color: var(--muted); margin-bottom: 6px; }
  select, input {
    width: 100%;
    padding: 10px 12px;
    background: var(--input-bg);
    border: 1px solid var(--line);
    border-radius: 8px;
    color: var(--text);
    font-size: 15px;
  }
  .row { display: flex; gap: 12px; margin-bottom: 14px; }
  .row > div { flex: 1; }
  button {
    width: 100%;
    padding: 11px;
    background: var(--accent);
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
  }
  button:active { transform: translateY(1px); }
  .error { color: #ff6b6b; font-size: 14px; margin-top: 12px; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .metric {
    background: var(--input-bg);
    border: 1px solid var(--line);
    border-radius: 8px;
    padding: 12px;
    text-align: center;
  }
  .metric .k { font-size: 12px; color: var(--muted); }
  .metric .v { font-size: 20px; font-weight: 700; margin-top: 4px; }
  h2 { font-size: 15px; margin: 0 0 12px; }
  .entry {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-top: 1px solid var(--line);
    font-size: 14px;
  }
  .entry:first-of-type { border-top: none; }
  .entry .when { color: var(--muted); font-size: 12px; }
  .empty { color: var(--muted); font-size: 14px; }
  .hidden { display: none; }
  .head { display: flex; justify-content: space-between; align-items: flex-start; }
  .theme-toggle {
    width: auto;
    padding: 7px 12px;
    background: var(--card);
    color: var(--text);
    border: 1px solid var(--line);
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
  }
  #chart { position: relative; }
  #chart svg { display: block; width: 100%; height: auto; }
  .tooltip {
    position: absolute;
    pointer-events: none;
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 8px;
    padding: 8px 10px;
    font-size: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
    z-index: 2;
    min-width: 120px;
  }
  .tooltip .tt-date { color: var(--muted); margin-bottom: 6px; }
  .tt-row { display: flex; align-items: center; gap: 6px; }
  .tt-row .tt-val { margin-left: auto; font-weight: 600; }
  .legend { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 12px; }
  .legend span { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: var(--muted); }
  .legend .dot { width: 10px; height: 10px; border-radius: 50%; }
  .btn-secondary {
    margin-top: 16px;
    background: transparent;
    color: var(--accent);
    border: 1px solid var(--accent);
  }
  .hint { display: block; margin-top: 6px; font-size: 12px; color: var(--muted); line-height: 1.4; }
  .delta { font-size: 12px; font-weight: 600; }
  .delta.up { color: #22c55e; }
  .delta.down { color: #ef4444; }
  .delta.flat { color: var(--muted); }
</style>
</head>
<body>
<main>
  <div class="head">
    <div>
      <h1>Workout Calculator</h1>
      <p class="sub">Enter any one value and get your full bench program.</p>
    </div>
    <button id="theme-toggle" class="theme-toggle" type="button">Light</button>
  </div>

  <div class="card">
    <form id="calc-form">
      <div class="row">
        <div>
          <label for="input-key">I know my</label>
          <select id="input-key">
            <option value="maxRm">1 rep max</option>
            <option value="max90">90% of max</option>
            <option value="rep95">5x1 (rep95)</option>
            <option value="rep90">5x3 (rep90)</option>
            <option value="rep85">5x5 (rep85)</option>
          </select>
          <small id="key-hint" class="hint"></small>
        </div>
        <div>
          <label for="input-value">Weight (kg)</label>
          <input id="input-value" type="number" step="0.5" min="0" placeholder="100" />
        </div>
      </div>
      <button type="submit">Calculate</button>
      <div id="error" class="error hidden"></div>
    </form>
  </div>

  <div id="result-card" class="card hidden">
    <h2>Your program</h2>
    <div class="grid" id="result-grid"></div>
    <button id="use-next" class="btn-secondary" type="button"></button>
  </div>

  <div class="card">
    <h2>Progression</h2>
    <div id="chart">
      <div id="chart-svg"></div>
      <div id="tooltip" class="tooltip hidden"></div>
    </div>
    <div class="legend" id="legend"></div>
  </div>

  <div class="card">
    <h2>Previous calculations</h2>
    <div id="history"></div>
  </div>
</main>

<script>
  const STORAGE_KEY = 'workout-history';
  const FIELDS = [
    ['maxRm', '1RM'],
    ['max90', 'Max 90%'],
    ['rep85', '5x5'],
    ['rep90', '5x3'],
    ['rep95', '5x1'],
    ['nextMax90', 'Next 90%'],
  ];
  const SERIES = [
    { key: 'maxRm', label: '1RM', color: '#4f8cff' },
    { key: 'max90', label: '90%', color: '#22c55e' },
    { key: 'rep95', label: '5x1', color: '#f59e0b' },
    { key: 'rep90', label: '5x3', color: '#ef4444' },
    { key: 'rep85', label: '5x5', color: '#a855f7' },
  ];

  const THEME_KEY = 'workout-theme';
  const themeToggle = document.getElementById('theme-toggle');

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    themeToggle.textContent = theme === 'light' ? 'Dark' : 'Light';
  }

  applyTheme(localStorage.getItem(THEME_KEY) || 'dark');

  themeToggle.addEventListener('click', function () {
    const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  });

  const form = document.getElementById('calc-form');
  const errorBox = document.getElementById('error');
  const resultCard = document.getElementById('result-card');
  const resultGrid = document.getElementById('result-grid');
  const historyBox = document.getElementById('history');
  const chartBox = document.getElementById('chart');
  const svgBox = document.getElementById('chart-svg');
  const tooltipBox = document.getElementById('tooltip');
  const legendBox = document.getElementById('legend');
  const useNextButton = document.getElementById('use-next');
  const inputKey = document.getElementById('input-key');
  const inputValue = document.getElementById('input-value');
  const keyHint = document.getElementById('key-hint');

  const HINTS = {
    maxRm: 'The most weight you can lift for a single rep.',
    max90: '90% of your 1 rep max.',
    rep95: 'Top weight you can push for 5x1 (singles).',
    rep90: 'Top weight you can push for 5x3 (triples).',
    rep85: 'Top weight you can push for 5x5.',
  };

  function updateHint() {
    keyHint.textContent = HINTS[inputKey.value];
  }

  inputKey.addEventListener('change', updateHint);
  updateHint();

  useNextButton.addEventListener('click', function () {
    inputKey.value = 'max90';
    inputValue.value = useNextButton.dataset.value;
    form.requestSubmit();
  });

  function renderChart(entries) {
    const ordered = (entries || []).slice().reverse();

    if (ordered.length === 0) {
      svgBox.innerHTML = '<div class="empty">No data yet.</div>';
      legendBox.innerHTML = '';
      return;
    }

    const width = 540;
    const height = 260;
    const left = 44;
    const right = 16;
    const top = 16;
    const bottom = 36;
    const plotW = width - left - right;
    const plotH = height - top - bottom;

    let min = Infinity;
    let max = -Infinity;
    ordered.forEach(function (entry) {
      SERIES.forEach(function (series) {
        const value = entry.program[series.key];
        min = Math.min(min, value);
        max = Math.max(max, value);
      });
    });

    const pad = max === min ? 2.5 : (max - min) * 0.1;
    const minP = min - pad;
    const maxP = max + pad;

    function xFor(index) {
      if (ordered.length === 1) {
        return left + plotW / 2;
      }
      return left + (index / (ordered.length - 1)) * plotW;
    }

    function yFor(value) {
      return top + (1 - (value - minP) / (maxP - minP)) * plotH;
    }

    function shortDate(iso) {
      const date = new Date(iso);
      return (date.getMonth() + 1) + '/' + date.getDate();
    }

    let svg = '<svg viewBox="0 0 ' + width + ' ' + height + '" role="img">';

    [maxP, (maxP + minP) / 2, minP].forEach(function (value) {
      const yPos = yFor(value);
      svg += '<line x1="' + left + '" y1="' + yPos + '" x2="' + (width - right) + '" y2="' + yPos + '" stroke="var(--line)" stroke-width="1" />';
      svg += '<text x="' + (left - 6) + '" y="' + (yPos + 4) + '" fill="var(--muted)" font-size="11" text-anchor="end">' + Math.round(value) + '</text>';
    });

    const xTicks = ordered.length === 1 ? [0] : [0, Math.floor((ordered.length - 1) / 2), ordered.length - 1];
    xTicks.forEach(function (index, position) {
      const anchor = position === 0 ? 'start' : position === xTicks.length - 1 ? 'end' : 'middle';
      svg += '<text x="' + xFor(index) + '" y="' + (height - 12) + '" fill="var(--muted)" font-size="11" text-anchor="' + anchor + '">' + shortDate(ordered[index].createdAt) + '</text>';
    });

    SERIES.forEach(function (series) {
      const points = ordered
        .map(function (entry, index) {
          return xFor(index) + ',' + yFor(entry.program[series.key]);
        })
        .join(' ');

      if (ordered.length > 1) {
        svg += '<polyline fill="none" stroke="' + series.color + '" stroke-width="2" points="' + points + '" />';
      }

      ordered.forEach(function (entry, index) {
        const isLast = index === ordered.length - 1;
        const radius = isLast ? 6 : 3;
        const extra = isLast ? ' stroke="var(--card)" stroke-width="2"' : '';
        svg += '<circle cx="' + xFor(index) + '" cy="' + yFor(entry.program[series.key]) + '" r="' + radius + '" fill="' + series.color + '"' + extra + ' />';
      });
    });

    const step = ordered.length === 1 ? plotW : plotW / (ordered.length - 1);
    ordered.forEach(function (entry, index) {
      const colX = xFor(index) - step / 2;
      svg += '<rect class="hit" data-index="' + index + '" x="' + colX + '" y="' + top + '" width="' + step + '" height="' + plotH + '" fill="transparent" />';
    });

    svg += '</svg>';
    svgBox.innerHTML = svg;

    legendBox.innerHTML = SERIES
      .map(function (series) {
        return '<span><span class="dot" style="background:' + series.color + '"></span>' + series.label + '</span>';
      })
      .join('');

    function showTooltip(event, index) {
      const entry = ordered[index];
      const when = new Date(entry.createdAt).toLocaleString();
      const rows = SERIES
        .map(function (series) {
          return '<div class="tt-row"><span class="dot" style="background:' + series.color + '"></span>' + series.label + '<span class="tt-val">' + entry.program[series.key] + '</span></div>';
        })
        .join('');
      tooltipBox.innerHTML = '<div class="tt-date">' + when + '</div>' + rows;
      tooltipBox.classList.remove('hidden');

      const bounds = chartBox.getBoundingClientRect();
      let posX = event.clientX - bounds.left + 12;
      const posY = event.clientY - bounds.top + 12;

      if (posX + tooltipBox.offsetWidth > bounds.width) {
        posX = event.clientX - bounds.left - tooltipBox.offsetWidth - 12;
      }

      tooltipBox.style.left = posX + 'px';
      tooltipBox.style.top = posY + 'px';
    }

    Array.prototype.forEach.call(svgBox.querySelectorAll('.hit'), function (rect) {
      const index = Number(rect.getAttribute('data-index'));
      rect.addEventListener('mousemove', function (event) {
        showTooltip(event, index);
      });
      rect.addEventListener('mouseleave', function () {
        tooltipBox.classList.add('hidden');
      });
    });
  }

  function showError(message) {
    errorBox.textContent = message;
    errorBox.classList.remove('hidden');
  }

  function clearError() {
    errorBox.textContent = '';
    errorBox.classList.add('hidden');
  }

  function renderResult(program) {
    resultGrid.innerHTML = FIELDS
      .map(function (field) {
        return '<div class="metric"><div class="k">' + field[1] + '</div><div class="v">' + program[field[0]] + '</div></div>';
      })
      .join('');
    useNextButton.textContent = 'Use next 90% (' + program.nextMax90 + ' kg)';
    useNextButton.dataset.value = program.nextMax90;
    resultCard.classList.remove('hidden');
  }

  function renderHistory(entries) {
    if (!entries || entries.length === 0) {
      historyBox.innerHTML = '<div class="empty">No previous calculations yet.</div>';
      return;
    }

    historyBox.innerHTML = entries
      .map(function (entry, index) {
        const when = new Date(entry.createdAt).toLocaleString();
        const summary = '1RM ' + entry.program.maxRm + ' · 90% ' + entry.program.max90;
        const older = entries[index + 1];
        let delta = '';

        if (older) {
          const diff = entry.program.maxRm - older.program.maxRm;
          const direction = diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat';
          const sign = diff > 0 ? '+' : '';
          delta = ' <span class="delta ' + direction + '">' + sign + diff + '</span>';
        }

        return '<div class="entry"><span>' + summary + delta + '</span><span class="when">' + when + '</span></div>';
      })
      .join('');
  }

  async function loadHistory() {
    try {
      const response = await fetch('/api/history');
      const entries = await response.json();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      renderHistory(entries);
      renderChart(entries);
    } catch (error) {
      const cached = localStorage.getItem(STORAGE_KEY);
      const entries = cached ? JSON.parse(cached) : [];
      renderHistory(entries);
      renderChart(entries);
    }
  }

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    clearError();

    const key = document.getElementById('input-key').value;
    const value = document.getElementById('input-value').value;

    if (value === '') {
      showError('Please enter a value.');
      return;
    }

    try {
      const response = await fetch('/api/program?' + key + '=' + encodeURIComponent(value));
      const body = await response.json();

      if (!response.ok) {
        showError(body.error || 'Something went wrong.');
        return;
      }

      renderResult(body);
      await loadHistory();
    } catch (error) {
      showError('Network error. Please try again.');
    }
  });

  loadHistory();
</script>
</body>
</html>`;
