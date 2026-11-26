# Análise de evolução — NebularCore

**Data:** 2026-11-17  
**Escopo:** biblioteca `@nebular-react/*` (core, hooks, styles, ssr, next)  
**Objetivo:** identificar melhorias de engenharia e evoluções de funcionalidades com impacto real para consumidores.

---

## 1. Resumo executivo

O NebularCore saiu de um estado de tooling quebrado para uma base moderna: TypeScript 7, React 19,
ESLint 9 sem warnings, Jest 30, Storybook 10, build ESM/CJS com `exports` map e SSR validado.

O próximo salto não é mais de tooling. É de **produto e confiabilidade**:

1. **Cobertura real de testes** — hoje a cobertura reportada é 55,8% de statements, mas medida apenas
   sobre os arquivos carregados pelos testes. Na prática, os 39 grupos de componentes estão sem
   testes de interação.
2. **Acessibilidade** — 19 usos de `aria-*` em 153 arquivos TSX é pouco para uma biblioteca de UI.
3. **APIs controladas consistentes** — cada componente usa um nome diferente (`value`, `date`,
   `defaultSelected`, `expanded`, `initialExpanded`), o que aumenta o custo de adoção.
4. **Funcionalidades de seleção e datas** — `Select`/`Autocomplete`/pickers ainda não têm async,
   virtualização, estados de loading/empty e presets.
5. **Peso de runtime** — `moment` (~4,4 MB instalado), `eva-icons` (~8 MB instalado) e duas
   bibliotecas de animação (`react-spring` + `react-transition-group`) dominam o custo.
6. **Documentação pública** — Storybook compila, mas não há docs de uso, props, acessibilidade e
   migração; o próprio README ainda marca “Tests / Documentation” como TBD.

---

## 2. Estado atual medido

| Indicador                            |                                                            Valor |
| ------------------------------------ | ---------------------------------------------------------------: |
| Grupos de componentes no core        |                                                           **43** |
| Arquivos `*.story.tsx`               |                                                           **43** |
| Arquivos `*.tsx`                     |                                                          **161** |
| Arquivos de teste                    |                                **17** (hooks, SSR e componentes) |
| Testes executados                    |                                                          **547** |
| Cobertura real (collectCoverageFrom) | **89,24% stmts / 76,84% branches / 86,55% funcs / 89,24% lines** |
| Usos de `aria-*`                     |                                                           **19** |
| `@ts-ignore` / `@ts-expect-error`    |                                                            **0** |
| `dangerouslySetInnerHTML`            |                                                            **0** |
| Lint                                 |                                         **0 erros / 0 warnings** |

Tamanho dos builds ESM atuais:

| Pacote                  | Tamanho ESM |
| ----------------------- | ----------: |
| `@nebular-react/core`   |   ~1.314 KB |
| `@nebular-react/styles` |     ~883 KB |
| `@nebular-react/hooks`  |     ~274 KB |
| `@nebular-react/ssr`    |     ~2,9 KB |
| `@nebular-react/next`   |     ~2,2 KB |

Dependências pesadas instaladas:

| Dependência              | Tamanho instalado |
| ------------------------ | ----------------: |
| `eva-icons`              |         ~8.093 KB |
| `moment`                 |         ~4.391 KB |
| `lodash`                 |         ~1.380 KB |
| `@mantine/hooks`         |         ~1.335 KB |
| `@emotion/react`         |           ~797 KB |
| `react-transition-group` |           ~238 KB |
| `@react-spring/web`      |            ~54 KB |

> Observação: cobertura não é comparável entre projetos sem `collectCoverageFrom`. Hoje o Jest mede
> só o que os testes importam; os componentes não entram no denominador. O número real de cobertura
> de componentes é próximo de zero.

---

## 3. Pontos fortes atuais

- **Arquitetura em pacotes** bem separada: `core`, `hooks`, `styles`, `ssr`, `next`.
- **Build moderno**: ESM + CJS + `.d.ts`, `exports` map, `type: module`, `files`, validação de exports.
- **SSR real**: `Tooltip`, `Popover`, `Select`, pickers e overlays não quebram mais no servidor;
  há teste de regressão em `tests/ssr.test.tsx`.
- **React 19 + Next 16** suportados; peer ranges coerentes.
- **Design system próprio** com Emotion, CSS variables, temas claro/cosmic/corporate/dark e RTL.
- **Componentização polimórfica** (`createPolymorphicComponent`) e `DefaultProps` consistentes.
- **Storybook 10** com build validado e 39 histórias cobrindo praticamente todos os grupos.
- **Tooling confiável**: syncpack, lint, typecheck, build e testes no mesmo pipeline.

---

## 4. Gaps priorizados

### P0 — Confiabilidade e acessibilidade

1. **Cobertura enganosa**
   - Adicionar `collectCoverageFrom` para `src/nebular-react-*/src/**/*.{ts,tsx}`.
   - Definir thresholds por pacote (ex.: core 60% inicial, hooks 80%).
   - Medir componentes, não só hooks utilitários.

2. **Ausência de testes de interação**
   - Componentes críticos sem teste: `Select`, `Autocomplete`, `Datepicker`, `Calendar`, `Dialog`,
     `Window`, `Toastr`, `Menu`, `Tabset`, `Accordion`, `Tags`.
   - Criar suíte com Testing Library + `user-event` cobrindo teclado, foco, seleção e fechamento.

3. **Acessibilidade não medida**
   - Reintroduzir `jest-axe` (ou `axe-core` direto) no setup.
   - Testar `combobox`/`listbox`/`option`, `dialog`, `menu`, `tabs`, `accordion`, `tooltip`,
     `toast` (live region) e mensagens de erro de formulário.
   - Revisar `aria-expanded`, `aria-controls`, `aria-activedescendant`, `aria-selected`,
     `aria-disabled`, `role` e foco inicial/restaurado.

4. **CI não valida pacotes publicados**
   - `npm pack` + instalação em app temporário (CJS e ESM).
   - `publint` e `@arethetypeswrong/cli` para validar `exports`/tipos.
   - `size-limit` para travar regressões de bundle.

### P1 — Consistência de API

5. **Padronizar controlado/não-controlado**
   - Hoje: `Select` usa `defaultSelected`/`onSelect`; `Accordion` usa `expanded`/`onChange`;
     `Menu` usa `initialExpanded`; `Tabset` usa `activeTabIndex`; `Tags` tem estado próprio.
   - Proposta: `value` + `defaultValue` + `onChange` em todos os componentes de valor, mantendo
     aliases depreciados por uma versão.
   - Usar `useUncontrolled` de forma uniforme.

6. **Integração com formulários**
   - Suportar `name`, `required`, `readOnly`, `error`, `description` e hidden input.
   - Adapters opcionais para React Hook Form / Formik (sem acoplar o core).

7. **Contratos de evento**
   - `onChange(value)` vs `onChange(event)` vs `onSelect(value)` hoje variam.
   - Definir um padrão e documentar em Storybook.

### P1 — Funcionalidades de maior valor

8. **Select / Autocomplete**
   - Busca/filtro no Select, `clearable`, `loading`, `emptyState`, `maxSelectedValues`.
   - Opções assíncronas com debounce e cancelamento.
   - Virtualização do `OptionList` para milhares de opções.
   - `renderOption`/`renderValue` e descrição/avatar por opção.
   - Select “creatable” (criar opção a partir do texto).

9. **Datas**
   - ✅ Adaptador plugável (`Date`, `Moment`, `dayjs`, `date-fns` e `Temporal`)
     implementado com `DateAdapterProvider`.
   - ✅ `min`/`max`/`filter`/`disabledDates` disponíveis em Calendar e pickers.
   - ✅ Presets embutidos (“Today”, “Last 7 days”, “This month”) e presets customizados
     em Datepicker, DatetimePicker e Rangepicker.
   - ✅ Máscara de input e edição por teclado (`withInputMask`/`withKeyboardEdit`).
   - Pendente: centralizar `locale` no `NebularProvider`.

10. **Overlays**
    - Gerenciador único de overlays (dialog/window/toastr/menu/popover) com fila, nesting e
      restauração de foco.
    - Avaliar `@floating-ui/react` no lugar da estratégia de posicionamento caseira.
    - `Toastr` com promise toast, ações, pausa no hover e posições independentes.
    - `Tooltip`/`Popover` com API baseada em `children` (sem exigir `triggerRef`).

11. **Componentes para telas administrativas**
    - ✅ `Table` e `DataGrid` (ordenação, filtros por coluna, paginação, seleção de linhas,
      virtualização de linhas, redimensionamento, reordenação, visibilidade de colunas,
      expansão de linhas, exportação CSV, agrupamento (simples e multi-nível), edição de linhas,
      modo server-side, column pinning, headers multi-nível, agregações de rodapé e por grupo,
      operadores de filtro, menu de coluna e reordenação de linhas).
    - ✅ `Pagination`, `Skeleton`, `EmptyState`, `SegmentedControl`, `Stat`, `Timeline`,
      `Descriptions`, `Tree`, `TreeTable`, `Scheduler`, `GanttChart`, `RichTextEditor`,
      `LineChart`/`AreaChart`/`BarChart`/`DonutChart`/`ComboChart`/`StackedBarChart`/`FunnelChart`/`TreeMapChart`/`WaterfallChart`/`BulletChart`/`PieChart`/`ScatterChart`/`RadarChart`/`Gauge`/`Heatmap`/`Sparkline`,
      `ChartContainer`, `Transfer`, `Dropzone`, `Slider`/`RangeSlider`,
      `ColorPicker`, `CommandPalette`, `Drawer`, `ConfirmDialog`, `Rating`, `Spoiler`,
      `ScrollArea`, `HoverCard`, `LoadingOverlay`, `Divider`, `Breadcrumbs`,
      `FormControl`, `Form`/`useForm`, `CheckboxGroup`, `InputGroup`, `PinInput`, `MaskedInput`,
      `PhoneInput`, `DocumentInput`, `CurrencyInput`, `CronInput`, `FileInput`, `TreeSelect`,
      `Cascader`, `Modal`, `Popconfirm`, `PageHeader`, `AvatarGroup`, `Indicator`,
      `AspectRatio`, `CopyButton`, `Kbd`, `Anchor`, `Image`, `QRCode`, `Barcode`, `CodeBlock`,
      `JsonViewer`, `DiffViewer`, `VirtualList`, `InfiniteScroll`, `Carousel`, `ImageViewer`, `Tour`, `NotificationCenter`, `FilterBuilder`,
      `PivotTable`, `Kanban`, `DashboardGrid`, `AppShell`, `SplitPane`, `LoadingBar`, `VisuallyHidden`,
      `ErrorBoundary`, `Textarea`, `NumberInput` e `PasswordInput`.

12. **Chat**
    - Markdown seguro, anexos com preview, status de mensagem, reações, indicador de digitação.
    - Substituir `ChatMessageMap` por provedor plugável (Google Maps com key embutida não escala).

### P2 — Performance e arquitetura

13. **Reduzir runtime**
    - `moment` → `dayjs` (ou adapter) reduz drasticamente bundle e superfície de API.
    - `eva-icons` → pacote de ícones separado/opcional, carregamento lazy por pack.
    - Consolidar `@react-spring/web` + `react-transition-group` em uma única solução.
    - Manter `lodash` por subpath (já feito) e auditar usos de `cloneDeep` em caminhos quentes.

14. **Renderização**
    - Virtualizar `OptionList`, `Menu`, `List` e futura `Table`.
    - Dividir contextos grandes (`MenuContext`, `OptionListContext`, `NebularProviderContext`)
      para evitar re-render global.
    - Usar `useEffectEvent` do React 19 para handlers de eventos estáveis.
    - Revisar `React.memo`/`useMemo` que hoje memoizam sobre objetos recriados.

15. **Strict TypeScript incremental**
    - Habilitar `strictNullChecks` por pacote, começando por `hooks` e `styles`.
    - Reduzir `any` em APIs públicas e props de componentes.
    - Adicionar `exactOptionalPropertyTypes` somente após a base estabilizar.

16. **Barramento de eventos**
    - `createUseExternalEvents` usa `window` CustomEvent para tema/dialog/window/toastr.
    - Migrar para store/context com `useSyncExternalStore`, mantendo os eventos como compatibilidade.
    - Ganho: testabilidade, isolamento entre instâncias, SSR mais previsível.

### P2 — Documentação e ecossistema

17. **Docs de uso**
    - ✅ Storybook com autodocs, props table e TOC; guias de uso, componentes/props,
      migração e date adapter publicados no GitHub Pages.
    - ✅ Guia de migração (incluindo `displayName`, adapters e APIs controladas).
    - ✅ Storybook publicado via `.github/workflows/pages.yml`.

18. **Versionamento e distribuição**
    - ✅ `CHANGELOG.md` + Changesets (`.changeset/config.json`, workflow `release.yml`).
    - ✅ Publicação npm preparada com provenance (`publishConfig.provenance` e
      `NPM_CONFIG_PROVENANCE`); falta apenas configurar o secret `NPM_TOKEN`.
    - Pendente: script de sincronização para `Common/webapp/external-libs` ou substituição
      por registry.
    - Pendente: `SECURITY.md`, `CONTRIBUTING.md`, templates de issue/PR.

19. **Exemplos vivos**
    - App de exemplo Vite + Next (pages e app router) rodando em CI para smoke test de consumo.

---

## 5. Roadmap sugerido

### Fase 1 — Confiança (1–2 semanas)

- `collectCoverageFrom` + thresholds.
- `jest-axe` + testes de `Select`, `Autocomplete`, `Datepicker`, `Dialog`, `Tabset`, `Accordion`.
- `publint`, `attw`, `size-limit` no CI.
- Teste de instalação dos tarballs (CJS + ESM).
- CI matrix Node 22 + React 19.2/19.3.

**Critério de saída:** cobertura real medida, componentes críticos com testes de teclado/foco/a11y,
pacotes validados como consumidores reais.

### Fase 2 — APIs e componentes (3–6 semanas)

- Padronização controlado/não-controlado em `Select`, `Tags`, `Accordion`, `Menu`, `Tabset`.
- `Select`/`Autocomplete` com busca, async, loading/empty, clearable e virtualização.
- Adaptador de datas + presets + `disabledDates`.
- Overlay manager + migração para floating-ui (avaliar).
- Novos componentes: `Table`/`DataGrid`, `Pagination`, `Skeleton`, `EmptyState`, `Slider`.

**Critério de saída:** APIs consistentes, seleção/datas prontas para cenários reais de admin,
primeira versão de DataGrid.

### Fase 3 — Produto e distribuição (6–12 semanas)

- Redução de runtime: remover `moment` e `eva-icons` do bundle principal.
- Docs públicas + guias de migração.
- Publicação npm automatizada + changelog.
- App de exemplo em CI.
- Strict TypeScript por pacote.
- Store de overlays com `useSyncExternalStore`.

**Critério de saída:** biblioteca publicável, documentada, com bundle previsível e consumível por
npm sem cópia manual.

---

## 6. Quick wins (baixo esforço, alto retorno)

1. Adicionar `collectCoverageFrom` e thresholds — expõe a realidade em um PR.
2. Reintroduzir `jest-axe` e um teste a11y por componente crítico.
3. Adicionar `publint` + `attw` ao CI.
4. Ativar `autodocs` no Storybook e publicar props tables.
5. Criar `CHANGELOG.md` e adotar Changesets.
6. Remover `triggerRef` obrigatório de `Tooltip`/`Popover` via API de `children`.
7. Adicionar `clearable` e `loading` ao `Select`.
8. Criar `Pagination`, `Skeleton` e `EmptyState` (componentes pequenos e muito usados).
9. Adicionar bundling budget com `size-limit`.
10. Documentar o padrão de API controlada antes de refatorar os componentes.

---

## 7. O que não recomendo agora

- Migrar tudo para outro sistema de estilos.
- Reimplementar todos os componentes como headless.
- Trocar o modelo de pacotes por um único pacote.
- Ativar `strict` global de uma vez; o custo supera o benefício sem testes de componente.
- Migrar para outra biblioteca de datas antes de estabilizar a API de datas.

---

## 8. Métricas de sucesso propostas

| Métrica                            |               Hoje |               Meta 6 meses |
| ---------------------------------- | -----------------: | -------------------------: |
| Cobertura real de statements       |             67,32% |                      ≥ 75% |
| Componentes com teste de interação |                 13 |                       ≥ 20 |
| Componentes com teste a11y         |                  0 |          100% dos críticos |
| Warnings de lint                   |                  0 |                          0 |
| Tamanho do core ESM                |          ~1.314 KB |                   ≤ 900 KB |
| Dependências de runtime pesadas    | moment + eva-icons | adapter + ícones opcionais |
| Pacotes validados por publint/attw |                  0 |                          5 |
| Docs com props/exemplos            |                  0 |       100% dos componentes |
