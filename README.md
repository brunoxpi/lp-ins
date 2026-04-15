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

Ou, se não houver Python:

```bash
cd assets
npx serve -l 8000 .
```

Abrir `http://localhost:8000/`.

Não abrir via `file://` — os partials (`nav.html`, `footer.html`) são carregados via `fetch()`, que é bloqueado no protocolo `file://`.

## Arquitetura

- Design system em `design-system/` (`tokens.css`, `components.css`, `sections.css`, `nav.css`)
- Partials compartilhados em `partials/` (`nav.html`, `footer.html`)
- Shell JS em `js/shell.js` (injeta partials, gerencia mega-menu e estado ativo)
- Documentação do design em `docs/superpowers/specs/`
- Plano de execução em `docs/superpowers/plans/`
