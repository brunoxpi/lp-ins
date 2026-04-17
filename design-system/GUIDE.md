# ANOVA DESIGN SYSTEM — Guia do Agente v1.0.1
## Referência definitiva para construção de interfaces

> **"Confiança que vira execução."**
> Sistema Operacional Conversacional para redes comerciais.

---

## 0. COMO USAR ESTE GUIA

Este documento é a **única fonte de verdade** para qualquer agente construindo interfaces Anova. Antes de escrever qualquer CSS ou HTML, leia as 10 Regras de Ouro e os tokens. Quando em dúvida, consulte a seção "Decisões por Contexto".

**Prioridade de leitura:** Regras → Tokens → Componentes → Layout do contexto específico

---

## 1. AS 10 REGRAS DE OURO

Estas regras são **invioláveis**. Qualquer output que viole uma regra deve ser corrigido antes da entrega.

| # | Regra | O que significa |
|---|-------|-----------------|
| 01 | **Monocromático sempre** | Apenas 6 cores: #000, #FFF, #333, #888, #CCC, #F8F8F8. EXCEÇÃO ÚNICA: gradientes metálicos nos indicadores de variação (↑↓) de métricas. |
| 02 | **Whitespace é sagrado** | O vazio comunica sofisticação. Nunca comprimir. Usar grid 8pt rigorosamente. |
| 03 | **Line-art, nunca filled** | Todos os ícones devem ser stroke-only, peso 1.5px. Biblioteca recomendada: Lucide Icons. |
| 04 | **Blueprint é a assinatura** | Crosshairs, linhas de guia e grids sutis como textura de fundo em heros e seções de destaque. |
| 05 | **Flat design absoluto** | ZERO box-shadow em qualquer componente. ZERO gradientes (exceto Regra 01 exceção). |
| 06 | **Hierarquia tipográfica** | Respeitar a escala de 10 níveis (76px→10px). Nunca improvisar tamanhos. |
| 07 | **Frases de impacto** | Use bold para fechar seções. "Title Emphasis Rule": primeira palavra em bold como âncora visual. |
| 08 | **Logo intocável** | Squircle com border-radius 22%. Nunca distorcer, rotacionar, adicionar efeitos ou mudar cores. |
| 09 | **Consistência entre contextos** | Slides, site, app, docs — tudo usa os mesmos tokens. |
| 10 | **Conexão visual** | Use linhas de rede e hubs como motivo gráfico. |

---

## 2. TOKENS — Copiar e colar

### 2.1 Paleta (6 tons, zero exceções)

```css
:root {
  --onyx:      #000000;  /* Texto primário, botões fill, logo */
  --white:     #FFFFFF;  /* Background principal */
  --charcoal:  #333333;  /* Texto secundário, corpo */
  --grey:      #888888;  /* Texto terciário, placeholders, labels */
  --silver:    #CCCCCC;  /* Borders, divisores */
  --snow:      #F8F8F8;  /* Background alternativo, cards, panels */
}
```

**Mapeamento semântico:**
```css
:root {
  --bg:         var(--white);
  --bg-alt:     var(--snow);
  --surface:    var(--white);
  --border:     var(--silver);
  --border-hi:  var(--grey);
  --text-1:     var(--onyx);     /* Títulos, valores, CTAs */
  --text-2:     var(--charcoal); /* Corpo, descrições */
  --text-3:     var(--grey);     /* Labels, captions, hints */
  --accent:     var(--onyx);     /* Botão primário fill */
  --accent-inv: var(--white);    /* Texto sobre accent */
}
```

### 2.2 Tipografia (Apple-aligned)

```css
:root {
  /* Famílias */
  --font: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
  --mono: 'DM Mono', 'SF Mono', monospace;

  /* Escala — 10 níveis */
  --text-hero:  76px;  /* wght 700  – Hero headline */
  --text-3xl:   56px;  /* wght 700  – Display */
  --text-2xl:   40px;  /* wght 600  – Heading 1 */
  --text-xl:    28px;  /* wght 600  – Heading 2 */
  --text-lg:    22px;  /* wght 500  – Heading 3 */
  --text-md:    18px;  /* wght 400  – Lead / subtítulo */
  --text-base:  15px;  /* wght 400  – Body (default do sistema) */
  --text-sm:    13px;  /* wght 500  – Labels, captions */
  --text-xs:    11px;  /* DM Mono   – Badges, tokens, código */
  --text-micro: 10px;  /* DM Mono   – Menor tamanho permitido */
}
```

**Regras de uso por elemento:**

| Elemento | Token | Peso | Extras |
|----------|-------|------|--------|
| Hero de landing page | `--text-hero` | 700 | `letter-spacing: -.04em; line-height: 1.04` |
| Título de página (dashboard) | `--text-2xl` | 700 | `letter-spacing: -.03em` |
| Título de seção | `--text-xl` | 700 | Uppercase, `letter-spacing: -.02em` |
| Subtítulo / lead | `--text-md` | 300 ou 400 | `color: var(--text-2)` |
| Corpo de texto | `--text-base` | 400 | `line-height: 1.6; color: var(--text-1)` |
| Labels de card / tabela | `--text-micro` | 600 | DM Mono, uppercase, `letter-spacing: .12em; color: var(--text-3)` |
| Breadcrumbs | `--text-micro` | 500 | DM Mono, uppercase, `letter-spacing: .14em; color: var(--text-3)` |
| Valor de métrica | `--text-xl` a `--text-2xl` | 700 | `letter-spacing: -.02em` |
| Badge / tag | `--text-micro` | 500 | DM Mono, pill `border-radius: 99px` |
| Código / token | `--text-xs` | 400 | DM Mono |

### 2.3 Espaçamento (grid 8pt)

```css
:root {
  --s1: 4px;    /* Micro gaps */
  --s2: 8px;    /* Inline gaps, small padding */
  --s3: 12px;   /* Icon gaps, small sections */
  --s4: 16px;   /* Card gaps, grid gaps */
  --s5: 24px;   /* Card padding, section gaps */
  --s6: 32px;   /* Section padding */
  --s7: 48px;   /* Large section separators */
  --s8: 64px;   /* Page padding horizontal */
  --s9: 96px;   /* Section margin vertical */
  --s10: 128px; /* Hero padding */
}
```

### 2.4 Border Radius

```css
:root {
  --r-sm:       6px;   /* Checkboxes, badges pequenos */
  --r-md:       10px;  /* Botões, inputs, selects */
  --r-lg:       16px;  /* Uso intermediário */
  --r-xl:       24px;  /* Cards, panels, modais, containers */
  --r-2xl:      32px;  /* Containers grandes, hero cards */
  --r-squircle: 22%;   /* Logo ANOVA apenas */
  --r-pill:     99px;  /* Pills, tags, toggles */
}
```

### 2.5 Motion

```css
:root {
  --ease:        cubic-bezier(.25, .1, .25, 1);     /* Padrão */
  --ease-out:    cubic-bezier(.16, 1, .3, 1);        /* Reveals, entrada */
  --ease-spring: cubic-bezier(.34, 1.56, .64, 1);    /* Bouncy, interações */
  --dur:         300ms;                                /* Duração padrão */
}
```

### 2.6 Exceção cromática: Indicadores de variação

A **única exceção** à Regra 01 monocromática. Aplicar apenas em indicadores de delta (↑↓ percentuais) via `background-clip: text`.

```css
/* Positivo — verde metálico escuro→claro */
.metric-up {
  background: linear-gradient(135deg, #1a3a2a 0%, #2d6b4f 30%, #4a9e72 60%, #6fc496 80%, #3d7a5a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-family: var(--mono);
  font-weight: 700;
  font-size: 11px;
}

/* Negativo — laranja→vermelho metálico */
.metric-down {
  background: linear-gradient(135deg, #8b3a00 0%, #c45200 25%, #e86800 50%, #d43d2f 75%, #9a2a1a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-family: var(--mono);
  font-weight: 700;
  font-size: 11px;
}
```

---

## 3. COMPONENTES — Padrões CSS

### 3.1 Botão Primário (CTA)

```css
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: var(--onyx);
  color: var(--white);
  border: 2px solid var(--onyx);
  border-radius: var(--r-md); /* 10px */
  font-family: var(--font);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: .04em;
  text-transform: uppercase;
  cursor: pointer;
  transition: opacity .2s var(--ease);
}
.btn-primary:hover { opacity: .85; }
```

### 3.2 Botão Outline (Secundário)

```css
.btn-outline {
  /* Mesmo padding, radius, tipografia do primário */
  background: transparent;
  color: var(--onyx);
  border: 2px solid var(--onyx);
}
.btn-outline:hover {
  background: var(--onyx);
  color: var(--white);
}
```

### 3.3 Card (Container genérico)

```css
.card {
  background: var(--white);
  border: 1px solid var(--silver);  /* NUNCA box-shadow */
  border-radius: var(--r-xl);       /* 24px */
  padding: 24px;
  transition: border-color .2s var(--ease);
}
.card:hover { border-color: var(--onyx); }
```

### 3.4 Input

```css
.input {
  width: 100%;
  padding: 10px 16px;
  background: var(--white);
  border: 1px solid var(--silver);
  border-radius: var(--r-md);  /* 10px */
  font-family: var(--font);
  font-size: 14px;
  color: var(--onyx);
  outline: none;
  transition: border-color .2s;
}
.input:focus { border-color: var(--onyx); }
.input::placeholder { color: var(--grey); }
```

### 3.5 Badge / Tag

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 12px;
  border: 1px solid var(--silver);
  border-radius: 99px;
  font-family: var(--mono);
  font-size: 10px;
  font-weight: 500;
  color: var(--grey);
  background: var(--snow);
}
```

### 3.6 Tabela

```css
/* Header */
th {
  font-family: var(--mono);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--grey);
  text-align: left;
  padding: 8px 12px;
  border-bottom: 1px solid var(--silver);
}
/* Body */
td {
  padding: 12px;
  font-size: 14px;
  border-bottom: 1px solid var(--silver);
}
/* Hover */
tbody tr:hover { background: var(--snow); }
```

### 3.7 Metric Card

```css
.metric-card {
  border: 1px solid var(--silver);
  border-radius: var(--r-xl);
  padding: 24px;
}
.metric-label {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--grey);
  margin-bottom: 8px;
}
.metric-value {
  font-size: 28px; /* ou --text-xl / --text-2xl */
  font-weight: 700;
  letter-spacing: -.02em;
  line-height: 1;
}
/* Usar .metric-up ou .metric-down para o delta */
```

### 3.8 Logo Squircle

```css
.logo-squircle {
  width: 36px;  /* sidebar: 36px. Showcase: 64px. Mini: 28-32px */
  height: 36px;
  background: var(--onyx);
  border-radius: 22%;  /* SEMPRE 22% — regra do manual */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;  /* Espaço entre texto e bordas */
}
.logo-squircle span {
  font-family: var(--font);
  font-size: 8px;  /* Ajustar proporcional ao tamanho */
  font-weight: 700;
  letter-spacing: .1em;
  color: var(--white);
  margin-right: -.1em;  /* Compensa trailing letter-spacing */
  text-align: center;
}
```

**Escala proporcional do squircle:**

| Contexto | Tamanho | font-size | letter-spacing | padding |
|----------|---------|-----------|----------------|---------|
| Sidebar collapsed | 36px | 8px | .10em | 4px |
| Sidebar expanded | 36px | 8px | .10em | 4px |
| Showcase (64px) | 64px | 10px | .12em | 8px |
| Showcase (80px) | 80px | 12px | .12em | 10px |
| Nav bar inline | 28-32px | 6px | .10em | 3px |
| Favicon / mini | 24px | 5px | .08em | 2px |

### 3.9 Nav Bar (Landing Page)

```css
.nav-bar {
  border: 1px solid var(--silver);
  border-radius: var(--r-xl);
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
```

### 3.10 Select (Dropdown)

```css
.select {
  width: 100%;
  padding: 10px 16px;
  padding-right: 36px;
  border: 1px solid var(--silver);
  border-radius: var(--r-md);
  font-size: 14px;
  appearance: none;
  background: var(--white);
  /* Seta: SVG chevron outline posicionado absolutamente à direita */
}
.select:focus { border-color: var(--onyx); }
```

### 3.11 Textarea

```css
.textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--silver);
  border-radius: var(--r-md);
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  line-height: 1.6;
}
```

### 3.12 Checkbox e Radio

```css
/* Checkbox: border-radius 6px, 18x18px */
.check-box {
  width: 18px; height: 18px;
  border: 1.5px solid var(--silver);
  border-radius: var(--r-sm); /* 6px */
  background: var(--white);
}
.check-box.checked {
  background: var(--onyx);
  border-color: var(--onyx);
  /* ✓ branco centralizado */
}

/* Radio: border-radius 50%, 18x18px */
.radio-box {
  width: 18px; height: 18px;
  border: 1.5px solid var(--silver);
  border-radius: 50%;
}
.radio-box.checked {
  border-color: var(--onyx);
  /* Dot 8x8 #000 centralizado */
}
```

### 3.13 Toggle

```css
.toggle {
  width: 40px; height: 22px;
  border-radius: 11px;
  background: var(--silver); /* off */
  /* Knob: 18x18 branco, top 2px left 2px */
}
.toggle.on {
  background: var(--onyx);
  /* Knob: translateX(18px) */
}
```

### 3.14 Upload Zone

```css
.upload-zone {
  border: 1.5px dashed var(--silver);
  border-radius: var(--r-xl);
  padding: 48px 24px;
  text-align: center;
  cursor: pointer;
  /* Ícone: upload arrow, 32x32, stroke --grey */
}
.upload-zone:hover {
  border-color: var(--onyx);
  background: var(--snow);
}
```

### 3.15 Tabela Completa

```css
/* Container */
.table-wrap {
  border: 1px solid var(--silver);
  border-radius: var(--r-xl);
  overflow: hidden;
}

/* Header */
th {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--grey);
  background: var(--snow);
  padding: 12px 16px;
  cursor: pointer; /* sortable */
}

/* Cells */
td { padding: 12px 16px; font-size: 14px; }
tbody tr:hover { background: var(--snow); }
```

### 3.16 Status Badges (Monocromático)

| Status | Background | Border | Text Color | Ícone |
|--------|-----------|--------|-----------|-------|
| Ativo | `--onyx` | — | `--white` | ● |
| Pendente | `--snow` | `--silver` | `--charcoal` | ◐ |
| Em Andamento | `--white` | `--charcoal` | `--charcoal` | ↻ |
| Rejeitado | `--white` | `--grey` | `--grey` | ✕ |
| Não Iniciado | `--white` | `--silver` | `--silver` | ○ |

### 3.17 Paginação

```css
.page-btn {
  width: 32px; height: 32px;
  border: 1px solid var(--silver);
  border-radius: var(--r-md);
  font-family: var(--mono);
  font-size: 12px;
}
.page-btn.active {
  background: var(--onyx);
  color: var(--white);
  border-color: var(--onyx);
}
```

### 3.18 Alertas

```css
.alert {
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  border: 1px solid var(--silver);
  border-radius: var(--r-xl);
  /* Ícone: stroke --charcoal, 18x18, outline */
}
/* Variantes por severidade: */
.alert-info  { background: var(--snow); }
.alert-warn  { border-color: var(--grey); }
.alert-critical { border-color: var(--onyx); border-width: 2px; }
```

### 3.19 Progress Bar e Steps

```css
/* Bar */
.progress-bar { height: 4px; background: var(--silver); border-radius: 2px; }
.progress-fill { height: 100%; background: var(--onyx); border-radius: 2px; }

/* Steps */
.step-num {
  width: 32px; height: 32px;
  border: 2px solid var(--silver); /* default */
  border-radius: 50%;
  font-family: var(--mono);
  font-size: 12px;
}
.step.done .step-num { background: var(--onyx); color: var(--white); }
.step.current .step-num { border-color: var(--onyx); color: var(--onyx); }
```

### 3.20 Avatares

```css
.avatar {
  border-radius: 50%;
  font-family: var(--mono);
  font-weight: 700;
}
/* Sizes: sm 28px, md 36px, lg 48px */
/* Variants: dark (bg --onyx, color --white), light (bg --snow, border --silver) */
/* Group: margin-left -8px, border 2px solid --white */
```

### 3.21 Product Card

```css
.product-card {
  border: 1px solid var(--silver);
  border-radius: var(--r-xl);
  overflow: hidden;
}
.product-img {
  height: 180px;
  background: var(--snow);
  border-bottom: 1px solid var(--silver);
  /* Ícone: outline 32x32, stroke --silver */
}
.product-body { padding: 24px; }
.product-tag { font-family: var(--mono); font-size: 10px; uppercase; --grey }
.product-name { font-size: 17px; font-weight: 700; }
.product-price { font-size: 20px; font-weight: 700; }
```

### 3.22 Modal

```css
.modal-box {
  background: var(--white);
  border: 1px solid var(--silver);
  border-radius: var(--r-xl);
  padding: 32px;
  max-width: 420px;
  /* Close: 28x28, border --silver, ícone X 14px stroke --grey */
}
/* Overlay: rgba(0,0,0,.04) — apenas leve escurecimento */
```

### 3.23 Tabs

```css
.tab-item {
  padding: 10px 20px;
  font-size: 13px;
  color: var(--grey);
  border-bottom: 2px solid transparent;
}
.tab-item.active {
  color: var(--onyx);
  border-bottom-color: var(--onyx);
  font-weight: 600;
}
/* Count badge: bg --onyx, color --white, pill, font-size 10px, DM Mono */
```

### 3.24 Breadcrumbs

```css
.breadcrumb-item {
  font-family: var(--mono);
  font-size: 10px;
  color: var(--grey);
  letter-spacing: .04em;
}
.breadcrumb-current { color: var(--onyx); font-weight: 600; }
.breadcrumb-sep { color: var(--silver); } /* › */
```

### 3.25 Empty State

```css
.empty {
  padding: 96px 24px;
  text-align: center;
  /* Ícone: 48x48, stroke --silver, outline */
}
.empty-title { font-size: 17px; font-weight: 700; }
.empty-desc { font-size: 14px; color: var(--grey); max-width: 360px; }
/* CTA: btn-outline abaixo da descrição */
```

### 3.26 Tooltip

```css
.tooltip {
  background: var(--onyx);
  color: var(--white);
  font-family: var(--mono);
  font-size: 11px;
  padding: 6px 12px;
  border-radius: var(--r-md);
  /* Seta: 4px border trick apontando para baixo */
  /* Trigger: hover no parent */
}

---

## 4. LAYOUTS POR CONTEXTO

### 4.1 Web App (Dashboard / Ferramenta)

```
┌──────────────────────────────────────────┐
│           TICKER (opcional, 44px)         │
├────┬─────────────────────────────────────┤
│    │                                     │
│ SB │         MAIN CONTENT                │
│64px│    padding: 32px 40px               │
│    │    max-width: sem limite            │
│    │                                     │
│    │    ┌───────┐ ┌───────┐ ┌───────┐   │
│    │    │METRIC │ │METRIC │ │METRIC │   │
│    │    └───────┘ └───────┘ └───────┘   │
│    │    gap: 16px                        │
│    │                                     │
│    │    ┌──────────────┐ ┌──────────┐   │
│    │    │    CHART     │ │  PANEL   │   │
│    │    │              │ │          │   │
│    │    └──────────────┘ └──────────┘   │
│    │                                     │
│    │    ┌────────────────────────────┐   │
│    │    │         TABLE              │   │
│    │    └────────────────────────────┘   │
└────┴─────────────────────────────────────┘
```

**Sidebar:**
- Collapsed: 64px width. Apenas ícones (stroke 1.5px, 18x18).
- Expanded: 220px. Logo + brand + nav groups + links.
- Background: `var(--snow)`.
- Border-right: `1px solid var(--silver)`.
- Active indicator: `2px solid var(--onyx)` na borda esquerda.

**Breadcrumb:** `DM Mono · 10px · uppercase · letter-spacing .14em · --grey`
**Título de página:** `SF Pro · 32px · Bold 700 · letter-spacing -.03em`
**Subtítulo:** `SF Pro · 14px · Regular · --grey`

**Grid de métricas:** `grid-template-columns: repeat(3, 1fr); gap: 16px`
**Seção chart+panel:** `grid-template-columns: 1fr 380px; gap: 16px`

### 4.2 Landing Page

```
┌──────────────────────────────────────────┐
│  LOGO    Links...           CTA BUTTON   │ ← Nav bar (border, r-xl)
├──────────────────────────────────────────┤
│                                          │
│  EYEBROW (DM Mono, 11px, uppercase)      │
│                                          │
│  HERO TITLE                              │ ← 76px Bold, letter-spacing -.04em
│  (clamp 40px–76px)                       │
│                                          │
│  Subtítulo leve (18px, weight 300)       │
│                                          │
│  [ CTA BUTTON ]                          │
│                                          │
│  ── Blueprint canvas background ──       │
│                                          │
├──────────────────────────────────────────┤
│                                          │
│  SEÇÃO: Por que escolher?                │ ← --text-2xl Bold
│  Grid 3 ou 4 colunas de feature cards    │
│  Ícones: line-art stroke 1.5px           │
│                                          │
├──────────────────────────────────────────┤
│  SEÇÃO: Como funciona?                   │
│  Steps 1→2→3→4 em linha                  │
│  Círculos pretos com número branco       │
│                                          │
├──────────────────────────────────────────┤
│  SEÇÃO: FAQ                              │
│  Acordeão com chevron outline            │
│  Dividers: 1px solid var(--silver)       │
│                                          │
├──────────────────────────────────────────┤
│  IMPACT PHRASE                           │ ← "Confiança que vira execução."
│  (22px Bold, centralizado)               │
│  [ CTA BUTTON ]                          │
│                                          │
├──────────────────────────────────────────┤
│  FOOTER (DM Mono, --grey, links)         │
└──────────────────────────────────────────┘
```

**Max-width do conteúdo:** `960px` (centrado com `margin: 0 auto`)
**Padding horizontal:** `clamp(24px, 5vw, 80px)`
**Seções:** `padding: 96px 0; border-top: 1px solid var(--silver)`
**Fundo alternado:** Seções pares podem usar `background: var(--snow)`

### 4.3 Mobile (App nativo ou responsivo)

**Breakpoint:** `max-width: 768px`

**Adaptações obrigatórias:**
- Sidebar vira bottom tab bar (height 64px, 5 ícones)
- Grid de métricas: `grid-template-columns: 1fr` (empilhado)
- Chart: full-width, height mínima 200px
- Tabelas: scroll horizontal com `-webkit-overflow-scrolling: touch`
- Título de página: `--text-xl` (28px) em vez de `--text-2xl` (40px)
- Padding horizontal: 16px
- Cards mantêm `--r-xl` (24px)

**Bottom tab bar:**
```css
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: var(--white);
  border-top: 1px solid var(--silver);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding-bottom: env(safe-area-inset-bottom); /* iPhone notch */
}
.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.tab-item svg {
  width: 22px;
  height: 22px;
  stroke: var(--grey);
  stroke-width: 1.5;
  fill: none;
}
.tab-item.active svg { stroke: var(--onyx); }
.tab-label {
  font-size: 10px;
  font-family: var(--mono);
  color: var(--grey);
}
.tab-item.active .tab-label { color: var(--onyx); }
```

---

## 5. MOTION — Especificações

### 5.1 Scroll Reveal (GSAP ScrollTrigger)

```javascript
// Cards, panels, rows — staggered reveal
gsap.from('.card', {
  opacity: 0,
  y: 20,
  duration: 0.6,
  stagger: 0.08,
  ease: 'power2.out',
  scrollTrigger: {
    trigger: '.card',
    start: 'top 90%',
    toggleActions: 'play none none none'
  }
});
```

### 5.2 Counter Animation

```javascript
// Métricas contam de 0 ao valor final
gsap.to({ v: 0 }, {
  v: targetValue,
  duration: 1.4,
  ease: 'power2.out',
  onUpdate: function() {
    element.textContent = Math.round(this.targets()[0].v).toLocaleString('pt-BR');
  }
});
// Trigger: IntersectionObserver quando card entra no viewport
```

### 5.3 Hover States

| Componente | Efeito | Duração |
|-----------|--------|---------|
| Card | `border-color: var(--onyx)` | 200ms |
| Botão fill | `opacity: .85` | 200ms |
| Botão outline | Fill inverte (bg preto, texto branco) | 200ms |
| Table row | `background: var(--snow)` | 150ms |
| Nav link | Underline `width: 0→100%` | 300ms |
| Logo squircle | `transform: scale(.94)` | 300ms spring |

### 5.4 Page Transitions

```javascript
// Saída: fade-out rápido
gsap.to('.main-content', { opacity: 0, duration: 0.2, ease: 'power2.in' });
// Entrada: fade-in com slide sutil
gsap.from('.main-content', { opacity: 0, y: 12, duration: 0.4, ease: 'power2.out' });
```

### 5.5 Logo Entrance (Anime.js)

```javascript
anime.animate('.logo-squircle', {
  scale: [0, 1],
  opacity: [0, 1],
  duration: 600,
  ease: 'outElastic(1, .6)',
  delay: 200
});
```

### 5.6 Motivos Gráficos Interativos (Canvas + Mouse Physics)

Os 3 motivos gráficos do manual de identidade são renderizados em `<canvas>` com animação contínua via `requestAnimationFrame` e **interação com o mouse** usando física simulada. Cada canvas rastreia o mouse independentemente.

**Performance:** O loop de animação só roda quando a seção está visível (IntersectionObserver com `threshold: 0.02`). Ao sair do viewport, para completamente.

**Cursor:** `cursor: crosshair` nos cards para sinalizar interatividade. Border muda para `--onyx` no hover.

#### Canvas 1: Linhas de Rede — Centro segue o mouse

O centro de convergência das linhas radiais é atraído pelo cursor com spring physics.

```javascript
// Física: lerp .04 — suave e orgânico
if (mouseActive) {
  targetX = mouse.x;
  targetY = mouse.y;
} else {
  targetX = canvas.width / 2;  // retorna ao centro
  targetY = canvas.height / 2;
}
centerX += (targetX - centerX) * 0.04;
centerY += (targetY - centerY) * 0.04;

// 36 linhas radiais com rotação lenta (t * .00006)
// Opacidade individual pulsante: .04 + sin(t*.0012 + i*.4) * .02
// Anéis concêntricos com raio que respira: r + sin(t*.0012 + r*.015) * 4
// Nó central: dot 3.5 + sin(t*.003)*2 px com halo 10 + sin(t*.002)*5 px
```

#### Canvas 2: Padrão de Mapa — Nós atraídos pelo mouse

14 nós de interseção sobre grid estático são gravitacionalmente atraídos pelo cursor.

```javascript
// Grid estático de fundo: 18px step, rgba(0,0,0,.03)
// Para cada nó:
const springX = (baseX - node.x) * 0.02;  // retorno elástico à base
const springY = (baseY - node.y) * 0.02;

// Gravidade do mouse (raio 120px)
if (distance < 120) {
  const force = 0.8 * (1 - distance / 120);
  gravityX = (mouseX - node.x) / distance * force;
  gravityY = (mouseY - node.y) / distance * force;
}

// Drift idle: sin(t * .0005 + phase) * .08
// Damping: velocity * .92
// Nós renderizados como crosshairs (+) com dot central
// Conexões entre nós próximos com alpha proporcional à distância
```

#### Canvas 3: Mesh Geométrico — Nós repelidos pelo mouse

10 nós conectados que são **empurrados** pelo cursor (força inversa).

```javascript
// Para cada nó:
const springX = (baseX - node.x) * 0.015;
const springY = (baseY - node.y) * 0.015;

// Repulsão do mouse (raio 100px, força 2.5)
if (distance < 100) {
  const force = 2.5 * (1 - distance / 100);
  repelX = (node.x - mouseX) / distance * force;  // INVERSO
  repelY = (node.y - mouseY) / distance * force;
}

// Damping: velocity * .94
// Conexões: alpha .07 * (1 - d/maxD) onde maxD = width * .42
// EXTRA: linhas fantasma do cursor aos nós próximos (raio 130px)
// Nós: dot com halo pulsante (r*2 + pulse*5 px)
```

#### Setup do Canvas (padrão para os 3)

```javascript
const dpr = devicePixelRatio;
function setup(canvasId) {
  const cv = document.getElementById(canvasId);
  const ctx = cv.getContext('2d');
  const rect = cv.parentElement.getBoundingClientRect();
  cv.width = rect.width * dpr;
  cv.height = rect.height * dpr;
  cv.style.width = rect.width + 'px';
  cv.style.height = rect.height + 'px';
  return { cv, ctx, w: rect.width, h: rect.height };
}
// No draw loop: ctx.setTransform(dpr, 0, 0, dpr, 0, 0) antes de desenhar
// Cor: sempre rgba(0,0,0, alpha) — nunca cores
```

#### Mouse Tracking (padrão para os 3)

```javascript
const mouse = { x: -999, y: -999, active: false };
wrap.addEventListener('mousemove', e => {
  const r = wrap.getBoundingClientRect();
  mouse.x = (e.clientX - r.left) * dpr;
  mouse.y = (e.clientY - r.top) * dpr;
  mouse.active = true;
});
wrap.addEventListener('mouseleave', () => { mouse.active = false; });
// No draw: converter para coordenadas lógicas com mouse.x / dpr
```

---

## 6. ÍCONES

**Biblioteca recomendada:** Lucide Icons (https://lucide.dev)
**Configuração padrão:**

```
stroke-width: 1.5
stroke-linecap: round
stroke-linejoin: round
fill: none  (SEMPRE — Regra 03)
```

**Tamanhos:**

| Contexto | Tamanho | Cor |
|----------|---------|-----|
| Sidebar navigation | 18×18 | `--grey` → `--onyx` (active/hover) |
| Card header icon | 18-20×18-20 | `--grey` |
| Action buttons (tabela) | 16×16 | `--grey` → `--onyx` (hover) |
| Feature icon (landing) | 24×24 | `--onyx` |
| Inline text icon | 14-16px | Herda cor do texto |

---

## 7. STATUS E DIFERENCIAÇÃO (sem cor)

Em vez de cores semânticas (verde/vermelho/amarelo), usar diferenciação monocromática:

| Status | Badge style | Ícone | Texto |
|--------|------------|-------|-------|
| Ativo / Executado | `border: --onyx; bg: --snow` | ✓ circle outline | `--onyx` bold |
| Pendente | `border: --grey; bg: --snow` | ◐ half-circle | `--charcoal` |
| Em andamento | `border: --charcoal; bg: --white` | ↻ arrows outline | `--charcoal` |
| Rejeitado / Erro | `border: --silver; bg: --white` | ✕ cross outline | `--grey` |
| Não iniciado | `border: --silver; bg: --white` | ○ circle outline | `--grey` |

**Regra:** Diferenciação por ícone + peso tipográfico + fill/outline. NUNCA por cor.

---

## 8. GRÁFICOS E VISUALIZAÇÕES

### 8.1 Hero Blueprint Canvas (background)

Textura de fundo para hero sections. Grid ortogonal + linhas radiais convergentes + anéis concêntricos + crosshair central. Tudo em opacidade muito baixa (2-8%) para não competir com o conteúdo.

```javascript
// Grid: linhas a cada 40px, rgba(0,0,0,.04), width .5
// Linhas radiais: 24 linhas do ponto focal, rgba(0,0,0,.03)
// Ponto focal: x = width * .35, y = height * .55
// Anéis: a cada 50px do focal, rgba(0,0,0,.025)
// Crosshair central: 24px, rgba(0,0,0,.08), width 1
```

### 8.2 Charts e Data Visualization

| Elemento | Estilo |
|----------|--------|
| Linha primária | `stroke: #000; width: 2px` |
| Linha secundária | `stroke: #CCC; width: 1px; stroke-dasharray: 4 4` |
| Área sob curva | `fill: #F8F8F8; opacity: 0.8` |
| Grid horizontal | `stroke: #eee; width: 0.5px` |
| Labels dos eixos | `DM Mono · 10px · #888` |
| Tooltip | `background: #000; color: #FFF; border-radius: 8px; font: DM Mono 11px` |
| Crosshair | `stroke: #000; width: 1px` |
| Data point dot | `fill: #000; r: 3px` com centro `fill: #FFF; r: 1.5px` |
| Ring chart track | `stroke: #eee; width: 5px` |
| Ring chart value | `stroke: #000; width: 5px; linecap: round` |

---

## 9. CHECKLIST DE VALIDAÇÃO

Antes de entregar qualquer tela, verificar **todos** os itens:

**Cor e Estilo:**
- [ ] Zero cores fora da paleta (#000, #FFF, #333, #888, #CCC, #F8F8F8)
- [ ] Gradientes metálicos apenas em indicadores ↑↓
- [ ] Zero `box-shadow` em qualquer elemento
- [ ] Zero gradientes em backgrounds/botões/cards
- [ ] Todos os ícones são stroke-only (fill: none)

**Logo:**
- [ ] Logo squircle com `border-radius: 22%` em toda ocorrência
- [ ] Texto da logo centralizado com `margin-right` compensando `letter-spacing`
- [ ] Logo tem `padding` interno para espaço entre texto e bordas

**Tipografia:**
- [ ] `font-family: SF Pro Display` em 100% dos textos de interface
- [ ] `font-family: DM Mono` em labels, breadcrumbs, badges, código, timestamps
- [ ] Tamanhos tipográficos seguem a escala de 10 níveis (nunca improvisar)

**Componentes:**
- [ ] Border-radius: `10px` botões/inputs, `24px` cards/panels, `22%` logo, `99px` pills
- [ ] Grid 8pt respeitado em todos os paddings e gaps
- [ ] Hover states em todos os elementos interativos
- [ ] `transition` em todas as propriedades que mudam no hover

**Motion e Interatividade:**
- [ ] Scroll reveals com GSAP ScrollTrigger (translateY 20-24px, opacity, stagger)
- [ ] Counter animations nas métricas (0→valor, 1.4s, power2.out)
- [ ] Motivos gráficos com interação de mouse (atração, repulsão, center-follow)
- [ ] Canvas patterns usam IntersectionObserver (só anima quando visível)
- [ ] Canvas sempre usa `devicePixelRatio` para retina
- [ ] Hero com blueprint canvas como background (grid + radial + concentric)
- [ ] Logo entrance com Anime.js (outElastic)

---

## 10. ANTI-PATTERNS — O que NUNCA fazer

| Nunca | Em vez disso |
|-------|-------------|
| `box-shadow: 0 2px 8px rgba(...)` | `border: 1px solid var(--silver)` |
| `background: linear-gradient(...)` em cards | `background: var(--white)` ou `var(--snow)` |
| Ícone com `fill: currentColor` | `fill: none; stroke: currentColor; stroke-width: 1.5` |
| `border-radius: 4px` em cards | `border-radius: var(--r-xl)` (24px) |
| Badge verde "Aprovado", vermelho "Rejeitado" | Badge monocromático com ícone outline diferente |
| Font size inventado (17px, 19px, 23px) | Usar apenas tokens da escala |
| `color: red` em valores negativos | Gradiente metálico via `background-clip: text` |
| Logo sem padding interno | `padding: 4px` (36px) ou `padding: 8px` (64px) |
| SF Pro para código/timestamps | DM Mono para tudo técnico |
| Sombra no hover | `border-color: var(--onyx)` no hover |
| Canvas pattern estático | Canvas animado com requestAnimationFrame + mouse physics |
| Canvas sem retina | Sempre `width * devicePixelRatio` e `ctx.scale(dpr, dpr)` |
| Animação sem IntersectionObserver | Só animar quando visível no viewport |

---

## 11. DEPENDÊNCIAS E FONT LOADING

### CDN — Bibliotecas de Motion

```html
<!-- GSAP + ScrollTrigger -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.7/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.7/dist/ScrollTrigger.min.js"></script>

<!-- Anime.js (logo entrance) -->
<script src="https://cdn.jsdelivr.net/npm/animejs/dist/bundles/anime.umd.min.js"></script>

<!-- Registrar plugins -->
<script>gsap.registerPlugin(ScrollTrigger);</script>
```

### Fonts

```html
<!-- Google Fonts — DM Mono -->
<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/>

<!-- SF Pro Display — self-hosted -->
<style>
@font-face { font-family: 'SF Pro Display'; src: url('https://sf.abarber.me/SF-Pro-Display-Light.otf') format('opentype'); font-weight: 300; font-display: swap; }
@font-face { font-family: 'SF Pro Display'; src: url('https://sf.abarber.me/SF-Pro-Display-Regular.otf') format('opentype'); font-weight: 400; font-display: swap; }
@font-face { font-family: 'SF Pro Display'; src: url('https://sf.abarber.me/SF-Pro-Display-Medium.otf') format('opentype'); font-weight: 500; font-display: swap; }
@font-face { font-family: 'SF Pro Display'; src: url('https://sf.abarber.me/SF-Pro-Display-Semibold.otf') format('opentype'); font-weight: 600; font-display: swap; }
@font-face { font-family: 'SF Pro Display'; src: url('https://sf.abarber.me/SF-Pro-Display-Bold.otf') format('opentype'); font-weight: 700; font-display: swap; }
</style>
```

---

## 12. RESET BASE

Aplicar em toda página Anova antes de qualquer componente:

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  background: var(--white);
  color: var(--onyx);
  font-family: var(--font);
  font-size: var(--text-base); /* 15px */
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
::selection { background: var(--onyx); color: var(--white); }
```

---

*ANOVA Design System v1.0.1 · Monocromático · Flat · Line-art · "Confiança que vira execução."*
