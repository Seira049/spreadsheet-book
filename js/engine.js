/* Mini spreadsheet formula engine.
 * Supports numbers, text, booleans, cell refs (A1, $A$1), ranges (A1:B5),
 * operators (+ - * / ^ & % = <> < > <= >=) and a set of common functions.
 * Exposed as window.SheetEngine (also module.exports for Node tests).
 */
(function (root) {
  'use strict';

  // ---------- Errors ----------
  class FErr {
    constructor(code) { this.code = code; }
    toString() { return this.code; }
  }
  const ERR = {
    DIV0: new FErr('#DIV/0!'),
    VALUE: new FErr('#VALUE!'),
    REF: new FErr('#REF!'),
    NAME: new FErr('#NAME?'),
    NA: new FErr('#N/A'),
    NUM: new FErr('#NUM!'),
    ERROR: new FErr('#ERROR!'),
  };
  const isErr = (v) => v instanceof FErr;

  // ---------- Addresses ----------
  function colToNum(col) {
    let n = 0;
    for (const ch of col.toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64);
    return n; // 1-based
  }
  function numToCol(n) {
    let s = '';
    while (n > 0) {
      const m = (n - 1) % 26;
      s = String.fromCharCode(65 + m) + s;
      n = Math.floor((n - 1) / 26);
    }
    return s;
  }
  function parseAddr(a) {
    const m = /^\$?([A-Za-z]{1,3})\$?(\d+)$/.exec(a);
    if (!m) return null;
    return { col: colToNum(m[1]), row: parseInt(m[2], 10) };
  }
  function addr(col, row) { return numToCol(col) + row; }

  class Range {
    constructor(sheet, c1, r1, c2, r2) {
      this.sheet = sheet;
      this.c1 = Math.min(c1, c2); this.c2 = Math.max(c1, c2);
      this.r1 = Math.min(r1, r2); this.r2 = Math.max(r1, r2);
    }
    get rows() { return this.r2 - this.r1 + 1; }
    get cols() { return this.c2 - this.c1 + 1; }
    matrix() {
      const out = [];
      for (let r = this.r1; r <= this.r2; r++) {
        const row = [];
        for (let c = this.c1; c <= this.c2; c++) row.push(this.sheet.value(addr(c, r)));
        out.push(row);
      }
      return out;
    }
    flat() { return this.matrix().flat(); }
  }

  // ---------- Tokenizer ----------
  function tokenize(src) {
    const toks = [];
    let i = 0;
    const s = src;
    while (i < s.length) {
      const ch = s[i];
      if (/\s/.test(ch)) { i++; continue; }
      if (ch === '"') {
        let j = i + 1, str = '';
        while (j < s.length) {
          if (s[j] === '"') {
            if (s[j + 1] === '"') { str += '"'; j += 2; continue; }
            break;
          }
          str += s[j++];
        }
        if (j >= s.length) throw ERR.ERROR;
        toks.push({ t: 'str', v: str });
        i = j + 1; continue;
      }
      if (/[0-9.]/.test(ch)) {
        const m = /^(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(s.slice(i));
        if (!m) throw ERR.ERROR;
        toks.push({ t: 'num', v: parseFloat(m[0]) });
        i += m[0].length; continue;
      }
      if (/[A-Za-z_$]/.test(ch)) {
        const rest = s.slice(i);
        const rm = /^(\$?[A-Za-z]{1,3}\$?\d+)(:(\$?[A-Za-z]{1,3}\$?\d+))?(?![A-Za-z0-9_(])/.exec(rest);
        if (rm) {
          if (rm[3]) toks.push({ t: 'range', a: rm[1], b: rm[3] });
          else toks.push({ t: 'ref', a: rm[1] });
          i += rm[0].length; continue;
        }
        const nm = /^[A-Za-z_][A-Za-z0-9_.]*/.exec(rest);
        if (!nm) throw ERR.ERROR;
        toks.push({ t: 'name', v: nm[0].toUpperCase() });
        i += nm[0].length; continue;
      }
      const two = s.slice(i, i + 2);
      if (two === '<=' || two === '>=' || two === '<>') { toks.push({ t: 'op', v: two }); i += 2; continue; }
      if ('+-*/^&=<>%(),;'.includes(ch)) {
        toks.push({ t: ch === ';' ? 'op' : 'op', v: ch === ';' ? ',' : ch });
        i++; continue;
      }
      throw ERR.ERROR;
    }
    return toks;
  }

  // ---------- Parser (precedence climbing) ----------
  function parse(src) {
    const toks = tokenize(src);
    let p = 0;
    const peek = () => toks[p];
    const isOp = (v) => toks[p] && toks[p].t === 'op' && toks[p].v === v;
    const eat = (v) => { if (!isOp(v)) throw ERR.ERROR; p++; };

    function parseComparison() {
      let left = parseConcat();
      while (peek() && peek().t === 'op' && ['=', '<>', '<', '>', '<=', '>='].includes(peek().v)) {
        const op = toks[p++].v;
        left = { k: 'bin', op, l: left, r: parseConcat() };
      }
      return left;
    }
    function parseConcat() {
      let left = parseAdd();
      while (isOp('&')) { p++; left = { k: 'bin', op: '&', l: left, r: parseAdd() }; }
      return left;
    }
    function parseAdd() {
      let left = parseMul();
      while (isOp('+') || isOp('-')) { const op = toks[p++].v; left = { k: 'bin', op, l: left, r: parseMul() }; }
      return left;
    }
    function parseMul() {
      let left = parsePow();
      while (isOp('*') || isOp('/')) { const op = toks[p++].v; left = { k: 'bin', op, l: left, r: parsePow() }; }
      return left;
    }
    function parsePow() {
      let left = parseUnary();
      while (isOp('^')) { p++; left = { k: 'bin', op: '^', l: left, r: parseUnary() }; }
      return left;
    }
    function parseUnary() {
      if (isOp('-')) { p++; return { k: 'neg', e: parseUnary() }; }
      if (isOp('+')) { p++; return parseUnary(); }
      return parsePostfix();
    }
    function parsePostfix() {
      let e = parsePrimary();
      while (isOp('%')) { p++; e = { k: 'pct', e }; }
      return e;
    }
    function parsePrimary() {
      const t = peek();
      if (!t) throw ERR.ERROR;
      if (t.t === 'num') { p++; return { k: 'num', v: t.v }; }
      if (t.t === 'str') { p++; return { k: 'str', v: t.v }; }
      if (t.t === 'ref') { p++; return { k: 'ref', a: t.a }; }
      if (t.t === 'range') { p++; return { k: 'range', a: t.a, b: t.b }; }
      if (t.t === 'name') {
        p++;
        if (isOp('(')) {
          p++;
          const args = [];
          if (!isOp(')')) {
            for (;;) {
              if (isOp(',')) { args.push({ k: 'blank' }); p++; continue; }
              args.push(parseComparison());
              if (isOp(',')) { p++; if (isOp(')')) { args.push({ k: 'blank' }); break; } continue; }
              break;
            }
          }
          eat(')');
          return { k: 'fn', name: t.v, args };
        }
        if (t.v === 'TRUE') return { k: 'bool', v: true };
        if (t.v === 'FALSE') return { k: 'bool', v: false };
        return { k: 'badname', v: t.v };
      }
      if (isOp('(')) { p++; const e = parseComparison(); eat(')'); return e; }
      throw ERR.ERROR;
    }

    const ast = parseComparison();
    if (p !== toks.length) throw ERR.ERROR;
    return ast;
  }

  // ---------- Coercion helpers ----------
  function toNum(v) {
    if (isErr(v)) throw v;
    if (v === null || v === undefined || v === '') return 0;
    if (typeof v === 'number') return v;
    if (typeof v === 'boolean') return v ? 1 : 0;
    if (typeof v === 'string') {
      const n = parseLiteralNumber(v);
      if (n !== null) return n;
      throw ERR.VALUE;
    }
    throw ERR.VALUE;
  }
  function toStr(v) {
    if (isErr(v)) throw v;
    if (v === null || v === undefined) return '';
    if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
    if (typeof v === 'number') return formatGeneral(v);
    return String(v);
  }
  function toBool(v) {
    if (isErr(v)) throw v;
    if (v === null || v === undefined) return false;
    if (typeof v === 'boolean') return v;
    if (typeof v === 'number') return v !== 0;
    if (typeof v === 'string') {
      const u = v.toUpperCase();
      if (u === 'TRUE') return true;
      if (u === 'FALSE') return false;
      throw ERR.VALUE;
    }
    throw ERR.VALUE;
  }
  function parseLiteralNumber(s) {
    const t = String(s).trim().replace(/,/g, '');
    if (t === '') return null;
    let m = /^([+-]?)\$?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.exec(t);
    if (m) return parseFloat(m[1] + m[2] + (m[3] || ''));
    m = /^([+-]?)(\d+\.?\d*|\.\d+)%$/.exec(t);
    if (m) return parseFloat(m[1] + m[2]) / 100;
    return null;
  }
  function formatGeneral(n) {
    if (!isFinite(n)) return '#NUM!';
    if (Number.isInteger(n)) return String(n);
    const r = parseFloat(n.toPrecision(10));
    return String(r);
  }
  // Scalar from a possibly-range value (implicit intersection: top-left)
  function scalar(v) {
    if (v instanceof Range) return v.sheet.value(addr(v.c1, v.r1));
    if (Array.isArray(v)) return Array.isArray(v[0]) ? v[0][0] : v[0];
    return v;
  }
  // Flatten args for aggregate functions. fromRange flag tells whether to
  // skip text/booleans (Excel rule: text in ranges is ignored by SUM etc.)
  function collect(args) {
    const out = [];
    for (const a of args) {
      if (a instanceof Range) { for (const v of a.flat()) out.push({ v, ref: true }); }
      else out.push({ v: a, ref: false });
    }
    return out;
  }
  function numbersOf(args) {
    const nums = [];
    for (const { v, ref } of collect(args)) {
      if (isErr(v)) throw v;
      if (ref) { if (typeof v === 'number') nums.push(v); }
      else if (v !== null && v !== undefined) nums.push(toNum(v));
    }
    return nums;
  }

  // ---------- Criteria (COUNTIF, SUMIF, ...) ----------
  function makeCriteria(crit) {
    if (isErr(crit)) throw crit;
    if (typeof crit === 'number' || typeof crit === 'boolean') {
      return (v) => v === crit || (typeof v === 'string' && parseLiteralNumber(v) === crit);
    }
    let s = crit === null || crit === undefined ? '' : String(crit);
    let op = '=';
    const m = /^(<=|>=|<>|<|>|=)(.*)$/.exec(s);
    if (m) { op = m[1]; s = m[2]; }
    const n = parseLiteralNumber(s);
    if (n !== null && s.trim() !== '') {
      return (v) => {
        if (typeof v !== 'number') return op === '<>' ? true : false;
        switch (op) {
          case '=': return v === n; case '<>': return v !== n;
          case '<': return v < n; case '>': return v > n;
          case '<=': return v <= n; case '>=': return v >= n;
        }
        return false;
      };
    }
    // text comparison with wildcards for = and <>
    const re = new RegExp('^' + s.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/~\*/g, '\u0001').replace(/~\?/g, '\u0002')
      .replace(/\*/g, '.*').replace(/\?/g, '.').replace(/\u0001/g, '\\*').replace(/\u0002/g, '\\?') + '$', 'i');
    if (op === '=' || op === '<>') {
      return (v) => {
        const sv = v === null || v === undefined ? '' : (typeof v === 'string' ? v : null);
        const hit = sv !== null && (s === '' ? sv === '' : re.test(sv));
        return op === '=' ? hit : !hit;
      };
    }
    const lower = s.toLowerCase();
    return (v) => {
      if (typeof v !== 'string') return false;
      const a = v.toLowerCase();
      switch (op) {
        case '<': return a < lower; case '>': return a > lower;
        case '<=': return a <= lower; case '>=': return a >= lower;
      }
      return false;
    };
  }

  function valuesEqual(a, b) {
    if (typeof a === 'string' && typeof b === 'string') return a.toLowerCase() === b.toLowerCase();
    if (typeof a === 'number' && typeof b === 'string') return parseLiteralNumber(b) === a;
    if (typeof b === 'number' && typeof a === 'string') return parseLiteralNumber(a) === b;
    return a === b;
  }

  function compare(a, b) {
    // Excel ordering: numbers < text < booleans; blanks treated as 0 / ""
    const rank = (v) => (typeof v === 'number' ? 0 : typeof v === 'string' ? 1 : typeof v === 'boolean' ? 2 : 0);
    if (a === null || a === undefined) a = typeof b === 'string' ? '' : (typeof b === 'boolean' ? false : 0);
    if (b === null || b === undefined) b = typeof a === 'string' ? '' : (typeof a === 'boolean' ? false : 0);
    const ra = rank(a), rb = rank(b);
    if (ra !== rb) return ra - rb;
    if (typeof a === 'string') { const x = a.toLowerCase(), y = b.toLowerCase(); return x < y ? -1 : x > y ? 1 : 0; }
    if (typeof a === 'boolean') return (a ? 1 : 0) - (b ? 1 : 0);
    return a < b ? -1 : a > b ? 1 : 0;
  }

  function vectorOf(v) {
    if (v instanceof Range) return v.flat();
    if (Array.isArray(v)) return v.flat();
    return [v];
  }

  function roundTo(n, d, mode) {
    const f = Math.pow(10, d);
    const x = n * f;
    let r;
    const eps = 1e-9;
    if (mode === 'up') r = Math.sign(x) * Math.ceil(Math.abs(x) - eps);
    else if (mode === 'down') r = Math.sign(x) * Math.floor(Math.abs(x) + eps);
    else r = Math.sign(x) * Math.round(Math.abs(x) + eps);
    return r / f;
  }

  // ---------- Functions ----------
  // Lazy functions receive (args AST, evalNode) and decide what to evaluate.
  const LAZY = {
    IF(args, ev) {
      if (args.length < 2 || args.length > 3) throw ERR.ERROR;
      const c = toBool(scalar(ev(args[0])));
      if (c) return ev(args[1]);
      return args.length === 3 ? ev(args[2]) : false;
    },
    IFERROR(args, ev) {
      if (args.length !== 2) throw ERR.ERROR;
      try {
        const v = scalar(ev(args[0]));
        if (isErr(v)) return ev(args[1]);
        return v;
      } catch (e) {
        if (isErr(e)) return ev(args[1]);
        throw e;
      }
    },
    IFNA(args, ev) {
      if (args.length !== 2) throw ERR.ERROR;
      try {
        const v = scalar(ev(args[0]));
        if (v === ERR.NA) return ev(args[1]);
        return v;
      } catch (e) {
        if (e === ERR.NA) return ev(args[1]);
        throw e;
      }
    },
    IFS(args, ev) {
      if (args.length < 2 || args.length % 2) throw ERR.ERROR;
      for (let i = 0; i < args.length; i += 2) {
        if (toBool(scalar(ev(args[i])))) return ev(args[i + 1]);
      }
      throw ERR.NA;
    },
  };

  const FN = {
    SUM: (...a) => numbersOf(a).reduce((s, x) => s + x, 0),
    AVERAGE: (...a) => { const n = numbersOf(a); if (!n.length) throw ERR.DIV0; return n.reduce((s, x) => s + x, 0) / n.length; },
    MIN: (...a) => { const n = numbersOf(a); return n.length ? Math.min(...n) : 0; },
    MAX: (...a) => { const n = numbersOf(a); return n.length ? Math.max(...n) : 0; },
    MEDIAN: (...a) => {
      const n = numbersOf(a).sort((x, y) => x - y);
      if (!n.length) throw ERR.NUM;
      const m = Math.floor(n.length / 2);
      return n.length % 2 ? n[m] : (n[m - 1] + n[m]) / 2;
    },
    PRODUCT: (...a) => numbersOf(a).reduce((s, x) => s * x, 1),
    COUNT: (...a) => collect(a).filter(({ v, ref }) => typeof v === 'number' || (!ref && parseLiteralNumber(v) !== null && typeof v !== 'boolean')).length,
    COUNTA: (...a) => collect(a).filter(({ v }) => v !== null && v !== undefined && v !== '').length,
    COUNTBLANK: (r) => vectorOf(r).filter((v) => v === null || v === undefined || v === '').length,
    LARGE: (r, k) => { const n = numbersOf([r]).sort((x, y) => y - x); k = toNum(scalar(k)); if (k < 1 || k > n.length) throw ERR.NUM; return n[k - 1]; },
    SMALL: (r, k) => { const n = numbersOf([r]).sort((x, y) => x - y); k = toNum(scalar(k)); if (k < 1 || k > n.length) throw ERR.NUM; return n[k - 1]; },

    ROUND: (n, d) => roundTo(toNum(scalar(n)), d === undefined ? 0 : toNum(scalar(d))),
    ROUNDUP: (n, d) => roundTo(toNum(scalar(n)), d === undefined ? 0 : toNum(scalar(d)), 'up'),
    ROUNDDOWN: (n, d) => roundTo(toNum(scalar(n)), d === undefined ? 0 : toNum(scalar(d)), 'down'),
    INT: (n) => Math.floor(toNum(scalar(n))),
    ABS: (n) => Math.abs(toNum(scalar(n))),
    SQRT: (n) => { const x = toNum(scalar(n)); if (x < 0) throw ERR.NUM; return Math.sqrt(x); },
    POWER: (a, b) => Math.pow(toNum(scalar(a)), toNum(scalar(b))),
    MOD: (a, b) => { const x = toNum(scalar(a)), y = toNum(scalar(b)); if (y === 0) throw ERR.DIV0; return x - y * Math.floor(x / y); },
    PI: () => Math.PI,

    AND: (...a) => { const v = collect(a).filter(({ v }) => v !== null && v !== undefined); if (!v.length) throw ERR.VALUE; return v.every(({ v }) => toBool(v)); },
    OR: (...a) => { const v = collect(a).filter(({ v }) => v !== null && v !== undefined); if (!v.length) throw ERR.VALUE; return v.some(({ v }) => toBool(v)); },
    NOT: (v) => !toBool(scalar(v)),
    TRUE: () => true,
    FALSE: () => false,

    COUNTIF: (r, c) => { const f = makeCriteria(scalar(c)); return vectorOf(r).filter(f).length; },
    SUMIF: (r, c, s) => {
      const f = makeCriteria(scalar(c));
      const crit = vectorOf(r);
      const sums = s === undefined ? crit : vectorOf(s);
      let t = 0;
      crit.forEach((v, i) => { if (f(v) && typeof sums[i] === 'number') t += sums[i]; });
      return t;
    },
    AVERAGEIF: (r, c, s) => {
      const f = makeCriteria(scalar(c));
      const crit = vectorOf(r);
      const vals = s === undefined ? crit : vectorOf(s);
      let t = 0, n = 0;
      crit.forEach((v, i) => { if (f(v) && typeof vals[i] === 'number') { t += vals[i]; n++; } });
      if (!n) throw ERR.DIV0;
      return t / n;
    },
    COUNTIFS: (...a) => {
      if (a.length % 2) throw ERR.ERROR;
      const len = vectorOf(a[0]).length;
      let n = 0;
      const pairs = [];
      for (let i = 0; i < a.length; i += 2) pairs.push([vectorOf(a[i]), makeCriteria(scalar(a[i + 1]))]);
      for (let i = 0; i < len; i++) if (pairs.every(([v, f]) => f(v[i]))) n++;
      return n;
    },
    SUMIFS: (s, ...a) => {
      if (a.length % 2) throw ERR.ERROR;
      const sums = vectorOf(s);
      const pairs = [];
      for (let i = 0; i < a.length; i += 2) pairs.push([vectorOf(a[i]), makeCriteria(scalar(a[i + 1]))]);
      let t = 0;
      sums.forEach((v, i) => { if (pairs.every(([vv, f]) => f(vv[i])) && typeof v === 'number') t += v; });
      return t;
    },

    LEN: (s) => toStr(scalar(s)).length,
    UPPER: (s) => toStr(scalar(s)).toUpperCase(),
    LOWER: (s) => toStr(scalar(s)).toLowerCase(),
    PROPER: (s) => toStr(scalar(s)).toLowerCase().replace(/(^|[^a-z])([a-z])/g, (m, a, b) => a + b.toUpperCase()),
    TRIM: (s) => toStr(scalar(s)).replace(/ +/g, ' ').trim(),
    LEFT: (s, n) => { const k = n === undefined ? 1 : toNum(scalar(n)); if (k < 0) throw ERR.VALUE; return toStr(scalar(s)).slice(0, k); },
    RIGHT: (s, n) => { const k = n === undefined ? 1 : toNum(scalar(n)); if (k < 0) throw ERR.VALUE; const t = toStr(scalar(s)); return k === 0 ? '' : t.slice(-k); },
    MID: (s, st, n) => { const a = toNum(scalar(st)), k = toNum(scalar(n)); if (a < 1 || k < 0) throw ERR.VALUE; return toStr(scalar(s)).substr(a - 1, k); },
    CONCAT: (...a) => collect(a).map(({ v }) => toStr(v)).join(''),
    CONCATENATE: (...a) => a.map((v) => toStr(scalar(v))).join(''),
    TEXTJOIN: (d, ig, ...a) => {
      const delim = toStr(scalar(d)), ignore = toBool(scalar(ig));
      return collect(a).map(({ v }) => toStr(v)).filter((s) => !(ignore && s === '')).join(delim);
    },
    FIND: (f, s, st) => {
      const start = st === undefined ? 1 : toNum(scalar(st));
      const i = toStr(scalar(s)).indexOf(toStr(scalar(f)), start - 1);
      if (i < 0) throw ERR.VALUE; return i + 1;
    },
    SEARCH: (f, s, st) => {
      const start = st === undefined ? 1 : toNum(scalar(st));
      const i = toStr(scalar(s)).toLowerCase().indexOf(toStr(scalar(f)).toLowerCase(), start - 1);
      if (i < 0) throw ERR.VALUE; return i + 1;
    },
    SUBSTITUTE: (s, o, n) => { const old = toStr(scalar(o)); if (!old) return toStr(scalar(s)); return toStr(scalar(s)).split(old).join(toStr(scalar(n))); },
    REPT: (s, n) => toStr(scalar(s)).repeat(Math.max(0, Math.floor(toNum(scalar(n))))),
    VALUE: (s) => toNum(scalar(s)),

    VLOOKUP: (key, table, col, approx) => {
      if (!(table instanceof Range)) throw ERR.VALUE;
      const k = scalar(key);
      const ci = toNum(scalar(col));
      if (ci < 1 || ci > table.cols) throw ERR.REF;
      const m = table.matrix();
      const exact = approx !== undefined && approx !== null && !toBool(scalar(approx));
      if (exact) {
        for (const row of m) if (valuesEqual(row[0], k)) return row[ci - 1];
        throw ERR.NA;
      }
      let found = -1;
      for (let i = 0; i < m.length; i++) {
        if (m[i][0] === null) continue;
        if (compare(m[i][0], k) <= 0) found = i; else break;
      }
      if (found < 0) throw ERR.NA;
      return m[found][ci - 1];
    },
    HLOOKUP: (key, table, rowIdx, approx) => {
      if (!(table instanceof Range)) throw ERR.VALUE;
      const k = scalar(key);
      const ri = toNum(scalar(rowIdx));
      if (ri < 1 || ri > table.rows) throw ERR.REF;
      const m = table.matrix();
      const exact = approx !== undefined && approx !== null && !toBool(scalar(approx));
      for (let c = 0; c < table.cols; c++) {
        if (exact ? valuesEqual(m[0][c], k) : compare(m[0][c], k) === 0) return m[ri - 1][c];
      }
      throw ERR.NA;
    },
    XLOOKUP: (key, look, ret, notFound) => {
      const k = scalar(key);
      const lv = vectorOf(look);
      if (!(ret instanceof Range)) {
        const rv = vectorOf(ret);
        for (let i = 0; i < lv.length; i++) if (valuesEqual(lv[i], k)) return rv[i];
      } else {
        const vertical = look instanceof Range ? look.cols === 1 : true;
        for (let i = 0; i < lv.length; i++) {
          if (valuesEqual(lv[i], k)) {
            if (vertical) return ret.sheet.value(addr(ret.c1, ret.r1 + i));
            return ret.sheet.value(addr(ret.c1 + i, ret.r1));
          }
        }
      }
      if (notFound !== undefined) return scalar(notFound);
      throw ERR.NA;
    },
    MATCH: (key, look, type) => {
      const k = scalar(key);
      const lv = vectorOf(look);
      const t = type === undefined ? 1 : toNum(scalar(type));
      if (t === 0) {
        if (typeof k === 'string' && /[*?]/.test(k)) {
          const f = makeCriteria(k);
          for (let i = 0; i < lv.length; i++) if (f(lv[i])) return i + 1;
        } else {
          for (let i = 0; i < lv.length; i++) if (valuesEqual(lv[i], k)) return i + 1;
        }
        throw ERR.NA;
      }
      let found = -1;
      for (let i = 0; i < lv.length; i++) {
        if (lv[i] === null) continue;
        const c = compare(lv[i], k);
        if (t > 0 ? c <= 0 : c >= 0) found = i; else break;
      }
      if (found < 0) throw ERR.NA;
      return found + 1;
    },
    INDEX: (r, row, col) => {
      if (!(r instanceof Range)) throw ERR.VALUE;
      let ri = row === undefined ? 1 : toNum(scalar(row));
      let ci = col === undefined ? 1 : toNum(scalar(col));
      if (r.rows === 1 && col === undefined) { ci = ri; ri = 1; }
      if (ri < 1 || ci < 1 || ri > r.rows || ci > r.cols) throw ERR.REF;
      return r.sheet.value(addr(r.c1 + ci - 1, r.r1 + ri - 1));
    },
    ISBLANK: (v) => { v = scalar(v); return v === null || v === undefined; },
    ISNUMBER: (v) => typeof scalar(v) === 'number',
    ISTEXT: (v) => typeof scalar(v) === 'string',
    ISERROR: () => false, // handled specially below
    NA: () => { throw ERR.NA; },
    ROWS: (r) => (r instanceof Range ? r.rows : 1),
    COLUMNS: (r) => (r instanceof Range ? r.cols : 1),
  };
  // Functions that should see errors rather than throw on them
  const ERROR_AWARE = new Set(['ISERROR', 'ISNUMBER', 'ISTEXT', 'ISBLANK']);
  const FN_NAMES = Object.keys(FN).concat(Object.keys(LAZY)).sort();

  // ---------- Sheet ----------
  class Sheet {
    constructor(rows, cols) {
      this.rows = rows; this.cols = cols;
      this.raw = {};      // address -> raw string typed by user
      this.cache = {};
      this.computing = new Set();
      this.astCache = {};
    }
    setRaw(a, text) {
      a = a.toUpperCase();
      if (text === '' || text === null || text === undefined) delete this.raw[a];
      else this.raw[a] = String(text);
      this.cache = {};
    }
    getRaw(a) { return this.raw[a.toUpperCase()] || ''; }
    invalidate() { this.cache = {}; }
    inBounds(p) { return p && p.col >= 1 && p.row >= 1 && p.col <= this.cols && p.row <= this.rows; }

    // Value of a cell: number | string | boolean | null | FErr
    value(a) {
      a = a.replace(/\$/g, '').toUpperCase();
      if (a in this.cache) return this.cache[a];
      const raw = this.raw[a];
      let v;
      if (raw === undefined || raw === '') v = null;
      else if (raw[0] === '=' && raw.length > 1) {
        if (this.computing.has(a)) return ERR.REF;
        this.computing.add(a);
        try { v = this.evalFormula(raw.slice(1)); }
        finally { this.computing.delete(a); }
      } else v = literal(raw);
      this.cache[a] = v;
      return v;
    }
    evalFormula(src) {
      let ast = this.astCache[src];
      if (!ast) {
        try { ast = parse(src); } catch (e) { return isErr(e) ? e : ERR.ERROR; }
        this.astCache[src] = ast;
      }
      try {
        let v = scalar(this.evalNode(ast));
        if (v === null || v === undefined) v = 0;
        if (typeof v === 'number' && !isFinite(v)) return ERR.NUM;
        return v;
      } catch (e) {
        if (isErr(e)) return e;
        throw e;
      }
    }
    evalNode(n) {
      switch (n.k) {
        case 'num': return n.v;
        case 'str': return n.v;
        case 'bool': return n.v;
        case 'blank': return null;
        case 'badname': throw ERR.NAME;
        case 'ref': {
          const p = parseAddr(n.a);
          if (!this.inBounds(p)) throw ERR.REF;
          const v = this.value(n.a);
          return v;
        }
        case 'range': {
          const p = parseAddr(n.a), q = parseAddr(n.b);
          if (!this.inBounds(p) || !this.inBounds(q)) throw ERR.REF;
          return new Range(this, p.col, p.row, q.col, q.row);
        }
        case 'neg': return -toNum(scalar(this.evalNode(n.e)));
        case 'pct': return toNum(scalar(this.evalNode(n.e))) / 100;
        case 'bin': {
          const l = scalar(this.evalNode(n.l));
          const r = scalar(this.evalNode(n.r));
          if (isErr(l)) throw l;
          if (isErr(r)) throw r;
          switch (n.op) {
            case '+': return toNum(l) + toNum(r);
            case '-': return toNum(l) - toNum(r);
            case '*': return toNum(l) * toNum(r);
            case '/': { const d = toNum(r); if (d === 0) throw ERR.DIV0; return toNum(l) / d; }
            case '^': return Math.pow(toNum(l), toNum(r));
            case '&': return toStr(l) + toStr(r);
            case '=': return compare(l, r) === 0;
            case '<>': return compare(l, r) !== 0;
            case '<': return compare(l, r) < 0;
            case '>': return compare(l, r) > 0;
            case '<=': return compare(l, r) <= 0;
            case '>=': return compare(l, r) >= 0;
          }
          throw ERR.ERROR;
        }
        case 'fn': {
          if (LAZY[n.name]) return LAZY[n.name](n.args, (x) => this.evalNode(x));
          const f = FN[n.name];
          if (!f) throw ERR.NAME;
          if (ERROR_AWARE.has(n.name)) {
            let v;
            try { v = scalar(this.evalNode(n.args[0])); } catch (e) { if (isErr(e)) v = e; else throw e; }
            if (n.name === 'ISERROR') return isErr(v);
            if (isErr(v)) return false;
            return f(v);
          }
          const args = n.args.map((a) => {
            const v = this.evalNode(a);
            return v;
          });
          for (const a of args) if (isErr(a)) throw a;
          return f(...args);
        }
      }
      throw ERR.ERROR;
    }
  }

  function literal(raw) {
    if (raw[0] === "'") return raw.slice(1);
    const u = raw.trim().toUpperCase();
    if (u === 'TRUE') return true;
    if (u === 'FALSE') return false;
    const n = parseLiteralNumber(raw);
    if (n !== null) return n;
    return raw;
  }

  // ---------- Formula shifting for copy/fill ----------
  function shiftFormula(formula, dRow, dCol, maxRow, maxCol) {
    if (!formula || formula[0] !== '=') return formula;
    let out = '';
    let i = 0;
    const s = formula;
    while (i < s.length) {
      if (s[i] === '"') {
        let j = i + 1;
        while (j < s.length) { if (s[j] === '"') { if (s[j + 1] === '"') { j += 2; continue; } break; } j++; }
        out += s.slice(i, j + 1); i = j + 1; continue;
      }
      const prev = i > 0 ? s[i - 1] : '';
      if (!/[A-Za-z0-9_.]/.test(prev)) {
        const m = /^(\$?)([A-Za-z]{1,3})(\$?)(\d+)(?![A-Za-z0-9_(])/.exec(s.slice(i));
        if (m) {
          let col = colToNum(m[2]), row = parseInt(m[4], 10);
          if (!m[1]) col += dCol;
          if (!m[3]) row += dRow;
          if (col < 1 || row < 1 || (maxCol && col > maxCol) || (maxRow && row > maxRow)) out += '#REF!';
          else out += m[1] + numToCol(col) + m[3] + row;
          i += m[0].length; continue;
        }
      }
      out += s[i]; i++;
    }
    return out;
  }

  function usesFunction(raw, name) {
    if (!raw || raw[0] !== '=') return false;
    const stripped = raw.replace(/"(?:[^"]|"")*"/g, '""');
    return new RegExp('(^|[^A-Za-z0-9_.])' + name + '\\s*\\(', 'i').test(stripped);
  }

  const api = {
    Sheet, Range, FErr, ERR, isErr, parse, tokenize,
    colToNum, numToCol, parseAddr, addr, shiftFormula, usesFunction,
    formatGeneral, parseLiteralNumber, literal, FN_NAMES,
  };
  root.SheetEngine = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
