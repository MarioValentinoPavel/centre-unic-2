/* Centre Únic · "28 dies": anells de fases lunars, el cicle pineat i la calculadora */
gsap.registerPlugin(ScrollTrigger);
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const NS = 'http://www.w3.org/2000/svg';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const el = (tag, attrs = {}, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); parent && parent.appendChild(n); return n; };

/* ---------- fase lunar: p 0 = nova, .5 = plena, 1 = nova ---------- */
function phasePath(p, r) {
  p = ((p % 1) + 1) % 1;
  const k = Math.cos(p * Math.PI * 2), rx = Math.abs(k) * r;
  if (p < .002 || p > .998) return '';
  if (p <= .5) return `M0 ${-r}A${r} ${r} 0 0 1 0 ${r}A${rx} ${r} 0 0 ${k > 0 ? 0 : 1} 0 ${-r}Z`;
  return `M0 ${-r}A${r} ${r} 0 0 0 0 ${r}A${rx} ${r} 0 0 ${k > 0 ? 1 : 0} 0 ${-r}Z`;
}

let uid = 0;
function defs(svg) {
  const id = ++uid, d = el('defs', {}, svg);
  const g1 = el('radialGradient', { id: 'mg' + id, cx: '38%', cy: '35%', r: '75%' }, d);
  el('stop', { offset: '0', 'stop-color': '#fffaf3' }, g1); el('stop', { offset: '.55', 'stop-color': '#f7e2d6' }, g1); el('stop', { offset: '1', 'stop-color': '#f2b8a2' }, g1);
  const g2 = el('radialGradient', { id: 'bg' + id, cx: '40%', cy: '36%', r: '80%' }, d);
  el('stop', { offset: '0', 'stop-color': '#fffaf3' }, g2); el('stop', { offset: '.6', 'stop-color': '#f4e6db' }, g2); el('stop', { offset: '1', 'stop-color': '#e9b5a3' }, g2);
  const f = el('filter', { id: 'gl' + id, x: '-50%', y: '-50%', width: '200%', height: '200%' }, d);
  el('feGaussianBlur', { stdDeviation: '18', result: 'b' }, f);
  const m = el('feMerge', {}, f); el('feMergeNode', { in: 'b' }, m); el('feMergeNode', { in: 'SourceGraphic' }, m);
  return id;
}
/* anell de n fases + lluna gran al centre */
function makeRing(svg, { n = 28, R = 420, dotR = 17, bigR = 250, ticks = false, phaseOf = i => .5 * (i + 1) / n }) {
  svg.textContent = '';
  const id = defs(svg);
  el('circle', { class: 'base', r: R }, svg);
  const C = Math.PI * 2 * R;
  const prog = el('circle', { class: 'prog', r: R, transform: 'rotate(-90)', 'stroke-dasharray': C.toFixed(1), 'stroke-dashoffset': C.toFixed(1) }, svg);
  const setProg = f => prog.setAttribute('stroke-dashoffset', (C * (1 - f)).toFixed(1));
  const big = el('g', { class: 'big' }, svg);
  el('circle', { class: 'big-bg', r: bigR }, big);
  const bigLit = el('path', { class: 'big-lit', fill: `url(#bg${id})`, filter: `url(#gl${id})` }, big);
  const dotsG = el('g', { class: 'dots' }, svg);
  const dots = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const g = el('g', { transform: `translate(${(Math.cos(a) * R).toFixed(1)} ${(Math.sin(a) * R).toFixed(1)})` }, dotsG);
    const inner = el('g', {}, g);
    el('circle', { class: 'dot-bg', r: dotR }, inner);
    const lit = el('path', { class: 'dot-lit', fill: `url(#mg${id})`, d: phasePath(phaseOf(i), dotR - 1) }, inner);
    dots.push({ g: inner, lit });
  }
  if (ticks) [7, 14, 21, 28].forEach(t => {
    const a = ((t - .5) / n) * Math.PI * 2 - Math.PI / 2, rr = R + 62;
    const tx = el('text', { class: 'tick', x: (Math.cos(a) * rr).toFixed(1), y: (Math.sin(a) * rr).toFixed(1) }, svg);
    tx.textContent = t;
  });
  return { svg, id, big, bigLit, bigR, dots, dotsG, R, n, setProg };
}

/* ---------- capçalera, llum i llunes de valoració ---------- */
$$('.moons').forEach(m => { for (let i = 0; i < 5; i++) m.appendChild(document.createElement('i')); });
const topBar = $('.top');
ScrollTrigger.create({ start: 80, end: 'max', onToggle: s => topBar.classList.toggle('is-solid', s.isActive) });
if (fine && !reduce) {
  const glow = $('.glow');
  const gx = gsap.quickTo(glow, 'x', { duration: .8, ease: 'power3' }), gy = gsap.quickTo(glow, 'y', { duration: .8, ease: 'power3' });
  addEventListener('pointermove', e => { glow.classList.add('on'); gx(e.clientX); gy(e.clientY); }, { passive: true });
}

/* ---------- portada: 28 fases que apareixen i la lluna que creix ---------- */
const hero = makeRing($('#heroRing'), { n: 28, R: 430, dotR: 16, bigR: 270 });
const heroDay = $('#heroDay');
function heroPhase(d) { hero.bigLit.setAttribute('d', phasePath(.5 * d / 28, hero.bigR)); }
gsap.set(hero.dots.map(d => d.g), { scale: 0, transformOrigin: '50% 50%' });
gsap.set('.hero__title .ln>span', { yPercent: 110 });
gsap.set(['.hero__sub', '.hero__bar'], { opacity: 0, y: 16 });
const st = { d: 0 };
const intro = gsap.timeline({ delay: .25, defaults: { ease: 'power3.out' } });
if (reduce) {
  intro.progress(1);
  heroPhase(28); hero.dots.forEach(d => gsap.set(d.g, { scale: 1 }));
  gsap.set('.hero__title .ln>span', { yPercent: 0 }); gsap.set(['.hero__sub', '.hero__bar'], { opacity: 1, y: 0 });
  gsap.set('.hero__count', { opacity: 0 }); gsap.set(hero.big, { opacity: .16 });
} else {
  intro
    .to(hero.dots.map(d => d.g), { scale: 1, duration: .6, ease: 'back.out(2)', stagger: 2.1 / 28 }, 0)
    .to(st, { d: 28, duration: 2.2, ease: 'none', onUpdate: () => { heroPhase(st.d); heroDay.textContent = String(Math.max(1, Math.ceil(st.d))).padStart(2, '0'); } }, 0)
    .to('.hero__count', { opacity: 0, scale: .9, duration: .7, ease: 'power2.in' }, 2.5)
    .to(hero.big, { opacity: .16, duration: 1.4, ease: 'power2.inOut' }, 2.6)
    .to('.hero__title .ln>span', { yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: .12 }, 2.75)
    .to('.hero__sub', { opacity: 1, y: 0, duration: 1 }, 3.2)
    .to('.hero__bar', { opacity: 1, y: 0, duration: 1 }, 3.35);
  gsap.to(hero.dotsG, { rotation: 360, svgOrigin: '0 0', duration: 260, repeat: -1, ease: 'none' });
}

/* ---------- el cicle: dia 1 → 28 amb el scroll ---------- */
const cyc = makeRing($('#cycleRing'), { n: 28, R: 400, dotR: 19, bigR: 250, ticks: true });
const weeks = $$('.week'), cycleDay = $('#cycleDay');
let curWeek = 0, curInt = 0;
function setCycle(d) { // d entre 1 i 28 (decimal)
  cyc.bigLit.setAttribute('d', phasePath(.5 * d / 28, cyc.bigR));
  cyc.setProg((d - .5) / 28);
  const di = Math.round(d);
  if (di !== curInt) {
    curInt = di; cycleDay.textContent = String(di).padStart(2, '0');
    cyc.dots.forEach((o, i) => {
      const passed = i < di;
      o.g.style.opacity = passed ? 1 : .22;
      o.g.style.transform = i === di - 1 ? 'scale(1.35)' : '';
    });
  }
  const w = Math.min(3, Math.floor((d - 1) / 7));
  if (w !== curWeek) { weeks[curWeek].classList.remove('is-on'); weeks[w].classList.add('is-on'); curWeek = w; }
}
cyc.dots.forEach(o => { o.g.style.transformBox = 'fill-box'; o.g.style.transformOrigin = 'center'; o.g.style.transition = 'transform .4s cubic-bezier(.16,1,.3,1), opacity .4s'; });
setCycle(1);
if (reduce) {
  $('.cycle').classList.add('is-static'); setCycle(28); weeks.forEach(w => w.classList.add('is-on'));
} else {
  ScrollTrigger.create({
    trigger: '.cycle', start: 'top top', end: () => '+=' + innerHeight * 3.2, pin: '.cycle__stage', scrub: .6,
    onUpdate: s => setCycle(1 + s.progress * 27)
  });
}

/* ---------- llunes dels tractaments ---------- */
$$('.card__moon').forEach(m => {
  const svg = el('svg', { viewBox: '-22 -22 44 44', 'aria-hidden': 'true' }, m);
  const id = defs(svg);
  el('circle', { r: 19, fill: 'rgba(244,237,227,.06)', stroke: 'rgba(244,237,227,.28)', 'stroke-width': 1 }, svg);
  const lit = el('path', { fill: `url(#mg${id})` }, svg);
  const o = { p: 0 }, target = +m.dataset.p;
  const draw = () => lit.setAttribute('d', phasePath(o.p, 18.5));
  draw();
  ScrollTrigger.create({ trigger: m, start: 'top 92%', onEnter: () => gsap.to(o, { p: target, duration: 1.4, ease: 'power2.out', onUpdate: draw }) });
  if (fine) {
    const card = m.closest('.card');
    card.addEventListener('pointerenter', () => gsap.to(o, { p: .5, duration: .7, ease: 'power3.out', overwrite: true, onUpdate: draw }));
    card.addEventListener('pointerleave', () => gsap.to(o, { p: target, duration: .9, ease: 'power3.out', overwrite: true, onUpdate: draw }));
  }
});

/* ---------- fitxa completa de cada tractament ---------- */
(function details() {
  const dlg = $('#tdlg'); if (!dlg) return;
  const g = $('#tdlgG'), h = $('#tdlgH'), b = $('#tdlgB'), wa = $('#tdlgWa');
  let cur = 0, opener;
  function fill() {
    if (!cur) return;
    const grp = $('.card__n span', $(`[data-x="${cur}"]`).closest('.card'));
    g.textContent = grp ? grp.textContent : '';
    h.textContent = t('a' + cur);
    b.innerHTML = t('x' + cur);
    wa.href = 'https://wa.me/34635857503?text=' + encodeURIComponent(t('dlg.msg', { t: t('a' + cur) }));
  }
  $$('.card__more').forEach(btn => btn.addEventListener('click', () => { cur = +btn.dataset.x; opener = btn; fill(); dlg.showModal(); dlg.scrollTop = 0; }));
  $('.tdlg__x').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', e => { // clic fora de la finestra
    const r = dlg.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dlg.close();
  });
  dlg.addEventListener('close', () => opener && opener.focus());
  document.addEventListener('langchange', fill);
})();

/* ---------- calculadora del cicle ---------- */
(function calc() {
  const age = $('#age'), ageOut = $('#ageOut'), res = $('#calcRes'), cta = $('#calcCta');
  const dayEl = $('#calcDay'), ofEl = $('#calcOf'), stageEl = $('#calcStage'), cell = $('#cell'), wrap = $('.calc__ringwrap');
  const svg = $('#calcRing');
  const daysFor = a => a <= 25 ? 28 : Math.round(28 + (a - 25) * .6);
  let ring, N = 28, X = 1, handle, handleLit, lastStage = -1, auto;
  function build() {
    ring = makeRing(svg, { n: N, R: 400, dotR: Math.min(19, (Math.PI * 2 * 400 / N) * .3), bigR: 230, phaseOf: () => .5 });
    ring.big.style.opacity = .2;
    handle = el('g', { class: 'handle' }, svg);
    el('circle', { r: 46, fill: 'transparent' }, handle);
    el('circle', { r: 30, fill: '#0d1428', stroke: '#f2b8a2', 'stroke-width': 2 }, handle);
    handleLit = el('path', { fill: `url(#mg${ring.id})`, filter: `url(#gl${ring.id})` }, handle);
    ring.dots.forEach(o => { o.g.style.transition = 'opacity .35s'; });
  }
  function setX(x) {
    X = Math.max(1, Math.min(N, x));
    const p = (X - 1) / (N - 1);
    const a = ((X - 1) / N) * Math.PI * 2 - Math.PI / 2;
    handle.setAttribute('transform', `translate(${(Math.cos(a) * 400).toFixed(1)} ${(Math.sin(a) * 400).toFixed(1)})`);
    handleLit.setAttribute('d', phasePath(.5 * p + .02, 29));
    ring.bigLit.setAttribute('d', phasePath(.5 * p, ring.bigR));
    ring.setProg((X - 1) / N);
    const xi = Math.round(X);
    ring.dots.forEach((o, i) => { o.g.style.opacity = i < xi ? 1 : .2; });
    dayEl.textContent = xi; ofEl.textContent = t('c.of', { n: N });
    wrap.setAttribute('aria-valuenow', xi); wrap.setAttribute('aria-valuetext', t('c.val', { x: xi, n: N }));
    const s = p < .25 ? 0 : p < .5 ? 1 : p < .8 ? 2 : 3;
    if (s !== lastStage) { lastStage = s; stageEl.textContent = t('c.s' + s); gsap.fromTo(stageEl, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .5, ease: 'power2.out' }); }
    const H = cell.parentElement.clientHeight - 28, flat = gsap.utils.clamp(0, 1, (p - .55) / .45);
    cell.style.transform = `translateY(${-p * H}px) scale(${1 + flat * .9}, ${1 - flat * .55})`;
    cell.style.opacity = p > .94 ? 1 - (p - .94) / .06 * .7 : 1;
  }
  function setAge(a) {
    const n = daysFor(a);
    ageOut.textContent = a;
    age.style.setProperty('--fill', ((a - age.min) / (age.max - age.min) * 100) + '%');
    res.innerHTML = t('c.res', { a, n });
    $('#calcWhy').textContent = t('c.why', { w: Math.round(n / 7) });
    cta.href = 'https://wa.me/34635857503?text=' + encodeURIComponent(t('c.msg', { a }));
    if (n !== N || !ring) { const keep = ring ? (X - 1) / (N - 1) : 0; N = n; build(); setX(1 + keep * (N - 1)); }
  }
  setAge(+age.value);
  age.addEventListener('input', () => { auto && auto.kill(); setAge(+age.value); });
  document.addEventListener('langchange', () => { wrap.setAttribute('aria-label', t('c.slider')); setAge(+age.value); lastStage = -1; setX(X); });

  // arrossegar la lluna per l'anell
  wrap.setAttribute('role', 'slider'); wrap.setAttribute('tabindex', '0'); wrap.setAttribute('aria-label', t('c.slider'));
  wrap.setAttribute('aria-valuemin', '1');
  const fromEvent = e => {
    const r = svg.getBoundingClientRect();
    let a = Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) + Math.PI / 2;
    if (a < 0) a += Math.PI * 2;
    return 1 + a / (Math.PI * 2) * N;
  };
  let drag = false;
  wrap.addEventListener('pointerdown', e => { drag = true; auto && auto.kill(); wrap.classList.add('dragging'); try { wrap.setPointerCapture(e.pointerId); } catch (_) {} setX(fromEvent(e)); });
  wrap.addEventListener('pointermove', e => { if (drag) setX(fromEvent(e)); });
  const end = () => { drag = false; wrap.classList.remove('dragging'); };
  wrap.addEventListener('pointerup', end); wrap.addEventListener('pointercancel', end);
  wrap.addEventListener('keydown', e => {
    const step = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key];
    if (step) { e.preventDefault(); auto && auto.kill(); setX(Math.round(X) + step); }
  });
  addEventListener('resize', () => setX(X));

  // quan arriba a la pantalla, el cicle es recorre sol una vegada
  if (!reduce) {
    const o = { x: 1 };
    ScrollTrigger.create({
      trigger: wrap, start: 'top 70%',
      onEnter: () => { if (!auto && X === 1) auto = gsap.to(o, { x: N, duration: 4.5, ease: 'power1.inOut', onUpdate: () => setX(o.x) }); }
    });
  }
})();

/* ---------- horari: avui i obert ara ---------- */
(function hours() {
  const H = { 2: [[9, 13], [15, 20]], 3: [[9, 13], [15, 20]], 4: [[9, 13], [15, 20]], 5: [[9, 13], [15, 20]], 6: [[9, 13]] };
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
  const get = k => parts.find(p => p.type === k).value;
  const wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  const now = +get('hour') + +get('minute') / 60;
  const day = d => { const n = t('d' + d); return I18N.lang === 'en' ? n : n.toLowerCase(); };
  function render() {
    const row = $(`#hours [data-d="${wd}"]`);
    if (row) { row.classList.add('today'); $('dt', row).innerHTML = `${t('d' + wd)} <span class="tday">· ${t('today')}</span>`; }
    const open = (H[wd] || []).find(([a, b]) => now >= a && now < b);
    let txt;
    if (open) txt = t('st.open', { h: open[1] });
    else {
      const later = (H[wd] || []).find(([a]) => now < a);
      if (later) txt = t('st.later', { h: later[0] });
      else for (let k = 1; k < 8; k++) { const d = (wd + k) % 7; if (H[d]) { txt = t('st.next', { d: k === 1 ? t('st.tomorrow') : t('st.pre') + day(d), h: H[d][0][0] }); break; } }
    }
    const status = $('#status');
    status.innerHTML = `<i></i>${txt}`;
    status.classList.toggle('open', !!open);
  }
  render();
  document.addEventListener('langchange', render);
})();

/* ---------- entrades ---------- */
if (!reduce) {
  const groups = ['.trust__in > *', '.treat .sec-head > *', '.card', '.onco__fig', '.onco__text > *', '.team__pics img', '.team__text > *', '.calc .sec-head > *', '.calc__ctl > *', '.voices h2', '.voices__score', '.voices blockquote', '.visit__main > *', '.hours div'];
  groups.forEach(sel => $$(sel).forEach((n, i) => {
    gsap.from(n, { y: 36, opacity: 0, duration: 1.1, ease: 'expo.out', delay: (i % 4) * .06, clearProps: 'transform,opacity', scrollTrigger: { trigger: n, start: 'top 90%', toggleActions: 'play none none none' } });
  }));
}
document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());
document.addEventListener('langchange', () => requestAnimationFrame(() => ScrollTrigger.refresh()));
