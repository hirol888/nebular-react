# Roadmap - NebularCore (UI Library)

> Análise detalhada de melhorias e evoluções: `docs/_archive/analises/2026-11-17 - Evolucao Funcionalidades.md`

## Resolvido

- **Node 24**: `.nvmrc` 24.20.0, `engines >=24`, `@types/node` 24.19.2,
  `@testing-library/jest-dom` 8, `@testing-library/user-event` 14.6.13 e Rollup 4.68.7.
  ESLint 10 e TypeScript 7 seguem bloqueados por peers (`eslint-config-airbnb-extended`
  exige ESLint 9; `typescript-eslint` aceita TypeScript <6.1).
- **Qualidade do legado**: testes dedicados para ButtonGroup, Icon, Popover, ContextMenu,
  Stepper, Sidebar, Layout, Tags, Window, Search, Chat e Toastr; correções de acessibilidade
  e bugs em Calendar, Window, ChatForm, Toastr, Sidebar, Layout, Tags e Search.
- **Fundação visual**: `Typography`, `Stack`, `Flex`, `Grid`, `Container` e `Result`.
- **Novos componentes**: `Affix`, `BackTop`, `FloatButton`, `Watermark`, `OrgChart`,
  `FileManager`, `ImageCropper`, `AvatarEditor`, `FileInput` múltiplo, `SankeyChart`,
  `ChordChart`, `SunburstChart`, `BoxPlotChart`, `CandlestickChart`, `WordCloud`,
  `StreamGraphChart`, `StepLineChart`, `Mentions`, `Markdown` e `SignaturePad`.
- **Editores visuais**: `WorkflowDesigner` (canvas, drag, zoom, conexão) e `MindMap`
  (árvore com ramos e teclado).
- **Forms/produtividade**: `MultiSelect`, `Wizard`, `SplitButton` e `SpeedDial`.
- **Analytics**: `CalendarHeatmap`, `PolarAreaChart` e `ViolinPlot`.
- **DataGrid avançado**: saved views, filtros por range, column/row pinning, agrupamento
  multi-nível, edição de célula com validação, virtualização de colunas, menu de coluna,
  paste TSV, fill handle e spans.
- **DataGrid final**: tree data (`treeData`/`getRowChildren`), agrupamento server-side
  (`serverSideGrouping`/`groupedData`) e autofit (`withColumnAutofit`).
- **Scheduler**: drag/resize (`editable`), recorrência (`recurrence`/`expandRecurrence`) e
  timezone por evento.
- **Kanban**: swimlanes, WIP limits e virtualização de cards.
- **FileManager**: multi-seleção, upload com progresso e menu de contexto.
- **Chat**: threads, typing indicator e read receipts.
- **GanttChart**: caminho crítico, baselines e recursos.
- **RichTextEditor**: tabelas, imagens, links e sanitização de paste.
- **Charts**: data table acessível, animações e export SVG/PNG.
- **Editores e conteúdo**: `CodeEditor` (realce por linguagem, números de linha, auto-indent e
  Tab/Shift+Tab), `MarkdownEditor` (split/edit/preview, toolbar e atalhos) e `EmojiPicker`
  (busca, categorias, recentes e teclado).
- **Charts finais**: `PictogramChart` (unidades fracionárias), `BubbleChart` (raio por `sqrt`)
  e `Dendrogram` (layout determinístico com `layoutDendrogram`).
- **DataGrid (2)**: undo/redo com histórico, export Excel (`.xls`), sorting/filtro server-side
  independentes e virtualização com altura variável (`getRowHeight`).
- **Scheduler (2)**: criação por arraste (`selectable`/`onRangeSelect`), resource lanes
  (`resources`/`resourceView`) e drag horizontal de eventos `allDay`.
- **Kanban (2)**: edição inline (`editable`/`onCardEdit`/`renderCardEditor`), checklist com
  progresso e labels/assignees acessíveis.
- **FileManager (2)**: drag-and-drop entre pastas (`draggable`/`onMove`), sorting
  (`sortBy`/`sortDirection`) e preview lateral (`preview`/`renderPreview`).
- **Chat (2)**: busca com destaque, edição/exclusão com confirmação, reações e virtualização.
- **GanttChart (2)**: resource lanes (`resourceView`), arraste de progresso
  (`editableProgress`) e export SVG/PNG.
- **RichTextEditor (2)**: mentions, code inline/block e find/replace com case-sensitive.
- **Charts (2)**: data table, export e animação `prefers-reduced-motion` em todas as famílias.
- **Pivot/Gantt**: drill-down no `PivotTable` e edição de tarefas/dependências no `GanttChart`.
- **Search/Tags**: Search controlado (`value`/`onChange`), Tags com autocomplete e estrutura
  ARIA corrigida (input fora do listbox, labels acessíveis).
- **DataGrid**: seleção de intervalo com `Shift+clique` e cópia TSV (`Ctrl/Cmd+C`).
- **Type safety**: casts `any` removidos de `DataGrid` e `Toastr`, com teste de tipos dedicado.
- **Type safety (2)**: `Select`, `Button`, `Accordion` e `PivotTable` sem `any`; `TypeSafety.test.tsx`
  cobre também `SelectProps` e `PivotTableProps`.
- **Type safety (3)**: `Actions`, `Badge`, `ButtonGroup`, `Card`, `Chat`, `OptionList` e
  `LineChart` sem `any`; `TypeSafetyLegacy.test.tsx` cobre os contratos públicos.

- **TypeScript 7**: `tsc` roda na versão 7.0.2 (pacote `@typescript/native`), mantendo o
  TypeScript 6.0.3 como API para o `typescript-eslint`, que ainda não suporta o compilador
  nativo do TS 7.
- **`@types/react` 19**: alinhado com React 19.3.1 usado pelo AllApp. Os erros de tipo
  expostos pela atualização foram corrigidos.
- **Jest 30**: atualizado de 27 para 30.5.2, com `jest-environment-jsdom` explícito e
  `@sucrase/jest-plugin` 3.
- **ESLint 9**: migrado para flat config nativo com `eslint-config-airbnb-extended` 3.3 e
  `eslint-config-prettier`. As regras `react-hooks/rules-of-hooks` e
  `react-hooks/exhaustive-deps` estão ativas.
- **Mantine 9**: `@mantine/hooks` atualizado para 9.8.1 (requer React 19.2+, já atendido).
- **`@mantine/utils` 6 removido**: `createPolymorphicComponent`,
  `ForwardRefWithStaticComponents` e `createUseExternalEvents` agora são implementados em
  `@nebular-react/styles` com tipos React 19.
- **Next 16**: suporte declarado para `>=15.5.0 <17` e validado com Next 16.4.6 no build/tipos.
- **Tooling de release**: `chalk` 6, `execa` 10, `fs-extra` 11, `open` 11,
  `new-github-release-url` 2, `rimraf` 6, `simple-git` 4 e `syncpack` 15. Node mínimo do
  repositório passou para 24.20.0.
- **Lint limpo**: `react-hooks/exhaustive-deps` chegou a 0 warnings. Efeitos com refs e
  callbacks foram estabilizados; os poucos casos intencionais têm `eslint-disable` comentado.
- **Componentes quick-win**: `Skeleton`, `EmptyState`, `Pagination`, `Table` e `DataGrid`
  adicionados com stories, testes de interação e testes a11y. O `DataGrid` cobre ordenação,
  paginação, seleção de linhas, filtros por coluna (com operadores), virtualização, resize,
  reorder, visibilidade de colunas, expansão de linhas, exportação CSV, agrupamento,
  edição de linhas, modo server-side, column pinning, headers multi-nível, agregações de
  rodapé e por grupo, agrupamento multi-nível, menu de coluna, edição por célula, virtualização de colunas e reordenação de linhas.
- **Novo catálogo de componentes**: `SegmentedControl`, `Textarea`, `NumberInput`,
  `PasswordInput`, `FormControl`, `Form`/`useForm`, `CheckboxGroup`, `InputGroup`, `PinInput`,
  `MaskedInput`, `PhoneInput`, `DocumentInput`, `CurrencyInput`, `CronInput`, `FileInput`,
  `TreeSelect`, `Cascader`, `Modal`, `Popconfirm`, `PageHeader`, `AvatarGroup`, `Indicator`,
  `AspectRatio`, `CopyButton`, `Kbd`, `Anchor`, `Image`, `QRCode`, `Barcode`, `CodeBlock`,
  `JsonViewer`, `DiffViewer`, `VirtualList`, `InfiniteScroll`, `Carousel`, `ImageViewer`, `Tour`, `NotificationCenter`, `FilterBuilder`,
  `PivotTable`, `Kanban`, `DashboardGrid`, `AppShell`, `SplitPane`, `LoadingBar`, `VisuallyHidden`,
  `ErrorBoundary`, `Breadcrumbs`, `Divider`, `Stat`/`KpiCard`, `Timeline`, `Descriptions`,
  `TreeTable`, `Scheduler`, `GanttChart`, `RichTextEditor`,
  `LineChart`/`AreaChart`/`BarChart`/`DonutChart`/`ComboChart`/`StackedBarChart`/`FunnelChart`/`TreeMapChart`/`WaterfallChart`/`BulletChart`/`PieChart`/`ScatterChart`/`RadarChart`/`Gauge`/`Heatmap`/`Sparkline`,
  `ChartContainer`, `Rating`, `LoadingOverlay`, `ConfirmDialog`, `Slider`, `RangeSlider`,
  `Drawer`, `Transfer`, `Tree`, `Dropzone`, `CommandPalette`, `ColorPicker`, `HoverCard`,
  `ScrollArea` e `Spoiler`, com stories e testes de interação/a11y.
- **Virtualização de listas agrupadas**: grupos e opções achatados por linha, com
  preservação de `role="group"`, `aria-setsize`/`aria-posinset` e key manager por opção.
- **Select/Autocomplete mais completos**: `clearable`, `loading`, `nothingFoundMessage`,
  busca local, busca assíncrona (`onSearchChange`), `filterOption`, seleção inicial
  consistente, navegação por teclado sobre a lista filtrada e virtualização opt-in.
  A virtualização cobre listas planas e agrupadas.
- **Qualidade de pacote**: cobertura real com thresholds, `publint`, `attw` e declarações
  `.d.cts` para consumidores CommonJS.
- **Date adapter plugável**: `DateAdapterProvider`, adapters nativo/Moment/dayjs,
  `createDateFnsDateAdapter`, `createTemporalDateAdapter`, `createDateAdapter` e migração
  de `useDateFns`/`useCalendar`.
- **Datas**: `disabledDates` (lista ou predicado) em Calendar/pickers e presets
  (`Today`, `Last 7 days`, `This month`) embutidos ou customizados nos pickers.
- **Pickers adicionais**: `DateTimeRangePicker`, `TimeRangePicker`, `MonthPicker` e
  `YearPicker`, com intervalos, presets, timezone, `min`/`max` e clear.
- **Timezone explícito**: `timeZone` em Calendar, Datepicker, Rangepicker, DatetimePicker e
  Timepicker (valor absoluto + exibição/parse no fuso), helpers `toTimeZone`/`fromTimeZone`/
  `getTimeZoneOffset`/`isValidTimeZone` e tratamento de DST.
- **Máscara e teclado nos pickers**: `withInputMask`/`withKeyboardEdit` em Datepicker,
  DatetimePicker, Rangepicker e Timepicker, com máscara derivada do formato e ajuste por
  `ArrowUp`/`ArrowDown`.
- **Componentes utilitários**: `Chip`/`ChipGroup`, `Fieldset`, `NativeSelect`, `SwitchGroup`,
  `FileButton`, `ThemeIcon`, `Overlay`, `NumberFormatter`, `PasswordStrength` e `ColorSwatch`,
  além da extensão do `RadioGroup` com `data`/`label`/`error`/`orientation`/`name`, todos com
  stories, testes de interação e `jest-axe`.
- **Componentes para filtros e operações**: `ResponsiveFilterBar`, `FormErrorSummary`,
  `PermissionMatrix`, `AuditTrail` e `UploadQueue`, com APIs documentadas, stories
  para desktop e celular e testes de interação e acessibilidade.
- **Editores e visualizadores compostos**: `RecordPicker`, `AvailabilityEditor`,
  `DecisionTableEditor`, `ChoiceCardGroup`, `IconPicker`, `OnboardingChecklist` e
  `TraceWaterfall`, com APIs documentadas, stories e testes de interação/a11y.
- **DataGrid em lote**: `batchEditing` acumula edições de célula, colagem e preenchimento
  em um único commit (`onCommit`), com validação opcional, descarte e indicação visual
  das células pendentes; indisponível com agrupamento server-side.
- **Ícones leves**: catálogo de ícones com a condição `nebular-light`; Menu e Accordion
  usam transições CSS.
- **Polimento de interação**: `Button` com `loading`/`loadingText`, novo `RingProgress`
  (valor único e seções), `Tabset` com `closable`/`keepMounted`, `Tree` com
  `checkable`/`checkStrictly`/`loadData`, `CommandPalette` com busca assíncrona, grupos
  e ações recentes, `TreeTable` com checkboxes em cascata e ordenação por coluna,
  `DataGrid` com densidade (`compact`/`comfortable`/`spacious`) e charts de linha/barra
  com legenda interativa e zoom por arraste.
- **Família de seleção**: `Select`/`Autocomplete` com `renderOption`, `MultiSelect` com
  grupos, busca assíncrona e virtualização, `TreeSelect` com checkboxes em cascata e
  carregamento assíncrono, e `Cascader` com busca por caminho e níveis remotos.
- **Telefone global**: `PhoneInput` usa `libphonenumber-js` para todos os países ISO,
  com `country`/`defaultCountry`, `outputFormat` (`national`/`international`/`e164`),
  AsYouType, validação e `onChangeMeta`; BR/US preservam o progressivo legado.
- **Localização/i18n**: `NebularProvider` aceita `locale` BCP 47 e `messages`; catálogos
  embutidos `en-US`/`pt-BR`, `useNebularLocale`/`t`, locale global em datas/números e
  `labels` tipados nos componentes com mais strings.
- **Desktop**: gerenciador de janelas em tela cheia com taskbar configurável, menu Iniciar
  com busca/fixados/recentes, drag/resize, snap e snap layouts, minimizar/maximizar,
  agrupamento e overflow, menu de contexto, foco/A11y, persistência local ou via adapter
  assíncrono, estado por janela, áreas de trabalho virtuais com tema, multi-display span,
  surfaces de produção (fullscreen por display, hot-plug, reconciliação de órfãs), abas por
  janela com tear-off, toolbar/footer (`WindowBreadcrumb`/`WindowStatusBar`), Alt+Tab visual,
  flyout de snap layouts, transições, ícones, command palette, overview, notificações, error
  boundary por janela, associação de arquivos, modo compacto e janelas filhas modais.
  colaboração via `BroadcastChannel` ou WebSocket, merge LWW, presença e templates/conflito
  de layout. Inclui app registry com permissões/deep links/lazy loading, `DesktopAppFrame`
  sandbox, widgets, flyout de calendário, seleção de ícones do wallpaper, gestos touch,
  status online/offline e `FileExplorer`/`FileExplorerDualPane` com providers de memória/REST,
  navegação, views, copiar/cortar/colar, abas, drag para pasta (inclusive entre panes), fila
  de upload, permissões, paginação, virtualização, preview de mídia e lixeira/restore/undo.
- **Integrações genéricas**: app registry com deep links (`app://`), `createRestLayoutTransport`
  com query/body/parsers configuráveis, `getDesktopDeviceId` com storage/generator
  injetáveis, codec próprio na colaboração WebSocket e provider REST do FileExplorer com
  rotas/query/parsers customizáveis. Nada no núcleo depende do AllApp ou de um backend
  específico.
- **Testes**: 3.330 testes em 273 suítes, incluindo interação, teclado,
  virtualização plana e agrupada, adapters de data (nativo/Moment/dayjs/date-fns/Temporal),
  DataGrid, novos componentes, `jest-axe` e Playwright para ponteiro real, múltiplas janelas,
  snap, modo compacto e regressão visual opcional. A cobertura é de 90,69% de instruções,
  80,33% de branches, 91,06% de funções e 90,64% de linhas, com limites mínimos no CI.
- **Strict null em todos os pacotes**: `hooks`, `styles`, `ssr`, `core` e `next` compilam
  com `strictNullChecks` via `tsconfig.strict.json`, integrados ao `yarn typecheck`.
- **Rollup 4**: toolchain de build modernizada (Rollup 4.68 + plugins atuais). O build agora
  externaliza subpaths de dependências e gera `esm/`, `cjs/` e `lib/` com `exports` map.
- **React 19 / csstype / dependências internas**: versões alinhadas via syncpack; dependências
  de runtime e de tipos que estavam implícitas foram declaradas nos pacotes corretos.
- **Storybook 10**: migrado para 10.6.7 com config ESM, `@storybook/addon-docs` +
  `@storybook/addon-a11y` e build de preview validado no webpack5. Autodocs está ativo em
  todas as stories, com tabelas de props via `react-docgen-typescript` e TOC.
- **Documentação pública**: guias de primeiros passos, componentes/props, migração,
  date adapter, virtualização, type safety e release em `docs/guides/`.
- **GitHub Pages**: workflow `pages.yml` publica o Storybook em
  `https://hirol888.github.io/nebular-react/`.
- **Release com Changesets**: `.changeset/config.json`, `changeset`/`version-packages`/
  `release`, workflow `release.yml` com PR automático de versão e provenance npm.
- **SSR**: componentes com overlay (`Tooltip`, `Popover`, `Select`, pickers) não acessam mais
  `window`/`document` durante a renderização no servidor; há teste de regressão em
  `tests/ssr.test.tsx`.
- **Scripts ESM**: `check-conflicts`, `check-exports`, `build`, `storybook-start` e `release`
  corrigidos para o modo ESM.

## Alta Prioridade

- **ESLint 10**: o `eslint-config-airbnb-extended` 3.3 e os plugins React/import/jsx-a11y
  ainda declaram peer `^9`; o ESLint 9 é a última versão suportada pelo ecossistema atual.

## Média Prioridade

- **Alinhar Prettier com o AllApp**: o submodule usa Prettier 3; o root do AllApp ainda usa
  Prettier 2.8.8. O ideal é o consumidor subir para a mesma major.
- **`@types/node`**: alinhado ao Node 24 (`^24.19.2`); a sugestão de `26.x` do ncu
  corresponde ao Node 26 e não ao runtime atual.

## Baixa Prioridade

- **Cobertura de testes**: ampliar testes de interação para componentes de overlay,
  seleção e calendário. Os hooks `useDateFns` e `useCalendar` agora têm versões puras
  (`createDateFns`/`createCalendar`) e hooks que leem o `DateAdapterProvider`.
- **Publicação real**: requer o secret `NPM_TOKEN` e a configuração de Pages em
  “GitHub Actions”. O pipeline está pronto em `release.yml` e `pages.yml`.
