# ANOVA — Instruções do Projeto

## Identidade

ANOVA é um **Sistema Operacional Conversacional** para redes comerciais financeiras no Brasil.
Tagline: "Confiança que vira execução."

## Design System — Regras Absolutas

Antes de criar QUALQUER interface (componente, página, tela, landing), leia:
- `design-system/tokens.css` — copie os tokens para seu CSS
- `design-system/components.css` — padrões de componentes
- `design-system/GUIDE.md` — referência completa com layouts, motion, decisões

### As 10 Regras de Ouro (INVIOLÁVEIS)

1. **Monocromático sempre** — 6 cores apenas: `#000 #FFF #333 #888 #CCC #F8F8F8`. EXCEÇÃO ÚNICA: gradientes metálicos em indicadores ↑↓ de métricas.
2. **Whitespace é sagrado** — grid 8pt rigoroso. Nunca comprimir.
3. **Line-art, nunca filled** — ícones stroke-only 1.5px. Usar Lucide Icons.
4. **Blueprint é a assinatura** — crosshairs e grids sutis em heros.
5. **Flat design absoluto** — ZERO `box-shadow`. ZERO gradientes (exceto regra 1).
6. **Hierarquia tipográfica** — escala de 10 níveis (76px→10px). Nunca improvisar.
7. **Frases de impacto** — primeira palavra em bold como âncora visual.
8. **Logo intocável** — squircle `border-radius: 22%`. Nunca distorcer.
9. **Consistência entre contextos** — mesmos tokens em tudo.
10. **Conexão visual** — linhas de rede e hubs como motivo gráfico.

### Checklist Rápido (validar antes de cada commit)

```
[ ] Zero cores fora da paleta
[ ] Zero box-shadow
[ ] Zero gradientes (exceto metric deltas)
[ ] Ícones stroke-only (fill: none)
[ ] Logo squircle 22%
[ ] SF Pro Display + DM Mono apenas
[ ] Border-radius: 10px botões, 24px cards, 22% logo, 99px pills
[ ] Hover states em todos os interativos
```

## Stack Técnica

- **Frontend**: React / Next.js / HTML
- **CSS**: CSS Modules ou Tailwind (mapear tokens)
- **Fontes**: SF Pro Display apenas (wght 300-700). DM Mono foi removida — usar SF Pro com `font-feature-settings:'tnum'` para números tabulares.
- **Motion**: GSAP + ScrollTrigger para scroll reveals, Anime.js para logo
- **Ícones**: Lucide Icons (stroke 1.5px, round caps)
- **Linguagem**: Português brasileiro (pt-BR)

## Convenções de Código

- CSS custom properties prefixadas com `--anova-` em projetos compartilhados
- Componentes em PascalCase: `MetricCard`, `StatusBadge`, `DataTable`
- Tokens sem prefixo dentro do design system: `--onyx`, `--text-hero`
- Sempre `font-display: swap` em @font-face
- Sempre `-webkit-font-smoothing: antialiased`
