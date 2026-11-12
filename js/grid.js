/* Interactive practice grid built on SheetEngine.
 * new SheetGrid(container, config, { saved, onChange, onTasksChange })
 */
(function (root) {
  'use strict';
  const E = root.SheetEngine;
  const { addr, numToCol, colToNum, parseAddr, isErr } = E;

  const MONTHS_S = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const MONTHS_L = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const DAYS_S = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const DAYS_L = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const LISTS = [MONTHS_S, MONTHS_L, DAYS_S, DAYS_L];

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function formatValue(v, f) {
    if (v === null || v === undefined) return '';
    if (isErr(v)) return v.code;
    if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
    if (typeof v === 'number') {
      const nf = f && f.nf;
      if (!nf) {
        let s = E.formatGeneral(v);
        if (s.length > 12) s = String(parseFloat(v.toPrecision(8)));
        return s;
      }
      const d = f.d !== undefined ? f.d : nf === 'percent' ? 0 : 2;
      const opts = { minimumFractionDigits: d, maximumFractionDigits: d };
      if (nf === 'currency') return (v < 0 ? '-' : '') + '$' + Math.abs(v).toLocaleString('en-US', opts);
      if (nf === 'percent') return (v * 100).toLocaleString('en-US', opts) + '%';
      return v.toLocaleString('en-US', opts);
    }
    return String(v);
  }
  function decimalsOf(v) {
    const s = E.formatGeneral(v);
    const i = s.indexOf('.');
    return i < 0 ? 0 : s.length - i - 1;
  }

  class SheetGrid {
    constructor(container, config, opts = {}) {
      this.el = container;
      this.cfg = Object.assign({ rows: 8, cols: 5, tasks: [], toolbar: [] }, config);
      this.opts = opts;
      this.sheet = new E.Sheet(this.cfg.rows, this.cfg.cols);
      this.formats = {};
      this.history = [];
      this.clip = null;
      this.chartType = (this.cfg.chart && this.cfg.chart.type) || 'column';
      this.active = { col: 1, row: 1 };
      this.sel = { c1: 1, r1: 1, c2: 1, r2: 1 };
      this.editing = null; // { addr, original, source: 'cell'|'bar' }
      this.refInsert = null;
      this.taskState = [];
      this.loadInitial();
      if (opts.saved) this.restore(opts.saved);
      this.build();
      this.renderAll();
      this.checkTasks(true);
    }

    // ---------- Data ----------
    loadInitial() {
      const d = this.cfg.data || [];
      this.sheet.raw = {};
      if (Array.isArray(d)) {
        d.forEach((row, ri) => row.forEach((v, ci) => {
          if (v !== null && v !== undefined && v !== '') this.sheet.raw[addr(ci + 1, ri + 1)] = String(v);
        }));
      } else {
        Object.entries(d).forEach(([k, v]) => { this.sheet.raw[k.toUpperCase()] = String(v); });
      }
      this.formats = JSON.parse(JSON.stringify(this.cfg.formats || {}));
      this.chartType = (this.cfg.chart && this.cfg.chart.type) || 'column';
      this.sheet.invalidate();
    }
    snapshot() { return { raw: Object.assign({}, this.sheet.raw), formats: JSON.parse(JSON.stringify(this.formats)), chart: this.chartType }; }
    restore(s) {
      if (!s || !s.raw) return;
      this.sheet.raw = Object.assign({}, s.raw);
      this.formats = s.formats || {};
      if (s.chart) this.chartType = s.chart;
      this.sheet.invalidate();
    }
    pushHistory() {
      this.history.push(this.snapshot());
      if (this.history.length > 60) this.history.shift();
    }
    changed() {
      this.sheet.invalidate();
      this.renderAll();
      this.checkTasks();
      if (this.opts.onChange) this.opts.onChange(this.snapshot());
    }
    setCell(a, text) { this.sheet.setRaw(a, text); }

    // ---------- Build DOM ----------
    build() {
      const c = this.cfg;
      const tb = c.toolbar || [];
      const btn = (act, label, title) => `<button type="button" class="sg-btn" data-act="${act}" title="${esc(title)}" aria-label="${esc(title)}">${label}</button>`;
      let tools = '';
      if (tb.includes('format')) {
        tools += btn('bold', '<b>B</b>', 'Bold (Ctrl+B)') + btn('currency', '$', 'Currency format') +
          btn('percent', '%', 'Percent format') + btn('comma', ',', 'Number with thousands separator') +
          btn('decinc', '.0→.00', 'Increase decimals') + btn('decdec', '.00→.0', 'Decrease decimals') +
          btn('clearfmt', '⌫ fmt', 'Clear formatting');
      }
      if (tb.includes('sort')) {
        tools += '<span class="sg-sep"></span>' + btn('sortasc', 'A→Z', 'Sort ascending by the active column') + btn('sortdesc', 'Z→A', 'Sort descending by the active column');
      }
      tools += '<span class="sg-grow"></span>' + btn('undo', '↶ Undo', 'Undo (Ctrl+Z)') + btn('reset', '⟲ Reset', 'Reset this exercise');

      let head = '<tr><th class="sg-corner"></th>';
      for (let col = 1; col <= c.cols; col++) {
        const w = (c.colWidths && c.colWidths[numToCol(col)]) || 96;
        head += `<th class="sg-ch" data-col="${col}" style="width:${w}px;min-width:${w}px">${numToCol(col)}</th>`;
      }
      head += '</tr>';
      let body = '';
      for (let row = 1; row <= c.rows; row++) {
        body += `<tr><th class="sg-rh" data-row="${row}">${row}</th>`;
        for (let col = 1; col <= c.cols; col++) body += `<td data-a="${addr(col, row)}"></td>`;
        body += '</tr>';
      }

      this.el.classList.add('sg');
      this.el.innerHTML = `
        ${c.title ? `<div class="sg-title">${esc(c.title)}</div>` : ''}
        <div class="sg-toolbar">${tools}</div>
        <div class="sg-fbar">
          <span class="sg-name" aria-label="Name box">A1</span>
          <span class="sg-fx">fx</span>
          <input class="sg-finput" type="text" spellcheck="false" autocomplete="off" aria-label="Formula bar">
        </div>
        <div class="sg-scroll" tabindex="0" role="grid" aria-label="Practice spreadsheet">
          <table class="sg-table"><thead>${head}</thead><tbody>${body}</tbody></table>
          <div class="sg-selbox"><div class="sg-handle" title="Fill handle: drag to copy or continue a series"></div></div>
          <input class="sg-editor" type="text" spellcheck="false" autocomplete="off">
        </div>
        <div class="sg-status"></div>
        ${c.chart ? '<div class="sg-chart"></div>' : ''}
        ${c.tasks.length ? '<ol class="sg-tasks"></ol>' : ''}`;

      this.scroll = this.el.querySelector('.sg-scroll');
      this.table = this.el.querySelector('.sg-table');
      this.selbox = this.el.querySelector('.sg-selbox');
      this.handle = this.el.querySelector('.sg-handle');
      this.editor = this.el.querySelector('.sg-editor');
      this.fbar = this.el.querySelector('.sg-finput');
      this.namebox = this.el.querySelector('.sg-name');
      this.status = this.el.querySelector('.sg-status');
      this.chartEl = this.el.querySelector('.sg-chart');
      this.tasksEl = this.el.querySelector('.sg-tasks');
      this.cells = {};
      this.table.querySelectorAll('td').forEach((td) => { this.cells[td.dataset.a] = td; });

      this.bindEvents();
      this.buildTasks();
    }

    buildTasks() {
      if (!this.tasksEl) return;
      this.tasksEl.innerHTML = this.cfg.tasks.map((t, i) => `
        <li class="sg-task" data-i="${i}">
          <span class="sg-check" aria-hidden="true"></span>
          <div class="sg-task-body">
            <div class="sg-task-text">${t.text}</div>
            <div class="sg-task-actions">
              ${t.hint ? '<button type="button" class="link-btn" data-hint>Hint</button>' : ''}
              ${t.solution ? '<button type="button" class="link-btn" data-solve>Show me</button>' : ''}
            </div>
            <div class="sg-hint" hidden>${t.hint || ''}</div>
          </div>
        </li>`).join('');
      this.tasksEl.addEventListener('click', (e) => {
        const li = e.target.closest('.sg-task');
        if (!li) return;
        const t = this.cfg.tasks[+li.dataset.i];
        if (e.target.matches('[data-hint]')) {
          const h = li.querySelector('.sg-hint');
          h.hidden = !h.hidden;
        }
        if (e.target.matches('[data-solve]')) this.applySolution(t.solution);
      });
    }

    applySolution(sol) {
      this.pushHistory();
      if (sol.cells) Object.entries(sol.cells).forEach(([a, v]) => this.setCell(a, v));
      if (sol.formats) Object.entries(sol.formats).forEach(([a, f]) => { this.formats[a] = Object.assign({}, this.formats[a], f); });
      if (sol.sort) this.sortBy(colToNum(sol.sort.col), sol.sort.dir, true);
      if (sol.chart) this.chartType = sol.chart;
      this.changed();
      if (sol.select) { const p = parseAddr(sol.select); this.select(p.col, p.row); }
    }

    // ---------- Rendering ----------
    renderAll() {
      for (const a in this.cells) {
        const td = this.cells[a];
        const v = this.sheet.value(a);
        const f = this.formats[a];
        td.textContent = formatValue(v, f);
        td.className = '';
        if (isErr(v)) td.classList.add('sg-err');
        else if (typeof v === 'number') td.classList.add('sg-num');
        else if (typeof v === 'boolean') td.classList.add('sg-bool');
        if (f && f.b) td.classList.add('sg-bold');
        if (this.sheet.getRaw(a)[0] === '=') td.classList.add('sg-formula');
        if (isErr(v)) td.title = errorHelp(v.code); else td.removeAttribute('title');
      }
      this.renderSelection();
      this.renderChart();
    }

    inSel(col, row) {
      const s = this.sel;
      return col >= s.c1 && col <= s.c2 && row >= s.r1 && row <= s.r2;
    }

    renderSelection() {
      const s = this.sel;
      for (const a in this.cells) {
        const p = parseAddr(a);
        const td = this.cells[a];
        td.classList.toggle('in-sel', this.inSel(p.col, p.row) && !(s.c1 === s.c2 && s.r1 === s.r2));
        td.classList.toggle('active', p.col === this.active.col && p.row === this.active.row);
      }
      this.table.querySelectorAll('.sg-ch').forEach((th) => th.classList.toggle('hl', +th.dataset.col >= s.c1 && +th.dataset.col <= s.c2));
      this.table.querySelectorAll('.sg-rh').forEach((th) => th.classList.toggle('hl', +th.dataset.row >= s.r1 && +th.dataset.row <= s.r2));
      const a1 = this.cells[addr(s.c1, s.r1)], a2 = this.cells[addr(s.c2, s.r2)];
      const box = this.boxFor(a1, a2);
      Object.assign(this.selbox.style, { left: box.left + 'px', top: box.top + 'px', width: box.width + 'px', height: box.height + 'px' });
      const aa = addr(this.active.col, this.active.row);
      const multi = s.c1 !== s.c2 || s.r1 !== s.r2;
      this.namebox.textContent = multi ? `${addr(s.c1, s.r1)}:${addr(s.c2, s.r2)}` : aa;
      if (!this.editing) this.fbar.value = this.sheet.getRaw(aa);
      this.renderStatus();
    }

    renderStatus() {
      const s = this.sel;
      if (s.c1 === s.c2 && s.r1 === s.r2) { this.status.textContent = ''; return; }
      const nums = [];
      let count = 0;
      for (let r = s.r1; r <= s.r2; r++) for (let c = s.c1; c <= s.c2; c++) {
        const v = this.sheet.value(addr(c, r));
        if (v !== null && v !== '') count++;
        if (typeof v === 'number') nums.push(v);
      }
      if (!nums.length) { this.status.textContent = count ? `Count: ${count}` : ''; return; }
      const sum = nums.reduce((a, b) => a + b, 0);
      this.status.textContent = `Sum: ${E.formatGeneral(sum)}   Average: ${E.formatGeneral(sum / nums.length)}   Count: ${count}`;
    }

    boxFor(td1, td2) {
      const sr = this.scroll.getBoundingClientRect();
      const r1 = td1.getBoundingClientRect(), r2 = td2.getBoundingClientRect();
      const left = Math.min(r1.left, r2.left) - sr.left + this.scroll.scrollLeft;
      const top = Math.min(r1.top, r2.top) - sr.top + this.scroll.scrollTop;
      const right = Math.max(r1.right, r2.right) - sr.left + this.scroll.scrollLeft;
      const bottom = Math.max(r1.bottom, r2.bottom) - sr.top + this.scroll.scrollTop;
      return { left, top, width: right - left, height: bottom - top };
    }

    // ---------- Selection ----------
    select(col, row, extend) {
      col = Math.max(1, Math.min(this.cfg.cols, col));
      row = Math.max(1, Math.min(this.cfg.rows, row));
      if (extend) {
        this.sel = { c1: Math.min(this.anchor.col, col), c2: Math.max(this.anchor.col, col), r1: Math.min(this.anchor.row, row), r2: Math.max(this.anchor.row, row) };
        this.cursor = { col, row };
      } else {
        this.active = { col, row };
        this.anchor = { col, row };
        this.cursor = { col, row };
        this.sel = { c1: col, r1: row, c2: col, r2: row };
      }
      this.renderSelection();
      const td = this.cells[addr(extend ? col : this.active.col, extend ? row : this.active.row)];
      if (td && td.scrollIntoView) td.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }

    // ---------- Editing ----------
    startEdit(initial, source = 'cell') {
      const a = addr(this.active.col, this.active.row);
      const raw = this.sheet.getRaw(a);
      this.editing = { addr: a, original: raw, source };
      const text = initial !== undefined ? initial : raw;
      if (source === 'cell') {
        const td = this.cells[a];
        const b = this.boxFor(td, td);
        Object.assign(this.editor.style, { display: 'block', left: b.left + 'px', top: b.top + 'px', minWidth: b.width + 'px', height: b.height + 'px' });
        this.editor.value = text;
        this.editor.focus();
        const n = text.length;
        this.editor.setSelectionRange(n, n);
      }
      this.fbar.value = text;
      this.el.classList.add('is-editing');
    }
    editInput() { return this.editing && this.editing.source === 'bar' ? this.fbar : this.editor; }
    commitEdit(move) {
      if (!this.editing) return;
      const text = this.editInput().value;
      const a = this.editing.addr;
      this.endEdit();
      const normalized = normalizeEntry(text);
      if (normalized !== this.sheet.getRaw(a)) {
        this.pushHistory();
        this.setCell(a, normalized);
        this.changed();
      }
      if (move === 'down') this.select(this.active.col, this.active.row + 1);
      else if (move === 'right') this.select(this.active.col + 1, this.active.row);
      else if (move === 'up') this.select(this.active.col, this.active.row - 1);
      else if (move === 'left') this.select(this.active.col - 1, this.active.row);
      else this.renderSelection();
      this.scroll.focus({ preventScroll: true });
    }
    cancelEdit() {
      this.endEdit();
      this.renderSelection();
      this.scroll.focus({ preventScroll: true });
    }
    endEdit() {
      this.editing = null;
      this.refInsert = null;
      this.editor.style.display = 'none';
      this.el.classList.remove('is-editing');
    }

    // Clicking a cell while typing a formula inserts its reference
    canInsertRef() {
      if (!this.editing) return false;
      const inp = this.editInput();
      const v = inp.value;
      if (v[0] !== '=') return false;
      if (this.refInsert && this.refInsert.input === inp && inp.selectionStart === this.refInsert.pos + this.refInsert.len) return true;
      const before = v.slice(0, inp.selectionStart).trimEnd();
      return /[=(,+\-*/^&<>:]$/.test(before);
    }
    insertRef(startCol, startRow, endCol, endRow) {
      const inp = this.editInput();
      const ref = (startCol === endCol && startRow === endRow)
        ? addr(startCol, startRow)
        : addr(Math.min(startCol, endCol), Math.min(startRow, endRow)) + ':' + addr(Math.max(startCol, endCol), Math.max(startRow, endRow));
      let pos, len;
      if (this.refInsert && this.refInsert.input === inp) { pos = this.refInsert.pos; len = this.refInsert.len; }
      else { pos = inp.selectionStart; len = 0; }
      inp.value = inp.value.slice(0, pos) + ref + inp.value.slice(pos + len);
      this.refInsert = { input: inp, pos, len: ref.length, startCol, startRow };
      const caret = pos + ref.length;
      inp.focus();
      inp.setSelectionRange(caret, caret);
      if (inp === this.editor) this.fbar.value = inp.value; else this.editor.value = inp.value;
    }

    // ---------- Commands ----------
    forSel(fn) {
      const s = this.sel;
      for (let r = s.r1; r <= s.r2; r++) for (let c = s.c1; c <= s.c2; c++) fn(addr(c, r), c, r);
    }
    clearSel() {
      this.pushHistory();
      this.forSel((a) => this.setCell(a, ''));
      this.changed();
    }
    fmtSel(update) {
      this.pushHistory();
      this.forSel((a) => {
        const f = Object.assign({}, this.formats[a]);
        update(f, a);
        Object.keys(f).forEach((k) => f[k] === undefined && delete f[k]);
        if (Object.keys(f).length) this.formats[a] = f; else delete this.formats[a];
      });
      this.changed();
    }
    command(act) {
      switch (act) {
        case 'bold': {
          const allBold = (() => { let all = true; this.forSel((a) => { if (!(this.formats[a] && this.formats[a].b)) all = false; }); return all; })();
          this.fmtSel((f) => { f.b = allBold ? undefined : true; });
          break;
        }
        case 'currency': this.fmtSel((f) => { f.nf = 'currency'; f.d = 2; }); break;
        case 'percent': this.fmtSel((f) => { f.nf = 'percent'; f.d = 0; }); break;
        case 'comma': this.fmtSel((f) => { f.nf = 'number'; f.d = 2; }); break;
        case 'decinc':
        case 'decdec':
          this.fmtSel((f, a) => {
            const v = this.sheet.value(a);
            let d = f.d;
            if (!f.nf) { f.nf = 'number'; d = typeof v === 'number' ? decimalsOf(v) : 0; }
            else if (d === undefined) d = f.nf === 'percent' ? 0 : 2;
            f.d = Math.max(0, Math.min(10, d + (act === 'decinc' ? 1 : -1)));
          });
          break;
        case 'clearfmt': this.fmtSel((f) => { delete f.nf; delete f.d; delete f.b; }); break;
        case 'sortasc': this.sortBy(this.active.col, 'asc'); break;
        case 'sortdesc': this.sortBy(this.active.col, 'desc'); break;
        case 'undo': this.undo(); break;
        case 'reset':
          if (root.confirm && !root.confirm('Reset this exercise to its starting data?')) return;
          this.pushHistory();
          this.loadInitial();
          this.changed();
          this.select(1, 1);
          break;
      }
      this.scroll.focus({ preventScroll: true });
    }
    undo() {
      const s = this.history.pop();
      if (!s) return;
      this.restore(s);
      this.changed();
    }

    usedBounds() {
      let maxR = 0, maxC = 0;
      Object.keys(this.sheet.raw).forEach((a) => { const p = parseAddr(a); if (p.row > maxR) maxR = p.row; if (p.col > maxC) maxC = p.col; });
      return { maxR, maxC };
    }
    sortBy(col, dir, silent) {
      const header = this.cfg.header !== false;
      const bounds = this.usedBounds();
      const maxR = bounds.maxR;
      const maxC = this.cfg.sortCols || bounds.maxC;
      const start = header ? 2 : 1;
      if (maxR < start) return;
      if (!silent) this.pushHistory();
      const rows = [];
      for (let r = start; r <= maxR; r++) {
        const raw = [], fmt = [];
        for (let c = 1; c <= maxC; c++) { raw.push(this.sheet.raw[addr(c, r)]); fmt.push(this.formats[addr(c, r)]); }
        rows.push({ raw, fmt, key: this.sheet.value(addr(col, r)) });
      }
      const cmp = (x, y) => {
        const ex = x.key === null || x.key === '', ey = y.key === null || y.key === '';
        if (ex || ey) return ex === ey ? 0 : ex ? 1 : -1;
        const a = isErr(x.key) ? '' : x.key, b = isErr(y.key) ? '' : y.key;
        const ra = typeof a === 'number' ? 0 : 1, rb = typeof b === 'number' ? 0 : 1;
        let c = ra - rb;
        if (!c) c = typeof a === 'string' ? a.localeCompare(b, undefined, { sensitivity: 'base' }) : a - b;
        return dir === 'desc' ? -c : c;
      };
      rows.sort(cmp);
      rows.forEach((rw, i) => {
        const r = start + i;
        for (let c = 1; c <= maxC; c++) {
          const a = addr(c, r);
          if (rw.raw[c - 1] === undefined) delete this.sheet.raw[a]; else this.sheet.raw[a] = rw.raw[c - 1];
          if (rw.fmt[c - 1]) this.formats[a] = rw.fmt[c - 1]; else delete this.formats[a];
        }
      });
      this.lastSort = { col, dir };
      if (!silent) this.changed();
    }

    copySel(cut) {
      const s = this.sel;
      const cells = [];
      const fmts = [];
      for (let r = s.r1; r <= s.r2; r++) {
        const row = [], frow = [];
        for (let c = s.c1; c <= s.c2; c++) { row.push(this.sheet.getRaw(addr(c, r))); frow.push(this.formats[addr(c, r)]); }
        cells.push(row); fmts.push(frow);
      }
      this.clip = { cells, fmts, col: s.c1, row: s.r1 };
      const tsv = cells.map((r, ri) => r.map((_, ci) => formatValue(this.sheet.value(addr(s.c1 + ci, s.r1 + ri)), null)).join('\t')).join('\n');
      try { if (navigator.clipboard) navigator.clipboard.writeText(tsv).catch(() => {}); } catch (e) { /* ignore */ }
      this.flash(`Copied ${addr(s.c1, s.r1)}${cells.length > 1 || cells[0].length > 1 ? ':' + addr(s.c2, s.r2) : ''}. Select a cell and press ${this.modKey()}+V to paste.`);
      if (cut) { this.pushHistory(); this.forSel((a) => { this.setCell(a, ''); delete this.formats[a]; }); this.changed(); }
    }
    paste() {
      if (!this.clip) return;
      const { cells, fmts, col, row } = this.clip;
      this.pushHistory();
      const s = this.sel;
      // If the selection is bigger than the clip, tile the clip across it (like Excel)
      const h = cells.length, w = cells[0].length;
      const tilesR = Math.max(1, Math.floor((s.r2 - s.r1 + 1) / h));
      const tilesC = Math.max(1, Math.floor((s.c2 - s.c1 + 1) / w));
      for (let tr = 0; tr < tilesR; tr++) for (let tc = 0; tc < tilesC; tc++) {
        for (let i = 0; i < h; i++) for (let j = 0; j < w; j++) {
          const dc = s.c1 + tc * w + j, dr = s.r1 + tr * h + i;
          if (dc > this.cfg.cols || dr > this.cfg.rows) continue;
          const raw = E.shiftFormula(cells[i][j], dr - (row + i), dc - (col + j), this.cfg.rows, this.cfg.cols);
          const a = addr(dc, dr);
          this.setCell(a, raw);
          if (fmts[i][j]) this.formats[a] = Object.assign({}, fmts[i][j]); else delete this.formats[a];
        }
      }
      this.changed();
    }
    fillFrom(dirn) {
      // Ctrl+D (down) / Ctrl+R (right): copy first row/col of the selection across it
      const s = this.sel;
      this.pushHistory();
      if (dirn === 'down') {
        for (let c = s.c1; c <= s.c2; c++) {
          const src = this.sheet.getRaw(addr(c, s.r1));
          for (let r = s.r1 + 1; r <= s.r2; r++) { this.setCell(addr(c, r), E.shiftFormula(src, r - s.r1, 0, this.cfg.rows, this.cfg.cols)); this.copyFmt(addr(c, s.r1), addr(c, r)); }
        }
      } else {
        for (let r = s.r1; r <= s.r2; r++) {
          const src = this.sheet.getRaw(addr(s.c1, r));
          for (let c = s.c1 + 1; c <= s.c2; c++) { this.setCell(addr(c, r), E.shiftFormula(src, 0, c - s.c1, this.cfg.rows, this.cfg.cols)); this.copyFmt(addr(s.c1, r), addr(c, r)); }
        }
      }
      this.changed();
    }
    copyFmt(from, to) { if (this.formats[from]) this.formats[to] = Object.assign({}, this.formats[from]); else delete this.formats[to]; }

    // Drag fill handle: continue series or copy
    autofill(target) {
      const s = this.sel;
      this.pushHistory();
      const series = (vals, k) => {
        // vals: raw strings of source cells (in order); k: index of the new cell (0-based beyond end)
        const n = vals.length;
        const allNum = vals.every((v) => v !== '' && v[0] !== '=' && E.parseLiteralNumber(v) !== null);
        if (allNum && n >= 2) {
          const nums = vals.map((v) => E.parseLiteralNumber(v));
          const step = (nums[n - 1] - nums[0]) / (n - 1);
          return { raw: E.formatGeneral(nums[n - 1] + step * (k + 1)) };
        }
        const srcIdx = k % n;
        const v = vals[srcIdx];
        if (v[0] === '=') return { formula: v, srcIdx };
        if (n === 1 && v !== '') {
          for (const list of LISTS) {
            const i = list.findIndex((x) => x.toLowerCase() === v.toLowerCase());
            if (i >= 0) return { raw: list[(i + k + 1) % list.length] };
          }
          const m = /^(.*?)(\d+)$/.exec(v);
          if (m && m[1] !== '' && E.parseLiteralNumber(v) === null) return { raw: m[1] + (parseInt(m[2], 10) + k + 1) };
        }
        return { raw: v, srcIdx };
      };
      if (target.dir === 'down') {
        for (let c = s.c1; c <= s.c2; c++) {
          const vals = [];
          for (let r = s.r1; r <= s.r2; r++) vals.push(this.sheet.getRaw(addr(c, r)));
          for (let r = s.r2 + 1, k = 0; r <= target.to; r++, k++) {
            const out = series(vals, k);
            const srcRow = s.r1 + (out.srcIdx !== undefined ? out.srcIdx : vals.length - 1);
            const raw = out.formula ? E.shiftFormula(out.formula, r - srcRow, 0, this.cfg.rows, this.cfg.cols) : out.raw;
            this.setCell(addr(c, r), raw);
            this.copyFmt(addr(c, srcRow), addr(c, r));
          }
        }
        this.sel.r2 = target.to;
      } else {
        for (let r = s.r1; r <= s.r2; r++) {
          const vals = [];
          for (let c = s.c1; c <= s.c2; c++) vals.push(this.sheet.getRaw(addr(c, r)));
          for (let c = s.c2 + 1, k = 0; c <= target.to; c++, k++) {
            const out = series(vals, k);
            const srcCol = s.c1 + (out.srcIdx !== undefined ? out.srcIdx : vals.length - 1);
            const raw = out.formula ? E.shiftFormula(out.formula, 0, c - srcCol, this.cfg.rows, this.cfg.cols) : out.raw;
            this.setCell(addr(c, r), raw);
            this.copyFmt(addr(srcCol, r), addr(c, r));
          }
        }
        this.sel.c2 = target.to;
      }
      this.changed();
    }

    flash(msg) {
      this.status.textContent = msg;
      clearTimeout(this._flashT);
      this._flashT = setTimeout(() => this.renderStatus(), 3500);
    }

    // ---------- Events ----------
    cellFromEvent(e) {
      const td = e.target.closest && e.target.closest('td[data-a]');
      if (!td || !this.el.contains(td)) return null;
      return parseAddr(td.dataset.a);
    }

    bindEvents() {
      this.el.querySelector('.sg-toolbar').addEventListener('click', (e) => {
        const b = e.target.closest('[data-act]');
        if (b) { if (this.editing) this.commitEdit(); this.command(b.dataset.act); }
      });
      // Keep focus in the editor when pressing toolbar buttons
      this.el.querySelector('.sg-toolbar').addEventListener('mousedown', (e) => { if (e.target.closest('[data-act]')) e.preventDefault(); });

      this.table.addEventListener('mousedown', (e) => {
        const th = e.target.closest('th');
        if (th && (th.dataset.col || th.dataset.row)) {
          if (this.editing) this.commitEdit();
          e.preventDefault();
          if (th.dataset.col) { const c = +th.dataset.col; this.select(c, 1); this.select(c, this.cfg.rows, true); }
          else { const r = +th.dataset.row; this.select(1, r); this.select(this.cfg.cols, r, true); }
          this.scroll.focus({ preventScroll: true });
          return;
        }
        const p = this.cellFromEvent(e);
        if (!p) return;
        if (this.editing && this.canInsertRef()) {
          e.preventDefault();
          this.refDrag = true;
          this.refInsert = this.refInsert && this.refInsert.input === this.editInput() && this.editInput().selectionStart === this.refInsert.pos + this.refInsert.len ? Object.assign(this.refInsert) : null;
          this.insertRef(p.col, p.row, p.col, p.row);
          return;
        }
        if (this.editing) this.commitEdit();
        e.preventDefault();
        this.select(p.col, p.row, e.shiftKey);
        this.dragging = true;
        this.scroll.focus({ preventScroll: true });
      });
      this.table.addEventListener('mouseover', (e) => {
        const p = this.cellFromEvent(e);
        if (!p) return;
        if (this.refDrag && this.refInsert) { this.insertRef(this.refInsert.startCol, this.refInsert.startRow, p.col, p.row); return; }
        if (this.dragging) this.select(p.col, p.row, true);
        if (this.filling) this.updateFillPreview(p);
      });
      this.table.addEventListener('dblclick', (e) => {
        const p = this.cellFromEvent(e);
        if (!p || this.editing) return;
        this.select(p.col, p.row);
        this.startEdit();
      });
      this.handle.addEventListener('mousedown', (e) => {
        e.preventDefault(); e.stopPropagation();
        if (this.editing) this.commitEdit();
        this.filling = { dir: null, to: null };
      });
      this._up = () => {
        if (this.filling) {
          const f = this.filling;
          this.filling = null;
          this.clearFillPreview();
          if (f.dir) this.autofill(f);
        }
        this.dragging = false;
        this.refDrag = false;
      };
      document.addEventListener('mouseup', this._up);

      // Touch: tap to select, double-tap to edit
      this.table.addEventListener('touchend', (e) => {
        const p = this.cellFromEvent(e);
        if (!p) return;
        const now = Date.now();
        if (this._lastTap && now - this._lastTap.t < 350 && this._lastTap.a === addr(p.col, p.row)) {
          e.preventDefault(); this.select(p.col, p.row); this.startEdit();
        }
        this._lastTap = { t: now, a: addr(p.col, p.row) };
      });

      this.scroll.addEventListener('keydown', (e) => this.onKey(e));
      this.scroll.addEventListener('scroll', () => this.renderSelection());
      this.scroll.addEventListener('paste', (e) => {
        if (this.editing) return;
        const text = (e.clipboardData || window.clipboardData).getData('text');
        if (!text) return;
        e.preventDefault();
        this.pushHistory();
        text.replace(/\r/g, '').replace(/\n$/, '').split('\n').forEach((line, i) => line.split('\t').forEach((v, j) => {
          const c = this.active.col + j, r = this.active.row + i;
          if (c <= this.cfg.cols && r <= this.cfg.rows) this.setCell(addr(c, r), normalizeEntry(v));
        }));
        this.changed();
      });

      this.editor.addEventListener('keydown', (e) => this.onEditorKey(e));
      this.editor.addEventListener('input', () => { this.fbar.value = this.editor.value; this.refInsert = null; this.showFnHint(this.editor.value); });
      this.editor.addEventListener('blur', () => {
        setTimeout(() => {
          if (this.editing && this.editing.source === 'cell' && document.activeElement !== this.editor && !this.refDrag) this.commitEdit();
        }, 0);
      });

      this.fbar.addEventListener('focus', () => {
        if (!this.editing) this.startEdit(undefined, 'bar');
      });
      this.fbar.addEventListener('input', () => { this.refInsert = null; this.showFnHint(this.fbar.value); });
      this.fbar.addEventListener('keydown', (e) => this.onEditorKey(e));
      this.fbar.addEventListener('blur', () => {
        setTimeout(() => {
          if (this.editing && this.editing.source === 'bar' && document.activeElement !== this.fbar && !this.refDrag) this.commitEdit();
        }, 0);
      });

      if (this.chartEl) {
        this.chartEl.addEventListener('change', (e) => {
          if (e.target.matches('select')) {
            this.pushHistory();
            this.chartType = e.target.value;
            this.changed();
          }
        });
      }
      this._resize = () => this.renderSelection();
      window.addEventListener('resize', this._resize);
    }

    showFnHint(text) {
      const m = /([A-Za-z]+)\($/.exec(text) || /([A-Za-z]+)\([^()]*$/.exec(text);
      if (text[0] === '=' && m) {
        const name = m[1].toUpperCase();
        const sig = FN_SIGNATURES[name];
        if (sig) { this.status.textContent = sig; return; }
      }
      if (text[0] === '=') {
        const pm = /([A-Za-z]{2,})$/.exec(text);
        if (pm) {
          const pre = pm[1].toUpperCase();
          const list = E.FN_NAMES.filter((n) => n.startsWith(pre)).slice(0, 6);
          this.status.textContent = list.length ? 'Functions: ' + list.join(', ') : '';
          return;
        }
      }
      this.status.textContent = '';
    }

    onEditorKey(e) {
      const k = e.key;
      if (k === 'Enter') { e.preventDefault(); this.commitEdit(e.shiftKey ? 'up' : 'down'); }
      else if (k === 'Tab') { e.preventDefault(); this.commitEdit(e.shiftKey ? 'left' : 'right'); }
      else if (k === 'Escape') { e.preventDefault(); this.cancelEdit(); }
      else if (k === 'F4') {
        // Cycle $ in the reference at the caret: A1 -> $A$1 -> A$1 -> $A1 -> A1
        e.preventDefault();
        const inp = e.target;
        const v = inp.value, pos = inp.selectionStart;
        const re = /\$?[A-Za-z]{1,3}\$?\d+/g;
        let m;
        while ((m = re.exec(v))) {
          if (pos >= m.index && pos <= m.index + m[0].length) {
            const p = /^(\$?)([A-Za-z]{1,3})(\$?)(\d+)$/.exec(m[0]);
            const state = (p[1] ? 2 : 0) + (p[3] ? 1 : 0);
            const next = { 0: [true, true], 3: [false, true], 1: [true, false], 2: [false, false] }[state];
            const rep = (next[0] ? '$' : '') + p[2] + (next[1] ? '$' : '') + p[4];
            inp.value = v.slice(0, m.index) + rep + v.slice(m.index + m[0].length);
            const caret = m.index + rep.length;
            inp.setSelectionRange(caret, caret);
            if (inp === this.editor) this.fbar.value = inp.value; else this.editor.value = inp.value;
            break;
          }
        }
      }
    }

    onKey(e) {
      if (this.editing) return;
      const mod = e.ctrlKey || e.metaKey;
      const k = e.key;
      const cur = e.shiftKey ? this.cursor : this.active;
      const move = (dc, dr) => { e.preventDefault(); this.select(cur.col + dc, cur.row + dr, e.shiftKey); };
      if (mod) {
        const l = k.toLowerCase();
        if (l === 'c') { e.preventDefault(); this.copySel(false); }
        else if (l === 'x') { e.preventDefault(); this.copySel(true); }
        else if (l === 'v') { if (this.clip) { e.preventDefault(); this.paste(); } }
        else if (l === 'z') { e.preventDefault(); this.undo(); }
        else if (l === 'd') { e.preventDefault(); this.fillFrom('down'); }
        else if (l === 'r') { e.preventDefault(); this.fillFrom('right'); }
        else if (l === 'b') { e.preventDefault(); this.command('bold'); }
        else if (l === 'a') { e.preventDefault(); this.select(1, 1); this.select(this.cfg.cols, this.cfg.rows, true); }
        else if (k === 'ArrowDown') { e.preventDefault(); this.select(cur.col, this.edgeRow(cur, 1), e.shiftKey); }
        else if (k === 'ArrowUp') { e.preventDefault(); this.select(cur.col, this.edgeRow(cur, -1), e.shiftKey); }
        else if (k === 'ArrowRight') { e.preventDefault(); this.select(this.edgeCol(cur, 1), cur.row, e.shiftKey); }
        else if (k === 'ArrowLeft') { e.preventDefault(); this.select(this.edgeCol(cur, -1), cur.row, e.shiftKey); }
        return;
      }
      switch (k) {
        case 'ArrowDown': return move(0, 1);
        case 'ArrowUp': return move(0, -1);
        case 'ArrowRight': return move(1, 0);
        case 'ArrowLeft': return move(-1, 0);
        case 'Enter':
          e.preventDefault();
          if (this.cfg.enterEdits && !e.shiftKey) this.startEdit();
          else this.select(this.active.col, this.active.row + (e.shiftKey ? -1 : 1));
          return;
        case 'Tab': e.preventDefault(); this.select(this.active.col + (e.shiftKey ? -1 : 1), this.active.row); return;
        case 'F2': e.preventDefault(); this.startEdit(); return;
        case 'Delete':
        case 'Backspace': e.preventDefault(); this.clearSel(); return;
        case 'Escape': this.select(this.active.col, this.active.row); return;
      }
      if (k.length === 1 && !e.altKey) {
        e.preventDefault();
        this.startEdit(k);
      }
    }
    // Ctrl+Arrow: jump to edge of data block
    edgeRow(cur, d) {
      const filled = (r) => this.sheet.getRaw(addr(cur.col, r)) !== '';
      let r = cur.row;
      const limit = d > 0 ? this.cfg.rows : 1;
      if (r === limit) return r;
      if (filled(r) && filled(r + d)) { while (r !== limit && filled(r + d)) r += d; return r; }
      r += d;
      while (r !== limit && !filled(r)) r += d;
      return r;
    }
    edgeCol(cur, d) {
      const filled = (c) => this.sheet.getRaw(addr(c, cur.row)) !== '';
      let c = cur.col;
      const limit = d > 0 ? this.cfg.cols : 1;
      if (c === limit) return c;
      if (filled(c) && filled(c + d)) { while (c !== limit && filled(c + d)) c += d; return c; }
      c += d;
      while (c !== limit && !filled(c)) c += d;
      return c;
    }

    updateFillPreview(p) {
      const s = this.sel;
      const down = p.row - s.r2, right = p.col - s.c2;
      this.clearFillPreview();
      if (down <= 0 && right <= 0) { this.filling.dir = null; return; }
      if (down >= right) { this.filling.dir = 'down'; this.filling.to = p.row; }
      else { this.filling.dir = 'right'; this.filling.to = p.col; }
      const f = this.filling;
      const c2 = f.dir === 'right' ? f.to : s.c2, r2 = f.dir === 'down' ? f.to : s.r2;
      for (let r = s.r1; r <= r2; r++) for (let c = s.c1; c <= c2; c++) if (!this.inSel(c, r)) this.cells[addr(c, r)].classList.add('fill-prev');
    }
    clearFillPreview() { this.table.querySelectorAll('.fill-prev').forEach((td) => td.classList.remove('fill-prev')); }

    // ---------- Chart ----------
    renderChart() {
      if (!this.chartEl) return;
      const ch = this.cfg.chart;
      const lr = parseRange(ch.labels), vr = parseRange(ch.values);
      const labels = [], values = [];
      for (let i = 0; i < lr.length; i++) {
        const l = this.sheet.value(lr[i]);
        const v = this.sheet.value(vr[i]);
        if ((l === null || l === '') && (v === null || v === '')) continue;
        labels.push(l === null ? '' : formatValue(l));
        values.push(typeof v === 'number' ? v : 0);
      }
      const types = ch.types || ['column', 'bar', 'line', 'pie'];
      const select = `<label class="sg-chart-pick">Chart type: <select aria-label="Chart type">${types.map((t) => `<option value="${t}"${t === this.chartType ? ' selected' : ''}>${t[0].toUpperCase() + t.slice(1)}</option>`).join('')}</select></label>`;
      const title = ch.titleCell ? formatValue(this.sheet.value(ch.titleCell)) : ch.title || '';
      this.chartEl.innerHTML = select + drawChart(this.chartType, labels, values, title);
    }

    // ---------- Tasks ----------
    helpers() {
      const g = this;
      return {
        val: (a) => { const v = g.sheet.value(a); return isErr(v) ? v.code : v; },
        num: (a) => { const v = g.sheet.value(a); return typeof v === 'number' ? v : NaN; },
        raw: (a) => g.sheet.getRaw(a),
        text: (a) => formatValue(g.sheet.value(a), g.formats[a]),
        isFormula: (a) => g.sheet.getRaw(a)[0] === '=',
        uses: (a, fn) => E.usesFunction(g.sheet.getRaw(a), fn),
        has: (a, re) => re.test(g.sheet.getRaw(a)),
        fmt: (a) => g.formats[a] || {},
        near: (a, x, tol = 1e-6) => { const v = g.sheet.value(a); return typeof v === 'number' && Math.abs(v - x) <= tol; },
        eqText: (a, s) => { const v = g.sheet.value(a); return typeof v === 'string' && v.trim().toLowerCase() === String(s).toLowerCase(); },
        chartType: () => g.chartType,
        lastSort: () => g.lastSort,
        column: (col, r1, r2) => { const out = []; for (let r = r1; r <= r2; r++) { const v = g.sheet.value(col + r); out.push(isErr(v) ? v.code : v); } return out; },
        all: (list, fn) => list.every(fn),
        range: (s) => parseRange(s),
      };
    }
    checkTasks(initial) {
      if (!this.tasksEl) return;
      const h = this.helpers();
      const prevDone = this.taskState.length && this.taskState.every(Boolean);
      this.taskState = this.cfg.tasks.map((t) => { try { return !!t.check(h); } catch (e) { return false; } });
      this.tasksEl.querySelectorAll('.sg-task').forEach((li, i) => li.classList.toggle('done', this.taskState[i]));
      const allDone = this.taskState.every(Boolean);
      this.el.classList.toggle('all-done', allDone);
      if (this.opts.onTasksChange) this.opts.onTasksChange(this.taskState, allDone && !prevDone && !initial);
    }

    modKey() { return this.cfg.os ? (this.cfg.os === 'mac' ? '⌘' : 'Ctrl') : modKey(); }

    destroy() {
      document.removeEventListener('mouseup', this._up);
      window.removeEventListener('resize', this._resize);
    }
  }

  // ---------- helpers ----------
  function normalizeEntry(text) {
    if (text === undefined || text === null) return '';
    let t = String(text);
    if (t[0] === '=') {
      // Uppercase function names and references outside of strings for a tidy look
      let out = '', inStr = false;
      for (let i = 0; i < t.length; i++) {
        const c = t[i];
        if (c === '"') inStr = !inStr;
        out += inStr ? c : c.toUpperCase();
      }
      // auto-close missing parentheses (like the real apps do)
      const open = (out.replace(/"(?:[^"]|"")*"/g, '').match(/\(/g) || []).length;
      const close = (out.replace(/"(?:[^"]|"")*"/g, '').match(/\)/g) || []).length;
      if (open > close) out += ')'.repeat(open - close);
      return out;
    }
    if (t[0] === '+' && t.length > 1 && E.parseLiteralNumber(t) === null) return '=' + t.slice(1);
    return t;
  }

  function parseRange(s) {
    const [a, b] = s.split(':');
    const p = parseAddr(a), q = parseAddr(b || a);
    const out = [];
    for (let r = Math.min(p.row, q.row); r <= Math.max(p.row, q.row); r++)
      for (let c = Math.min(p.col, q.col); c <= Math.max(p.col, q.col); c++) out.push(addr(c, r));
    return out;
  }

  function modKey() { return /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent) ? '⌘' : 'Ctrl'; }

  function errorHelp(code) {
    return {
      '#DIV/0!': 'Dividing by zero (or by an empty cell).',
      '#VALUE!': 'Wrong kind of value, e.g. doing maths on text.',
      '#REF!': 'Reference to a cell that does not exist, or a circular reference.',
      '#NAME?': 'Unknown function or name. Check the spelling.',
      '#N/A': 'Value not found (common with lookups).',
      '#NUM!': 'Invalid number.',
      '#ERROR!': 'The formula could not be read. Check commas, quotes and brackets.',
    }[code] || code;
  }

  const PALETTE = ['#4472c4', '#ed7d31', '#a5a5a5', '#ffc000', '#5b9bd5', '#70ad47', '#264478', '#9e480e', '#636363', '#997300'];
  function drawChart(type, labels, values, title) {
    const W = 520, H = 280, pad = { l: 48, r: 16, t: title ? 34 : 14, b: 46 };
    const t = title ? `<text x="${W / 2}" y="22" text-anchor="middle" class="ch-title">${esc(title)}</text>` : '';
    if (!values.length) return `<svg viewBox="0 0 ${W} ${H}" class="sg-svg" role="img" aria-label="Empty chart">${t}<text x="${W / 2}" y="${H / 2}" text-anchor="middle" class="ch-lbl">No data yet</text></svg>`;
    if (type === 'pie') {
      const total = values.reduce((a, b) => a + Math.max(0, b), 0) || 1;
      const cx = 150, cy = (H + pad.t) / 2, R = Math.min(110, (H - pad.t - 10) / 2);
      let ang = -Math.PI / 2, paths = '', legend = '';
      values.forEach((v, i) => {
        const frac = Math.max(0, v) / total;
        const a2 = ang + frac * Math.PI * 2;
        const large = a2 - ang > Math.PI ? 1 : 0;
        const x1 = cx + R * Math.cos(ang), y1 = cy + R * Math.sin(ang), x2 = cx + R * Math.cos(a2), y2 = cy + R * Math.sin(a2);
        if (frac >= 0.9999) paths += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="${PALETTE[i % 10]}"/>`;
        else if (frac > 0) paths += `<path d="M${cx},${cy} L${x1},${y1} A${R},${R} 0 ${large} 1 ${x2},${y2} Z" fill="${PALETTE[i % 10]}" stroke="#fff" stroke-width="1"/>`;
        legend += `<rect x="300" y="${pad.t + 6 + i * 22}" width="12" height="12" fill="${PALETTE[i % 10]}"/><text x="318" y="${pad.t + 16 + i * 22}" class="ch-lbl">${esc(labels[i])} (${Math.round(frac * 100)}%)</text>`;
        ang = a2;
      });
      return `<svg viewBox="0 0 ${W} ${H}" class="sg-svg" role="img" aria-label="Pie chart">${t}${paths}${legend}</svg>`;
    }
    const max = Math.max(0, ...values), min = Math.min(0, ...values);
    const span = max - min || 1;
    const niceMax = max, niceMin = min;
    const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
    let g = '';
    const ticks = 4;
    for (let i = 0; i <= ticks; i++) {
      const v = niceMin + (span * i) / ticks;
      if (type === 'bar') {
        const x = pad.l + 40 + ((iw - 40) * i) / ticks;
        g += `<line x1="${x}" y1="${pad.t}" x2="${x}" y2="${pad.t + ih}" class="ch-grid"/><text x="${x}" y="${pad.t + ih + 16}" text-anchor="middle" class="ch-ax">${esc(short(v))}</text>`;
      } else {
        const y = pad.t + ih - (ih * i) / ticks;
        g += `<line x1="${pad.l}" y1="${y}" x2="${pad.l + iw}" y2="${y}" class="ch-grid"/><text x="${pad.l - 6}" y="${y + 4}" text-anchor="end" class="ch-ax">${esc(short(v))}</text>`;
      }
    }
    const n = values.length;
    if (type === 'bar') {
      const x0 = pad.l + 40, w = iw - 40, bh = (ih / n) * 0.7;
      values.forEach((v, i) => {
        const y = pad.t + (ih / n) * i + (ih / n - bh) / 2;
        const xa = x0 + (w * (Math.min(0, v) - niceMin)) / span, xb = x0 + (w * (Math.max(0, v) - niceMin)) / span;
        g += `<rect x="${xa}" y="${y}" width="${Math.max(1, xb - xa)}" height="${bh}" fill="${PALETTE[0]}"><title>${esc(labels[i])}: ${v}</title></rect>`;
        g += `<text x="${x0 - 6}" y="${y + bh / 2 + 4}" text-anchor="end" class="ch-lbl">${esc(trunc(labels[i], 10))}</text>`;
      });
    } else if (type === 'line') {
      const pts = values.map((v, i) => [pad.l + (iw * (i + 0.5)) / n, pad.t + ih - (ih * (v - niceMin)) / span]);
      g += `<polyline points="${pts.map((p) => p.join(',')).join(' ')}" fill="none" stroke="${PALETTE[0]}" stroke-width="2.5"/>`;
      pts.forEach((p, i) => {
        g += `<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="${PALETTE[0]}"><title>${esc(labels[i])}: ${values[i]}</title></circle>`;
        g += `<text x="${p[0]}" y="${pad.t + ih + 18}" text-anchor="middle" class="ch-lbl">${esc(trunc(labels[i], 9))}</text>`;
      });
    } else {
      const bw = (iw / n) * 0.65;
      values.forEach((v, i) => {
        const x = pad.l + (iw / n) * i + (iw / n - bw) / 2;
        const ya = pad.t + ih - (ih * (Math.max(0, v) - niceMin)) / span, yb = pad.t + ih - (ih * (Math.min(0, v) - niceMin)) / span;
        g += `<rect x="${x}" y="${ya}" width="${bw}" height="${Math.max(1, yb - ya)}" fill="${PALETTE[0]}"><title>${esc(labels[i])}: ${v}</title></rect>`;
        g += `<text x="${x + bw / 2}" y="${pad.t + ih + 18}" text-anchor="middle" class="ch-lbl">${esc(trunc(labels[i], 9))}</text>`;
      });
    }
    return `<svg viewBox="0 0 ${W} ${H}" class="sg-svg" role="img" aria-label="${type} chart">${t}${g}</svg>`;
  }
  function short(v) {
    const a = Math.abs(v);
    if (a >= 1e6) return (v / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
    if (a >= 1e3) return (v / 1e3).toFixed(1).replace(/\.0$/, '') + 'k';
    return String(Math.round(v * 100) / 100);
  }
  function trunc(s, n) { s = String(s); return s.length > n ? s.slice(0, n - 1) + '…' : s; }

  const FN_SIGNATURES = {
    SUM: 'SUM(number1, [number2], ...) adds numbers',
    AVERAGE: 'AVERAGE(number1, [number2], ...) arithmetic mean',
    MIN: 'MIN(number1, ...) smallest value', MAX: 'MAX(number1, ...) largest value',
    COUNT: 'COUNT(value1, ...) counts cells containing numbers', COUNTA: 'COUNTA(value1, ...) counts non-empty cells',
    COUNTBLANK: 'COUNTBLANK(range) counts empty cells', MEDIAN: 'MEDIAN(number1, ...) middle value',
    ROUND: 'ROUND(number, num_digits)', ROUNDUP: 'ROUNDUP(number, num_digits)', ROUNDDOWN: 'ROUNDDOWN(number, num_digits)',
    IF: 'IF(logical_test, value_if_true, [value_if_false])', IFS: 'IFS(test1, value1, [test2, value2], ...)',
    AND: 'AND(logical1, [logical2], ...) TRUE if all are TRUE', OR: 'OR(logical1, [logical2], ...) TRUE if any is TRUE', NOT: 'NOT(logical)',
    IFERROR: 'IFERROR(value, value_if_error)',
    COUNTIF: 'COUNTIF(range, criterion)', SUMIF: 'SUMIF(range, criterion, [sum_range])', AVERAGEIF: 'AVERAGEIF(range, criterion, [average_range])',
    COUNTIFS: 'COUNTIFS(range1, criterion1, [range2, criterion2], ...)', SUMIFS: 'SUMIFS(sum_range, range1, criterion1, ...)',
    LEFT: 'LEFT(text, [num_chars])', RIGHT: 'RIGHT(text, [num_chars])', MID: 'MID(text, start_num, num_chars)',
    LEN: 'LEN(text) number of characters', UPPER: 'UPPER(text)', LOWER: 'LOWER(text)', PROPER: 'PROPER(text) Capitalises Each Word', TRIM: 'TRIM(text) removes extra spaces',
    CONCAT: 'CONCAT(text1, [text2], ...)', CONCATENATE: 'CONCATENATE(text1, [text2], ...)', TEXTJOIN: 'TEXTJOIN(delimiter, ignore_empty, text1, ...)',
    FIND: 'FIND(find_text, within_text, [start]) case-sensitive', SEARCH: 'SEARCH(find_text, within_text, [start])', SUBSTITUTE: 'SUBSTITUTE(text, old_text, new_text)',
    VLOOKUP: 'VLOOKUP(search_key, range, column_index, [is_sorted]) use FALSE for exact match',
    HLOOKUP: 'HLOOKUP(search_key, range, row_index, [is_sorted])',
    XLOOKUP: 'XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found])',
    MATCH: 'MATCH(lookup_value, lookup_array, [match_type]) use 0 for exact match', INDEX: 'INDEX(range, row_num, [column_num])',
    ABS: 'ABS(number)', SQRT: 'SQRT(number)', POWER: 'POWER(base, exponent)', MOD: 'MOD(dividend, divisor)', INT: 'INT(number)', PRODUCT: 'PRODUCT(number1, ...)',
    LARGE: 'LARGE(range, k) k-th largest', SMALL: 'SMALL(range, k) k-th smallest',
  };

  root.SheetGrid = SheetGrid;
  root.SheetGrid.formatValue = formatValue;
})(window);
