# Anova Multi-Página — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar o site Anova de uma página única (`assets/index.html`) em um site multi-página com 7 páginas compartilhando uma shell comum (nav, footer, mega-menu de produtos), sem introduzir framework, build step, ou backend.

**Architecture:** HTML5 estático + CSS com tokens existentes (`design-system/tokens.css`, `design-system/components.css`) + JavaScript vanilla mínimo para injetar partials via `fetch()`. Cada página é um arquivo `.html` que carrega `nav.html` e `footer.html` de `partials/`. Shell gerenciada por `js/shell.js`. Serve via servidor local (`python -m http.server`). Sem Node, sem build.

**Tech Stack:**
- HTML5, CSS3 (custom properties), vanilla JavaScript (ES2020+)
- Design system existente: `design-system/tokens.css` + `design-system/components.css` + SF Pro Display + DM Mono
- Servidor local pra dev: `python -m http.server` (ou equivalente)
- Validação: W3C HTML validator (online ou `html-validate` CLI), grep + bash pra link integrity
- Sem framework, sem bundler, sem Node package, sem backend

**Spec de referência:** `docs/superpowers/specs/2026-04-14-anova-multi-page-design.md`

**Observação sobre testes:** este projeto não tem lógica de runtime testável via unit tests. A disciplina TDD é adaptada: cada mudança de código tem uma **verificação prévia** (grep/HTML-validate/link-check) que rodamos ANTES da implementação pra confirmar que o estado esperado não existe (o "teste falha"), e DEPOIS da implementação pra confirmar que passou. Para estilo visual, há checkpoints de QA manual marcados explicitamente.

**Pré-requisito do ambiente:**
- Python 3 instalado (pra `python -m http.server`). Se não houver, usar `npx serve` ou qualquer outro servidor estático.
- `grep` e `find` disponíveis no shell (Git Bash no Windows, ou WSL).

---

## Task 0: Inicializar git no `assets/`

A pasta `assets/` hoje não é repositório git. O plano depende de commits incrementais, então inicializamos o repo antes de qualquer coisa.

**Files:**
- Create: `assets/.gitignore`

- [ ] **Step 0.1: Verificar que `assets/` ainda não é git repo**

Run: `cd assets && git rev-parse --is-inside-work-tree 2>&1`
Expected: `fatal: not a git repository` (ou similar)

- [ ] **Step 0.2: Inicializar repositório**

Run: `cd assets && git init`
Expected: `Initialized empty Git repository in .../assets/.git/`

- [ ] **Step 0.3: Criar `.gitignore`**

Arquivo: `assets/.gitignore`
```
.DS_Store
Thumbs.db
*.log
.vscode/
.idea/
node_modules/
```

- [ ] **Step 0.4: Primeiro commit — snapshot do estado atual**

Run:
```bash
cd assets
git add .
git commit -m "chore: initial snapshot before multi-page refactor"
```
Expected: `[main (root-commit) ...] chore: initial snapshot before multi-page refactor`

- [ ] **Step 0.5: Verificar estado**

Run: `cd assets && git log --oneline`
Expected: uma linha mostrando o commit inicial.

---

## Task 1: Extrair CSS inline do `index.html` para `design-system/sections.css`

O `<style>` inline do `index.html` atual tem 235 linhas (linhas 10-245). Vamos movê-las pra um arquivo CSS dedicado pra que as outras páginas possam reutilizar sem duplicar. É um refactor puro — visualmente a home não muda.

**Files:**
- Create: `assets/design-system/sections.css`
- Modify: `assets/index.html` (remover `<style>` block, adicionar `<link>`)

- [ ] **Step 1.1: Pre-check — confirmar que `sections.css` não existe**

Run: `ls assets/design-system/sections.css 2>&1`
Expected: `No such file or directory`

- [ ] **Step 1.2: Ler o bloco `<style>` do `index.html`**

Ler `assets/index.html` linhas 10-245. Copiar **exatamente** o conteúdo entre (não incluindo) `<style>` e `</style>`.

- [ ] **Step 1.3: Criar `assets/design-system/sections.css` com o conteúdo copiado**

Adicionar um header no topo do arquivo:
```css
/* ─────────────────────────────────────────────────────────
   ANOVA — SECTIONS
   Estilos de página extraídos do index.html.
   Usado por: index.html + 6 páginas de produto.
   Depende de: tokens.css, components.css
   ───────────────────────────────────────────────────────── */
```

Seguido do CSS copiado de index.html (linhas 10-245, sem incluir as tags `<style>` e `</style>`).

- [ ] **Step 1.4: Modificar `index.html` — substituir bloco style por link**

No `assets/index.html`, substituir o bloco inteiro `<style>...</style>` (linhas ~10-245) por:

```html
<link rel="stylesheet" href="design-system/sections.css">
```

Essa linha deve aparecer logo depois de `<link rel="stylesheet" href="design-system/components.css">`.

- [ ] **Step 1.5: Verificação — CSS foi movido corretamente**

Run:
```bash
cd assets && grep -c 'font-family:var(--mono)' design-system/sections.css
```
Expected: número >= 10 (indica que o CSS com tokens foi copiado).

Run: `cd assets && grep -c 'font-family:var(--mono)' index.html`
Expected: 0 (ou apenas menções nos atributos `style=""` inline, que são poucos).

- [ ] **Step 1.6: Visual QA — abrir home no browser**

Run: `cd assets && python -m http.server 8000` (rodar em background ou em outro terminal)

Abrir `http://localhost:8000/` no browser. A página **deve aparecer visualmente idêntica** ao estado anterior. Se houver alguma diferença (espaçamento, cor, tipografia), o CSS foi quebrado na extração — voltar ao step 1.2 e revisar.

Parar o servidor com Ctrl+C após o QA.

- [ ] **Step 1.7: Commit**

Run:
```bash
cd assets
git add design-system/sections.css index.html
git commit -m "refactor: extract index.html inline styles to sections.css"
```

---

## Task 2: Criar `design-system/nav.css` (estilos da nav + mega-menu)

A nav atual do `index.html` tem estilos simples (linhas ~36-44 do CSS extraído). Vamos substituí-la por uma versão nova com mega-menu. Isso começa num arquivo separado pra ficar desacoplado.

**Files:**
- Create: `assets/design-system/nav.css`

- [ ] **Step 2.1: Pre-check — arquivo não existe**

Run: `ls assets/design-system/nav.css 2>&1`
Expected: `No such file or directory`

- [ ] **Step 2.2: Criar `assets/design-system/nav.css` com o conteúdo abaixo**

```css
/* ─────────────────────────────────────────────────────────
   ANOVA — NAV + MEGA-MENU
   Usado por: partials/nav.html
   Depende de: tokens.css
   ───────────────────────────────────────────────────────── */

/* ─── NAV container ─────────────────────────────────────── */
.anova-nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(255,255,255,.94);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid var(--border);}
.anova-nav-inner{display:flex;align-items:center;justify-content:space-between;height:64px;max-width:1180px;margin:0 auto;padding:0 var(--s5);}

/* ─── Brand ─────────────────────────────────────────────── */
.anova-nav-brand{display:flex;align-items:center;gap:var(--s3);color:var(--text-1);}
.anova-nav-logo{width:32px;height:32px;background:var(--onyx);border-radius:22%;display:flex;align-items:center;justify-content:center;color:var(--white);font-weight:700;font-size:13px;letter-spacing:-.04em;}
.anova-nav-name{font-weight:700;font-size:15px;letter-spacing:-.01em;}

/* ─── Links ─────────────────────────────────────────────── */
.anova-nav-links{display:flex;gap:var(--s6);align-items:center;}
.anova-nav-link{font-size:13px;color:var(--text-2);transition:color .15s;padding:4px 0;border-bottom:2px solid transparent;background:none;border-left:none;border-right:none;border-top:none;cursor:pointer;font-family:inherit;}
.anova-nav-link:hover{color:var(--text-1);}
.anova-nav-link[aria-current="page"]{color:var(--text-1);border-bottom-color:var(--onyx);}
.anova-nav-link.has-submenu::after{content:" ▾";font-size:9px;margin-left:2px;}

/* ─── CTA ───────────────────────────────────────────────── */
.anova-nav-cta{display:inline-flex;align-items:center;gap:var(--s2);padding:8px 16px;background:var(--onyx);color:var(--white);border-radius:99px;font-size:12px;font-weight:600;letter-spacing:-.005em;transition:background .2s;}
.anova-nav-cta:hover{background:var(--charcoal);}

/* ─── Mega-menu ─────────────────────────────────────────── */
.anova-mega{position:absolute;top:64px;left:0;right:0;background:var(--white);border-bottom:1px solid var(--border);border-top:1px solid var(--border);display:none;padding:var(--s7) 0;}
.anova-nav.mega-open .anova-mega{display:block;}
.anova-mega-inner{max-width:1180px;margin:0 auto;padding:0 var(--s5);display:grid;grid-template-columns:repeat(3,1fr);gap:var(--s8);}
.anova-mega-col h4{font-family:var(--mono);font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:var(--text-3);margin-bottom:var(--s5);padding-bottom:var(--s3);border-bottom:1px solid var(--border);font-weight:600;}
.anova-mega-item{display:block;padding:var(--s3) 0;border-bottom:1px solid transparent;transition:border-color .15s;}
.anova-mega-item:hover{border-bottom-color:var(--text-1);}
.anova-mega-item-title{display:block;font-size:15px;font-weight:700;color:var(--text-1);letter-spacing:-.01em;}
.anova-mega-item-desc{display:block;font-family:var(--mono);font-size:11px;color:var(--text-3);margin-top:4px;line-height:1.4;}

/* ─── Mobile ────────────────────────────────────────────── */
.anova-nav-toggle{display:none;background:none;border:none;font-size:20px;color:var(--text-1);cursor:pointer;padding:8px;}

@media(max-width:880px){
  .anova-nav-links{display:none;position:fixed;top:64px;left:0;right:0;bottom:0;background:var(--white);flex-direction:column;align-items:stretch;padding:var(--s6) var(--s5);gap:var(--s5);overflow-y:auto;}
  .anova-nav.mobile-open .anova-nav-links{display:flex;}
  .anova-nav-toggle{display:block;}
  .anova-nav-cta{display:none;}
  .anova-nav-link{font-size:18px;padding:var(--s3) 0;border-bottom:1px solid var(--border);}
  .anova-nav-link[aria-current="page"]{border-bottom-color:var(--onyx);}
  .anova-mega{position:static;display:none;padding:var(--s5) 0 0 0;border:none;}
  .anova-nav.mega-open .anova-mega{display:block;}
  .anova-mega-inner{grid-template-columns:1fr;gap:var(--s6);padding:0;}
}

/* ─── Active page body offset (nav is fixed) ────────────── */
body{padding-top:64px;}
```

- [ ] **Step 2.3: Verificação**

Run: `cd assets && grep -c 'anova-nav' design-system/nav.css`
Expected: número > 10.

- [ ] **Step 2.4: Commit**

Run:
```bash
cd assets
git add design-system/nav.css
git commit -m "feat: add nav.css for nav + mega-menu styles"
```

---

## Task 3: Criar `partials/nav.html` (markup da nav + mega-menu)

**Files:**
- Create: `assets/partials/nav.html`

- [ ] **Step 3.1: Criar diretório**

Run: `mkdir -p assets/partials`

- [ ] **Step 3.2: Criar `assets/partials/nav.html`**

```html
<nav class="anova-nav" aria-label="Navegação principal">
  <div class="anova-nav-inner">
    <a href="index.html" class="anova-nav-brand">
      <div class="anova-nav-logo">A</div>
      <div class="anova-nav-name">Anova</div>
    </a>

    <button class="anova-nav-toggle" aria-label="Abrir menu" aria-expanded="false">☰</button>

    <div class="anova-nav-links">
      <a href="index.html" class="anova-nav-link" data-nav="home">Anova OS</a>
      <button class="anova-nav-link has-submenu" data-nav="produtos" aria-haspopup="true" aria-expanded="false">Produtos</button>
      <a href="index.html#manifesto" class="anova-nav-link">Manifesto</a>
      <a href="index.html#contato" class="anova-nav-link">Contato</a>
      <a href="index.html#contato" class="anova-nav-cta">Falar com time →</a>
    </div>

    <div class="anova-mega" role="menu" aria-label="Produtos">
      <div class="anova-mega-inner">
        <div class="anova-mega-col">
          <h4>Para investidores</h4>
          <a href="wealth-management.html" class="anova-mega-item" data-nav="wealth-management">
            <span class="anova-mega-item-title">Wealth Management</span>
            <span class="anova-mega-item-desc">Gestão patrimonial orientada por método.</span>
          </a>
        </div>
        <div class="anova-mega-col">
          <h4>Para escritórios</h4>
          <a href="wealth-hubs.html" class="anova-mega-item" data-nav="wealth-hubs">
            <span class="anova-mega-item-title">Anova Wealth Hubs</span>
            <span class="anova-mega-item-desc">White-label 80/20 completo, sem TI.</span>
          </a>
          <a href="orquestrador.html" class="anova-mega-item" data-nav="orquestrador">
            <span class="anova-mega-item-title">Orquestrador</span>
            <span class="anova-mega-item-desc">Integre seu produto à camada conversacional.</span>
          </a>
          <a href="credito.html" class="anova-mega-item" data-nav="credito">
            <span class="anova-mega-item-title">Produtos de Crédito</span>
            <span class="anova-mega-item-desc">Multibanco por rede de parceiros regulados.</span>
          </a>
        </div>
        <div class="anova-mega-col">
          <h4>Tecnologia</h4>
          <a href="life-invest.html" class="anova-mega-item" data-nav="life-invest">
            <span class="anova-mega-item-title">Life Invest</span>
            <span class="anova-mega-item-desc">Algoritmo de mercado observando continuamente.</span>
          </a>
          <a href="research.html" class="anova-mega-item" data-nav="research">
            <span class="anova-mega-item-title">Anova Research</span>
            <span class="anova-mega-item-desc">Metodologia preditiva. A origem da Anova.</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</nav>
```

- [ ] **Step 3.3: Verificação estrutural**

Run: `cd assets && grep -c 'anova-mega-item' partials/nav.html`
Expected: `6` (um por produto).

Run: `cd assets && grep 'href=' partials/nav.html | grep -v '#' | wc -l`
Expected: `>= 7` (pelo menos 7 hrefs — index + 6 produtos + CTA).

- [ ] **Step 3.4: Commit**

Run:
```bash
cd assets
git add partials/nav.html
git commit -m "feat: add nav.html partial with mega-menu"
```

---

## Task 4: Criar `partials/footer.html`

**Files:**
- Create: `assets/partials/footer.html`

- [ ] **Step 4.1: Criar `assets/partials/footer.html`**

```html
<footer class="footer">
  <div class="container">
    <div class="footer-top">
      <div>
        <div class="footer-brand">
          <div class="nav-logo">A</div>
          <div class="nav-name">Anova</div>
        </div>
        <p class="footer-disclaimer">Os produtos financeiros são oferecidos por parceiros regulados conectados à plataforma Anova. A Anova é uma empresa de tecnologia, não constitui instituição financeira, corretora, seguradora, gestora ou banco.</p>
      </div>
      <div class="footer-cols">
        <div class="footer-col">
          <h4>Para investidores</h4>
          <a href="wealth-management.html">Wealth Management</a>
          <a href="research.html">Anova Research</a>
          <a href="index.html#manifesto">Manifesto</a>
        </div>
        <div class="footer-col">
          <h4>Para escritórios</h4>
          <a href="wealth-hubs.html">Anova Wealth Hubs</a>
          <a href="orquestrador.html">Orquestrador</a>
          <a href="credito.html">Produtos de Crédito</a>
          <a href="life-invest.html">Life Invest</a>
        </div>
        <div class="footer-col">
          <h4>Contato</h4>
          <a href="mailto:institucional@anova.com.br">institucional@anova.com.br</a>
          <a href="https://anovainvestimentos.com.br">anovainvestimentos.com.br</a>
        </div>
      </div>
    </div>
    <div class="footer-bot">
      <span>© 2026 Anova Financial Technologies</span>
      <span>Confiança que vira execução</span>
    </div>
  </div>
</footer>
```

- [ ] **Step 4.2: Verificação**

Run: `cd assets && grep -c 'footer-col' partials/footer.html`
Expected: `4` (3 colunas + 1 classe ref no container).

- [ ] **Step 4.3: Commit**

Run:
```bash
cd assets
git add partials/footer.html
git commit -m "feat: add footer.html partial"
```

---

## Task 5: Criar `js/shell.js` (injeção de partials + mega-menu + active page)

**Files:**
- Create: `assets/js/shell.js`

- [ ] **Step 5.1: Criar diretório**

Run: `mkdir -p assets/js`

- [ ] **Step 5.2: Criar `assets/js/shell.js`**

```js
/* ─────────────────────────────────────────────────────────
   ANOVA SHELL
   Injeta partials (nav, footer), gerencia mega-menu e
   estado ativo da página atual.
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
      mount.innerHTML = `<p style="padding:16px;color:#888;font-family:monospace;font-size:12px;">Falha ao carregar ${url}. Rode via servidor local (python -m http.server).</p>`;
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

  function wireMegaMenu() {
    const nav = document.querySelector('.anova-nav');
    if (!nav) return;
    const trigger = nav.querySelector('[data-nav="produtos"]');
    if (!trigger) return;

    const toggle = (open) => {
      const isOpen = open !== undefined ? open : !nav.classList.contains('mega-open');
      nav.classList.toggle('mega-open', isOpen);
      trigger.setAttribute('aria-expanded', String(isOpen));
    };

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggle();
    });

    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target)) toggle(false);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') toggle(false);
    });

    // Hover bônus no desktop
    const mega = nav.querySelector('.anova-mega');
    if (mega && window.matchMedia('(hover: hover)').matches) {
      let hoverTimer;
      nav.addEventListener('mouseleave', () => {
        hoverTimer = setTimeout(() => toggle(false), 200);
      });
      nav.addEventListener('mouseenter', () => clearTimeout(hoverTimer));
    }
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
  }

  async function init() {
    await Promise.all([
      injectPartial('partials/nav.html', navMount),
      injectPartial('partials/footer.html', footerMount),
    ]);
    markActivePage();
    wireMegaMenu();
    wireMobileToggle();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
```

- [ ] **Step 5.3: Verificação — JS sintaticamente válido**

Run: `cd assets && node -c js/shell.js 2>&1 || echo "node not available, skip syntax check"`
Expected: silêncio (sem erro) ou a mensagem "node not available, skip syntax check".

Se não houver Node, usar validação alternativa: abrir o arquivo no VSCode ou `python -c "import re; open('assets/js/shell.js').read()"` pra garantir que leia sem erro.

- [ ] **Step 5.4: Commit**

Run:
```bash
cd assets
git add js/shell.js
git commit -m "feat: add shell.js for partials injection and mega-menu"
```

---

## Task 6: Migrar `index.html` pra usar a shell

Remover a `<nav>` inline, remover a `<footer>` inline, adicionar os mount points, incluir nav.css e shell.js.

**Files:**
- Modify: `assets/index.html`

- [ ] **Step 6.1: Pre-check — gravar estado atual do arquivo**

Run: `cd assets && wc -l index.html`
Expected: `814 index.html` (pode variar ligeiramente se Task 1 alterou).

- [ ] **Step 6.2: Adicionar `<link rel="stylesheet" href="design-system/nav.css">` no `<head>`**

No `<head>`, logo depois do `<link>` de `sections.css`, adicionar:
```html
<link rel="stylesheet" href="design-system/nav.css">
```

- [ ] **Step 6.3: Adicionar `data-page="home"` ao `<body>`**

Substituir `<body>` por `<body data-page="home">`.

- [ ] **Step 6.4: Substituir `<nav>...</nav>` inline pelo mount point**

Localizar o bloco `<!-- ═══ NAV ═══ -->` seguido de `<nav class="nav">...</nav>` (linhas ~249-265).

Substituir o bloco inteiro (incluindo o comentário) por:
```html
<!-- ═══ NAV (injected by shell.js) ═══ -->
<div id="anova-nav"></div>
<noscript>
  <nav style="padding:16px;background:#F8F8F8;border-bottom:1px solid #CCC;font-family:sans-serif;font-size:13px;">
    <a href="index.html" style="margin-right:16px;">Anova OS</a>
    <a href="wealth-management.html" style="margin-right:16px;">Wealth Management</a>
    <a href="wealth-hubs.html" style="margin-right:16px;">Wealth Hubs</a>
    <a href="life-invest.html" style="margin-right:16px;">Life Invest</a>
    <a href="orquestrador.html" style="margin-right:16px;">Orquestrador</a>
    <a href="credito.html" style="margin-right:16px;">Crédito</a>
    <a href="research.html">Research</a>
  </nav>
</noscript>
```

- [ ] **Step 6.5: Substituir `<footer>...</footer>` inline pelo mount point**

Localizar o bloco `<!-- ═══ FOOTER ═══ -->` seguido de `<footer class="footer">...</footer>` (linhas ~757-796).

Substituir o bloco inteiro por:
```html
<!-- ═══ FOOTER (injected by shell.js) ═══ -->
<div id="anova-footer"></div>
```

- [ ] **Step 6.6: Adicionar `<script src="js/shell.js" defer></script>` antes de `</body>`**

O `<script>` existente (gallery tabs + video) já está ali. Adicionar o novo script **acima** dele (o shell roda primeiro):
```html
<script src="js/shell.js" defer></script>
<script>
document.querySelectorAll('.gallery-tab').forEach(btn=>{
  // ... (script existente do gallery fica igual) ...
});
// ... (video script fica igual) ...
</script>
```

- [ ] **Step 6.7: Verificação estrutural**

Run: `cd assets && grep -c 'id="anova-nav"' index.html`
Expected: `1`.

Run: `cd assets && grep -c 'id="anova-footer"' index.html`
Expected: `1`.

Run: `cd assets && grep -c '<nav class="nav">' index.html`
Expected: `0` (nav antiga removida).

Run: `cd assets && grep -c 'js/shell.js' index.html`
Expected: `1`.

- [ ] **Step 6.8: Visual QA — rodar servidor e validar**

Run: `cd assets && python -m http.server 8000 &` (ou em outro terminal)

Abrir `http://localhost:8000/`. Checklist:
- [ ] Nav aparece no topo, identica visualmente à anterior (logo + links + CTA).
- [ ] Item "Anova OS" da nav está com `aria-current="page"` (inspecionar DOM ou notar o underline).
- [ ] Click em "Produtos ▾" abre o mega-menu com 3 colunas e 6 produtos.
- [ ] Click fora do mega-menu fecha.
- [ ] `Esc` fecha o mega-menu.
- [ ] Footer aparece no final, com as 3 colunas atualizadas (Para investidores / Para escritórios / Contato).
- [ ] Nenhum erro no console do browser.
- [ ] Resto da página (hero, proof, problem, pivot, gallery, how, board, founder, etc.) visualmente inalterado.

Se algum item falhar → não commitar, voltar pro step que introduziu o problema.

Parar o servidor (Ctrl+C).

- [ ] **Step 6.9: Commit**

Run:
```bash
cd assets
git add index.html
git commit -m "refactor: wire index.html into shell (nav/footer partials)"
```

---

## Task 7: Adaptar o `gallery` do `index.html` (6 superfícies novas)

O gallery atual tem 5 abas: Advisor, Orquestrador, Research, Life Invest, Central. Precisa virar 6 abas refletindo o novo sitemap. Cada painel ganha um link `→ Conheça [produto]` pra página dedicada.

**Files:**
- Modify: `assets/index.html` (seção gallery, linhas ~391-478 antes)

- [ ] **Step 7.1: Localizar o bloco gallery no `index.html`**

Grep: `cd assets && grep -n 'plataforma.*section-alt' index.html | head -3`

Abrir o bloco `<section id="plataforma" class="section section-alt">` até `</section>`.

- [ ] **Step 7.2: Substituir os `.gallery-tab` botões**

Substituir o bloco `<div class="gallery-tabs">...</div>` por:
```html
<div class="gallery-tabs">
  <button class="gallery-tab active" data-tab="0"><span class="idx">01</span> Wealth Management</button>
  <button class="gallery-tab" data-tab="1"><span class="idx">02</span> Wealth Hubs</button>
  <button class="gallery-tab" data-tab="2"><span class="idx">03</span> Orquestrador</button>
  <button class="gallery-tab" data-tab="3"><span class="idx">04</span> Life Invest</button>
  <button class="gallery-tab" data-tab="4"><span class="idx">05</span> Crédito</button>
  <button class="gallery-tab" data-tab="5"><span class="idx">06</span> Research</button>
</div>
```

- [ ] **Step 7.3: Substituir os 5 `.gallery-panel` por 6 painéis novos**

Substituir **todos** os `<div class="gallery-panel"...>` existentes por estes 6:

```html
<div class="gallery-panel active" data-panel="0">
  <div class="gallery-info">
    <h3>Wealth Management — gestão patrimonial com método.</h3>
    <p>Estratégia orientada por metodologia preditiva, execução auditada e proteção integrada. Para investidores que preferem fundamento a intuição.</p>
    <ul class="gallery-feats">
      <li>Carteira diversificada por estratégia</li>
      <li>Rebalanceamento contínuo via algoritmo</li>
      <li>Research proprietária preditiva</li>
      <li>Proteção patrimonial integrada</li>
    </ul>
    <a href="wealth-management.html" class="btn btn-outline btn-sm" style="margin-top:var(--s5);">Conhecer Wealth Management →</a>
  </div>
  <div class="gallery-img"><img src="assets/img/product-advisor-carteira.png" alt="Wealth Management"></div>
</div>

<div class="gallery-panel" data-panel="1">
  <div class="gallery-info">
    <h3>Anova Wealth Hubs — sua operação sobre nossa stack.</h3>
    <p>Monte e opere seu escritório com backoffice, research, orquestrador, multibanco e compliance da Anova. Modelo 80/20. Sem TI.</p>
    <ul class="gallery-feats">
      <li>Backoffice completo</li>
      <li>Research + Life Invest embutidos</li>
      <li>Multibanco e compliance</li>
      <li>Repasse 80/20 transparente</li>
    </ul>
    <a href="wealth-hubs.html" class="btn btn-outline btn-sm" style="margin-top:var(--s5);">Conhecer Wealth Hubs →</a>
  </div>
  <div class="gallery-img"><img src="assets/img/product-central.png" alt="Wealth Hubs"></div>
</div>

<div class="gallery-panel" data-panel="2">
  <div class="gallery-info">
    <h3>Orquestrador — execução conversacional governada.</h3>
    <p>Cada interação cliente-consultor acontece no canal natural. Mas é rastreada, roteada e auditada pela camada Anova. Conversa vira execução, sem virar caos.</p>
    <ul class="gallery-feats">
      <li>WhatsApp como camada de execução</li>
      <li>Roteamento por contexto e intenção</li>
      <li>Aprovação humana em ações sensíveis (HITL)</li>
      <li>Histórico completo por cliente</li>
    </ul>
    <a href="orquestrador.html" class="btn btn-outline btn-sm" style="margin-top:var(--s5);">Conhecer Orquestrador →</a>
  </div>
  <div class="gallery-img"><img src="assets/img/product-orquestrador-2.png" alt="Orquestrador"></div>
</div>

<div class="gallery-panel" data-panel="3">
  <div class="gallery-info">
    <h3>Life Invest — o algoritmo que observa o mercado.</h3>
    <p>Motor proprietário que consulta o mercado em tempo real, gera sinais e alimenta decisões de portfolio. Fundamento acima de intuição.</p>
    <ul class="gallery-feats">
      <li>Dados em tempo real, multiativos</li>
      <li>Correlações e sinais acionáveis</li>
      <li>Integração nativa com carteiras</li>
      <li>Trilha de auditoria algorítmica</li>
    </ul>
    <a href="life-invest.html" class="btn btn-outline btn-sm" style="margin-top:var(--s5);">Conhecer Life Invest →</a>
  </div>
  <div class="gallery-img"><img src="assets/img/product-life.png" alt="Life Invest"></div>
</div>

<div class="gallery-panel" data-panel="4">
  <div class="gallery-info">
    <h3>Produtos de Crédito — multibanco por rede de parceiros.</h3>
    <p>O consultor oferece ao cliente a melhor combinação de taxa, parcela e CET entre uma rede de parceiros regulados. Tudo originado via Orquestrador, com trilha auditável.</p>
    <ul class="gallery-feats">
      <li>Empréstimos, financiamentos, consórcio</li>
      <li>Seguro e previdência</li>
      <li>Comparação lado a lado multibanco</li>
      <li>Comissão rastreada por operação</li>
    </ul>
    <a href="credito.html" class="btn btn-outline btn-sm" style="margin-top:var(--s5);">Conhecer Crédito →</a>
  </div>
  <div class="gallery-img"><img src="assets/img/product-research.png" alt="Crédito"></div>
</div>

<div class="gallery-panel" data-panel="5">
  <div class="gallery-info">
    <h3>Anova Research — a origem metodológica.</h3>
    <p>Onde a análise descritiva vira preditiva. Metodologia proprietária, desenvolvida desde a primeira aparição da Anova no mercado, alimentando Life Invest, Wealth Management e Wealth Hubs.</p>
    <ul class="gallery-feats">
      <li>Metodologia preditiva proprietária</li>
      <li>Software de análise multiativos</li>
      <li>Alimenta motor algorítmico e gestão</li>
      <li>Base editorial e institucional</li>
    </ul>
    <a href="research.html" class="btn btn-outline btn-sm" style="margin-top:var(--s5);">Conhecer Research →</a>
  </div>
  <div class="gallery-img"><img src="assets/img/product-research.png" alt="Research"></div>
</div>
```

- [ ] **Step 7.4: Atualizar o `<h2>` e `<p class="lead">` do bloco gallery**

No mesmo `<section id="plataforma">`, substituir o h2 e lead atuais por:
```html
<span class="eyebrow">03 · As superfícies</span>
<h2 style="margin-top:var(--s4);max-width:24ch;"><strong>Seis superfícies.</strong> Uma única infraestrutura operacional.</h2>
<p class="lead" style="margin-top:var(--s5);">Cada produto da Anova é um ponto da mesma camada. O investidor entra pelo Wealth Management. O escritório opera pelo Wealth Hubs. A conversa acontece no Orquestrador. Tudo alimentado pela mesma Research.</p>
```

- [ ] **Step 7.5: Verificação**

Run: `cd assets && grep -c 'gallery-panel' index.html`
Expected: `6` (6 painéis) ou `7` se contar a regra CSS (tem que ser apenas 6 no HTML body).

Run: `cd assets && grep -c 'gallery-tab"' index.html`
Expected: `6`.

Run: `cd assets && grep 'Conhecer' index.html | wc -l`
Expected: `6`.

- [ ] **Step 7.6: Visual QA**

Run: `cd assets && python -m http.server 8000` (em outro terminal).

Abrir `http://localhost:8000/`. Checklist:
- [ ] Seção "As superfícies" aparece com 6 abas.
- [ ] Click em cada aba troca o painel corretamente.
- [ ] Cada painel tem um botão "Conhecer [produto] →" no final.
- [ ] Click em cada botão tenta navegar pra página (vai dar 404 ainda, porque as páginas não existem — isso é esperado; corrigido nas próximas tasks).
- [ ] Nav e footer continuam funcionando.

Parar o servidor.

- [ ] **Step 7.7: Commit**

Run:
```bash
cd assets
git add index.html
git commit -m "refactor: update home gallery to reflect new 6-product sitemap"
```

---

## Task 8: Criar `orquestrador.html`

Primeira página de produto. Usa o template descrito no spec Section 4.4.

**Files:**
- Create: `assets/orquestrador.html`

- [ ] **Step 8.1: Pre-check**

Run: `ls assets/orquestrador.html 2>&1`
Expected: `No such file or directory`.

- [ ] **Step 8.2: Criar `assets/orquestrador.html`**

Criar o arquivo com o conteúdo abaixo. Este é o template base; os passos seguintes (Task 9-13) reutilizam esta estrutura variando o conteúdo.

```html
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Orquestrador — Anova</title>
<meta name="description" content="Camada conversacional governada. Integre seu produto à rede de execução Anova e chegue ao cliente via WhatsApp com trilha auditável.">
<link rel="stylesheet" href="design-system/tokens.css">
<link rel="stylesheet" href="design-system/components.css">
<link rel="stylesheet" href="design-system/sections.css">
<link rel="stylesheet" href="design-system/nav.css">
<style>
  /* ─── PAGE-SPECIFIC ─── */
  html{scroll-behavior:smooth;}
  body{background:var(--bg);color:var(--text-1);}
  img{max-width:100%;display:block;}
  a{color:inherit;text-decoration:none;}
  button{font-family:inherit;}
  .container{max-width:1180px;margin:0 auto;padding:0 var(--s5);}
  h1,h2,h3,h4{font-family:var(--font);font-weight:700;letter-spacing:-.025em;line-height:1.05;}
  h1{font-size:clamp(40px,6.4vw,72px);letter-spacing:-.035em;line-height:1.02;}
  h2{font-size:clamp(32px,4.6vw,52px);letter-spacing:-.025em;line-height:1.08;}
  h3{font-size:22px;letter-spacing:-.015em;line-height:1.2;}
  .lead{font-size:clamp(16px,1.4vw,19px);color:var(--text-2);line-height:1.55;max-width:60ch;}
  .what-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:var(--s8);align-items:center;margin-top:var(--s6);}
  @media(max-width:880px){.what-grid{grid-template-columns:1fr;}}
  .what-visual{border:1px solid var(--border);border-radius:var(--r-xl);overflow:hidden;background:var(--bg-alt);aspect-ratio:4/3;display:flex;align-items:center;justify-content:center;padding:var(--s5);}
  .what-visual img{max-width:80%;max-height:100%;object-fit:contain;}
  .feat-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:var(--s3) var(--s6);margin-top:var(--s6);}
  @media(max-width:680px){.feat-grid{grid-template-columns:1fr;}}
</style>
</head>
<body data-page="orquestrador">

<div id="anova-nav"></div>
<noscript>
  <nav style="padding:16px;background:#F8F8F8;border-bottom:1px solid #CCC;font-family:sans-serif;font-size:13px;">
    <a href="index.html" style="margin-right:16px;">Anova OS</a>
    <a href="wealth-management.html" style="margin-right:16px;">Wealth Management</a>
    <a href="wealth-hubs.html" style="margin-right:16px;">Wealth Hubs</a>
    <a href="life-invest.html" style="margin-right:16px;">Life Invest</a>
    <a href="orquestrador.html" style="margin-right:16px;">Orquestrador</a>
    <a href="credito.html" style="margin-right:16px;">Crédito</a>
    <a href="research.html">Research</a>
  </nav>
</noscript>

<!-- ═══ HERO ═══ -->
<header class="hero">
  <div class="hero-bp"></div>
  <div class="container hero-grid">
    <div>
      <span class="eyebrow">Para parceiros · Integração</span>
      <h1><strong>Conversa</strong> vira execução. Execução vira trilha.</h1>
      <p class="hero-sub">O Orquestrador é a camada conversacional da Anova. Integre seu produto — crédito, seguro, saúde, consórcio, previdência ou investimento — a uma rede já orquestrada, e chegue ao cliente final via WhatsApp com roteamento, HITL e auditoria embutidas.</p>
      <div class="hero-cta">
        <a href="#cta" class="btn btn-primary btn-lg">Conversar sobre integração →</a>
        <a href="#o-que-e" class="btn btn-outline btn-lg">Ver como funciona</a>
      </div>
      <div class="hero-meta">
        <span>WhatsApp-first</span>
        <span>HITL nativo</span>
        <span>Audit-by-design</span>
      </div>
    </div>
    <div class="hero-visual">
      <img src="assets/img/product-orquestrador-2.png" alt="Orquestrador — atendimento conversacional">
      <span class="hero-tag">Camada conversacional</span>
    </div>
  </div>
</header>

<!-- ═══ O QUE É ═══ -->
<section id="o-que-e" class="section section-alt">
  <div class="container">
    <span class="eyebrow">01 · O que é</span>
    <div class="what-grid">
      <div>
        <h2><strong>Uma camada</strong> entre o canal do cliente e o produto do parceiro.</h2>
        <p class="lead">O Orquestrador recebe a intenção do cliente pelo WhatsApp, roteia para o produto correto, aciona o parceiro regulado e devolve a resposta — tudo dentro de uma trilha auditável. O humano aprova o que precisa de aprovação (HITL) e o sistema executa o que pode ser executado. Seu produto entra como um nó dessa rede — sem sair da regulação, sem rodar contexto.</p>
      </div>
      <div class="what-visual">
        <img src="assets/img/product-orquestrador-2.png" alt="Fluxo Orquestrador">
      </div>
    </div>
  </div>
</section>

<!-- ═══ COMO FUNCIONA ═══ -->
<section class="section">
  <div class="container">
    <span class="eyebrow">02 · Como funciona</span>
    <h2 style="margin-top:var(--s4);max-width:24ch;"><strong>Integra</strong>. Calibra. Aprova. Executa.</h2>
    <div class="how-grid">
      <article class="how-step">
        <div class="how-num">PASSO 01</div>
        <h3>Integração técnica</h3>
        <p>Seu produto conecta à Anova via API ou contrato definido com o time de integrações. Sem reescrever sua stack.</p>
      </article>
      <article class="how-step">
        <div class="how-num">PASSO 02</div>
        <h3>Calibração de fluxo</h3>
        <p>Definimos juntos o roteamento, os pontos de HITL e os gatilhos de aprovação. Cada fluxo é auditável.</p>
      </article>
      <article class="how-step">
        <div class="how-num">PASSO 03</div>
        <h3>Aprovação humana</h3>
        <p>Ações sensíveis passam por um humano autorizado antes de executar. A trilha é preservada no histórico do cliente.</p>
      </article>
      <article class="how-step">
        <div class="how-num">PASSO 04</div>
        <h3>Execução auditada</h3>
        <p>A resposta volta ao cliente pelo WhatsApp. Tudo fica registrado — mensagem, decisão, carimbo temporal, responsável.</p>
      </article>
    </div>
  </div>
</section>

<!-- ═══ CAPACIDADES ═══ -->
<section class="section section-alt">
  <div class="container">
    <span class="eyebrow">03 · Capacidades</span>
    <h2 style="margin-top:var(--s4);max-width:24ch;"><strong>Rede</strong> viva, governança nativa.</h2>
    <ul class="gallery-feats feat-grid">
      <li>Roteamento por contexto e intenção</li>
      <li>HITL em ações sensíveis (cada ação definida)</li>
      <li>Histórico completo por cliente (multi-produto)</li>
      <li>Multi-parceiro com isolamento regulatório</li>
      <li>Compliance embutido na camada de execução</li>
      <li>APIs de integração documentadas</li>
      <li>SLA e observabilidade por fluxo</li>
      <li>Auditoria imutável por operação</li>
    </ul>
  </div>
</section>

<!-- ═══ CTA FINAL ═══ -->
<section id="cta" class="section section-dark">
  <div class="container">
    <span class="eyebrow">04 · Próximo passo</span>
    <h2 style="margin-top:var(--s4);max-width:22ch;color:var(--white);"><strong>Pronto</strong> pra plugar seu produto numa rede já orquestrada?</h2>
    <div style="margin-top:var(--s7);">
      <a href="mailto:integracoes@anova.com.br" class="btn btn-primary btn-lg">Falar com integrações →</a>
    </div>
  </div>
</section>

<div id="anova-footer"></div>

<script src="js/shell.js" defer></script>
</body>
</html>
```

- [ ] **Step 8.3: Verificação estrutural**

Run: `cd assets && grep -c 'data-page="orquestrador"' orquestrador.html`
Expected: `1`.

Run: `cd assets && grep -c 'id="anova-nav"' orquestrador.html`
Expected: `1`.

Run: `cd assets && grep -c 'id="anova-footer"' orquestrador.html`
Expected: `1`.

- [ ] **Step 8.4: Visual QA**

Run: `cd assets && python -m http.server 8000`

Abrir `http://localhost:8000/orquestrador.html`. Checklist:
- [ ] Nav aparece com "Orquestrador" destacado (sublinhado) no mega-menu.
- [ ] Hero aparece com blueprint grid de fundo, h1 grande, CTA pill.
- [ ] Seção "O que é" com 2 colunas.
- [ ] Seção "Como funciona" com 4 passos em cards.
- [ ] Seção "Capacidades" com 8 bullets em grid 2x4.
- [ ] CTA dark no final.
- [ ] Footer aparece com os links corretos.
- [ ] Click no logo "Anova" da nav → volta pra index.html.
- [ ] Nenhum erro no console do browser.

Parar o servidor.

- [ ] **Step 8.5: Commit**

Run:
```bash
cd assets
git add orquestrador.html
git commit -m "feat: add orquestrador.html product page"
```

---

## Task 9: Criar `life-invest.html`

Segunda página de produto. **Atenção:** a copy é totalmente nova — Life Invest é agora o algoritmo proprietário, não o antigo vida/previdência.

**Files:**
- Create: `assets/life-invest.html`

- [ ] **Step 9.1: Criar `assets/life-invest.html`**

Use o mesmo esqueleto do `orquestrador.html` (head, nav mount, noscript, hero, seções, footer mount, shell.js). Substitua `<title>`, `<meta description>`, `data-page`, e o conteúdo de cada seção conforme abaixo.

**Substituições:**
- `<title>Life Invest — Anova</title>`
- `<meta name="description" content="O algoritmo proprietário da Anova. Observa o mercado em tempo real, gera sinais e alimenta decisões de portfolio.">`
- `<body data-page="life-invest">`

**Hero:**
```html
<header class="hero">
  <div class="hero-bp"></div>
  <div class="container hero-grid">
    <div>
      <span class="eyebrow">Tecnologia · Motor de decisão</span>
      <h1><strong>Mercados</strong> observados continuamente. Decisões com fundamento.</h1>
      <p class="hero-sub">Life Invest é o algoritmo proprietário da Anova. Consulta o mercado em tempo real, constrói correlações entre ativos, gera sinais acionáveis e alimenta as carteiras geridas pela plataforma. Fundamento acima de intuição.</p>
      <div class="hero-cta">
        <a href="#cta" class="btn btn-primary btn-lg">Entender o algoritmo →</a>
        <a href="#o-que-e" class="btn btn-outline btn-lg">Como funciona</a>
      </div>
      <div class="hero-meta">
        <span>Dados em tempo real</span>
        <span>Multiativos</span>
        <span>Auditoria algorítmica</span>
      </div>
    </div>
    <div class="hero-visual">
      <img src="assets/img/product-life.png" alt="Life Invest — motor de decisão">
      <span class="hero-tag">Motor proprietário</span>
    </div>
  </div>
</header>
```

**O que é:**
```html
<section id="o-que-e" class="section section-alt">
  <div class="container">
    <span class="eyebrow">01 · O que é</span>
    <div class="what-grid">
      <div>
        <h2><strong>Um motor</strong> que observa o mercado por você.</h2>
        <p class="lead">O Life Invest processa continuamente dados de ativos, volumes, correlações e eventos macro, transformando ruído em sinal acionável. Os sinais alimentam as carteiras administradas pela Anova (via Wealth Management) e ficam disponíveis dentro das ferramentas operadas pelos parceiros (via Wealth Hubs). Todo sinal passa por revisão humana antes de virar ordem — HITL desde o dia um.</p>
      </div>
      <div class="what-visual">
        <img src="assets/img/product-research.png" alt="Visualização do algoritmo">
      </div>
    </div>
  </div>
</section>
```

**Como funciona:**
```html
<section class="section">
  <div class="container">
    <span class="eyebrow">02 · Como funciona</span>
    <h2 style="margin-top:var(--s4);max-width:24ch;"><strong>Coleta.</strong> Analisa. Sinaliza. Decide (com humano).</h2>
    <div class="how-grid">
      <article class="how-step">
        <div class="how-num">PASSO 01</div>
        <h3>Coleta em tempo real</h3>
        <p>Feed contínuo de cotações, volumes, indicadores macro e eventos corporativos de múltiplos ativos.</p>
      </article>
      <article class="how-step">
        <div class="how-num">PASSO 02</div>
        <h3>Análise multiativos</h3>
        <p>Cruzamento de correlações, volume profile e sinais técnicos-fundamentais em um único modelo proprietário.</p>
      </article>
      <article class="how-step">
        <div class="how-num">PASSO 03</div>
        <h3>Sinal acionável</h3>
        <p>O motor produz um sinal com fundamento explícito — por que, em quê, com qual confiança.</p>
      </article>
      <article class="how-step">
        <div class="how-num">PASSO 04</div>
        <h3>Decisão humana</h3>
        <p>O sinal é revisado por um humano autorizado antes de virar ordem. Toda decisão fica na trilha de auditoria.</p>
      </article>
    </div>
  </div>
</section>
```

**Capacidades:**
```html
<section class="section section-alt">
  <div class="container">
    <span class="eyebrow">03 · Capacidades</span>
    <h2 style="margin-top:var(--s4);max-width:24ch;"><strong>Observação</strong> contínua, decisão humana.</h2>
    <ul class="gallery-feats feat-grid">
      <li>Feed multiativos em tempo real</li>
      <li>Correlações e volume profile</li>
      <li>Sinais com explicação de fundamento</li>
      <li>Integração nativa com carteiras</li>
      <li>HITL obrigatório antes de ordem</li>
      <li>Alertas acionáveis por operador</li>
      <li>Trilha de auditoria algorítmica</li>
      <li>Backtesting de sinais anteriores</li>
    </ul>
  </div>
</section>
```

**CTA final:**
```html
<section id="cta" class="section section-dark">
  <div class="container">
    <span class="eyebrow">04 · Ver em ação</span>
    <h2 style="margin-top:var(--s4);max-width:22ch;color:var(--white);"><strong>Quer</strong> ver o Life Invest funcionando com um caso real?</h2>
    <div style="margin-top:var(--s7);">
      <a href="mailto:institucional@anova.com.br" class="btn btn-primary btn-lg">Agendar demo →</a>
    </div>
  </div>
</section>
```

- [ ] **Step 9.2: Verificação estrutural**

Run: `cd assets && grep -c 'data-page="life-invest"' life-invest.html`
Expected: `1`.

Run: `cd assets && grep -c 'vida\|previdência' life-invest.html`
Expected: `0` — confirma que a copy antiga (seguro de vida) não está presente.

- [ ] **Step 9.3: Visual QA**

Run: `cd assets && python -m http.server 8000`

Abrir `http://localhost:8000/life-invest.html`. Verificar as mesmas coisas da Task 8 step 8.4 (nav, hero, seções, footer, consola limpa). Confirmar que o item "Life Invest" está ativo na nav.

- [ ] **Step 9.4: Commit**

Run:
```bash
cd assets
git add life-invest.html
git commit -m "feat: add life-invest.html product page (algorithm positioning)"
```

---

## Task 10: Criar `wealth-hubs.html`

Página mais volumosa (apresenta a Anova do zero + 8 capacidades).

**Files:**
- Create: `assets/wealth-hubs.html`

- [ ] **Step 10.1: Criar `assets/wealth-hubs.html`**

Mesmo esqueleto base. Substituições:
- `<title>Anova Wealth Hubs — Plataforma White-Label</title>`
- `<meta name="description" content="Monte seu escritório sobre a stack Anova. Backoffice, research, orquestrador, multibanco, compliance e 80/20 — sem TI.">`
- `<body data-page="wealth-hubs">`

**Hero:**
```html
<header class="hero">
  <div class="hero-bp"></div>
  <div class="container hero-grid">
    <div>
      <span class="eyebrow">Para escritórios · Plataforma completa</span>
      <h1><strong>Seu escritório.</strong> Nossa infraestrutura. 80/20.</h1>
      <p class="hero-sub">Anova Wealth Hubs é a plataforma white-label onde escritórios e consultores operam com a stack completa da Anova — backoffice, research, orquestrador, multibanco, compliance — sob repasse 80/20 e sem precisar montar um time de tecnologia.</p>
      <div class="hero-cta">
        <a href="#cta" class="btn btn-primary btn-lg">Conhecer a proposta →</a>
        <a href="#anova-30s" class="btn btn-outline btn-lg">Primeiro, sobre a Anova</a>
      </div>
      <div class="hero-meta">
        <span>Sem TI própria</span>
        <span>Repasse 80/20</span>
        <span>Onboarding em semanas</span>
      </div>
    </div>
    <div class="hero-visual">
      <img src="assets/img/product-central.png" alt="Wealth Hubs — plataforma white-label">
      <span class="hero-tag">app.anovainvestimentos.com.br</span>
    </div>
  </div>
</header>
```

**Seção "Anova em 30 segundos" (especial pra Wealth Hubs, porque o leitor não conhece):**
```html
<section id="anova-30s" class="section section-alt">
  <div class="container">
    <span class="eyebrow">01 · Anova em 30 segundos</span>
    <div class="what-grid">
      <div>
        <h2><strong>Quem</strong> é a Anova?</h2>
        <p class="lead">A Anova é o sistema operacional conversacional da distribuição financeira brasileira. Conectamos crédito, seguros, saúde, consórcio, previdência e investimentos em uma única camada operacional — com trilha de auditoria, governança e atendimento via WhatsApp. Hoje, oferecemos toda essa infraestrutura como plataforma white-label para escritórios que querem operar sem precisar construir tecnologia.</p>
      </div>
      <div class="what-visual">
        <img src="assets/img/product-advisor-carteira.png" alt="Sistema Anova">
      </div>
    </div>
  </div>
</section>
```

**"O que você recebe" (8 capacidades em grid):**
```html
<section class="section">
  <div class="container">
    <span class="eyebrow">02 · O que você recebe</span>
    <h2 style="margin-top:var(--s4);max-width:24ch;"><strong>Oito</strong> camadas operando juntas, sob sua marca.</h2>
    <div class="how-grid" style="grid-template-columns:repeat(2,1fr);">
      <article class="how-step">
        <div class="how-num">CAPACIDADE 01</div>
        <h3>Backoffice completo</h3>
        <p>Gestão de clientes, operações, comissões, contratos e pipeline — tudo em uma única tela.</p>
      </article>
      <article class="how-step">
        <div class="how-num">CAPACIDADE 02</div>
        <h3>Anova Research</h3>
        <p>Metodologia preditiva proprietária alimentando suas estratégias de carteira e seus relatórios.</p>
      </article>
      <article class="how-step">
        <div class="how-num">CAPACIDADE 03</div>
        <h3>Orquestrador no WhatsApp</h3>
        <p>Atendimento conversacional governado. HITL, auditoria, roteamento e histórico completo por cliente.</p>
      </article>
      <article class="how-step">
        <div class="how-num">CAPACIDADE 04</div>
        <h3>Life Invest</h3>
        <p>O algoritmo que observa o mercado e alimenta as decisões de portfolio — disponível dentro do seu ambiente.</p>
      </article>
      <article class="how-step">
        <div class="how-num">CAPACIDADE 05</div>
        <h3>Plataforma multibanco</h3>
        <p>Ofereça crédito, financiamentos, consórcio e seguros de múltiplos parceiros regulados em uma origem única.</p>
      </article>
      <article class="how-step">
        <div class="how-num">CAPACIDADE 06</div>
        <h3>Sistema de escritório</h3>
        <p>Infraestrutura pra você montar e operar seu próprio escritório — identidade, clientes, operações, pipeline — sob seu guarda-chuva.</p>
      </article>
      <article class="how-step">
        <div class="how-num">CAPACIDADE 07</div>
        <h3>Compliance</h3>
        <p>Esteira regulatória embutida. Compliance não é checklist manual — é parte da camada de execução.</p>
      </article>
      <article class="how-step">
        <div class="how-num">CAPACIDADE 08</div>
        <h3>Repasse 80/20</h3>
        <p>Modelo de remuneração transparente. Você fica com 80% da receita gerada; a Anova fica com 20%. Sem pegadinha.</p>
      </article>
    </div>
  </div>
</section>
```

**"Como começar":**
```html
<section class="section section-alt">
  <div class="container">
    <span class="eyebrow">03 · Como começar</span>
    <h2 style="margin-top:var(--s4);max-width:24ch;"><strong>Conversa</strong>. Assinatura. Onboarding. Operação.</h2>
    <div class="how-grid">
      <article class="how-step">
        <div class="how-num">PASSO 01</div>
        <h3>Conversa inicial</h3>
        <p>Entendemos seu perfil, volume esperado, verticais de interesse e expectativas.</p>
      </article>
      <article class="how-step">
        <div class="how-num">PASSO 02</div>
        <h3>Assinatura do contrato</h3>
        <p>Formalizamos o modelo de repasse, as responsabilidades e o escopo da operação.</p>
      </article>
      <article class="how-step">
        <div class="how-num">PASSO 03</div>
        <h3>Onboarding técnico</h3>
        <p>Configuramos acessos, unidades, times, identidade visual e permissões.</p>
      </article>
      <article class="how-step">
        <div class="how-num">PASSO 04</div>
        <h3>Operação</h3>
        <p>Seu escritório entra em operação com suporte dedicado nas primeiras semanas.</p>
      </article>
    </div>
  </div>
</section>
```

**CTA final:**
```html
<section id="cta" class="section section-dark">
  <div class="container">
    <span class="eyebrow">04 · Próximo passo</span>
    <h2 style="margin-top:var(--s4);max-width:22ch;color:var(--white);"><strong>Conversar</strong> com o time de parcerias.</h2>
    <div style="margin-top:var(--s7);">
      <a href="mailto:parcerias@anova.com.br" class="btn btn-primary btn-lg">Falar com parcerias →</a>
    </div>
  </div>
</section>
```

- [ ] **Step 10.2: Verificação**

Run: `cd assets && grep -c 'CAPACIDADE' wealth-hubs.html`
Expected: `8`.

Run: `cd assets && grep -c 'data-page="wealth-hubs"' wealth-hubs.html`
Expected: `1`.

- [ ] **Step 10.3: Visual QA**

Run: `cd assets && python -m http.server 8000`

Abrir `http://localhost:8000/wealth-hubs.html`. Checklist padrão + verificar que a seção "O que você recebe" tem 8 cards em grid 2 colunas.

- [ ] **Step 10.4: Commit**

```bash
cd assets
git add wealth-hubs.html
git commit -m "feat: add wealth-hubs.html (white-label platform page)"
```

---

## Task 11: Criar `wealth-management.html`

**Files:**
- Create: `assets/wealth-management.html`

- [ ] **Step 11.1: Criar `assets/wealth-management.html`**

Mesmo esqueleto. Substituições:
- `<title>Wealth Management — Anova</title>`
- `<meta name="description" content="Gestão patrimonial orientada por método e tecnologia. Metodologia preditiva, algoritmo proprietário, parceiros regulados.">`
- `<body data-page="wealth-management">`

**Hero:**
```html
<header class="hero">
  <div class="hero-bp"></div>
  <div class="container hero-grid">
    <div>
      <span class="eyebrow">Para investidores · Gestão Patrimonial</span>
      <h1><strong>Seu patrimônio</strong> merece método. Não intuição.</h1>
      <p class="hero-sub">A gestão patrimonial da Anova é ancorada em metodologia proprietária, algoritmo de mercado contínuo e execução auditável por parceiros regulados. Você tem fundamento pra cada decisão — e trilha pra cada operação.</p>
      <div class="hero-cta">
        <a href="#cta" class="btn btn-primary btn-lg">Agendar conversa →</a>
        <a href="#o-que-e" class="btn btn-outline btn-lg">Como operamos</a>
      </div>
      <div class="hero-meta">
        <span>Metodologia preditiva</span>
        <span>Multi-estratégia</span>
        <span>Parceiros regulados</span>
      </div>
    </div>
    <div class="hero-visual">
      <img src="assets/img/product-advisor-carteira.png" alt="Wealth Management — carteira diversificada">
      <span class="hero-tag">Gestão patrimonial</span>
    </div>
  </div>
</header>
```

**O que é:**
```html
<section id="o-que-e" class="section section-alt">
  <div class="container">
    <span class="eyebrow">01 · O que é</span>
    <div class="what-grid">
      <div>
        <h2><strong>Método</strong> primeiro. Intuição depois.</h2>
        <p class="lead">A gestão patrimonial da Anova opera em três camadas. A primeira é <strong>metodologia</strong> — a Anova Research desenvolveu uma abordagem proprietária que transforma análise descritiva em preditiva, e é ela quem fundamenta as estratégias. A segunda é <strong>algoritmo</strong> — o Life Invest observa o mercado continuamente, alimenta sinais acionáveis e revisão humana obrigatória antes de cada ordem. A terceira é <strong>execução</strong> — por parceiros regulados, com trilha auditável e custos transparentes.</p>
      </div>
      <div class="what-visual">
        <img src="assets/img/product-research.png" alt="Metodologia Anova">
      </div>
    </div>
  </div>
</section>
```

**Como funciona:**
```html
<section class="section">
  <div class="container">
    <span class="eyebrow">02 · Como funciona</span>
    <h2 style="margin-top:var(--s4);max-width:24ch;"><strong>Diagnóstico.</strong> Estratégia. Execução. Acompanhamento.</h2>
    <div class="how-grid">
      <article class="how-step">
        <div class="how-num">PASSO 01</div>
        <h3>Diagnóstico patrimonial</h3>
        <p>Entendemos seu patrimônio, seus objetivos, seu horizonte e sua tolerância real a risco — não a que está no questionário.</p>
      </article>
      <article class="how-step">
        <div class="how-num">PASSO 02</div>
        <h3>Estratégia orientada por método</h3>
        <p>Construímos uma alocação sob medida baseada em metodologia Research + sinais Life Invest + seu perfil.</p>
      </article>
      <article class="how-step">
        <div class="how-num">PASSO 03</div>
        <h3>Execução auditável</h3>
        <p>Ordens são executadas por parceiros regulados, com trilha auditável e custos transparentes.</p>
      </article>
      <article class="how-step">
        <div class="how-num">PASSO 04</div>
        <h3>Acompanhamento vivo</h3>
        <p>Rebalanceamento contínuo, relatórios personalizados, acesso direto ao time. Nenhum trimestre no escuro.</p>
      </article>
    </div>
  </div>
</section>
```

**Capacidades (8 bullets):**
```html
<section class="section section-alt">
  <div class="container">
    <span class="eyebrow">03 · Capacidades</span>
    <h2 style="margin-top:var(--s4);max-width:24ch;"><strong>Gestão</strong> com fundamento e transparência.</h2>
    <ul class="gallery-feats feat-grid">
      <li>Carteira diversificada por estratégia</li>
      <li>Rebalanceamento contínuo</li>
      <li>Research preditivo proprietário</li>
      <li>Relatórios personalizados</li>
      <li>Acesso direto ao time de gestão</li>
      <li>Cobertura multibanco regulada</li>
      <li>Proteção patrimonial integrada</li>
      <li>Transparência total de custos</li>
    </ul>
  </div>
</section>
```

**CTA final:**
```html
<section id="cta" class="section section-dark">
  <div class="container">
    <span class="eyebrow">04 · Próximo passo</span>
    <h2 style="margin-top:var(--s4);max-width:22ch;color:var(--white);"><strong>Agendar</strong> um diagnóstico patrimonial.</h2>
    <div style="margin-top:var(--s7);">
      <a href="mailto:wealth@anova.com.br" class="btn btn-primary btn-lg">Falar com o time →</a>
    </div>
  </div>
</section>
```

- [ ] **Step 11.2: Verificação**

Run: `cd assets && grep -c 'data-page="wealth-management"' wealth-management.html`
Expected: `1`.

- [ ] **Step 11.3: Visual QA**

Abrir `http://localhost:8000/wealth-management.html`. Checklist padrão. Confirmar que "Wealth Management" está destacado na nav (coluna "Para investidores").

- [ ] **Step 11.4: Commit**

```bash
cd assets
git add wealth-management.html
git commit -m "feat: add wealth-management.html (B2C investor page)"
```

---

## Task 12: Criar `credito.html`

Esta página usa **dados reais** do `banking.model.ts` do PlataformaAnova. Lê os parceiros e as categorias de lá.

**Files:**
- Create: `assets/credito.html`
- Reference (read-only): `C:/Users/bruno/OneDrive/Documentos/Projetos/PlataformaAnova/src/app/modules/banking/models/banking.model.ts`

- [ ] **Step 12.1: Extrair dados do banking.model.ts**

Ler as linhas 1-180 de `banking.model.ts`. Anotar:
- As 4 categorias: Empréstimos, Financiamentos, Consórcio, Seguro e Previdência.
- Os subprodutos: `garantia-imovel, garantia-veiculo, imobiliario, veiculos, imoveis, veiculos (consórcio), servicos, vida, residencial, previdencia`.
- Os parceiros do primeiro produto (empréstimo com garantia de imóvel): Banrisul, CashMe, Bradesco, C6 Bank, Aminter.

- [ ] **Step 12.2: Criar `assets/credito.html`**

Mesmo esqueleto. Substituições:
- `<title>Produtos de Crédito — Anova Multibanco</title>`
- `<meta name="description" content="Multibanco por rede de parceiros regulados. Ofereça a melhor taxa, parcela e CET ao seu cliente via Anova Orquestrador.">`
- `<body data-page="credito">`

**CSS adicional no `<style>` da página (para os cards de categoria):**
```html
<style>
  /* ... (estilos base do template) ... */
  .cat-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:var(--s5);margin-top:var(--s7);}
  @media(max-width:880px){.cat-grid{grid-template-columns:1fr;}}
  .cat-card{border:1px solid var(--border);border-radius:var(--r-xl);padding:var(--s6);background:var(--white);transition:border-color .2s;}
  .cat-card:hover{border-color:var(--text-1);}
  .cat-card h3{margin-bottom:var(--s4);}
  .cat-card ul{list-style:none;margin-top:var(--s4);}
  .cat-card li{padding:var(--s3) 0;border-top:1px solid var(--border);font-size:14px;color:var(--text-2);}
  .cat-card li:first-child{border-top:none;}
  .cat-card .cat-num{font-family:var(--mono);font-size:10px;color:var(--text-3);letter-spacing:.1em;margin-bottom:var(--s3);}
  .partner-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:var(--s4);margin-top:var(--s6);}
  @media(max-width:680px){.partner-grid{grid-template-columns:repeat(2,1fr);}}
  .partner-card{border:1px solid var(--border);border-radius:var(--r-md);padding:var(--s4);text-align:center;font-weight:700;font-size:13px;color:var(--text-2);background:var(--white);}
</style>
```

**Hero:**
```html
<header class="hero">
  <div class="hero-bp"></div>
  <div class="container hero-grid">
    <div>
      <span class="eyebrow">Para consultores · Multibanco</span>
      <h1><strong>Uma origem.</strong> Múltiplos bancos. Taxa que faz sentido.</h1>
      <p class="hero-sub">Os Produtos de Crédito da Anova são um multibanco real: o consultor oferece ao cliente a melhor combinação de taxa, parcela e CET entre uma rede de parceiros regulados — tudo operado via Orquestrador, com trilha auditável e comissão rastreada por operação.</p>
      <div class="hero-cta">
        <a href="#cta" class="btn btn-primary btn-lg">Operar no multibanco →</a>
        <a href="#categorias" class="btn btn-outline btn-lg">Ver produtos disponíveis</a>
      </div>
      <div class="hero-meta">
        <span>Empréstimos · Financiamentos</span>
        <span>Consórcio · Seguros</span>
        <span>Parceiros regulados</span>
      </div>
    </div>
    <div class="hero-visual">
      <img src="assets/img/product-research.png" alt="Dashboard multibanco">
      <span class="hero-tag">Dashboard multibanco</span>
    </div>
  </div>
</header>
```

**O que é:**
```html
<section id="o-que-e" class="section section-alt">
  <div class="container">
    <span class="eyebrow">01 · O que é</span>
    <div class="what-grid">
      <div>
        <h2><strong>Multibanco</strong> na mesma origem.</h2>
        <p class="lead">O consultor abre uma única origem na Anova e, a partir dela, oferece ao cliente a comparação real entre múltiplos parceiros regulados — Banrisul, CashMe, Bradesco, C6 Bank, Aminter, entre outros. Taxa, parcela e CET lado a lado. A escolha é do cliente. A operação é auditada. A comissão é rastreada. Tudo acontece dentro do Orquestrador, preservando governança e histórico por cliente.</p>
      </div>
      <div class="what-visual">
        <img src="assets/img/product-orquestrador-2.png" alt="Comparação multibanco">
      </div>
    </div>
  </div>
</section>
```

**Categorias (cards com subprodutos reais):**
```html
<section id="categorias" class="section">
  <div class="container">
    <span class="eyebrow">02 · Categorias</span>
    <h2 style="margin-top:var(--s4);max-width:24ch;"><strong>Cinco</strong> linhas de produto. Uma única origem.</h2>
    <div class="cat-grid">
      <article class="cat-card">
        <div class="cat-num">LINHA 01 · EMPRÉSTIMOS</div>
        <h3>Crédito com garantia</h3>
        <p>Use bens como garantia e alcance taxas significativamente menores que empréstimos pessoais ou cartão.</p>
        <ul>
          <li>Empréstimo com Garantia de Imóvel</li>
          <li>Empréstimo com Garantia de Veículo</li>
        </ul>
      </article>
      <article class="cat-card">
        <div class="cat-num">LINHA 02 · FINANCIAMENTOS</div>
        <h3>Bens de alto valor</h3>
        <p>As melhores condições de financiamento imobiliário e veicular do mercado, via múltiplos bancos.</p>
        <ul>
          <li>Financiamento Imobiliário</li>
          <li>Financiamento de Veículos</li>
        </ul>
      </article>
      <article class="cat-card">
        <div class="cat-num">LINHA 03 · CONSÓRCIO</div>
        <h3>Planejado, sem juros</h3>
        <p>Planeje a conquista de bens ou serviços de forma econômica, parcelada e sem juros, em grupos regulados.</p>
        <ul>
          <li>Consórcio de Imóveis</li>
          <li>Consórcio de Veículos</li>
          <li>Consórcio de Serviços</li>
        </ul>
      </article>
      <article class="cat-card">
        <div class="cat-num">LINHA 04 · SEGURO E PREVIDÊNCIA</div>
        <h3>Proteger e planejar</h3>
        <p>Proteja o que é seu e planeje o futuro com parceiros SUSEP-regulados integrados ao multibanco.</p>
        <ul>
          <li>Seguro de Vida Individual</li>
          <li>Seguro Residencial</li>
          <li>Previdência Privada</li>
        </ul>
      </article>
      <article class="cat-card">
        <div class="cat-num">LINHA 05 · PLANO DE SAÚDE</div>
        <h3>Em breve</h3>
        <p>Plano de saúde será a próxima linha integrada ao multibanco Anova. Fale com o time pra acompanhar o roadmap.</p>
        <ul>
          <li>Em roadmap</li>
        </ul>
      </article>
    </div>
  </div>
</section>
```

**Como funciona:**
```html
<section class="section section-alt">
  <div class="container">
    <span class="eyebrow">03 · Como funciona</span>
    <h2 style="margin-top:var(--s4);max-width:24ch;"><strong>Simula.</strong> Compara. Escolhe. Opera.</h2>
    <div class="how-grid">
      <article class="how-step">
        <div class="how-num">PASSO 01</div>
        <h3>Simulação</h3>
        <p>O consultor informa valor, objetivo e dados relevantes do cliente. O sistema gera a simulação inicial.</p>
      </article>
      <article class="how-step">
        <div class="how-num">PASSO 02</div>
        <h3>Comparação multibanco</h3>
        <p>Propostas de múltiplos parceiros regulados aparecem lado a lado — taxa, parcela, CET e prazo.</p>
      </article>
      <article class="how-step">
        <div class="how-num">PASSO 03</div>
        <h3>Escolha do cliente</h3>
        <p>O cliente escolhe a proposta que faz sentido. O consultor conduz a decisão com transparência.</p>
      </article>
      <article class="how-step">
        <div class="how-num">PASSO 04</div>
        <h3>Operação auditada</h3>
        <p>Documentação, acompanhamento e liberação do crédito — tudo com trilha auditável e comissão rastreada.</p>
      </article>
    </div>
  </div>
</section>
```

**Parceiros:**
```html
<section class="section">
  <div class="container">
    <span class="eyebrow">04 · Parceiros regulados</span>
    <h2 style="margin-top:var(--s4);max-width:24ch;"><strong>Parceiros</strong> conectados ao multibanco.</h2>
    <div class="partner-grid">
      <div class="partner-card">Banrisul</div>
      <div class="partner-card">CashMe</div>
      <div class="partner-card">Bradesco</div>
      <div class="partner-card">C6 Bank</div>
      <div class="partner-card">Aminter</div>
    </div>
    <p style="margin-top:var(--s5);font-family:var(--mono);font-size:11px;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em;">Lista não exaustiva · Parceiros adicionais conectados caso a caso</p>
  </div>
</section>
```

**Capacidades:**
```html
<section class="section section-alt">
  <div class="container">
    <span class="eyebrow">05 · Capacidades</span>
    <h2 style="margin-top:var(--s4);max-width:24ch;"><strong>Operação</strong> real. Comissão rastreada.</h2>
    <ul class="gallery-feats feat-grid">
      <li>Comparação lado a lado (taxa, parcela, CET)</li>
      <li>Documentação centralizada</li>
      <li>Acompanhamento de status por operação</li>
      <li>Comissão rastreada por originação</li>
      <li>Trilha de auditoria fim a fim</li>
      <li>Integração nativa com Orquestrador</li>
      <li>Cross-sell com Life Invest e Wealth Management</li>
      <li>Compliance embutido na esteira</li>
    </ul>
  </div>
</section>
```

**CTA final:**
```html
<section id="cta" class="section section-dark">
  <div class="container">
    <span class="eyebrow">06 · Próximo passo</span>
    <h2 style="margin-top:var(--s4);max-width:22ch;color:var(--white);"><strong>Começar</strong> a operar crédito pela Anova.</h2>
    <div style="margin-top:var(--s7);">
      <a href="mailto:credito@anova.com.br" class="btn btn-primary btn-lg">Falar com o time →</a>
    </div>
  </div>
</section>
```

- [ ] **Step 12.3: Verificação**

Run: `cd assets && grep -c 'Banrisul\|CashMe\|Bradesco\|C6 Bank\|Aminter' credito.html`
Expected: `>= 5`.

Run: `cd assets && grep -c 'cat-card' credito.html`
Expected: `>= 6` (5 cards + a classe CSS).

- [ ] **Step 12.4: Visual QA**

Abrir `http://localhost:8000/credito.html`. Confirmar:
- Hero legível.
- Seção "Categorias" mostra os 5 cards (inclusive o "Em breve" de plano de saúde).
- Seção "Parceiros" mostra os 5 parceiros em grid.

- [ ] **Step 12.5: Commit**

```bash
cd assets
git add credito.html
git commit -m "feat: add credito.html (multibanco page from banking.model data)"
```

---

## Task 13: Criar `research.html`

Última página. Tom mais editorial.

**Files:**
- Create: `assets/research.html`

- [ ] **Step 13.1: Criar `assets/research.html`**

Mesmo esqueleto. Substituições:
- `<title>Anova Research — Metodologia Preditiva</title>`
- `<meta name="description" content="A origem da Anova. Onde descritivo virou preditivo. Metodologia proprietária desenvolvida desde a primeira aparição no mercado.">`
- `<body data-page="research">`

**CSS adicional para prosa editorial:**
```html
<style>
  /* ... (estilos base do template) ... */
  .prose{max-width:68ch;margin:var(--s7) 0;}
  .prose p{font-size:17px;color:var(--text-2);line-height:1.7;margin-bottom:var(--s5);}
  .prose p:first-of-type::first-letter{font-size:52px;font-weight:700;float:left;line-height:.9;padding:4px 12px 0 0;color:var(--text-1);}
  .pillar-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:var(--s6);margin-top:var(--s7);}
  @media(max-width:880px){.pillar-grid{grid-template-columns:1fr;}}
  .pillar{border-left:2px solid var(--text-1);padding:var(--s3) 0 var(--s3) var(--s5);}
  .pillar h3{margin-bottom:var(--s3);}
  .pillar p{font-size:15px;color:var(--text-2);line-height:1.6;}
</style>
```

**Hero (editorial, menos agressivo que os outros):**
```html
<header class="hero">
  <div class="hero-bp"></div>
  <div class="container hero-grid">
    <div>
      <span class="eyebrow">Metodologia · Desde o início</span>
      <h1><strong>Descritivo</strong> é passado. Preditivo é decisão.</h1>
      <p class="hero-sub">A Anova Research é a origem metodológica da empresa — o primeiro ponto onde construímos uma abordagem proprietária pra transformar análise descritiva em preditiva via software. Tudo que veio depois (Life Invest, Wealth Management, Wealth Hubs) é uma expressão dela.</p>
      <div class="hero-cta">
        <a href="#cta" class="btn btn-primary btn-lg">Falar com Research →</a>
        <a href="#origem" class="btn btn-outline btn-lg">Ler a história</a>
      </div>
      <div class="hero-meta">
        <span>Origem da Anova</span>
        <span>Metodologia proprietária</span>
        <span>Software preditivo</span>
      </div>
    </div>
    <div class="hero-visual">
      <img src="assets/img/product-research.png" alt="Anova Research">
      <span class="hero-tag">Origem metodológica</span>
    </div>
  </div>
</header>
```

**Origem (prosa longa):**
```html
<section id="origem" class="section section-alt">
  <div class="container">
    <span class="eyebrow">01 · Origem</span>
    <h2 style="margin-top:var(--s4);max-width:24ch;"><strong>Onde</strong> a Anova começou.</h2>
    <div class="prose">
      <p>A Research foi a primeira aparição da Anova no mercado financeiro brasileiro. Antes de plataforma, antes de orquestrador, antes de multibanco — havia a pergunta: por que o mercado financeiro ainda opera em cima de análise descritiva, olhando o retrovisor, quando a tecnologia já permite observar o que está chegando?</p>
      <p>A resposta veio como software. Desenvolvemos uma metodologia proprietária que cruza dados de ativos, volumes, correlações, eventos corporativos e sinais macro em um único modelo. O output não é um relatório trimestral — é um sinal acionável, com fundamento explícito, atualizado conforme o mercado se move. Descritivo vira preditivo quando você para de contar o que aconteceu e começa a explicar o que está se formando.</p>
      <p>Essa metodologia é o que alimenta, hoje, todas as outras superfícies da Anova. Ela vive no Life Invest (como motor algorítmico contínuo), no Wealth Management (como fundamento das estratégias de carteira) e no Wealth Hubs (como capacidade embarcada na stack entregue aos escritórios parceiros). É o DNA — e é por isso que a Research merece um lugar próprio.</p>
    </div>
  </div>
</section>
```

**Metodologia (4 pilares):**
```html
<section class="section">
  <div class="container">
    <span class="eyebrow">02 · Metodologia</span>
    <h2 style="margin-top:var(--s4);max-width:24ch;"><strong>Quatro</strong> pilares. Um método.</h2>
    <div class="pillar-grid">
      <div class="pillar">
        <h3>Dado histórico denso</h3>
        <p>Séries temporais de ativos, volumes, cotações, eventos corporativos e indicadores macro em alta granularidade — a base sob tudo.</p>
      </div>
      <div class="pillar">
        <h3>Modelagem multiativos</h3>
        <p>Cruzamento de correlações, volume profile e fundamentos em um modelo proprietário que respeita a natureza não-estacionária do mercado.</p>
      </div>
      <div class="pillar">
        <h3>Sinal preditivo explícito</h3>
        <p>Cada sinal vem com fundamento — por que, em quê, com que confiança. Sem caixa-preta. Sem "o modelo disse".</p>
      </div>
      <div class="pillar">
        <h3>Calibração contínua</h3>
        <p>Os sinais são recalibrados conforme o mercado evolui. Backtesting é parte do ciclo, não um teste único de saída.</p>
      </div>
    </div>
  </div>
</section>
```

**Onde vive hoje:**
```html
<section class="section section-alt">
  <div class="container">
    <span class="eyebrow">03 · Onde vive hoje</span>
    <h2 style="margin-top:var(--s4);max-width:24ch;"><strong>Research</strong> alimenta tudo.</h2>
    <div class="prose">
      <p>A metodologia Research não é um produto separado esperando ser comprado — é a camada invisível que dá fundamento a todas as outras. No <a href="life-invest.html" style="border-bottom:1px solid var(--text-1);">Life Invest</a>, vira o motor algorítmico contínuo que observa o mercado. No <a href="wealth-management.html" style="border-bottom:1px solid var(--text-1);">Wealth Management</a>, vira o fundamento das estratégias de carteira. No <a href="wealth-hubs.html" style="border-bottom:1px solid var(--text-1);">Wealth Hubs</a>, vira uma capacidade embarcada na stack entregue aos parceiros. A Research fala por meio de cada produto.</p>
    </div>
  </div>
</section>
```

**CTA final:**
```html
<section id="cta" class="section section-dark">
  <div class="container">
    <span class="eyebrow">04 · Próximo passo</span>
    <h2 style="margin-top:var(--s4);max-width:22ch;color:var(--white);"><strong>Conversar</strong> com o time de Research.</h2>
    <div style="margin-top:var(--s7);">
      <a href="mailto:research@anova.com.br" class="btn btn-primary btn-lg">Falar com Research →</a>
    </div>
  </div>
</section>
```

- [ ] **Step 13.2: Verificação**

Run: `cd assets && grep -c 'data-page="research"' research.html`
Expected: `1`.

Run: `cd assets && grep -c 'pillar' research.html`
Expected: `>= 5` (4 pilares + classe CSS).

- [ ] **Step 13.3: Visual QA**

Abrir `http://localhost:8000/research.html`. Confirmar tom editorial (prosa, drop cap no primeiro parágrafo, grid de pilares).

- [ ] **Step 13.4: Commit**

```bash
cd assets
git add research.html
git commit -m "feat: add research.html (methodology + editorial tone)"
```

---

## Task 14: QA de integração global

Todas as 7 páginas existem. Passamos uma auditoria completa.

**Files:**
- Modify: qualquer página que falhar no QA.

- [ ] **Step 14.1: Verificação de link integrity**

Run:
```bash
cd assets
for f in index.html wealth-management.html wealth-hubs.html life-invest.html orquestrador.html credito.html research.html; do
  echo "=== $f ==="
  grep -oE 'href="[^"#][^"]*\.html"' "$f" | sort -u
done
```

Anotar todos os arquivos referenciados. Cada um deve ser um dos 7. Qualquer link apontando pra arquivo inexistente = bug.

Run: `cd assets && for f in $(grep -rhoE 'href="[^"#][^"]*\.html"' *.html partials/*.html | sort -u | sed 's/href="//;s/"//'); do if [ ! -f "$f" ]; then echo "MISSING: $f"; fi; done`

Expected: sem output (tudo existe).

- [ ] **Step 14.2: Verificação de `data-page` em todas as páginas**

Run:
```bash
cd assets
for f in wealth-management.html wealth-hubs.html life-invest.html orquestrador.html credito.html research.html; do
  grep -o 'data-page="[^"]*"' "$f" | head -1
done
```

Expected:
```
data-page="wealth-management"
data-page="wealth-hubs"
data-page="life-invest"
data-page="orquestrador"
data-page="credito"
data-page="research"
```

Se alguma página tiver `data-page` errado, corrigir e commit com `fix: correct data-page slug in X`.

- [ ] **Step 14.3: Verificação de mount points**

Run:
```bash
cd assets
for f in index.html wealth-management.html wealth-hubs.html life-invest.html orquestrador.html credito.html research.html; do
  has_nav=$(grep -c 'id="anova-nav"' "$f")
  has_footer=$(grep -c 'id="anova-footer"' "$f")
  echo "$f: nav=$has_nav footer=$has_footer"
done
```

Expected: cada linha termina com `nav=1 footer=1`.

- [ ] **Step 14.4: Manual QA — golden path investidor**

Abrir `http://localhost:8000/`. Navegar:
1. index → clicar no botão "Conhecer Wealth Management →" do gallery
2. wealth-management → clicar no link "Research" do mega-menu (via Produtos ▾)
3. research → clicar no link de Wealth Management no parágrafo "Onde vive hoje"
4. de volta em wealth-management → clicar no CTA final (deve abrir mailto)

Checklist:
- [ ] Cada navegação funciona sem 404.
- [ ] Estado ativo da nav muda corretamente.
- [ ] Mega-menu abre e fecha sem bug.
- [ ] Nenhum erro no console.

- [ ] **Step 14.5: Manual QA — golden path escritório**

Navegar:
1. index → mega-menu → Wealth Hubs
2. wealth-hubs → mega-menu → Orquestrador
3. orquestrador → mega-menu → Crédito
4. credito → CTA final

Mesmo checklist.

- [ ] **Step 14.6: Manual QA — golden path integrador**

Navegar:
1. index → gallery → "Conhecer Orquestrador →"
2. orquestrador → CTA final

- [ ] **Step 14.7: Manual QA — mobile**

Abrir DevTools → Toggle device toolbar → 375px de largura.

Checklist em cada uma das 7 páginas:
- [ ] Nav colapsa pra hamburguer.
- [ ] Click no hamburguer abre menu vertical full-height.
- [ ] Dentro do menu, clicar em "Produtos" abre o accordion (mega-menu vira lista vertical).
- [ ] Links do mega-menu vertical funcionam.
- [ ] Layouts internos não quebram (sem overflow horizontal, sem texto cortado).
- [ ] Footer renderiza corretamente.

- [ ] **Step 14.8: Manual QA — teclado/a11y básico**

Em `orquestrador.html`:
- [ ] Tab navega por todos os links da nav.
- [ ] Tab entra no mega-menu quando aberto.
- [ ] Esc fecha o mega-menu.
- [ ] Todos os botões/links têm foco visível.

- [ ] **Step 14.9: Manual QA — disable JS**

DevTools → Settings → Disable JavaScript → reload `index.html`.
- [ ] Nav noscript aparece no topo com 7 links texto.
- [ ] Conteúdo da página aparece normal (o hero, seções, etc.).
- [ ] Mega-menu e gallery JS não funcionam (esperado).
- [ ] Links noscript navegam pras outras páginas.

Reabilitar JS depois.

- [ ] **Step 14.10: Corrigir problemas encontrados**

Para cada problema encontrado nos steps anteriores, fazer fix + commit individual (`fix: <descrição>`).

Se nenhum problema for encontrado, pular pro step 14.11.

- [ ] **Step 14.11: Commit final de QA (vazio se nada foi alterado)**

Se houver commits de fix, ok. Se não, adicionar um tag:

Run:
```bash
cd assets
git tag -a v1.0.0-multipage -m "Multi-page site complete (7 pages)"
git log --oneline | head -20
```

Expected: ver todos os commits do plan de volta até o `chore: initial snapshot`.

---

## Task 15: Documentar servidor local no README

Adicionar instrução curta sobre como rodar o site localmente.

**Files:**
- Create or Modify: `assets/README.md`

- [ ] **Step 15.1: Verificar se existe README**

Run: `ls assets/README.md 2>&1`
Expected: `No such file or directory` (ou achado, nesse caso: abrir e anexar).

- [ ] **Step 15.2: Criar `assets/README.md`**

```markdown
# Anova — Site Multi-Página

Site institucional da Anova, HTML estático.

## Estrutura

- `index.html` — home (Anova OS)
- `wealth-management.html` — B2C, investidor
- `wealth-hubs.html` — B2B, white-label
- `life-invest.html` — algoritmo proprietário
- `orquestrador.html` — parceiros integradores
- `credito.html` — consultor multibanco
- `research.html` — metodologia preditiva

## Rodar localmente

```bash
cd assets
python -m http.server 8000
```

Abrir `http://localhost:8000/`.

Não abrir via `file://` — os partials (`nav.html`, `footer.html`) são carregados via `fetch()`, que é bloqueado no protocolo `file://`.

## Arquitetura

- Design system em `design-system/` (tokens.css, components.css, sections.css, nav.css)
- Partials compartilhados em `partials/` (nav.html, footer.html)
- Shell JS em `js/shell.js`
- Documentação do design em `docs/superpowers/specs/`
- Plano de execução em `docs/superpowers/plans/`
```

- [ ] **Step 15.3: Commit**

```bash
cd assets
git add README.md
git commit -m "docs: add README with local dev instructions"
```

---

## Self-Review (post-plan)

(Realizado pelo autor do plano após escrever todas as tasks.)

**Spec coverage:**
- ✓ Section 2 (sitemap) — Task 6 (home migration) + Tasks 8-13 (6 product pages).
- ✓ Section 3 (arquitetura) — Tasks 0-5 (git, sections.css, nav.css, partials, shell.js).
- ✓ Section 4 (componentes compartilhados) — Tasks 2, 3, 4, 5.
- ✓ Section 5.1 (home) — Task 6 + Task 7 (gallery adaptation).
- ✓ Section 5.2 (Wealth Management) — Task 11.
- ✓ Section 5.3 (Wealth Hubs) — Task 10.
- ✓ Section 5.4 (Life Invest) — Task 9.
- ✓ Section 5.5 (Orquestrador) — Task 8.
- ✓ Section 5.6 (Crédito) — Task 12.
- ✓ Section 5.7 (Research) — Task 13.
- ✓ Section 6 (plano de execução) — ordem respeitada nas Tasks 8-13.
- ✓ Section 7 (QA) — Task 14.
- ✓ Section 9 (fora de escopo) — plan respeita (sem backend, sem framework).

**Placeholder scan:** plan tem referências a `assets/img/*` que já existem e usa reuso planejado pelo spec. Não há "TBD", "TODO", ou steps sem conteúdo.

**Type consistency:** nomes de data-page consistentes entre `nav.html` (Task 3) e os `<body data-page="...">` (Tasks 6, 8-13). Verificado visualmente.

**Uma observação não-bloqueante:** se o design system existente (components.css) não tiver as classes `btn-outline btn-sm`, os botões "Conhecer [produto] →" no gallery adaptado (Task 7) podem renderizar sem estilo. Se isso acontecer no Step 7.6 (Visual QA), o fix é um sub-commit dentro da Task 7 ajustando a classe ou adicionando o estilo em `sections.css`.

---

## Execution Handoff

Plano completo e salvo em `assets/docs/superpowers/plans/2026-04-14-anova-multi-page.md`.

Duas opções de execução:

1. **Subagent-Driven (recommended)** — dispatch de subagent fresco por task, review entre tasks, iteração rápida.
2. **Inline Execution** — execução em sessão direta, batch com checkpoints.

Qual abordagem?
