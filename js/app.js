/* Book reader: navigation, progress, quizzes and practice-grid mounting. */
(function () {
  'use strict';

  const META = {
    excel: { name: 'Excel', title: 'Excel: Zero to Intermediate', other: 'sheets', otherName: 'Google Sheets' },
    sheets: { name: 'Google Sheets', title: 'Google Sheets: Zero to Intermediate', other: 'excel', otherName: 'Excel' },
  };
  const track = new URLSearchParams(location.search).get('track');
  if (!META[track]) { location.replace('index.html'); return; }
  const meta = META[track];

  // ---------- Platform (Windows / Mac) ----------
  const OS_NAMES = { win: 'Windows', mac: 'Mac' };
  const params = new URLSearchParams(location.search);
  const detectOS = () => (/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent) ? 'mac' : 'win');
  let os = params.get('os');
  if (!OS_NAMES[os]) { try { os = localStorage.getItem('ssbook:os'); } catch (e) { os = null; } }
  if (!OS_NAMES[os]) os = detectOS();
  try { localStorage.setItem('ssbook:os', os); } catch (e) { /* ignore */ }

  // ---------- Storage ----------
  const PREFIX = `ssbook:${track}:`;
  const store = {
    get(k, d) { try { const v = localStorage.getItem(PREFIX + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(PREFIX + k, JSON.stringify(v)); } catch (e) { /* storage full or blocked */ } },
    clear() { Object.keys(localStorage).filter((k) => k.startsWith(PREFIX)).forEach((k) => localStorage.removeItem(k)); },
  };
  let progress = store.get('progress', { done: {}, quiz: {}, last: null });
  const saveProgress = () => store.set('progress', progress);

  // ---------- Content ----------
  const chapters = BookContent.build(track, os);
  const lessons = [];
  chapters.forEach((ch, ci) => ch.lessons.forEach((l) => lessons.push(Object.assign(l, { chapter: ch, chapterIndex: ci }))));
  const byId = Object.fromEntries(lessons.map((l, i) => [l.id, Object.assign(l, { index: i })]));

  // ---------- DOM ----------
  const $ = (s, r = document) => r.querySelector(s);
  const main = $('#main');
  const toc = $('#toc');
  document.body.classList.add('track-' + track);
  document.title = meta.title;
  $('#book-title').textContent = `${meta.title} · ${OS_NAMES[os]}`;
  $('#switch-book').href = `book.html?track=${meta.other}&os=${os}`;
  document.body.classList.add('os-' + os);
  document.querySelectorAll('#os-switch [data-os]').forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.os === os));
    b.addEventListener('click', () => {
      if (b.dataset.os === os) return;
      try { localStorage.setItem('ssbook:os', b.dataset.os); } catch (e) { /* ignore */ }
      location.href = `book.html?track=${track}&os=${b.dataset.os}${location.hash}`;
    });
  });
  $('#switch-book').textContent = `Switch to the ${meta.otherName} book`;

  // Theme
  const root = document.documentElement;
  const savedTheme = localStorage.getItem('ssbook:theme');
  if (savedTheme) root.dataset.theme = savedTheme;
  $('#theme-toggle').addEventListener('click', () => {
    const dark = root.dataset.theme === 'dark' || (!root.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
    root.dataset.theme = dark ? 'light' : 'dark';
    localStorage.setItem('ssbook:theme', root.dataset.theme);
  });

  // Mobile nav
  $('#nav-toggle').addEventListener('click', () => document.body.classList.toggle('nav-open'));
  $('#nav-scrim').addEventListener('click', () => document.body.classList.remove('nav-open'));

  $('#reset-progress').addEventListener('click', () => {
    if (!confirm(`Reset all progress and practice work in the ${meta.name} book?`)) return;
    store.clear();
    progress = { done: {}, quiz: {}, last: null };
    location.hash = '#' + lessons[0].id;
    renderToc();
    renderLesson(lessons[0]);
  });

  // ---------- TOC ----------
  function renderToc() {
    const doneCount = lessons.filter((l) => progress.done[l.id]).length;
    toc.innerHTML = chapters.map((ch, ci) => {
      const chDone = ch.lessons.filter((l) => progress.done[l.id]).length;
      return `<section class="toc-ch">
        <h2><span class="toc-icon" aria-hidden="true">${ch.icon}</span><span>${ci + 1}. ${ch.title}</span><span class="toc-count">${chDone}/${ch.lessons.length}</span></h2>
        <ol>${ch.lessons.map((l) => `<li><a href="#${l.id}" data-id="${l.id}" class="${progress.done[l.id] ? 'done' : ''}">
          <span class="toc-dot" aria-hidden="true"></span><span>${l.title}</span></a></li>`).join('')}</ol></section>`;
    }).join('');
    const pct = Math.round((doneCount / lessons.length) * 100);
    $('#progress-text').textContent = `${doneCount} / ${lessons.length} lessons`;
    $('#progress-bar').style.width = pct + '%';
    $('#progress-bar').parentElement.setAttribute('aria-valuenow', pct);
    highlightToc();
  }
  function highlightToc() {
    toc.querySelectorAll('a').forEach((a) => {
      const on = current && a.dataset.id === current.id;
      a.classList.toggle('current', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }

  // ---------- Lesson ----------
  let current = null;
  let mounted = [];
  let ready = false;

  function renderLesson(lesson) {
    mounted.forEach((m) => m.grid && m.grid.destroy());
    mounted = [];
    ready = false;
    current = lesson;
    progress.last = lesson.id;
    saveProgress();

    const prev = lessons[lesson.index - 1], next = lessons[lesson.index + 1];
    main.innerHTML = `
      <article class="lesson">
        <header class="lesson-head">
          <div class="crumb">Chapter ${lesson.chapterIndex + 1} · ${lesson.chapter.title}</div>
          <h1 tabindex="-1">${lesson.title}</h1>
          <div class="meta">⏱ ${lesson.minutes} min <span class="done-badge" ${progress.done[lesson.id] ? '' : 'hidden'}>✓ Completed</span></div>
        </header>
        <div class="lesson-body">${lesson.html}</div>
        <footer class="lesson-foot">
          <button type="button" class="btn ghost" id="mark-done"></button>
          <div class="pager">
            ${prev ? `<a class="btn ghost" href="#${prev.id}" rel="prev">← ${prev.title}</a>` : '<span></span>'}
            ${next ? `<a class="btn primary" href="#${next.id}" rel="next" id="next-link">${next.title} →</a>` : `<a class="btn primary" href="index.html">Back to the library 🎉</a>`}
          </div>
        </footer>
      </article>`;

    // Grids
    main.querySelectorAll('[data-grid]').forEach((el) => {
      const gid = el.dataset.grid;
      const cfg = lesson.grids && lesson.grids[gid];
      if (!cfg) return;
      const key = `grid:${lesson.id}:${gid}`;
      const head = document.createElement('div');
      head.className = 'practice-head';
      head.innerHTML = `<span class="practice-label">✍️ Practice</span><span class="practice-count"></span>`;
      el.parentNode.insertBefore(head, el);
      const entry = { grid: null, done: false, head };
      mounted.push(entry);
      const gridEl = document.createElement('div');
      el.appendChild(gridEl);
      entry.grid = new SheetGrid(gridEl, Object.assign({ enterEdits: track === 'sheets', os }, cfg), {
        saved: store.get(key, null),
        onChange: (snap) => store.set(key, snap),
        onTasksChange: (state, justFinished) => {
          entry.done = state.every(Boolean);
          const n = state.filter(Boolean).length;
          head.querySelector('.practice-count').textContent = state.length ? `${n} / ${state.length} tasks` : '';
          head.classList.toggle('complete', entry.done);
          if (justFinished) toast('Practice complete! 🎉');
          evaluateCompletion();
        },
      });
    });

    // Quizzes
    main.querySelectorAll('[data-quiz]').forEach((el) => {
      const qid = el.dataset.quiz;
      const q = lesson.quizzes && lesson.quizzes[qid];
      if (!q) return;
      const key = lesson.id + ':' + qid;
      const entry = { quiz: true, done: progress.quiz[key] === q.answer };
      mounted.push(entry);
      el.innerHTML = `
        <div class="quiz-q"><span class="quiz-tag">Quick check</span>${q.q}</div>
        <div class="quiz-opts" role="group" aria-label="Answers">${q.options.map((o, i) => `<button type="button" class="quiz-opt" data-i="${i}">${o}</button>`).join('')}</div>
        <div class="quiz-fb" aria-live="polite"></div>`;
      const show = (i, fresh) => {
        el.querySelectorAll('.quiz-opt').forEach((b) => {
          const bi = +b.dataset.i;
          b.classList.remove('right', 'wrong');
          if (bi === i) b.classList.add(i === q.answer ? 'right' : 'wrong');
          if (i === q.answer) b.disabled = true;
        });
        const fb = el.querySelector('.quiz-fb');
        if (i === q.answer) fb.innerHTML = `<b>Correct.</b> ${q.explain || ''}`;
        else fb.innerHTML = `<b>Not quite.</b> Try another answer.`;
        fb.className = 'quiz-fb ' + (i === q.answer ? 'ok' : 'no');
        entry.done = i === q.answer;
        if (fresh) evaluateCompletion();
      };
      if (progress.quiz[key] !== undefined) show(progress.quiz[key], false);
      el.addEventListener('click', (e) => {
        const b = e.target.closest('.quiz-opt');
        if (!b || b.disabled) return;
        const i = +b.dataset.i;
        progress.quiz[key] = i;
        saveProgress();
        show(i, true);
      });
    });

    ready = true;
    const markBtn = $('#mark-done');
    const syncMark = () => {
      const d = !!progress.done[lesson.id];
      markBtn.textContent = d ? '✓ Completed (click to undo)' : 'Mark lesson as complete';
      markBtn.classList.toggle('is-done', d);
      main.querySelector('.done-badge').hidden = !d;
    };
    markBtn.addEventListener('click', () => {
      setDone(lesson, !progress.done[lesson.id]);
      syncMark();
    });
    const nextLink = $('#next-link');
    if (nextLink) nextLink.addEventListener('click', () => {
      // Reading-only lessons count as complete once you move on
      if (!mounted.length) setDone(lesson, true);
    });
    syncMark();
    lesson._syncMark = syncMark;

    highlightToc();
    document.body.classList.remove('nav-open');
    window.scrollTo(0, 0);
    const h1 = main.querySelector('h1');
    if (h1) h1.focus({ preventScroll: true });
  }

  function evaluateCompletion() {
    if (!ready || !current || !mounted.length) return;
    const all = mounted.every((m) => m.done);
    if (all && !progress.done[current.id]) {
      setDone(current, true);
      toast('Lesson complete ✓');
      if (current._syncMark) current._syncMark();
    }
  }

  function setDone(lesson, done) {
    if (done) progress.done[lesson.id] = true; else delete progress.done[lesson.id];
    saveProgress();
    renderToc();
  }

  let toastT;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove('show'), 2600);
  }

  // ---------- Routing ----------
  function route() {
    const id = decodeURIComponent(location.hash.slice(1));
    const lesson = byId[id] || byId[progress.last] || lessons[0];
    if (!byId[id]) { history.replaceState(null, '', '#' + lesson.id); }
    if (current !== lesson) renderLesson(lesson);
  }
  window.addEventListener('hashchange', route);
  renderToc();
  route();
})();
