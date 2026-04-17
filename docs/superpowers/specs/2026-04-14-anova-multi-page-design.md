# Anova — Site Multi-Página (Design Spec)

**Data:** 2026-04-14
**Projeto:** `assets/` — site institucional Anova
**Status:** aprovado para implementação
**Autor:** brainstorm com Bruno

---

## 1. Problema e Objetivo

Hoje o `assets/index.html` é uma página única (814 linhas) que fala da plataforma Anova como um todo e apresenta 5 superfícies numa seção "gallery" com abas JavaScript (Advisor, Orquestrador, Research, Life Invest, Central).

Bruno quer **transformar o site em multi-página**, com uma home institucional (Anova OS) e **6 páginas de produto** dedicadas, cada uma com audiência, ângulo e profundidade própria. O objetivo é permitir que cada produto tenha peso de landing page real — prospect clica na nav ou no mega-menu e cai num pitch completo do produto, não num parágrafo e uma imagem.

**Não é objetivo deste spec:** redesenhar o design system, migrar pra framework, criar CMS, integrar backend, adicionar conta/login.

---

## 2. Sitemap Final

```
/ (Anova OS — home)
├── wealth-management.html    → B2C — investidor final
├── wealth-hubs.html          → B2B — escritório white-label
├── life-invest.html          → algoritmo proprietário
├── orquestrador.html         → parceiros integradores
├── credito.html              → consultor multibanco
└── research.html             → metodologia preditiva
```

**Total: 7 páginas HTML estáticas.** Advisor e Central (do gallery atual) somem — absorvidos pelo Wealth Hubs, que cobre o backoffice completo.

### Audiência por página

| Página           | Público principal                                       | Intenção dominante         |
| ---------------- | ------------------------------------------------------- | -------------------------- |
| Anova OS         | investidor, dono de gestora, empresário, mercado        | entender a visão           |
| Wealth Management| investidor final (B2C) com patrimônio                   | contratar gestão           |
| Wealth Hubs      | escritório/consultor que **não conhece a Anova**        | avaliar white-label 80/20  |
| Life Invest      | investidor + escritório avaliando tecnologia            | entender o algoritmo       |
| Orquestrador     | parceiros integradores (bancos, seguradoras, gestoras)  | integrar produto à camada  |
| Crédito          | consultor que vende crédito ao cliente final            | usar multibanco            |
| Research         | investidor sofisticado + mercado + jornalista           | entender a metodologia     |

---

## 3. Arquitetura Técnica

**Stack:** HTML5 estático + CSS custom (tokens.css/components.css existentes) + JS vanilla mínimo. **Zero framework, zero build, zero Node.**

### Layout de diretórios final

```
assets/
├── index.html                        # Anova OS (home)
├── wealth-management.html
├── wealth-hubs.html
├── life-invest.html
├── orquestrador.html
├── credito.html
├── research.html
│
├── design-system/
│   ├── tokens.css                    # (existente, intocado)
│   ├── components.css                # (existente, intocado)
│   ├── GUIDE.md                      # (existente, intocado)
│   ├── nav.css                       # NOVO — nav + mega-menu
│   └── sections.css                  # NOVO — hero/proof/problem/pivot/gallery/how/cta (extraído do inline)
│
├── partials/
│   ├── nav.html                      # NOVO — markup da nav + mega-menu (fonte única)
│   └── footer.html                   # NOVO — markup do footer (fonte única)
│
├── js/
│   └── shell.js                      # NOVO — injeção de partials, toggle mega-menu, active page
│
├── assets/img/                       # (existente — reuso o que tem, placeholders onde faltar)
│
└── docs/superpowers/specs/
    └── 2026-04-14-anova-multi-page-design.md   # este arquivo
```

### Reuso de partials (nav + footer)

Como é HTML estático puro e não queremos framework, a estratégia é:

1. Cada página tem `<div id="anova-nav"></div>` no topo e `<div id="anova-footer"></div>` no final.
2. Cada página tem `<body data-page="wealth-management">` (ou o slug correspondente).
3. `js/shell.js` roda em cada página e faz:
   - `fetch('partials/nav.html')` → inject em `#anova-nav`
   - `fetch('partials/footer.html')` → inject em `#anova-footer`
   - Lê `document.body.dataset.page` e aplica `aria-current="page"` + classe `.nav-link-active` no link correspondente
   - Attach de handlers do mega-menu (click pra abrir, click fora pra fechar, `Esc` pra fechar, Tab pra navegar)

**Consequência conhecida:** `fetch` local não funciona via `file://` (bloqueado pelo browser). **Exige servidor local** (`python -m http.server 8000` ou `npx serve`). Deploy em qualquer hospedagem estática (Vercel, Netlify, S3, Nginx) funciona normalmente. Esta limitação foi apresentada e aceita.

### Fallback de no-JS

Se JS estiver desabilitado, `shell.js` não roda e a nav/footer não aparecem. **Mitigação:** cada página inclui uma `<noscript>` no topo com uma nav minimalista texto-only (links pros outros 6 arquivos). Não é bonita, mas preserva navegabilidade pra acessibilidade e crawlers. Performance crawlers modernos (Googlebot) executam JS e vão ver o conteúdo real.

---

## 4. Componentes Compartilhados

### 4.1 Nav (`partials/nav.html` + `design-system/nav.css`)

```
┌─────────────────────────────────────────────────────────────────┐
│ [◼] Anova     Anova OS   Produtos ▾   Manifesto   Contato  [CTA]│
└─────────────────────────────────────────────────────────────────┘
```

- **Marca** (esquerda): logo squircle 32×32 `border-radius: 22%` + wordmark "Anova". Link pra `/`.
- **Menu** (centro): 4 itens — `Anova OS` (=home), `Produtos ▾`, `Manifesto`, `Contato`.
- **CTA** (direita): pill `Falar com time →`, preto sólido.
- **Altura:** 64px, `position: fixed`, `backdrop-filter: blur(14px)`, `background: rgba(255,255,255,.94)`.

**Estado ativo:** quando `body[data-page="X"]`, o item de nav correspondente recebe `border-bottom: 2px solid var(--onyx)` e `aria-current="page"`.

**Mobile (`≤880px`):** menu central colapsa pra botão hamburguer que abre um overlay full-height com os 4 itens verticais. Mega-menu vira accordion dentro desse overlay.

### 4.2 Mega-menu de Produtos

Abre abaixo da nav, full-width, `background: var(--white)`, border-top `var(--border)`, padding `var(--s7)`. Três colunas, cada uma com um título `mono uppercase` e 1-3 produtos. Cada produto é um link com título + 1 linha de resumo.

```
PARA INVESTIDORES         PARA ESCRITÓRIOS            TECNOLOGIA
───────────────────       ──────────────────────      ───────────────
Wealth Management         Anova Wealth Hubs           Life Invest
Gestão patrimonial        White-label 80/20           Algoritmo de mercado
orientada por método.     completo, sem TI.           observando continuamente.

                          Orquestrador                Anova Research
                          Integre seu produto à       Metodologia preditiva.
                          camada conversacional.      A origem da Anova.

                          Produtos de Crédito
                          Multibanco por rede de
                          parceiros regulados.
```

**Interação:**
- Click no item `Produtos ▾` → toggle da classe `.mega-open` no `<nav>`.
- Click fora do mega-menu → fecha.
- `Esc` → fecha.
- `Tab` navega pelos links na ordem esperada.
- Hover no desktop também abre (bonus, não bloqueante).

### 4.3 Footer (`partials/footer.html`)

Background `var(--onyx)`, texto `var(--silver)`, padding generoso. Quatro colunas:

1. **Marca** — logo + tagline "Confiança que vira execução."
2. **Para investidores** — Wealth Management, Research, Manifesto
3. **Para escritórios** — Wealth Hubs, Orquestrador, Crédito, Life Invest
4. **Institucional** — Sobre, Contato, Política, LGPD

Linha de baixo: `© 2026 Anova Investimentos. CNPJ …. Parceiro regulado …` (texto exato a fornecer por Bruno — placeholder no commit inicial).

### 4.4 Template de Página de Produto

Todas as 6 páginas de produto (tudo exceto `index.html`) seguem este esqueleto:

```html
<body data-page="[slug]">
  <div id="anova-nav"></div>

  <!-- 1. HERO -->
  <section class="prod-hero">
    <div class="hero-bp"></div>
    <div class="container">
      <div class="hero-grid">
        <div>
          <span class="eyebrow">[AUDIÊNCIA] · [CATEGORIA]</span>
          <h1><strong>[Primeira palavra]</strong> [resto do título]</h1>
          <p class="hero-sub">[1-2 frases de lead]</p>
          <div class="hero-cta">
            <a class="btn btn-primary" href="#cta">[CTA primário]</a>
            <a class="btn btn-ghost" href="#o-que-e">[CTA secundário]</a>
          </div>
          <div class="hero-meta">
            <span>[badge 1]</span><span>[badge 2]</span><span>[badge 3]</span>
          </div>
        </div>
        <div class="hero-visual">
          <img src="assets/img/[produto].png" alt="[produto]">
          <span class="hero-tag">[tag]</span>
        </div>
      </div>
    </div>
  </section>

  <!-- 2. O QUE É (2 colunas: texto + imagem/diagrama) -->
  <section id="o-que-e" class="section section-alt">
    <div class="container">
      <span class="eyebrow">01 · O que é</span>
      <div class="what-grid">
        <div>
          <h2><strong>[frase]</strong> [continuação]</h2>
          <p class="lead">[explicação — 3-5 frases]</p>
        </div>
        <div class="what-visual">[imagem ou diagrama SVG]</div>
      </div>
    </div>
  </section>

  <!-- 3. COMO FUNCIONA (3-4 passos em cards) -->
  <section class="section">
    <div class="container">
      <span class="eyebrow">02 · Como funciona</span>
      <h2><strong>[verbo]</strong> [resto]</h2>
      <div class="how-grid">
        <article class="how-step">
          <div class="how-num">PASSO 01</div>
          <h3>[título]</h3>
          <p>[descrição curta]</p>
        </article>
        <!-- …repete 2-3x -->
      </div>
    </div>
  </section>

  <!-- 4. FEATURES / CAPACIDADES (grid de bullets) -->
  <section class="section section-alt">
    <div class="container">
      <span class="eyebrow">03 · Capacidades</span>
      <h2><strong>[frase]</strong></h2>
      <ul class="gallery-feats feat-grid">
        <li>[capacidade 1]</li>
        <li>[capacidade 2]</li>
        <!-- …6-10 bullets -->
      </ul>
    </div>
  </section>

  <!-- 5. PROVA (opcional por página — citação ou métricas) -->
  <section class="section">
    <div class="container">
      <blockquote class="problem-quote"><strong>"[citação]"</strong></blockquote>
    </div>
  </section>

  <!-- 6. CTA FINAL (seção dark) -->
  <section id="cta" class="section section-dark">
    <div class="container">
      <h2><strong>[verbo]</strong> [resto]</h2>
      <a class="btn btn-primary-inverse" href="[destino]">[label]</a>
    </div>
  </section>

  <div id="anova-footer"></div>
  <script src="js/shell.js" defer></script>
</body>
```

**Seções opcionais por página:**
- Wealth Management, Crédito e Wealth Hubs adicionam "Parceiros" (grid de logos).
- Wealth Hubs adiciona "Preço / 80-20" como sub-seção dedicada.
- Research adiciona "Metodologia" (seção longa de prosa estilo editorial).

---

## 5. Conteúdo por Página

### 5.1 Anova OS — `index.html` (home)

**O que muda em relação ao atual:**
- Nav inline → `<div id="anova-nav"></div>` + shell.js.
- Estilos inline do `<style>` extraídos pra `design-system/sections.css`.
- Seção "gallery" (abas JS) **adaptada**: em vez de 5 abas Advisor/Orquestrador/Research/Life Invest/Central, vira **6 abas** refletindo o novo sitemap — Wealth Management, Wealth Hubs, Orquestrador, Life Invest, Crédito, Research. Cada painel ganha um link `→ Conheça [produto]` que leva pra página dedicada. A estética do gallery é preservada.
- Footer inline → `<div id="anova-footer"></div>`.
- Resto da página (hero, proof, problem, pivot, how, CTA) — **intocado**.

### 5.2 Wealth Management — `wealth-management.html`

**Ângulo:** "Gestão patrimonial orientada por método e tecnologia, não por sensação de mercado."

**Ganchos internos:** puxa Research ("a metodologia preditiva por trás da nossa gestão") e Life Invest ("o algoritmo que observa o mercado continuamente alimentando suas decisões").

**Seções:**
- **Hero** — eyebrow "Para investidores · Gestão Patrimonial". H1 tipo "**Seu patrimônio** merece método, não intuição.". CTA primário "Agendar conversa".
- **O que é** — 4-5 frases definindo a gestão patrimonial da Anova como um serviço ancorado em metodologia proprietária.
- **Como funciona** — 4 passos: Diagnóstico → Estratégia → Execução → Acompanhamento.
- **Capacidades** — 8 bullets: carteira diversificada, rebalanceamento contínuo, research preditivo, relatórios personalizados, acesso ao time, cobertura multibanco, proteção integrada (Life Invest), transparência de custos.
- **Prova** — citação institucional + métricas (AUM, tempo médio de cliente) — placeholder até Bruno fornecer.
- **CTA final** — "Agendar diagnóstico patrimonial".

**Copy:** escrita nova, baseada no tom institucional do `index.html` atual.

### 5.3 Anova Wealth Hubs — `wealth-hubs.html`

**Ângulo:** "Monte seu escritório em cima da Anova. 80/20. Zero TI."

**Nota crítica:** o leitor **não conhece a Anova**. A página tem que apresentar a empresa do zero antes de vender o white-label.

**Seções:**
- **Hero** — eyebrow "Para escritórios · Plataforma completa". H1 tipo "**Seu escritório.** Nossa infraestrutura. 80/20.". CTA "Conhecer a proposta".
- **Anova em 30 segundos** — bloco curto institucional (sem essa, o leitor sai).
- **O que você recebe** — grid de 8 capacidades (cada uma é uma mini-card):
  1. **Backoffice completo** — gestão de clientes, operações, comissões.
  2. **Anova Research** — metodologia preditiva proprietária.
  3. **Orquestrador no WhatsApp** — atendimento governado, HITL, auditoria.
  4. **Life Invest** — algoritmo de mercado alimentando as decisões.
  5. **Plataforma multibanco** — atendimento em múltiplos parceiros bancários.
  6. **Sistema de escritório** — infraestrutura pra o parceiro montar e operar seu próprio escritório em cima da stack Anova (identidade visual, clientes, operações, pipeline — tudo sob o guarda-chuva do escritório dele).
  7. **Compliance** — esteira regulatória embutida.
  8. **Repasse 80/20** — modelo de remuneração transparente.
- **Como começar** — 4 passos (Conversa inicial → Assinatura → Onboarding técnico → Operação).
- **Capacidades técnicas** — bullets (APIs, SSO, reports, permissões, multi-usuário, multi-unidade).
- **CTA final** — "Falar com o time de parcerias".

**Copy:** escrita nova, baseada no briefing que Bruno passou durante o brainstorm.

### 5.4 Life Invest — `life-invest.html`

**Ângulo:** "O algoritmo que observa o mercado pela Anova."

**Importante:** a copy antiga do gallery (vida/previdência/proteção) **é descartada**. Life Invest agora é posicionado como o **motor de decisão algorítmico** da Anova. Confirmado por Bruno durante o brainstorm.

**Seções:**
- **Hero** — eyebrow "Tecnologia · Motor de decisão". H1 tipo "**Mercados** observados continuamente. Decisões com fundamento.". CTA "Entender o algoritmo".
- **O que é** — 3-4 frases definindo o Life Invest como o algoritmo proprietário que consulta o mercado em tempo real e gera sinais/indicadores que alimentam as carteiras geridas.
- **Como funciona** — 3-4 passos: Coleta → Análise → Sinais → Decisão humana (HITL).
- **Capacidades** — bullets técnicos: dados em tempo real, correlações multiativos, alertas acionáveis, integração com Advisor/backoffice, trilha de auditoria algorítmica.
- **Prova** — placeholder: métrica de acurácia ou case de sinal acertado.
- **CTA final** — "Ver o Life Invest em ação" (leva a agendamento).

**Copy:** escrita nova. Curta, técnica, tom confiante.

### 5.5 Orquestrador — `orquestrador.html`

**Ângulo:** "Plugue seu produto numa rede já orquestrada." Parceiros integradores conectam crédito, seguros, saúde, etc. à camada conversacional da Anova e chegam ao cliente final via WhatsApp sob governança.

**Seções:**
- **Hero** — eyebrow "Para parceiros · Integração". H1 tipo "**Conversa** vira execução. Execução vira trilha.". CTA "Conversar sobre integração".
- **O que é** — reusa e expande a copy atual do gallery (WhatsApp como camada de execução, HITL, auditoria, histórico por cliente).
- **Como funciona** — 4 passos: Integração técnica → Calibração de fluxo → Aprovação humana → Execução auditada.
- **Capacidades** — bullets: roteamento por contexto, HITL em ações sensíveis, histórico completo por cliente, multi-produto, multi-parceiro, compliance embutido.
- **Quem já está dentro** — placeholder de logos de parceiros (se tiver).
- **CTA final** — "Falar com integrações".

**Copy:** base reusada do `index.html` atual + expansão nova.

### 5.6 Produtos de Crédito — `credito.html`

**Ângulo:** "Ofereça crédito de uma rede de parceiros, não de um banco só."

**Fonte de copy:** extraída de `PlataformaAnova/src/app/modules/banking/models/banking.model.ts`. Produtos reais, parceiros reais.

**Categorias (do banking.model.ts):**
1. **Empréstimos** — garantia de imóvel, garantia de veículo.
2. **Financiamentos** — imobiliário, veículos.
3. **Consórcio** — imóveis, veículos, serviços.
4. **Seguro e Previdência** — vida, residencial, previdência.
5. **Plano de saúde** — ⚠ mencionado por Bruno no briefing mas **não existe** no `banking.model.ts` atual. Vai entrar como card na página com copy placeholder ("Em breve — conversar com o time") até Bruno fornecer copy e parceiros. **Decisão aberta** (ver seção 8).

**Parceiros reais (do banking.model.ts):** Banrisul, CashMe, Bradesco, C6 Bank, Aminter (e outros nos outros produtos).

**Seções:**
- **Hero** — eyebrow "Para consultores · Multibanco". H1 tipo "**Uma origem.** Múltiplos bancos. Taxa que faz sentido.". CTA "Operar no multibanco".
- **O que é** — 3-4 frases definindo Anova Crédito como multibanco conectado via Orquestrador, onde o consultor apresenta a melhor combinação de taxa/parcela/CET entre uma rede de parceiros regulados.
- **Categorias de produto** — grid de 4 cards (Empréstimos, Financiamentos, Consórcio, Seguro & Previdência) com os subprodutos listados em cada.
- **Como funciona** — 4 passos: Simulação → Comparação multibanco → Escolha do cliente → Operação auditada.
- **Parceiros** — grid de logos dos bancos parceiros (5-10 logos).
- **Capacidades** — bullets: comparação taxa/parcela/CET lado a lado, documentação centralizada, acompanhamento de status, comissão rastreada por operação, trilha de auditoria, integração com Orquestrador.
- **Cross-sell** — bullet breve apontando pra Life Invest (proteção) e Wealth Management (investimento do valor liberado).
- **CTA final** — "Começar a operar crédito pela Anova".

**Copy:** adaptada do banking.model.ts (textos reais já existentes no PlataformaAnova) pro tom do site institucional.

### 5.7 Anova Research — `research.html`

**Ângulo:** "A origem da Anova. Onde descritivo virou preditivo."

**Tom:** editorial/institucional. Mais prosa, menos bullets. Texto respira.

**Seções:**
- **Hero** — eyebrow "Metodologia · Desde o início". H1 tipo "**Descritivo** é passado. Preditivo é decisão.". Sem CTA primário agressivo — CTA secundário "Ler o paper" ou "Falar com Research".
- **Origem** — prosa longa (3-4 parágrafos) contando que a Research foi a primeira aparição da Anova no mercado, que a metodologia proprietária é o que antecede e dá forma a tudo que veio depois.
- **Metodologia** — 3-4 seções explicando como a Research transforma análise descritiva em preditiva via software. Uma subseção por pilar (dado histórico → modelagem → sinal preditivo → calibração).
- **Onde vive hoje** — parágrafo curto citando que a Research alimenta Life Invest (motor algorítmico), Wealth Management (estratégias de carteira), e Wealth Hubs (entregue a parceiros).
- **Prova** — citação de metodologia ou número-chave (placeholder até Bruno fornecer).
- **CTA final** — "Conversar com o time de Research".

**Copy:** escrita nova, tom editorial. Mais longa que as outras (~1.5x).

---

## 6. Plano de Execução

### Ordem (confirmada por Bruno)

| # | Passo                                              | Commit                           |
| - | -------------------------------------------------- | -------------------------------- |
| 1 | Extrair CSS inline do index.html → sections.css    | `refactor: extract page styles`  |
| 2 | Criar nav.css + partials/nav.html + partials/footer.html + js/shell.js | `feat: add nav/footer shell`     |
| 3 | Migrar index.html pra usar a shell + adaptar gallery | `refactor: wire index into shell`|
| 4 | Criar `orquestrador.html`                          | `feat: orquestrador page`        |
| 5 | Criar `life-invest.html`                           | `feat: life invest page`         |
| 6 | Criar `wealth-hubs.html`                           | `feat: wealth hubs page`         |
| 7 | Criar `wealth-management.html`                     | `feat: wealth management page`   |
| 8 | Criar `credito.html` (após ler banking.model.ts)   | `feat: credito page`             |
| 9 | Criar `research.html`                              | `feat: research page`            |
| 10| QA de integração (nav, links, mobile, a11y)        | `chore: qa pass`                 |

**Observação sobre git:** a pasta `assets/` atualmente **não é um repositório git**. O spec recomenda `git init` antes do passo 1 pra ter histórico real. Se Bruno preferir não versionar, os passos são feitos como edições incrementais mas sem commits.

### Imagens

- **Existentes reusadas:** product-orquestrador-2.png, product-life.png (vai ser realocada pra um placeholder novo já que o produto mudou), product-research.png, product-advisor-carteira.png (vira imagem decorativa em Wealth Hubs), product-central.png (idem).
- **Faltam (placeholder com nota "IMAGEM A FORNECER"):** hero de Wealth Management, hero de Wealth Hubs (pode ser screen do app.anovainvestimentos.com.br), hero de Life Invest (visualização do algoritmo), hero de Crédito (dashboard multibanco), hero de Research (algum artefato visual da metodologia).

### Copy institucional e legal

- Número do CNPJ, aviso legal, nomes de parceiros regulados no footer → placeholder até Bruno fornecer.

---

## 7. QA e Critérios de "Pronto"

### Por página (checklist em cada uma das 7)

- [ ] Valida contra as 10 Regras de Ouro do `CLAUDE.md`: 6 cores, zero box-shadow, zero gradientes (exceto deltas métricos), line-art only, border-radius dos tokens, SF Pro + DM Mono.
- [ ] HTML passa no W3C validator (zero erros estruturais).
- [ ] Todos os `href="*.html"` internos resolvem (script de grep + existência).
- [ ] Nav ativa destacada corretamente (`body[data-page]` → item correspondente com `aria-current="page"`).
- [ ] Mega-menu: abre no click, fecha no outside-click, fecha no Esc, navegável por teclado (Tab).
- [ ] Mobile (≤880px): nav colapsa pra hamburguer, mega-menu vira accordion.
- [ ] Imagens têm `alt` descritivo. Placeholders marcados com "IMAGEM A FORNECER".
- [ ] Tipografia: só SF Pro Display + DM Mono (nada de fallback silencioso system-ui).
- [ ] Lighthouse ≥ 95 em Performance/Accessibility/SEO/Best Practices.
- [ ] `<noscript>` fallback tem links pras outras 6 páginas.

### Global (integração)

- [ ] Nav e footer renderizam idênticos nas 7 páginas (fonte única: `partials/`).
- [ ] Cada link do mega-menu leva pra página correta.
- [ ] Home gallery → cada painel tem link pra página dedicada.
- [ ] CTAs finais apontam pra destino consistente (todos pro mesmo endpoint ou âncora).
- [ ] Golden paths navegados manualmente:
  - **Investidor:** index → Wealth Management → Research → CTA.
  - **Escritório:** index → Wealth Hubs → Orquestrador → Crédito → CTA.
  - **Integrador:** index → Orquestrador → CTA.

### Como validar de fato

1. Rodar `python -m http.server 8000` em `assets/`.
2. Abrir `http://localhost:8000/` e navegar pelas 7 páginas manualmente em desktop.
3. Toggle DevTools mobile (375px) e repetir.
4. Disable JS no browser → validar `<noscript>` fallback.
5. Rodar Lighthouse em cada uma das 7 rotas.

---

## 8. Riscos e Decisões Abertas

- **Cópias das imagens faltantes** — Bruno precisa fornecer ou aprovar placeholders até a entrega final. Não bloqueia a implementação, bloqueia o "pronto".
- **Informações legais do footer** — CNPJ e nomes de parceiros regulados são placeholder.
- **Métricas de prova social** — Wealth Management e Research ganham placeholders ("X clientes", "Y% acurácia") até Bruno fornecer números reais.
- **Testes A11y profundos** — o checklist cobre o essencial (teclado, aria, alt, contraste visual). Um audit WCAG 2.1 AA formal não está no escopo deste spec.
- **Plano de saúde no Crédito** — mencionado por Bruno mas ainda sem copy nem parceiros. Entra como placeholder ("Em breve") na primeira entrega, substituído depois quando Bruno fornecer o conteúdo.

---

## 9. Fora de Escopo (explícito)

- Backend, API, formulários funcionais (CTAs apontam pra `mailto:` ou placeholder).
- Sistema de busca.
- Blog/changelog.
- Internacionalização (só pt-BR).
- CMS ou painel admin.
- Analytics (Google/Plausible/etc.) — pode ser adicionado depois em um script simples.
- SEO técnico avançado (structured data, sitemap.xml, robots.txt) — o básico (title/meta/OG) entra, o resto fica pra depois.
- Refactor do design system existente (tokens/components/GUIDE intocados).
