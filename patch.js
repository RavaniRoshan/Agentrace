const fs = require('fs');
const content = fs.readFileSync('ui/index.html', 'utf8');

const styleToInsert = `
  /* ── Token Waterfall Panel ── */
  .waterfall-panel {
    border-bottom: 1px solid var(--border);
    background: var(--bg1);
    flex-shrink: 0;
  }
  .waterfall-header {
    padding: 12px 24px;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text3);
    transition: background 0.15s;
  }
  .waterfall-header:hover {
    background: var(--bg2);
    color: var(--text);
  }
  .waterfall-header::before {
    content: '▶';
    font-size: 9px;
    transition: transform 0.2s;
  }
  .waterfall-panel.expanded .waterfall-header::before {
    transform: rotate(90deg);
  }
  .waterfall-content {
    display: none;
    padding: 0 24px 20px;
  }
  .waterfall-panel.expanded .waterfall-content {
    display: block;
  }
  .waterfall-row {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 8px;
  }
  .waterfall-label {
    width: 140px;
    font-size: 11px;
    font-family: var(--sans);
    font-weight: 600;
    color: var(--text2);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: right;
    flex-shrink: 0;
  }
  .waterfall-bar-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    height: 16px;
  }
  .waterfall-bar-in {
    background: #7c6af7;
    height: 100%;
    min-width: 2px;
  }
  .waterfall-bar-out {
    background: #3ecf8e;
    height: 100%;
    min-width: 2px;
  }
  .waterfall-val {
    margin-left: 8px;
    font-size: 10px;
    color: var(--text3);
    font-family: var(--mono);
    white-space: nowrap;
  }
  .waterfall-total-row {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px dashed var(--border2);
  }
  .waterfall-legend {
    display: flex;
    gap: 16px;
    margin-top: 12px;
    justify-content: flex-end;
    font-size: 10px;
    color: var(--text3);
  }
  .w-legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .w-legend-dot {
    width: 8px; height: 8px;
    border-radius: 2px;
  }
`;

const jsToInsert = `
function renderTokenWaterfall(steps) {
  if (!steps || !steps.length) return '';

  const tokenSteps = steps.filter(s => (s.tokens_in || 0) > 0 || (s.tokens_out || 0) > 0);
  if (tokenSteps.length === 0) return '';

  let maxTokens = 0;
  let totalIn = 0;
  let totalOut = 0;

  tokenSteps.forEach(s => {
    const tIn = s.tokens_in || 0;
    const tOut = s.tokens_out || 0;
    const tTotal = tIn + tOut;
    if (tTotal > maxTokens) maxTokens = tTotal;
    totalIn += tIn;
    totalOut += tOut;
  });

  if (maxTokens === 0) return '';

  let rowsHtml = tokenSteps.map(s => {
    const tIn = s.tokens_in || 0;
    const tOut = s.tokens_out || 0;
    const wIn = (tIn / maxTokens) * 100;
    const wOut = (tOut / maxTokens) * 100;

    return \\\`
      <div class="waterfall-row">
        <div class="waterfall-label" title="\\\${escapeHtml(s.name)}">\\\${escapeHtml(s.name)}</div>
        <div class="waterfall-bar-wrap">
          \\\${tIn > 0 ? \\\`<div class="waterfall-bar-in" style="width: \\\${wIn}%"></div>\\\` : ''}
          \\\${tOut > 0 ? \\\`<div class="waterfall-bar-out" style="width: \\\${wOut}%"></div>\\\` : ''}
          <div class="waterfall-val">\\\${(tIn + tOut).toLocaleString()} (\\\${tIn} in, \\\${tOut} out)</div>
        </div>
      </div>
    \\\`;
  }).join('');

  rowsHtml += \\\`
    <div class="waterfall-row waterfall-total-row">
      <div class="waterfall-label" style="color:var(--text)">TOTAL</div>
      <div class="waterfall-bar-wrap">
        <div class="waterfall-val" style="color:var(--text); font-weight:bold; margin-left:0">
          \\\${(totalIn + totalOut).toLocaleString()} (\\\${totalIn} in, \\\${totalOut} out)
        </div>
      </div>
    </div>
  \\\`;

  return \\\`
    <div class="waterfall-panel fade-in" id="waterfall-panel">
      <div class="waterfall-header" onclick="document.getElementById('waterfall-panel').classList.toggle('expanded')">
        Token Usage by Step
      </div>
      <div class="waterfall-content">
        \\\${rowsHtml}
        <div class="waterfall-legend">
          <div class="w-legend-item"><div class="w-legend-dot" style="background:#7c6af7"></div> Tokens In</div>
          <div class="w-legend-item"><div class="w-legend-dot" style="background:#3ecf8e"></div> Tokens Out</div>
        </div>
      </div>
    </div>
  \\\`;
}
`;

let newContent = content.replace('/* ── Loading ── */', styleToInsert + '\n  /* ── Loading ── */');
if (newContent === content) {
    // try placing it before /* ── Scrollbar global ── */
    newContent = content.replace('/* ── Scrollbar global ── */', styleToInsert + '\n  /* ── Scrollbar global ── */');
}

// insert js before renderCompare()
newContent = newContent.replace('function renderCompare() {', jsToInsert + '\nfunction renderCompare() {');

// modify renderTrace()
newContent = newContent.replace(
  '<div class="detail-panel" id="detail-panel">',
  '${renderTokenWaterfall(t.steps)}\n    <div class="detail-panel" id="detail-panel">'
);

fs.writeFileSync('ui/index.html', newContent);
console.log('done');
