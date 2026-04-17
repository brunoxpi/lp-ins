/* ─────────────────────────────────────────────────────────
   ANOVA SHELL
   Injeta partials (nav, footer), marca página ativa,
   gerencia toggle mobile.
   ───────────────────────────────────────────────────────── */

(function () {
  'use strict';

  const navMount = document.getElementById('anova-nav');
  const footerMount = document.getElementById('anova-footer');
  const currentPage = document.body.dataset.page || 'home';

  async function injectPartial(url, mount) {
    if (!mount) return;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${url} → ${res.status}`);
      mount.innerHTML = await res.text();
    } catch (err) {
      console.error('[anova-shell] failed to load', url, err);
      mount.innerHTML = `<p style="padding:16px;color:#888;font-family:monospace;font-size:12px;">Falha ao carregar ${url}. Rode via servidor local.</p>`;
    }
  }

  function markActivePage() {
    const links = document.querySelectorAll('[data-nav]');
    links.forEach(link => {
      if (link.dataset.nav === currentPage) {
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  function wireMobileToggle() {
    const nav = document.querySelector('.anova-nav');
    if (!nav) return;
    const toggle = nav.querySelector('.anova-nav-toggle');
    if (!toggle) return;
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = !nav.classList.contains('mobile-open');
      nav.classList.toggle('mobile-open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && nav.classList.contains('mobile-open')) {
        nav.classList.remove('mobile-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  async function init() {
    await Promise.all([
      injectPartial('partials/nav.html', navMount),
      injectPartial('partials/footer.html', footerMount),
    ]);
    markActivePage();
    wireMobileToggle();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
