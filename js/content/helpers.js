/* Shared helpers for book content. Each content part registers a function
 * (ctx) => [chapters] via BookContent.register(). The app calls
 * BookContent.build(track, os) to get the chapter list for
 * track 'excel' | 'sheets' and os 'win' | 'mac'.
 */
(function (root) {
  'use strict';
  const parts = [];

  // Mac equivalents that are NOT a simple Ctrl→⌘ / Alt→Option swap.
  // Sources: Microsoft "Keyboard shortcuts in Excel" (macOS tab) and
  // Google "Keyboard shortcuts for Google Sheets" (Mac column).
  const MAC_EXCEPTIONS = {
    excel: {
      'Alt+=': 'Cmd+Shift+T',          // AutoSum
      'F4': 'Cmd+T',                   // toggle $ (F4 also works on some Macs)
      'F12': 'Cmd+Shift+S',            // Save As
      'Ctrl+Alt+V': 'Cmd+Control+V',   // Paste Special
      'Ctrl+Shift+L': 'Cmd+Shift+F',   // toggle filter
      'Ctrl+H': 'Cmd+Shift+H',         // Replace (Cmd+H hides the app)
      'Ctrl+;': 'Control+;',           // today's date
      'Ctrl+`': 'Control+`',           // show formulas
      'Ctrl+Home': 'Control+Fn+←',     // go to A1 (Home key on a MacBook)
      'Ctrl+Page Down': 'Option+→',    // next sheet
      'Ctrl+Page Up': 'Option+←',      // previous sheet
      'Enter': 'Return',
    },
    sheets: {
      'F4': 'Fn+F4',
      'Ctrl+H': 'Cmd+Shift+H',
      'Ctrl+Home': 'Cmd+Fn+←',
      'Ctrl+Alt+M': 'Cmd+Option+M',
      'Alt+/': 'Option+/',
      'Enter': 'Return',
    },
  };
  const MAC_KEY = { Ctrl: 'Cmd', Alt: 'Option' };
  const LABEL = { Cmd: '⌘ Cmd', Option: '⌥ Option', Control: '⌃ Control', Shift: 'Shift', Fn: 'fn' };

  function shortcut(track, os, combo) {
    let keys;
    if (os === 'mac') {
      const ex = MAC_EXCEPTIONS[track][combo];
      keys = (ex || combo.split('+').map((x) => MAC_KEY[x] || x).join('+')).split('+');
      return keys.map((x) => `<kbd>${LABEL[x] || x}</kbd>`).join('+');
    }
    return combo.split('+').map((x) => `<kbd>${x}</kbd>`).join('+');
  }

  function makeCtx(track, os) {
    const X = track === 'excel';
    const M = os === 'mac';
    const ctx = {
      track, os, X, M,
      app: X ? 'Excel' : 'Google Sheets',
      platform: M ? 'Mac' : 'Windows',
      v: (excel, sheets) => (X ? excel : sheets),
      // Platform-aware shortcut: write the Windows combo, get the right keys.
      sc: (combo) => shortcut(track, os, combo),
      // Literal key(s), no platform mapping (for e.g. Tab, Esc, Delete).
      k: (...keys) => keys.map((x) => `<kbd>${x}</kbd>`).join('+'),
      path: (...p) => `<span class="menu-path">${p.join(' <span aria-hidden="true">›</span> ')}</span>`,
      tip: (html, title = 'Tip') => `<div class="callout tip"><div class="callout-t">💡 ${title}</div>${html}</div>`,
      note: (html, title = 'Note') => `<div class="callout note"><div class="callout-t">📝 ${title}</div>${html}</div>`,
      warn: (html, title = 'Watch out') => `<div class="callout warn"><div class="callout-t">⚠️ ${title}</div>${html}</div>`,
      diff: (html) => `<div class="callout diff"><div class="callout-t">🔀 ${X ? 'In Google Sheets' : 'In Excel'}</div>${html}</div>`,
      grid: (id) => `<div class="practice" data-grid="${id}"></div>`,
      quiz: (id) => `<div class="quiz" data-quiz="${id}"></div>`,
      code: (s) => `<code class="f">${s}</code>`,
      // One-line reminder of which keyboard the shortcuts are for
      kbNote: M
        ? `<span class="kb-note">Shortcuts are shown for <b>Mac</b>. ⌘ is the Command key next to the space bar.</span>`
        : `<span class="kb-note">Shortcuts are shown for <b>Windows</b>.</span>`,
      fNear: (g, a, x, tol) => g.isFormula(a) && g.near(a, x, tol),
      fText: (g, a, s) => g.isFormula(a) && g.eqText(a, s),
    };
    return ctx;
  }

  root.BookContent = {
    register(fn) { parts.push(fn); },
    build(track, os = 'win') {
      const ctx = makeCtx(track, os === 'mac' ? 'mac' : 'win');
      const chapters = [];
      parts.forEach((fn) => chapters.push(...fn(ctx)));
      return chapters;
    },
    shortcut,
  };
})(window);
