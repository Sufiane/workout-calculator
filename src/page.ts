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
    resultCard.classList.remove('hidden');
  }

  function renderHistory(entries) {
    if (!entries || entries.length === 0) {
      historyBox.innerHTML = '<div class="empty">No previous calculations yet.</div>';
      return;
    }

    historyBox.innerHTML = entries
      .map(function (entry) {
        const when = new Date(entry.createdAt).toLocaleString();
        const summary = '1RM ' + entry.program.maxRm + ' · 90% ' + entry.program.max90;
        return '<div class="entry"><span>' + summary + '</span><span class="when">' + when + '</span></div>';
      })
      .join('');
  }

  async function loadHistory() {
    try {
      const response = await fetch('/api/history');
      const entries = await response.json();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      renderHistory(entries);
    } catch (error) {
      const cached = localStorage.getItem(STORAGE_KEY);
      renderHistory(cached ? JSON.parse(cached) : []);
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
