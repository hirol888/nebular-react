# Changelog

Todas as mudanças relevantes deste repositório serão documentadas neste arquivo.

## [Unreleased]

### Added

- `Skeleton`, `EmptyState`, `Pagination` e `Table` (com `Head`, `Body`, `Foot`, `Row`,
  `HeaderCell`, `Cell` e `Caption`).
- `DataGrid` com ordenação, paginação, seleção de linhas controlada/não-controlada,
  filtros por coluna (`withColumnFilters`, `filterValues`, `onFilterChange`),
  virtualização de linhas (`virtualized`, `virtualizedRowHeight`, `virtualizedMaxHeight`,
  `overscan`), redimensionamento (`withColumnResize`, `columnWidths`,
  `onColumnWidthChange`) e reordenação de colunas (`withColumnReorder`, `columnOrder`,
  `onColumnOrderChange`), visibilidade (`withColumnVisibility`, `hiddenColumnKeys`),
  expansão de linhas (`withRowExpansion`, `renderRowExpansion`), exportação CSV
  (`withExport`, `createDataGridCsv`), agrupamento (`groupBy`, `collapsibleGroups`) e
  edição de linhas (`withRowEditing`, `onRowEdit`, `renderRowEditor`), modo server-side
  (`serverSide`, `totalRows`, `loading`), column pinning (`pinned`, `pinnedColumns`),
  headers multi-nível (`column.children`), agregações de rodapé (`withSummary`,
  `aggregate`, `summaryScope`, `summaryFormatter`, `withGroupSummary`), agrupamento multi-nível
  (`groupBy` como array), operadores de filtro por coluna (`filterOperator`), reordenação de
  linhas (`withRowReorder`, `onRowReorder`), menu de coluna (`withColumnMenu`),
  edição por célula (`withCellEditing`, `onCellEdit`, `renderCellEditor`), virtualização de
  colunas (`virtualizeColumns`, `columnVirtualizationThreshold`, `getVirtualColumnRange`),
  saved views (`withViews`, `views`, `viewStorageKey`), filtros por range
  (`filterType`, `between`) e seleção de intervalo com cópia TSV (`withRangeSelection`,
  `Ctrl/Cmd+C`).
- `TreeTable` hierárquico com colunas configuráveis, expandir/colapsar, seleção,
  navegação por teclado e a11y.
- `Scheduler` com views de dia/semana/mês, navegação, eventos, API controlada e
  renderização customizada.
- `RichTextEditor` com toolbar, comandos de formatação, atalhos de teclado e API
  controlada/não controlada.
- `Charts`: `LineChart`, `AreaChart`, `BarChart`, `DonutChart`, `PieChart`,
  `ScatterChart`, `RadarChart`, `Gauge`, `Heatmap`, `ComboChart`, `StackedBarChart` e
  `Sparkline` em SVG puro, com tooltips, legenda, eixos e callbacks de interação;
  `ChartContainer` responsivo com loading/empty e export SVG/PNG.
- Formulários avançados: `FormControl`, `Form`/`useForm`, `CheckboxGroup`, `InputGroup`,
  `PinInput`, `MaskedInput`, `PhoneInput`, `DocumentInput`, `CurrencyInput`, `CronInput`,
  `FileInput`, `TreeSelect` e `Cascader`, com helpers de máscara/moeda/documento/telefone.
- Página/overlays: `Modal`, `Popconfirm`, `PageHeader`, `AvatarGroup`, `Indicator`,
  `AspectRatio`, `CopyButton`, `Kbd`, `Anchor`, `Image`, `QRCode` (encoder SVG puro),
  `Barcode`, `CodeBlock`, `JsonViewer`, `Carousel`, `ImageViewer`, `Tour` e
  `NotificationCenter`.
- Layout/utilitários: `AppShell`, `SplitPane`, `LoadingBar`, `VisuallyHidden` e
  `ErrorBoundary`.
- Produtividade: `FilterBuilder`, `PivotTable`, `GanttChart`, `Kanban` e `DashboardGrid`.
- Fundação visual: `Typography` (`Title`/`Text`/`Paragraph`/`Link`/`Code`/`Blockquote`),
  `Stack`, `Flex`, `Grid`, `Container` e `Result`.
- Layout/utilitários: `Affix`, `BackTop`, `FloatButton` e `Watermark`.
- Arquivos e imagens: `FileManager`, `OrgChart`, `ImageCropper`, `AvatarEditor` e
  `FileInput` múltiplo.
- Charts adicionais: `SankeyChart`, `ChordChart`, `SunburstChart`, `BoxPlotChart`,
  `CandlestickChart`, `WordCloud`, `StreamGraphChart` e `StepLineChart`.
- Editores visuais: `WorkflowDesigner` e `MindMap`.
- Produtividade/forms: `MultiSelect`, `Wizard`, `SplitButton` e `SpeedDial`.
- Analytics: `CalendarHeatmap`, `PolarAreaChart` e `ViolinPlot`.
- Datas: `DateTimeRangePicker`, `TimeRangePicker`, `MonthPicker` e `YearPicker`.
- Conteúdo: `Mentions`, `Markdown` seguro com `parseMarkdown` e `SignaturePad` em SVG.
- `PivotTable` com múltiplas medidas por célula (`measures`, `measureCells`, totais por medida)
  e drill-down (`onCellClick`/`onRowClick`/`renderCell`).
- `GanttChart` com edição (`editable`, `onTaskChange`) e criação de dependências
  (`onDependencyCreate`).
- Datas (2): `WeekPicker`, `QuarterPicker`, `MonthRangePicker`, `YearRangePicker` e
  `TimeZonePicker`.
- Edição/produtividade: `JsonEditor` (validação, formatar/minificar), `SortableList`
  (pointer/teclado) e `Masonry`.
- Charts adicionais: `WaffleChart`, `HexbinChart`, `RadialBarChart`, `ParallelCoordinates`,
  `MekkoChart` e `NetworkGraph`.
- Charts acessíveis: `ChartDataTable`, `showDataTable`/`animated` em Line/Bar/Pie e helpers
  `exportChartSvg`/`exportChartPng`/`serializeChartSvg`.
- DataGrid: tree data (`treeData`/`getRowChildren`), agrupamento server-side
  (`serverSideGrouping`/`groupedData`) e autofit (`withColumnAutofit`).
- Scheduler: drag/resize (`editable`), recorrência (`recurrence`/`expandRecurrence`) e
  timezone por evento.
- Kanban: swimlanes, WIP limits e virtualização de cards.
- FileManager: multi-seleção, upload com progresso e menu de contexto.
- Chat: threads, typing indicator e read receipts.
- GanttChart: caminho crítico (`showCriticalPath`), baselines (`showBaseline`) e recursos.
- RichTextEditor: tabelas, upload de imagem, links e sanitização de paste.
- Listas e comparação: `DiffViewer` (`diffLines`), `VirtualList` e `InfiniteScroll`.
- Novo catálogo de componentes: `SegmentedControl`, `Textarea`, `NumberInput`,
  `PasswordInput`, `Breadcrumbs`, `Divider`, `Stat`/`KpiCard`, `Timeline`,
  `Descriptions`, `Rating`, `LoadingOverlay`, `ConfirmDialog`, `Slider`, `RangeSlider`,
  `Drawer`, `Transfer`, `Tree`, `Dropzone`, `CommandPalette`, `ColorPicker`,
  `HoverCard`, `ScrollArea` e `Spoiler`.
- Datas: `disabledDates` (lista ou predicado) em Calendar/pickers e presets embutidos
  (`Today`, `Last 7 days`, `This month`) ou customizados em Datepicker, DatetimePicker e
  Rangepicker; helpers `createDatePresets` e `createRangePresets`; `timeZone` explícito em
  Calendar, Datepicker, Rangepicker, DatetimePicker e Timepicker (instante absoluto com
  exibição/parse no fuso), com `toTimeZone`/`fromTimeZone`/`getTimeZoneOffset`/
  `isValidTimeZone`; máscara de input e edição por teclado (`withInputMask`,
  `withKeyboardEdit`) nos pickers.
- `Select`: props `clearable`, `loading`, `nothingFoundMessage`, `searchable`,
  `searchPlaceholder`, `searchValue`, `defaultSearchValue`, `onSearchChange` e
  `filterOption`; estado inicial corretamente marcado como selecionado.
- `Autocomplete`: filtro local, busca assíncrona via `onSearchChange`, `filterOption`,
  `loading` e `nothingFoundMessage`.
- `OptionList` virtualizado (opt-in) para listas planas, com janela de renderização,
  overscan, scroll automático até o item ativo e ARIA `setsize`/`posinset`.
- `Select` e `Autocomplete` reindexam o `useListKeyManager` sobre a lista filtrada; a
  navegação por teclado opera apenas nas opções visíveis.
- Date adapter plugável em `@nebular-react/hooks`: `nativeDateAdapter`,
  `momentDateAdapter`, `createDayjsDateAdapter`, `createDateFnsDateAdapter`,
  `createTemporalDateAdapter`, `createDateAdapter`, `DateAdapterProvider` e hooks
  `useDateAdapter`, `useDateFns` e `useCalendar`.
- Virtualização de listas agrupadas no `OptionList`, com achatamento de grupos/opções,
  preservação de `role="group"` e índices ARIA.
- Guias de date adapter, virtualização do `OptionList` e type safety incremental.
- Storybook com `autodocs` em todas as stories, tabelas de props via
  `react-docgen-typescript`, TOC e metadados `component` nos arquivos de story.
- Documentação pública: primeiros passos, componentes/props, migração e release.
- Workflow de GitHub Pages para publicar o Storybook.
- Pipeline de release com Changesets, provenance npm e PR automático de versão.
- `strictNullChecks` ativado em todos os pacotes (`hooks`, `styles`, `ssr`, `core`, `next`)
  via `tsconfig.strict.json`, com `yarn typecheck:hooks`/`typecheck:styles`/
  `typecheck:ssr`/`typecheck:core`/`typecheck:next` integrados ao `yarn typecheck`.
- Testes de interação e acessibilidade com Testing Library, `user-event` e `jest-axe`.
- Cobertura real com `collectCoverageFrom` e thresholds globais.
- Validação de pacotes com `publint` e `@arethetypeswrong/cli`.
- Declarações CommonJS (`.d.cts`) em `lib-cjs`, além das declarações ESM em `lib`.

### Changed

- Tooling modernizado: Node 24, TypeScript 7 (`tsc`) + TS 6 (API do ESLint), ESLint 9,
  Jest 30, Storybook 10, Rollup 4.68.7, Mantine 9, Next 16; `@types/node` 24,
  `@testing-library/jest-dom` 8 e `@testing-library/user-event` 14.6.13.
- `@mantine/utils` removido; utilitários locais em `@nebular-react/styles`.
- Dependências de runtime explícitas e alinhadas via syncpack.
- Build ESM/CJS com `exports` map dual e subpaths `./lib/*`.
- `Option.value` agora é `string` obrigatório; `Chat` usa `ChatFile` tipado para anexos.
- `DataGrid` valida células antes de `onCellEdit`, aceita paste TSV (`onRangePaste`),
  preenchimento por arraste/teclado (`onRangeFill`) e `colSpan`/`rowSpan` estáveis.

### Fixed

- SSR de overlays e pickers (`Tooltip`, `Popover`, `Select`, `Datepicker`, etc.).
- Navegação do `Calendar` agora expõe `aria-label` contextual e passa no `jest-axe` com a
  navegação habilitada.
- Botões icon-only com nome acessível em `Window`, `Search` e `ChatForm`.
- `Toastr` anuncia toasts via `role="status"`/`alert` e `updateToast` não perde mais updates.
- `Sidebar` sincroniza `fixed`, `Layout` aplica `center`/footer fixo/`restoreScrollTop`,
  `Tags` separa o `input` do `listbox` (ARIA válida), respeita `disabled` e suporta autocomplete,
  `Search` dispara callbacks de abrir/fechar e aceita `value`/`onChange`.
- `DataGrid` e `Toastr` tiveram os casts `any` substituídos por tipos genéricos/eventos precisos,
  com teste de type safety em `TypeSafety.test.tsx`.
- `Select`, `Button`, `Accordion` e `PivotTable` também ficaram sem `any`: opções/valores,
  componente polimórfico, callbacks de foco e valores genéricos foram tipados; `Button` corrigiu
  `stopPropagation` no foco desabilitado.
- Cache Emotion duplicado.
- Hooks condicionais em `useOverlayTrigger`, `OptionComponent` e `Autocomplete`.
- Diversos bugs de posicionamento, classes e seleção inicial.
- Scripts ESM quebrados e build sem efeito.
