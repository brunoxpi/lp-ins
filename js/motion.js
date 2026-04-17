/* ─────────────────────────────────────────────────────────
   ANOVA MOTION
   Scroll reveals, counter animation, scroll progress,
   back-to-top, ticker, chapter markers.
   CSS-first: todas as animacoes de estado estao em editorial.css.
   Este arquivo apenas adiciona classes / observa scroll.
   ───────────────────────────────────────────────────────── */

(function(){
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── hero ready (dispara sublinhado no <strong>) ────── */
  function markHeroReady(){
    document.querySelectorAll('.hero').forEach(h => {
      requestAnimationFrame(() => h.setAttribute('data-ready','true'));
    });
  }

  /* ── scroll progress bar ─────────────────────────────── */
  function ensureScrollProgress(){
    if(document.querySelector('.scroll-progress')) return;
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.appendChild(bar);

    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'back-top';
    back.setAttribute('aria-label','Voltar ao topo');
    back.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
    document.body.appendChild(back);

    let ticking = false;
    function update(){
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      bar.style.width = pct + '%';
      back.classList.toggle('visible', window.scrollY > 600);
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if(!ticking){ requestAnimationFrame(update); ticking = true; }
    }, {passive:true});
    update();
  }

  /* ── scroll reveal via IntersectionObserver ──────────── */
  function wireReveal(){
    const targets = document.querySelectorAll('[data-reveal]');
    if(!targets.length) return;
    if(reduce){ targets.forEach(el => el.classList.add('is-visible')); return; }

    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if(e.isIntersecting){
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: .14, rootMargin: '0px 0px -8% 0px' });

    targets.forEach(el => io.observe(el));
  }

  /* ── counter animation para .proof-num ───────────────── */
  function wireCounters(){
    const targets = document.querySelectorAll('[data-count]');
    if(!targets.length) return;
    if(reduce){ targets.forEach(el => el.textContent = el.dataset.count); return; }

    const parse = v => {
      const n = parseFloat(String(v).replace(',','.'));
      return isNaN(n) ? null : n;
    };
    const fmt = (n, decimals) => {
      const str = decimals > 0 ? n.toFixed(decimals) : Math.round(n).toString();
      return str.replace('.', ',');
    };

    const animate = (el) => {
      const target = parse(el.dataset.count);
      if(target === null) return;
      const decimals = (el.dataset.count.split(',')[1] || el.dataset.count.split('.')[1] || '').length;
      const prefix = el.dataset.prefix || '';
      const dur = 1200;
      const start = performance.now();
      const ease = t => 1 - Math.pow(1 - t, 3);
      el.classList.add('counting');
      function step(now){
        const p = Math.min(1, (now - start) / dur);
        const v = target * ease(p);
        el.firstChild.nodeValue = prefix + fmt(v, decimals);
        if(p < 1) requestAnimationFrame(step);
        else el.classList.remove('counting');
      }
      el.innerHTML = (prefix + fmt(0, decimals)) + el.innerHTML.slice(el.firstChild ? el.firstChild.length || 0 : 0);
      el.firstChild.nodeValue = prefix + fmt(0, decimals);
      requestAnimationFrame(step);
    };

    const io = new IntersectionObserver((entries, ob) => {
      entries.forEach(e => {
        if(e.isIntersecting){ animate(e.target); ob.unobserve(e.target); }
      });
    }, { threshold: .4 });

    targets.forEach(el => io.observe(el));
  }

  /* ── duplica partners-track para loop seamless ──────── */
  function wireTicker(){
    document.querySelectorAll('.partners-track').forEach(track => {
      if(track.dataset.dupe === '1') return;
      track.dataset.dupe = '1';
      const clone = track.innerHTML;
      track.innerHTML = clone + clone;
    });
  }

  /* ── smooth scroll para anchors internos ─────────────── */
  function wireAnchors(){
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href').slice(1);
        if(!id) return;
        const t = document.getElementById(id);
        if(!t) return;
        e.preventDefault();
        const top = t.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
      });
    });
  }

  /* ── dot-index ordinais em .hero-meta ────────────────── */
  function wireHeroMeta(){
    document.querySelectorAll('.hero-meta').forEach(group => {
      [...group.children].forEach((el, i) => el.style.setProperty('--i', i));
    });
  }

  /* ── init ────────────────────────────────────────────── */
  function init(){
    ensureScrollProgress();
    wireReveal();
    wireCounters();
    wireTicker();
    wireAnchors();
    wireHeroMeta();
    markHeroReady();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
