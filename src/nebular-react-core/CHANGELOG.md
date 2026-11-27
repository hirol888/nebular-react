# @nebular-react/core

## 1.0.0

### Major Changes

- Nebular React 1.0.0.

### Minor Changes

- 169e894: Adiciona PropertyGrid, TemplateEditor, TimeSlotPicker, FormDesigner, DataMappingEditor,
  TranscriptViewer e ImageAnnotator. MediaPlayer expõe a referência ao elemento de mídia
  e um callback de posição para sincronizar controles externos.
- 02aa0d8: Adiciona `CodeEditor`, `MarkdownEditor`, `EmojiPicker`, `PictogramChart`, `BubbleChart` e
  `Dendrogram`, além de aprofundar componentes existentes:

  - `DataGrid`: undo/redo com histórico, export Excel (`.xls`), sorting/filtro server-side
    independentes e virtualização com altura variável (`getRowHeight`).
  - `Scheduler`: criação por arraste (`selectable`/`onRangeSelect`), resource lanes
    (`resources`/`resourceView`) e drag horizontal de eventos `allDay`.
  - `Kanban`: edição inline (`editable`/`onCardEdit`/`renderCardEditor`), checklist com
    progresso e labels/assignees.
  - `FileManager`: drag-and-drop entre pastas (`draggable`/`onMove`), sorting
    (`sortBy`/`sortDirection`) e preview lateral (`preview`/`renderPreview`).
  - `Chat`: busca com destaque, edição/exclusão com confirmação, reações e virtualização.
  - `GanttChart`: resource lanes, arraste de progresso e export SVG/PNG.
  - `RichTextEditor`: mentions, code inline/block e find/replace.
  - Charts: data table acessível, export SVG/PNG e animação com `prefers-reduced-motion` em
    todas as famílias, incluindo os novos `PictogramChart`, `BubbleChart` e `Dendrogram`.

  Adiciona também o pacote de componentes utilitários:

  - `Chip`/`ChipGroup`: seleção única ou múltipla, variantes, status, label/description/error e
    orientação, com semântica de checkbox.
  - `Fieldset`: agrupamento com `legend`, descrição, variante `filled`, borda opcional e estado
    desabilitado.
  - `NativeSelect`: wrapper acessível do `<select>` nativo com `data`, `onChange(value, event)`,
    placeholder, erro, descrição e tamanhos.
  - `SwitchGroup`: grupo de switches controlado ou não controlado com arrays de valores e layout
    horizontal/vertical.
  - `FileButton`: botão de upload baseado em input oculto, com `multiple`, `accept`, `capture`,
    `reset` e callback `File[] | null`.
  - `ThemeIcon`: ícone temático com `size`, `radius`, `variant` e `status`/`color`.
  - `Overlay`: camada de bloqueio com opacidade, cor, blur, `zIndex`, modo fixo e centralização.
  - `NumberFormatter`: formatação via `Intl.NumberFormat` com prefixo/sufixo/fallback e helper
    `formatNumber`.
  - `PasswordStrength`: medidor de força com score 0–4, labels customizáveis e helper
    `getPasswordStrength`.
  - `ColorSwatch`: amostra de cor selecionável, com estado `checked`, borda e suporte a
    transparência.

  O `RadioGroup` existente foi estendido com `data`, `label`, `description`, `error`, `required`,
  `orientation` e `name`, mantendo a API baseada em filhos (`Radio`).

- 3ed57fd: Adiciona localização global: `NebularProvider` aceita `locale` (BCP 47) e `messages`,
  com catálogos embutidos `en-US`/`pt-BR`, hook `useNebularLocale()` e helper `t(key, fallback,
params)`. Componentes de data/hora e `NumberFormatter` usam o locale do provider quando
  não recebem `locale` explícito. Componentes com muitas strings passam a aceitar `labels`
  tipados e usam o catálogo como fallback (DataGrid, Chat, FileManager, Gantt, Scheduler,
  editores, seleção, overlays e utilitários).
- 0327613: Adiciona `RingProgress` e amplia componentes existentes: `Button` com `loading`/`loadingText`,
  `Tabset` com abas fecháveis e `keepMounted`, `Tree` com checkboxes em cascata,
  `checkStrictly` e carregamento assíncrono (`loadData`), e `CommandPalette` com busca
  assíncrona (`onSearch`/`loading`), grupos e ações recentes. `TreeTable` ganha checkboxes
  em cascata e ordenação por coluna, `DataGrid` aceita `density`, e `LineChart`/`AreaChart`/
  `BarChart` suportam legenda interativa (`interactiveLegend`); `LineChart`/`AreaChart`
  também ganham zoom por arraste (`zoomable`/`onZoomChange`).
- 81edbe6: Adiciona LogViewer, DateField e MatrixField. O CronInput passa a aceitar um identificador
  de campo para integração com rótulos e resumos de validação.
- 3a9a3a2: `PhoneInput` passa a usar `libphonenumber-js` para formatação e validação global: suporta
  qualquer país ISO 3166-1 alpha-2, `country`/`defaultCountry`, AsYouType,
  `outputFormat` (`national`/`international`/`e164`) e `onChangeMeta` com país, formatos
  national/international/E.164 e flags `valid`/`possible`. `formatPhoneNumber` e
  `parsePhoneNumber` continuam disponíveis; BR/US preservam o progressivo legado.
- aec5df2: Adiciona RepeatableFieldset, FilePreview, VersionHistory, ImageComparison, DockLayout,
  MediaPlayer e LocationPicker. O FilterBuilder passa a aceitar grupos aninhados de forma opcional.
- 313d02a: Adiciona InlineEdit, Toolbar, OverflowList, BulkActionBar, ImportPreview, ConflictResolutionDialog,
  SchemaForm, RecurrenceEditor, Combobox, TableOfContents e ChatSources. Inclui um modo visual
  opcional no CronInput e adiciona validação, painel de propriedades e histórico ao WorkflowDesigner.
- 32edbd6: Adiciona RecordPicker, AvailabilityEditor, DecisionTableEditor, ChoiceCardGroup,
  IconPicker, OnboardingChecklist e TraceWaterfall. DataGrid ganha edição em lote,
  e FilePreview aceita miniaturas, sumário e busca de PDF via adaptador.
- 13ebe24: Adiciona ResponsiveFilterBar, FormErrorSummary, PermissionMatrix, AuditTrail e UploadQueue.
  Corrige a indicação visual de seleção do RadioGroup, a rolagem horizontal do DataGrid e
  do Kanban, o contraste de textos e os exemplos de formulários no Storybook. Corrige também
  a troca AM/PM no Timepicker e os atalhos de teclado de Tree e CommandPalette.
- bff2b1e: Amplia a família de seleção: `Select`/`Autocomplete` aceitam `renderOption`;
  `MultiSelect` ganha grupos, busca assíncrona (`onSearchChange`/`loading`),
  virtualização e `renderOption`; `TreeSelect` ganha `checkable` com cascata,
  `checkStrictly` e `loadData`; `Cascader` ganha `searchable` por caminho e `loadData`
  para níveis remotos.

### Patch Changes

- 32edbd6: Adiciona o catálogo de ícones leve com a condição `nebular-light`.
  Menu e Accordion passam a usar transições CSS. Select, Autocomplete e
  Timepicker usam operações específicas para opções e horários.
- Updated dependencies [3ed57fd]
- Updated dependencies [32edbd6]
- Updated dependencies
- Updated dependencies [13ebe24]
  - @nebular-react/styles@1.0.0
  - @nebular-react/hooks@1.0.0

## 0.6.0

### Minor Changes

- 9afd3f3: Publica a documentação com Autodocs, os novos componentes (`DataGrid`, `Table`,
  `Pagination`, `Skeleton`, `EmptyState`), busca assíncrona/virtualização em
  Select/Autocomplete, filtros por coluna, virtualização de linhas, resize, reorder,
  visibilidade de colunas, expansão de linhas e exportação CSV no DataGrid,
  agrupamento, edição de linhas, modo server-side, column pinning, headers multi-nível,
  agregações de rodapé e por grupo, operadores de filtro, reordenação de linhas, menu de coluna, agrupamento multi-nível, edição por célula e
  virtualização de colunas, saved views, filtros por range e seleção de intervalo com cópia TSV,
  `disabledDates`, presets, `timeZone`, máscara de input e edição por teclado nos componentes de data, adapters de data
  (dayjs/date-fns/Temporal), o catálogo de componentes de formulário, exibição, overlays e
  dados (SegmentedControl, Textarea, NumberInput, PasswordInput, FormControl, Form, useForm,
  CheckboxGroup, InputGroup, PinInput, MaskedInput, PhoneInput, DocumentInput, CurrencyInput,
  CronInput, FileInput, TreeSelect, Cascader, Modal, Popconfirm, PageHeader, AvatarGroup,
  Indicator, AspectRatio, CopyButton, Kbd, Anchor, Image, QRCode, Barcode, CodeBlock, JsonViewer, DiffViewer, VirtualList, InfiniteScroll,
  Carousel, ImageViewer, Tour, NotificationCenter, FilterBuilder, PivotTable, GanttChart, Kanban, DashboardGrid,
  AppShell, SplitPane, LoadingBar, VisuallyHidden, ErrorBoundary, Breadcrumbs, Divider,
  Stat, Timeline, Descriptions, Rating, LoadingOverlay, ConfirmDialog, Slider, RangeSlider,
  Drawer, Transfer, Tree, TreeTable, Scheduler, RichTextEditor, LineChart, AreaChart, BarChart,
  DonutChart, ComboChart, StackedBarChart, FunnelChart, TreeMapChart, WaterfallChart, BulletChart, PieChart, ScatterChart, RadarChart, Gauge, Heatmap,
  Sparkline, ChartContainer, Dropzone, CommandPalette, ColorPicker,
  HoverCard, ScrollArea e Spoiler) e o pipeline de release com Changesets e provenance.
  Inclui também a fundação visual (Typography, Stack, Flex, Grid, Container, Result), utilitários
  (Affix, BackTop, FloatButton, Watermark), arquivos/imagens (FileManager, OrgChart, ImageCropper,
  AvatarEditor, FileInput múltiplo), conteúdo (Mentions, Markdown, SignaturePad) e charts
  adicionais (Sankey, Chord, Sunburst, BoxPlot, Candlestick, WordCloud, StreamGraph, StepLine),
  editores visuais (WorkflowDesigner, MindMap), Search controlado e Tags com autocomplete,
  MultiSelect, Wizard, SplitButton, SpeedDial, CalendarHeatmap, PolarAreaChart e ViolinPlot.
  Adiciona também `DateTimeRangePicker`, `TimeRangePicker`, `MonthPicker` e `YearPicker`, e
  fecha a dívida de tipos em Actions, Badge, ButtonGroup, Card, Chat, OptionList e LineChart.

  Rodada final: `WeekPicker`, `QuarterPicker`, `MonthRangePicker`, `YearRangePicker`,
  `TimeZonePicker`, `JsonEditor`, `SortableList`, `Masonry`, `WaffleChart`, `HexbinChart`,
  `RadialBarChart`, `ParallelCoordinates`, `MekkoChart`, `NetworkGraph`, `ChartDataTable` e
  helpers de export SVG/PNG. Também aprofunda componentes existentes: DataGrid (tree data,
  server grouping, autofit), Scheduler (drag/resize, recorrência, timezone por evento), Kanban
  (swimlanes, WIP, virtualização), FileManager (multi-seleção, upload, contexto), Chat (threads,
  typing, recibos), GanttChart (caminho crítico, baselines, recursos), RichTextEditor (tabelas,
  imagens, links, sanitização) e charts (data table acessível, animações, export).

### Patch Changes

- Updated dependencies [9afd3f3]
  - @nebular-react/hooks@0.6.0
  - @nebular-react/styles@0.4.2

## 0.5.0

### Minor Changes

- 9afd3f3: Publica a documentação com Autodocs, os novos componentes (`DataGrid`, `Table`,
  `Pagination`, `Skeleton`, `EmptyState`), busca assíncrona/virtualização em
  Select/Autocomplete, filtros por coluna, virtualização de linhas, resize, reorder,
  visibilidade de colunas, expansão de linhas e exportação CSV no DataGrid,
  agrupamento, edição de linhas, modo server-side, column pinning, headers multi-nível,
  agregações de rodapé e por grupo, operadores de filtro, reordenação de linhas, menu de coluna, agrupamento multi-nível, edição por célula e
  virtualização de colunas, saved views, filtros por range e seleção de intervalo com cópia TSV,
  `disabledDates`, presets, `timeZone`, máscara de input e edição por teclado nos componentes de data, adapters de data
  (dayjs/date-fns/Temporal), o catálogo de componentes de formulário, exibição, overlays e
  dados (SegmentedControl, Textarea, NumberInput, PasswordInput, FormControl, Form, useForm,
  CheckboxGroup, InputGroup, PinInput, MaskedInput, PhoneInput, DocumentInput, CurrencyInput,
  CronInput, FileInput, TreeSelect, Cascader, Modal, Popconfirm, PageHeader, AvatarGroup,
  Indicator, AspectRatio, CopyButton, Kbd, Anchor, Image, QRCode, Barcode, CodeBlock, JsonViewer, DiffViewer, VirtualList, InfiniteScroll,
  Carousel, ImageViewer, Tour, NotificationCenter, FilterBuilder, PivotTable, GanttChart, Kanban, DashboardGrid,
  AppShell, SplitPane, LoadingBar, VisuallyHidden, ErrorBoundary, Breadcrumbs, Divider,
  Stat, Timeline, Descriptions, Rating, LoadingOverlay, ConfirmDialog, Slider, RangeSlider,
  Drawer, Transfer, Tree, TreeTable, Scheduler, RichTextEditor, LineChart, AreaChart, BarChart,
  DonutChart, ComboChart, StackedBarChart, FunnelChart, TreeMapChart, WaterfallChart, BulletChart, PieChart, ScatterChart, RadarChart, Gauge, Heatmap,
  Sparkline, ChartContainer, Dropzone, CommandPalette, ColorPicker,
  HoverCard, ScrollArea e Spoiler) e o pipeline de release com Changesets e provenance.
  Inclui também a fundação visual (Typography, Stack, Flex, Grid, Container, Result), utilitários
  (Affix, BackTop, FloatButton, Watermark), arquivos/imagens (FileManager, OrgChart, ImageCropper,
  AvatarEditor, FileInput múltiplo), conteúdo (Mentions, Markdown, SignaturePad) e charts
  adicionais (Sankey, Chord, Sunburst, BoxPlot, Candlestick, WordCloud, StreamGraph, StepLine),
  editores visuais (WorkflowDesigner, MindMap), Search controlado e Tags com autocomplete,
  MultiSelect, Wizard, SplitButton, SpeedDial, CalendarHeatmap, PolarAreaChart e ViolinPlot.
  Adiciona também `DateTimeRangePicker`, `TimeRangePicker`, `MonthPicker` e `YearPicker`, e
  fecha a dívida de tipos em Actions, Badge, ButtonGroup, Card, Chat, OptionList e LineChart.

  Rodada final: `WeekPicker`, `QuarterPicker`, `MonthRangePicker`, `YearRangePicker`,
  `TimeZonePicker`, `JsonEditor`, `SortableList`, `Masonry`, `WaffleChart`, `HexbinChart`,
  `RadialBarChart`, `ParallelCoordinates`, `MekkoChart`, `NetworkGraph`, `ChartDataTable` e
  helpers de export SVG/PNG. Também aprofunda componentes existentes: DataGrid (tree data,
  server grouping, autofit), Scheduler (drag/resize, recorrência, timezone por evento), Kanban
  (swimlanes, WIP, virtualização), FileManager (multi-seleção, upload, contexto), Chat (threads,
  typing, recibos), GanttChart (caminho crítico, baselines, recursos), RichTextEditor (tabelas,
  imagens, links, sanitização) e charts (data table acessível, animações, export).

### Patch Changes

- Updated dependencies [9afd3f3]
  - @nebular-react/hooks@0.5.0
  - @nebular-react/styles@0.4.1
