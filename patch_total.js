const fs = require('fs');
let content = fs.readFileSync('ui/index.html', 'utf8');

// I need to fix the JS in index.html to have the complete logic since the previous regex
// replacement added a literal string block with some missing bits depending on how it interpreted escape sequences

content = content.replace(/function renderTokenWaterfall\([\s\S]*?<\/div>\s*`;\n}/m, `function renderTokenWaterfall(steps) {
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
}`);

fs.writeFileSync('ui/index.html', content);
