# @nebular-react/styles

## 1.0.0

### Major Changes

- Nebular React 1.0.0.

### Minor Changes

- 3ed57fd: Adiciona localização global: `NebularProvider` aceita `locale` (BCP 47) e `messages`,
  com catálogos embutidos `en-US`/`pt-BR`, hook `useNebularLocale()` e helper `t(key, fallback,
params)`. Componentes de data/hora e `NumberFormatter` usam o locale do provider quando
  não recebem `locale` explícito. Componentes com muitas strings passam a aceitar `labels`
  tipados e usam o catálogo como fallback (DataGrid, Chat, FileManager, Gantt, Scheduler,
  editores, seleção, overlays e utilitários).
- 32edbd6: Adiciona o catálogo de ícones leve com a condição `nebular-light`.
  Menu e Accordion passam a usar transições CSS. Select, Autocomplete e
  Timepicker usam operações específicas para opções e horários.

### Patch Changes

- 13ebe24: Adiciona ResponsiveFilterBar, FormErrorSummary, PermissionMatrix, AuditTrail e UploadQueue.
  Corrige a indicação visual de seleção do RadioGroup, a rolagem horizontal do DataGrid e
  do Kanban, o contraste de textos e os exemplos de formulários no Storybook. Corrige também
  a troca AM/PM no Timepicker e os atalhos de teclado de Tree e CommandPalette.

## 0.4.2

### Patch Changes

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

## 0.4.1

### Patch Changes

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
