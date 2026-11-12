/* Shared helpers for book content. Each content part registers a function
 * (ctx) => [chapters] via BookContent.register(). The app calls
 * BookContent.build(track) to get the chapter list for 'excel' or 'sheets'.
 */
(function (root) {
  'use strict';
  const parts = [];

  function makeCtx(track) {
    const X = track === 'excel';
    const ctx = {
      track,
      X,
      app: X ? 'Excel' : 'Google Sheets',
      v: (excel, sheets) => (X ? excel : sheets),
      k: (...keys) => keys.map((x) => `<kbd>${x}</kbd>`).join('+'),
      path: (...p) => `<span class="menu-path">${p.join(' <span aria-hidden="true">›</span> ')}</span>`,
      tip: (html, title = 'Tip') => `<div class="callout tip"><div class="callout-t">💡 ${title}</div>${html}</div>`,
      note: (html, title = 'Note') => `<div class="callout note"><div class="callout-t">📝 ${title}</div>${html}</div>`,
      warn: (html, title = 'Watch out') => `<div class="callout warn"><div class="callout-t">⚠️ ${title}</div>${html}</div>`,
      diff: (html) => `<div class="callout diff"><div class="callout-t">🔀 ${X ? 'In Google Sheets' : 'In Excel'}</div>${html}</div>`,
      grid: (id) => `<div class="practice" data-grid="${id}"></div>`,
      quiz: (id) => `<div class="quiz" data-quiz="${id}"></div>`,
      code: (s) => `<code class="f">${s}</code>`,
      mac: `<span class="mac-note">On a Mac, use <kbd>⌘ Cmd</kbd> where this book says <kbd>Ctrl</kbd>.</span>`,
      // Common check helpers
      fNear: (g, a, x, tol) => g.isFormula(a) && g.near(a, x, tol),
      fText: (g, a, s) => g.isFormula(a) && g.eqText(a, s),
    };
    return ctx;
  }

  root.BookContent = {
    register(fn) { parts.push(fn); },
    build(track) {
      const ctx = makeCtx(track);
      const chapters = [];
      parts.forEach((fn) => chapters.push(...fn(ctx)));
      return chapters;
    },
  };
})(window);
