# Componentes e props

## Catálogo

| Categoria   | Componentes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Estrutura   | `Card`, `Layout`, `Sidebar`, `List`, `Table`, `Tabset`, `Accordion`, `Stepper`, `Pagination`, `Breadcrumbs`, `Divider`, `ScrollArea`, `Spoiler`, `AspectRatio`, `PageHeader`, `Kbd`, `CopyButton`, `Anchor`, `Carousel`, `AppShell`, `SplitPane`, `Desktop`, `ErrorBoundary`, `VisuallyHidden`, `Typography`, `Stack`, `Flex`, `Grid`, `Container`, `Affix`, `BackTop`, `FloatButton`, `Watermark`, `SortableList`, `Masonry`, `Fieldset`, `ThemeIcon`                                                                                                                                                                                                                                                                                                                                                                                         |
| Dados       | `DataGrid`, `PivotTable`, `TreeTable`, `Scheduler`, `GanttChart`, `Charts` (`Line`/`Area`/`Bar`/`Donut`/`Combo`/`Stacked`/`Funnel`/`TreeMap`/`Waterfall`/`Bullet`/`Sankey`/`Chord`/`Sunburst`/`BoxPlot`/`Candlestick`/`WordCloud`/`StreamGraph`/`StepLine`/`PolarArea`/`Violin`/`Waffle`/`Hexbin`/`RadialBar`/`ParallelCoordinates`/`Mekko`/`Network`/`Pictogram`/`Bubble`/`Dendrogram`/`Pie`/`Scatter`/`Radar`/`Gauge`/`Heatmap`/`Sparkline`), `ChartDataTable`, `Badge`, `User`, `AvatarGroup`, `Indicator`, `Icon`, `ThemeIcon`, `Chat`, `Stat`/`KpiCard`, `Timeline`, `Descriptions`, `Tree`, `Transfer`, `Image`, `QRCode`, `Barcode`, `CodeBlock`, `JsonViewer`, `JsonEditor`, `DiffViewer`, `Markdown`, `VirtualList`, `InfiniteScroll`, `Kanban`, `DashboardGrid`, `OrgChart`, `FileManager`, `CalendarHeatmap`, `NumberFormatter`, `ColorSwatch` |
| Formulários | `Input`, `Checkbox`, `Radio`, `Toggle`, `Select`, `Autocomplete`, `Tags`, `Search`, `Button`, `ButtonGroup`, `Actions`, `SegmentedControl`, `MultiSelect`, `Chip`, `ChipGroup`, `SwitchGroup`, `FormControl`, `Form`, `Wizard`, `CheckboxGroup`, `InputGroup`, `PinInput`, `PhoneInput`, `DocumentInput`, `MaskedInput`, `CurrencyInput`, `FileInput`, `FileButton`, `CronInput`, `Textarea`, `NumberInput`, `PasswordInput`, `PasswordStrength`, `NativeSelect`, `Rating`, `Slider`, `RangeSlider`, `ColorPicker`, `Dropzone`, `RichTextEditor`, `CodeEditor`, `MarkdownEditor`, `EmojiPicker`, `TreeSelect`, `Cascader`, `FilterBuilder`, `ImageCropper`, `AvatarEditor`, `Mentions`, `SignaturePad`                                                                                                                                                                                           |
| Datas       | `Calendar`, `Datepicker`, `Rangepicker`, `DatetimePicker`, `DateTimeRangePicker`, `Timepicker`, `TimeRangePicker`, `MonthPicker`, `YearPicker`, `WeekPicker`, `QuarterPicker`, `MonthRangePicker`, `YearRangePicker`, `TimeZonePicker`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Feedback    | `Alert`, `Toastr`, `Loader`, `LoadingBar`, `ProgressBar`, `RingProgress`, `Skeleton`, `EmptyState`, `LoadingOverlay`, `Result`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Overlays    | `Tooltip`, `Popover`, `Menu`, `ContextMenu`, `Dialog`, `Window`, `Portal`, `Drawer`, `ConfirmDialog`, `CommandPalette`, `HoverCard`, `Modal`, `Popconfirm`, `ImageViewer`, `Tour`, `NotificationCenter`, `Overlay`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |

As props de cada componente estão na página **Docs** do Storybook, gerada por
Autodocs a partir das interfaces TypeScript.

## Convenções comuns

Todos os componentes que aceitam estilos estendem `DefaultProps`:

```ts
interface DefaultProps<StylesNames, StylesParams> {
  className?: string;
  style?: React.CSSProperties;
  classNames?: Partial<Record<StylesNames, string>>;
  styles?: Partial<Record<StylesNames, CSSObject>>;
  unstyled?: boolean;
}
```

- `classNames`/`styles` permitem sobrescrever partes internas sem CSS global.
- `unstyled` remove os estilos padrão e mantém apenas a estrutura/comportamento.
- Componentes polimórficos aceitam `component` (ex.: `<Button component="a" href="..." />`).

## Componentes de composição

| Componente | Contrato principal |
| --- | --- |
| `InlineEdit` | `value` ou `defaultValue` controla o texto confirmado. `validate` pode mostrar um erro no campo e `onCommit` pode ser assíncrono. Se a gravação falhar, o rascunho fica disponível para nova tentativa. `Escape` cancela. Em texto multilinha, `Ctrl+Enter` ou `Cmd+Enter` confirma. |
| `Toolbar` | Envolva cada controle em `Toolbar.Item` e use `Toolbar.Separator` para dividir grupos. Os controles devem encaminhar as props de foco à sua raiz. Use o nome acessível e `orientation` conforme o contexto. |
| `OverflowList` | Recebe `items`, `getItemKey` e `renderItem`. Mantém os itens que cabem na linha e reúne os demais em uma área expansível. Para preservar estado entre mudanças de largura, mantenha o estado do item no consumidor. |
| `BulkActionBar` | Recebe seleção e ações por props. `onSelectPage` e `onSelectAllMatching` representam escopos diferentes. O consumidor decide como gerenciar a seleção e executar `onAction`. |
| `ImportPreview` | Recebe colunas e linhas já lidas, campos de destino e `mapping` controlado. `onConfirm` entrega o mapeamento e o lote depois da revisão dos erros fornecidos. |
| `ConflictResolutionDialog` | Recebe as duas versões por campo e mantém decisões em `choices`. `onResolve` devolve os valores escolhidos para que o consumidor grave a nova versão. |
| `SchemaForm` | Renderiza campos declarados em `fields` com valores, regras de visibilidade e validação informadas pelo consumidor. Use um renderizador próprio para controles específicos. |
| `RecurrenceEditor` | Edita um `SchedulerRecurrence` controlado ou `null`. Aceita início, fuso e quantidade de ocorrências para a prévia. |
| `Combobox` | Permite controlar consulta e seleção e oferece `renderInput` e `renderOption` para personalizar o campo e as opções. |
| `TableOfContents` | Recebe os IDs e rótulos das seções, acompanha a leitura e aceita um contêiner de rolagem via `scrollContainerRef`. |
| `ChatSources` | Mostra referências numeradas com título, link e trecho opcional. Aceita expansão controlada e callback para abrir a fonte em uma interface do consumidor. |

O `CronInput` oferece edição visual com `withVisualEditor`. O campo de expressão continua disponível para padrões personalizados. Os callbacks `validate` e `renderPreview` permitem usar o dialeto e o cálculo de ocorrências da aplicação.

No `WorkflowDesigner`, `validateConnection` pode devolver o motivo de uma ligação inválida. `renderNodeProperties` configura o painel de propriedades. Para histórico, use `withHistory` com `onGraphChange` e mantenha `nodes` e `edges` sincronizados com o grafo recebido.

## Arquivos, conteúdo e áreas de trabalho

| Componente | Contrato principal |
| --- | --- |
| `RepeatableFieldset` | Mantém uma lista controlada de grupos editáveis. Informe uma chave estável por item e use `renderItem` para compor os campos. Adição, remoção e reordenação podem ser operadas pelo teclado. |
| `FilePreview` | Exibe imagens e texto. Passe `pdf={{ pageCount, renderPage }}` para usar um renderizador de PDF com controles de página e zoom. Use `renderers` para outros formatos e `FileManager.renderPreview` para integrar a prévia ao gerenciador. |
| `VersionHistory` | Recebe revisões em ordem de exibição, da mais recente para a mais antiga. Compare duas versões com o `DiffViewer` ou com `renderComparison`. Se habilitar `onRestore`, o consumidor recebe a revisão selecionada em Depois. |
| `ImageComparison` | Exibe duas imagens alinhadas com um divisor que pode ser movido por mouse, toque e teclado. Forneça texto alternativo para cada imagem. |
| `DockLayout` | Recebe um layout serializável de grupos de abas e divisões, além do registro com o conteúdo dos painéis. A aplicação pode persistir o layout retornado por `onLayoutChange`. |
| `MediaPlayer` | Reproduz fontes de áudio e vídeo com controles Nebular e suporte a faixas de legenda. |
| `LocationPicker` | Recebe e devolve latitude e longitude. `renderMap` permite incorporar o mapa do consumidor. `searchLocations` recebe o texto e um `AbortSignal` para cancelar buscas substituídas. |

O `FilterBuilder` aceita grupos aninhados com `group`, `defaultGroup` ou `nested`. Cada grupo pode combinar condições com E ou OU. Use `onGroupChange` para persistir a árvore e `applyFilterBuilderGroup` para aplicá-la a dados locais. A API de regras planas continua disponível.

## Edição e visualização de conteúdo

| Componente | Contrato principal |
| --- | --- |
| `PropertyGrid` | Agrupa descritores de campo por categoria e edita os valores com `value` ou `defaultValue`. Informe `readOnly` ou `defaultValue` no descritor para controlar edição e restauração. |
| `TemplateEditor` | Edita texto com variáveis `{{caminho}}`. Informe `variables` para inserir tokens e mostrar os valores de exemplo. A prévia usa texto literal e indica as variáveis desconhecidas. |
| `TimeSlotPicker` | Recebe horários com ID, início e fim em instantes absolutos. `value` é o ID selecionado e `onChange` recebe o horário original. `timeZone` controla a exibição e `onDayChange` devolve a data local em ISO. |
| `FormDesigner` | Adiciona, remove e reordena campos. O histórico de edição pode ser mantido pelo consumidor com `value` e `onChange`. Use `toSchemaFormFields` para converter a definição serializável em campos de `SchemaForm`. |
| `DataMappingEditor` | Liga caminhos de origem e destino, ou atribui constantes de texto. Use `sample` para prévia e `applyDataMapping` para criar um objeto de destino com os vínculos configurados. Caminhos usam pontos entre segmentos. |
| `TranscriptViewer` | Recebe trechos com tempos em segundos. `currentTime` destaca o trecho atual, e `onSeek` recebe o início selecionado. Use `MediaPlayer.mediaRef` e `onPlaybackTimeChange` para sincronizar o player. |
| `ImageAnnotator` | Edita pontos e retângulos com comentários. Posições e dimensões são frações da imagem de 0 a 1. A lista e os campos de geometria permitem editar uma marcação por teclado. |

## Tamanho, status, forma e aparência

A maioria dos controles compartilha os mesmos eixos:

```tsx
<Button
  size="medium" // tiny | small | medium | large | giant
  status="primary" // basic | primary | success | info | warning | danger | control
  shape="rectangle" // rectangle | semiround | round
  appearance="filled" // filled | outline | ghost | hero
/>
```

## Controlado e não controlado

| Componente             | Valor                         | Padrão                                      | Callback                                  |
| ---------------------- | ----------------------------- | ------------------------------------------- | ----------------------------------------- |
| `Select`               | `selected`                    | `defaultSelected`                           | `onSelect`                                |
| `Autocomplete`         | `value`                       | `defaultValue`                              | `onChange`                                |
| `DataGrid` (página)    | `page`                        | `defaultPage`                               | `onPageChange`                            |
| `DataGrid` (ordenação) | `sortKey`/`sortDirection`     | `defaultSortKey`                            | `onSortChange`                            |
| `DataGrid` (seleção)   | `selectedRowIds`              | `defaultSelectedRowIds`                     | `onSelectionChange`                       |
| `Pagination`           | `page`                        | `defaultPage`                               | `onChange`                                |
| `Accordion`            | `activeItems`                 | `defaultActiveItems`                        | `onChange`                                |
| `Menu`                 | `selectedItem`/`expandedItem` | `defaultSelectedItem`/`defaultExpandedItem` | `onSelectItemChange`/`onExpandItemChange` |
| `Tabset`               | `activeTabIndex`              | —                                           | `onTabChange`                             |
| `Tags`                 | `value`                       | `defaultValue`                              | `onChange`                                |

Use a versão controlada quando o estado precisar viver fora do componente.

## Localização e i18n

```tsx
<NebularProvider locale="pt-BR" messages={{ 'dataGrid.undo': 'Voltar' }}>
  <App />
</NebularProvider>
```

- `locale` aceita BCP 47 (`pt-BR`, `en-US`, ...). O padrão é `en-US`.
- Catálogos embutidos: `en-US` e `pt-BR`; `messages` sobrescreve chaves pontuais e é
  mesclado sobre o catálogo do locale.
- `useNebularLocale()` retorna `{ locale, messages, t }`; `t('dataGrid.undo', 'Undo')`
  interpola parâmetros (`t('pagination.page', 'Page {page}', { page })`).
- Calendários, pickers, `DateField`, `TimeSlotPicker`, `Scheduler` e `GanttChart` usam
  o locale do provider quando `locale` não é passado explicitamente.
- `NumberFormatter` usa o locale do provider quando `locale` não é informado.
- Componentes com muitas strings expõem `labels` tipados, que têm precedência sobre o
  catálogo.
- `dir="rtl"` é aplicado pelo provider; overlays e componentes de layout usam a direção
  para posicionamento.

## Select e Autocomplete

```tsx
<Select
  options={options}
  searchable
  clearable
  loading={isLoading}
  nothingFoundMessage="Nenhum resultado"
  onSearchChange={(query) => fetchOptions(query)}
  onSelect={setSelected}
/>
```

- `searchable` habilita o campo de busca no dropdown.
- Com `onSearchChange`, o componente delega a busca ao consumidor (assíncrona) e não
  filtra localmente.
- Sem `onSearchChange`, o filtro local usa `filterOption`.
- `virtualized` e `virtualizedMaxHeight` habilitam virtualização (listas planas e
  agrupadas).
- A navegação por teclado opera apenas sobre as opções visíveis/filtradas.
- `renderOption(option)` permite conteúdo rico (avatar, descrição, badge) mantendo o
  `label` textual para busca, nome acessível e valor exibido no trigger.

## DataGrid

```tsx
<DataGrid
  data={users}
  columns={[
    { key: 'name', title: 'Nome', sortable: true },
    { key: 'email', title: 'E-mail' },
    {
      key: 'status',
      title: 'Status',
      render: (user) => <Badge text={user.status} />
    }
  ]}
  pageSize={10}
  withSelection
  onSelectionChange={setSelectedIds}
  caption="Usuários"
/>
```

Recursos atuais: ordenação por coluna, filtros por coluna, paginação, seleção
controlada/não controlada, seleção da página com estado indeterminado, `emptyState`,
`caption`, `ariaLabel`, virtualização de linhas e resize/reorder de colunas.

- `density`: `compact`, `comfortable` (padrão) ou `spacious` ajusta o padding das células e
  o tamanho da fonte do cabeçalho sem alterar a estrutura da tabela.

- Tree data: `treeData`, `getRowChildren`, `treeColumnKey`, `expandedRowKeys` e `onExpandedRowKeysChange`.
- Server grouping: `serverSideGrouping`, `groupedData` (`DataGridServerGroup`) e `aggregates`, sem recálculo no cliente.
- Autofit: `withColumnAutofit`, `autofitSampleSize`, `minColumnWidth` e `maxColumnWidth`.

### Filtros por coluna

```tsx
<DataGrid
  data={users}
  columns={[
    { key: 'name', title: 'Nome', sortable: true, filterable: true },
    { key: 'email', title: 'E-mail', filterable: true },
    { key: 'status', title: 'Status', filterValue: (user) => user.status }
  ]}
  withColumnFilters
  onFilterChange={setFilters}
/>
```

- `column.filterable` habilita o campo de busca da coluna.
- `column.filterValue` permite filtrar por um valor derivado.
- `filterValues`/`defaultFilterValues` controlam os filtros; `onFilterChange` recebe
  `Record<string, string>`.
- O filtro é case-insensitive e por substring; ao filtrar, a página volta para 1.

### Virtualização de linhas

```tsx
<DataGrid
  data={manyRows}
  columns={columns}
  pageSize={500}
  withPagination={false}
  virtualized
  virtualizedRowHeight={44}
  virtualizedMaxHeight={420}
  overscan={3}
/>
```

- `virtualized` renderiza apenas a janela visível da página atual.
- `virtualizedRowHeight` deve corresponder à altura real das linhas.
- `virtualizedMaxHeight` define a altura do viewport com scroll.
- O header fica sticky durante o scroll.

### Redimensionamento de colunas

```tsx
<DataGrid
  data={rows}
  columns={columns}
  withColumnResize
  columnWidths={{ name: 220, email: 260 }}
  onColumnWidthChange={setWidths}
  minColumnWidth={80}
/>
```

- `withColumnResize` habilita os handles de resize no header.
- `columnWidths`/`defaultColumnWidths` controlam larguras por `column.key`.
- `onColumnWidthChange` recebe o mapa atualizado.
- `minColumnWidth` é o mínimo global; `column.minWidth`/`column.maxWidth` refinam
  por coluna.
- Mouse: arraste o handle; teclado: foque o handle e use `ArrowLeft`/`ArrowRight`
  (`Shift` move 25px).

### Reordenação de colunas

```tsx
<DataGrid
  data={rows}
  columns={columns}
  withColumnReorder
  columnOrder={order}
  onColumnOrderChange={setOrder}
/>
```

- Arraste o handle de reordenação no header.
- Teclado: foque o handle e use `Alt+ArrowLeft`/`Alt+ArrowRight`.
- `columnOrder`/`defaultColumnOrder` usam `column.key` e controlam a ordem.
- Colunas novas são anexadas ao final quando não estão na ordem.

### Visibilidade de colunas

```tsx
<DataGrid
  data={rows}
  columns={columns}
  withColumnVisibility
  hiddenColumnKeys={hidden}
  onHiddenColumnsChange={setHidden}
/>
```

- O botão **Columns** abre a lista de colunas.
- `hiddenColumnKeys`/`defaultHiddenColumnKeys` controlam a visibilidade por `column.key`.
- `column.hideable={false}` impede ocultar uma coluna.
- A última coluna visível não pode ser ocultada.

### Expansão de linhas

```tsx
<DataGrid
  data={rows}
  columns={columns}
  withRowExpansion
  renderRowExpansion={(row) => <UserDetails user={row} />}
/>
```

- `expandedRowIds`/`defaultExpandedRowIds`/`onExpandedRowsChange` controlam o estado.
- A coluna de expansão é adicionada automaticamente.
- A expansão desativa a virtualização, pois as linhas passam a ter altura variável.

### Exportação CSV

```tsx
<DataGrid
  data={rows}
  columns={columns}
  withExport
  exportFileName="users.csv"
  exportScope="filtered"
  onExport={(csv, fileName) => upload(csv, fileName)}
/>
```

- `exportScope`: `filtered` (padrão) ou `page`.
- `column.exportValue`/`column.exportTitle`/`column.exportable` customizam o CSV.
- Sem `onExport`, o componente baixa o arquivo via Blob.
- `createDataGridCsv(data, columns, options)` está disponível para uso direto.

### Agrupamento

```tsx
<DataGrid
  data={rows}
  columns={columns}
  groupBy="role"
  groupLabel={(key, rows) => `${key} (${rows.length})`}
  collapsibleGroups
  expandedGroupKeys={expandedGroups}
  onExpandedGroupsChange={setExpandedGroups}
/>
```

- `groupBy` aceita uma chave de coluna, um array de chaves (agrupamento aninhado, um nível
  por chave, com cabeçalhos `Título: valor`) ou `(row) => string`.
- `groupLabel`/`renderGroupHeader` customizam o cabeçalho do grupo e recebem a chave
  completa (ex.: `Alpha / Dev`) e as linhas do subtree.
- `collapsibleGroups` habilita expandir/colapsar; `expandedGroupKeys`/`defaultExpandedGroupKeys` controlam o estado.
- Agrupamento e virtualização são mutuamente exclusivos (linhas de grupo quebram a altura fixa).

### Edição de linhas

```tsx
<DataGrid
  data={rows}
  columns={columns}
  withRowEditing
  onRowEdit={(row, changes) => updateRow(row.id, changes)}
/>
```

- `editingRowId`/`defaultEditingRowId`/`onEditingRowChange` controlam a linha em edição.
- `column.editable={false}` remove a coluna do editor.
- `renderRowEditor(row, onSave, onCancel)` substitui o editor padrão.
- `onRowEdit` recebe somente os campos alterados.
- Edição e virtualização são mutuamente exclusivas.

### Server-side

```tsx
<DataGrid
  data={currentPageRows}
  columns={columns}
  serverSide
  totalRows={total}
  page={page}
  pageSize={20}
  onPageChange={setPage}
  sortKey={sortKey}
  sortDirection={sortDirection}
  onSortChange={setSort}
  filterValues={filters}
  onFilterChange={setFilters}
  loading={loading}
/>
```

- `serverSide` desativa paginação, ordenação e filtro locais.
- `serverSideSorting`/`serverSideFiltering` aplicam o modo apenas a ordenação/filtro.
- `data` deve conter apenas a página atual.
- `totalRows` define o total de páginas.
- `loading` mostra o overlay de carregamento.
- Use `page`, `sortKey`/`sortDirection` e `filterValues` controlados para refletir o estado do servidor.
- Exportação CSV em server-side cobre apenas os dados carregados; use `onExport` para exportação completa no servidor.

### Column pinning

```tsx
<DataGrid
  data={rows}
  columns={[
    { key: 'name', title: 'Nome', pinned: 'left', width: 200 },
    { key: 'email', title: 'E-mail', width: 240 },
    { key: 'status', title: 'Status', pinned: 'right', width: 140 }
  ]}
/>
```

- `column.pinned` fixa à esquerda/direita.
- `pinnedColumns`/`defaultPinnedColumns`/`onPinnedColumnsChange` permitem controlar por `column.key`.
- Colunas fixas usam `position: sticky`, offsets calculados pelas larguras e sombra na borda.
- Definir `width` explícito é recomendado para offsets precisos.
- Pinning é aplicado apenas em headers planos; com headers multi-nível ele é ignorado.

### Headers multi-nível

```tsx
<DataGrid
  data={rows}
  columns={[
    { key: 'name', title: 'Nome', sortable: true },
    {
      key: 'contact',
      title: 'Contato',
      children: [
        { key: 'email', title: 'E-mail', sortable: true, filterable: true },
        { key: 'phone', title: 'Telefone' }
      ]
    }
  ]}
  withColumnFilters
/>
```

- `column.children` cria grupos de header com `colSpan` automático.
- Folhas continuam com sort, filtro, resize, exportação e edição.
- Reorder atua no nível superior (grupo ou coluna).
- Virtualização é desativada quando há headers multi-nível.

### Resumo e agregações

```tsx
<DataGrid
  data={rows}
  columns={[
    { key: 'name', title: 'Nome' },
    { key: 'total', title: 'Total', aggregate: 'sum', summaryValue: (row) => row.total },
    { key: 'status', title: 'Ativos', aggregate: (rows) => rows.filter((row) => row.active).length }
  ]}
  withSummary
  summaryScope="filtered"
  summaryLabel="Total"
/>
```

- `aggregate`: `sum`, `avg`, `min`, `max`, `count` ou função `(rows) => ReactNode`.
- `summaryValue` extrai o número da linha; por padrão usa `row[column.key]`.
- `summaryFormatter` formata o resultado numérico.
- `summaryScope`: `filtered` (default) agrega todos os dados filtrados; `page` apenas a página atual.
- `summaryLabel` aparece na primeira célula disponível do rodapé.
- `withGroupSummary` renderiza um subtotal por grupo, respeitando grupos colapsados.
- Em `serverSide`, o resumo usa apenas `data` (a página recebida).

### Operadores de filtro

```tsx
<DataGrid
  data={rows}
  columns={[
    { key: 'name', title: 'Nome', filterable: true, filterOperator: 'startsWith' },
    { key: 'total', title: 'Total', filterable: true, filterOperator: 'gte' }
  ]}
  withColumnFilters
/>
```

- Operadores: `contains` (default), `notContains`, `equals`, `notEquals`,
  `startsWith`, `endsWith`, `gt`, `gte`, `lt`, `lte`, `isEmpty` e `isNotEmpty`.
- Comparações numéricas usam `filterValue` (ou `row[column.key]`) e aceitam vírgula decimal.
- `isEmpty`/`isNotEmpty` são aplicados mesmo com o campo de filtro vazio.

### Reordenação de linhas

```tsx
<DataGrid
  data={rows}
  columns={columns}
  withRowReorder
  onRowReorder={(fromIndex, toIndex) => move(fromIndex, toIndex)}
/>
```

- Adiciona uma coluna com handle de arraste e suporte a teclado (`Alt+ArrowUp`/`Alt+ArrowDown`).
- `onRowReorder` recebe índices relativos à página atual.
- Desativado automaticamente quando `groupBy` está configurado.
- Combine com estado controlado para persistir a nova ordem.

### Menu de coluna

```tsx
<DataGrid data={rows} columns={columns} withColumnMenu withColumnVisibility />
```

- `withColumnMenu` adiciona um botão por header com menu `role="menu"`.
- Ações: ordenar ascendente/descendente, fixar à esquerda/direita, desafixar e ocultar.
- Fecha com `Escape` ou clique fora.
- Ações de pinning ficam indisponíveis quando há headers multi-nível.

### Edição por célula

```tsx
<DataGrid
  data={rows}
  columns={columns}
  withCellEditing
  onCellEdit={(row, columnKey, value) => update(row.id, columnKey, value)}
  renderCellEditor={(row, column, value, onSave, onCancel) => (
    <MyEditor value={value} onSave={onSave} onCancel={onCancel} />
  )}
/>
```

- `withCellEditing` transforma cada célula editável em botão; clique/Enter inicia a edição.
- `onCellEdit(row, columnKey, value)` recebe o valor digitado; Enter/blur confirmam, `Escape` cancela.
- `editingCell`/`defaultEditingCell`/`onEditingCellChange` controlam a célula ativa.
- `renderCellEditor` substitui o input padrão.
- `column.editable={false}` mantém a coluna somente leitura; quando ativo, tem precedência sobre `withRowEditing`.

### Virtualização de colunas

```tsx
<DataGrid
  data={rows}
  columns={columns}
  virtualizeColumns
  columnVirtualizationThreshold={15}
  columnVirtualizationOverscan={2}
/>
```

- Renderiza apenas as colunas visíveis no scroll horizontal, com spacers e `<colgroup>` para manter as larguras.
- Define `width` nas colunas para offsets precisos.
- Desativada com headers multi-nível, `groupBy` ou colunas fixas; helper `getVirtualColumnRange` exportado.

### Saved views

```tsx
<DataGrid
  data={rows}
  columns={columns}
  withViews
  viewStorageKey="users-grid"
  defaultViews={[{ id: 'ativos', name: 'Ativos', filters: { status: 'active' } }]}
/>
```

- `views`/`defaultViews`/`onViewsChange` controlam a lista; `activeViewId`/`onActiveViewChange` a view ativa.
- Salva sort, filtros, colunas ocultas, ordem, larguras, pinning e `pageSize`.
- `viewStorageKey` persiste no `localStorage`; aplicar uma view restaura os estados e dispara os callbacks.

### Filtros por range

```tsx
<DataGrid
  data={rows}
  columns={[
    {
      key: 'total',
      title: 'Total',
      filterable: true,
      filterType: 'number',
      filterOperator: 'between'
    },
    {
      key: 'createdAt',
      title: 'Criado em',
      filterable: true,
      filterType: 'date',
      filterOperator: 'between'
    }
  ]}
  withColumnFilters
/>
```

- `filterType`: `text`, `number` ou `date`; gera dois inputs (`from`/`to`) no filter row.
- Operadores `between`/`notBetween`; limites abertos quando uma ponta está vazia.
- Helpers `parseRangeFilterValue` e `matchesRangeFilter`.

### Seleção de intervalo e clipboard

```tsx
<DataGrid data={rows} columns={columns} withRangeSelection onRangeSelectionChange={setSelection} />
```

- Clique define a célula âncora; `Shift+clique` estende o intervalo.
- `Ctrl/Cmd+C` copia o intervalo como TSV (linhas × colunas, respeitando `exportValue`).
- `rangeSelection`/`defaultRangeSelection` controlam a seleção; `onRangeSelectionChange` emite as bordas.
- Feedback via `role="status"` (“N rows copied”).

### Undo/redo

```tsx
<DataGrid
  data={rows}
  columns={columns}
  withUndoRedo
  maxHistory={50}
  onUndo={track}
  onRedo={track}
/>
```

- `withUndoRedo` registra edições de célula/linha e reordenação; atalhos `Ctrl/Cmd+Z`,
  `Ctrl/Cmd+Shift+Z`/`Ctrl+Y` e botões acessíveis.
- `maxHistory` limita o histórico; uma nova edição limpa o redo e `data` nunca é mutado.

### Exportação Excel

```tsx
<DataGrid data={rows} columns={columns} withExcelExport excelFileName="clientes" />
```

- Gera HTML Office (`.xls`) com colunas visíveis, headers e agregações; helpers
  `createDataGridExcel`/`exportDataGridExcel`.
- Escapa HTML e neutraliza fórmulas (`=`, `+`, `-`, `@`).

### Sorting e filtro server-side

```tsx
<DataGrid
  data={pageRows}
  columns={columns}
  serverSideSorting
  serverSideFiltering
  onSortChange={loadSort}
  onFilterChange={loadFilters}
  loading={loading}
/>
```

- Não ordena/filtra localmente; emite o estado via `onSortChange`/`onFilterChange`.
- `aria-busy` é aplicado durante `loading`; pode ser combinado com `serverSide`.

### Altura variável

```tsx
<DataGrid
  data={rows}
  columns={columns}
  virtualized
  getRowHeight={(row) => (row.expanded ? 96 : 48)}
/>
```

- `getRowHeight` deve ser determinístico; offsets cumulativos, overscan e
  `aria-rowcount`/`aria-rowindex` são preservados.
- Incompatível com rowSpan/colSpan e expansão de linhas (a virtualização é desativada nesses casos).

## Fundação visual

```tsx
<Title order={2}>Dashboard</Title>
<Text size="sm" color="dimmed">Resumo do período</Text>

<Stack gap="md">
  <Text>Item 1</Text>
  <Text>Item 2</Text>
</Stack>

<Grid columns={12} gap="md">
  <Grid.Col span={8}>Conteúdo</Grid.Col>
  <Grid.Col span={4}>Aside</Grid.Col>
</Grid>

<Container size="lg">…</Container>

<Result status="success" title="Tudo certo" subTitle="Operação concluída" />
```

- `Typography`: `Title`, `Text`, `Paragraph`, `Link`, `Code`, `Blockquote`.
- `Stack`/`Flex`: espaçamento e alinhamento.
- `Grid`/`Container`: layout responsivo.
- `Result`: estados de sucesso, erro, 404/403/500.

## Editores visuais

```tsx
<WorkflowDesigner
  nodes={nodes}
  edges={edges}
  editable
  selectedNodeId={selected}
  onSelectNode={setSelected}
  onNodesChange={setNodes}
  onConnect={(from, to) => addEdge(from, to)}
/>

<MindMap root={root} collapsible onNodeClick={openNode} />
```

- Canvas com grid, nós/arestas SVG, seleção, drag com snap, zoom e conexão acessível.
- `editable` controla movimento/conexão; `renderNode` permite conteúdo customizado.
- `MindMap`: árvore com ramos, expansão e navegação por teclado.

## Layout e utilitários

```tsx
<AppShell
  header={<PageHeader title="Dashboard" />}
  navbar={<nav>...</nav>}
  aside={<aside>...</aside>}
>
  <SplitPane defaultSize={60}>
    <section>Editor</section>
    <section>Preview</section>
  </SplitPane>
</AppShell>

<LoadingBar loading={saving} value={progress} />
<VisuallyHidden>Texto para leitores de tela</VisuallyHidden>
<ErrorBoundary onError={report} fallback={<p>Falha ao carregar.</p>}>
  <Widget />
</ErrorBoundary>
```

- `AppShell`: header/navbar/aside/footer, colapsável e responsivo.
- `SplitPane`: painéis redimensionáveis por arraste ou teclado.
- `LoadingBar`: barra determinada/indeterminada.
- `VisuallyHidden`: conteúdo apenas para leitores de tela.
- `ErrorBoundary`: fallback customizável e reset.
- `Affix`/`BackTop`/`FloatButton`: fixação e ações flutuantes.
- `Watermark`: marca d'água repetida em SVG.

## Página, overlays e utilidades

```tsx
<Modal opened={opened} onClose={close} title="Editar usuário" footer={<Button>Salvar</Button>}>
  Conteúdo
</Modal>

<Popconfirm
  message="Excluir este item?"
  onConfirm={remove}
  onCancel={cancel}
>
  <Button status="danger">Excluir</Button>
</Popconfirm>

<PageHeader
  title="Usuários"
  description="Gerencie acessos e permissões"
  breadcrumbs={<Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Usuários' }]} />}
  actions={<Button status="primary">Novo usuário</Button>}
/>

<AvatarGroup max={3} total={8} spacing={10}>
  <User name="Alice" showName={false} />
  <User name="Bruno" showName={false} />
  <User name="Carla" showName={false} />
</AvatarGroup>

<Indicator label={3} position="top-end">
  <Icon icon="bell-outline" pack="nebular-essentials" />
</Indicator>

<AspectRatio ratio={16 / 9}>
  <div>Conteúdo</div>
</AspectRatio>

<CopyButton value="npm install @nebular-react/core" />
<p><Kbd>Ctrl</Kbd> + <Kbd>K</Kbd></p>

<Affix offsetTop={64}>
  <Toolbar />
</Affix>
<BackTop />
<FloatButton icon={<Icon icon="plus-outline" />} label="Novo" />
<Watermark text="Confidencial">{content}</Watermark>

<Tour
  opened={tourOpened}
  onOpenChange={setTourOpened}
  steps={[
    { target: '#search', title: 'Busca', content: 'Encontre qualquer registro aqui.' },
    { target: '#actions', title: 'Ações', content: 'Crie, exporte e compartilhe.' }
  ]}
  onFinish={() => setTourOpened(false)}
/>

<NotificationCenter
  notifications={notifications}
  onMarkAllRead={markAllRead}
  onClear={clearNotifications}
  onNotificationClick={openNotification}
/>
```

- `Modal`: portal, foco, Escape/backdrop, title/footer.
- `Popconfirm`: confirmação inline controlada/não controlada.
- `PageHeader`: título, descrição, breadcrumbs, ações e tabs.
- `AvatarGroup`/`Indicator`: composição de avatares e badges de status.
- `AspectRatio`: containers responsivos.
- `CopyButton`/`Kbd`: utilidades de produtividade.
- `Tour`: onboarding com spotlight, navegação por teclado e foco gerenciado.
- `NotificationCenter`: sino com badge, lista de notificações, marcar como lidas e limpar.

## Formulários avançados

```tsx
<FormControl label="E-mail" description="Usaremos para login" required htmlFor="email">
  <Input id="email" type="email" />
</FormControl>

<CheckboxGroup
  label="Permissões"
  defaultValue={['read']}
  data={[
    { label: 'Ler', value: 'read' },
    { label: 'Escrever', value: 'write' }
  ]}
/>

<InputGroup before="https://">
  <Input placeholder="seusite.com" />
</InputGroup>

<PinInput length={6} oneTimeCode ariaLabel="Código de verificação" />

<MaskedInput mask="999.999.999-99" aria-label="CPF" />

<CurrencyInput currency="BRL" locale="pt-BR" defaultValue={1234.5} />

<FileInput accept="image/*" buttonLabel="Escolher imagem" clearable />

<EmojiPicker label="Reação" searchable clearable onChange={setReaction} />
```

- `FormControl`: label, descrição, erro (`role="alert"`) e asterisco de obrigatório.
- `CheckboxGroup`: seleção múltipla controlada/não controlada.
- `InputGroup`: addons antes/depois do input.
- `PinInput`: OTP com colagem, backspace e máscara.
- `MaskedInput`: tokens `9`, `A`, `S`, `*`; helpers `formatMaskedValue`/`parseMaskedValue`.
- `CurrencyInput`: `Intl.NumberFormat`, min/max, decimais e negativos; helper `parseCurrencyValue`.
- `FileInput`: upload único, aceita `accept`, clear e label/erro.
- `EmojiPicker`: base embutida de ~230 emojis, busca por nome/keyword, chips de categoria,
  recentes, clear e navegação por teclado (`combobox`/`listbox`).

### Form e validação

```tsx
const form = useForm({
  initialValues: { email: '', password: '' },
  rules: {
    email: { required: true, pattern: /^\S+@\S+\.\S+$/, message: 'E-mail inválido' },
    password: { required: true, minLength: 8 }
  },
  onSubmit: signIn
});

<Form form={form}>
  <FormControl label="E-mail" required>
    <Input {...form.getInputProps('email')} />
  </FormControl>
  <Button type="submit">Entrar</Button>
</Form>

<PhoneInput country="BR" withCountryCode />
<PhoneInput country="PT" outputFormat="e164" onChangeMeta={setPhoneMeta} />
<DocumentInput documentType="auto" />
<CronInput defaultValue="*/15 * * * *" />
```

- `useForm`/`Form`: regras declarativas, erros, touched, submit e `aria-describedby`.
- `useFieldArray`: append/prepend/insert/remove/move/replace/update; validação assíncrona
  (`validating`, `validateAsync`) e `schema` externo (Zod/Yup adaptado).
- `PhoneInput`: formatação AsYouType via `libphonenumber-js` para qualquer país ISO 3166-1
  alpha-2 (`country`/`defaultCountry`), `outputFormat` (`national`/`international`/`e164`) e
  `onChangeMeta({ country, national, international, e164, valid, possible })`; helpers
  `formatPhoneNumber`/`parsePhoneNumber`. BR/US mantêm o progressivo legado.
- `DocumentInput`: CPF/CNPJ com validação de dígitos verificadores.
- `CronInput`: validação, descrição em pt-BR/en-US e presets.

## Conteúdo e assinatura

```tsx
<Mentions
  data={users}
  placeholder="Escreva @ para mencionar"
  onChange={setMessage}
/>

<Markdown value={markdown} />

<MarkdownEditor value={markdown} onChange={setMarkdown} previewMode="split" />

<CodeEditor language="json" value={json} onChange={setJson} lineNumbers height={240} />

<SignaturePad value={signature} onChange={setSignature} />
```

- `Mentions`: sugestões com trigger configurável, teclado e inserção de `@label`.
- `Markdown`: renderização segura em React, links sanitizados e `parseMarkdown` exportado.
- `MarkdownEditor`: edição e preview (`split`/`edit`/`preview`), toolbar de formatação,
  atalhos `Ctrl/Cmd+B/I/K`, contador de caracteres e preview seguro via `Markdown`.
- `CodeEditor`: números de linha, auto-indent, Tab/Shift+Tab, `wrap`, `readOnly`/`disabled` e
  realce leve para `json`, `javascript`, `typescript`, `html` e `css`; helper `highlightCode`.
- `SignaturePad`: desenho em SVG com pointer events, clear e valor controlado.

## Charts

```tsx
<LineChart
  labels={['Jan', 'Feb', 'Mar']}
  series={[
    { name: 'Revenue', data: [12, 19, 14] },
    { name: 'Costs', data: [8, 11, 9] }
  ]}
  onPointClick={(series, index, value) => openPoint(series, index, value)}
/>

<BarChart labels={['Q1', 'Q2']} series={[{ name: 'Revenue', data: [32, 48] }]} />

<DonutChart
  data={[
    { label: 'Direct', value: 60 },
    { label: 'Organic', value: 40 }
  ]}
  centerLabel="Total"
/>

<Sparkline data={[4, 8, 6, 12]} area ariaLabel="Weekly users" />

<PolarAreaChart
  data={[
    { label: 'Direto', value: 40 },
    { label: 'Busca', value: 28 },
    { label: 'Social', value: 18 }
  ]}
  ariaLabel="Origem do tráfego"
/>

<ViolinPlot
  data={[
    { label: 'Turma A', values: [62, 68, 71, 75, 79, 84] },
    { label: 'Turma B', values: [55, 61, 66, 70, 74, 88] }
  ]}
  ariaLabel="Distribuição de notas"
/>

<CalendarHeatmap
  data={activity}
  weeks={52}
  ariaLabel="Atividade do ano"
/>

<WaffleChart data={channels} rows={10} columns={10} ariaLabel="Canais" />
<HexbinChart data={points} xLabel="Preço" yLabel="Demanda" ariaLabel="Densidade" />
<RadialBarChart data={goals} ariaLabel="Metas por equipe" />

<ParallelCoordinates dimensions={dimensions} series={series} ariaLabel="Comparação" />
<MekkoChart data={marketShare} ariaLabel="Share por canal" />
<NetworkGraph nodes={services} edges={dependencies} layout="force" ariaLabel="Serviços" />
<PictogramChart data={population} maxUnits={10} columns={10} ariaLabel="População" />
<BubbleChart data={bubbles} xLabel="Receita" yLabel="Margem" ariaLabel="Oportunidades" />
<Dendrogram data={taxonomy} orientation="top" ariaLabel="Taxonomia" />

<PieChart
  data={[
    { label: 'Direct', value: 60 },
    { label: 'Organic', value: 30 },
    { label: 'Referral', value: 10 }
  ]}
  showLegend
/>

<ScatterChart
  series={[
    { name: 'A', data: [{ x: 1, y: 12 }, { x: 2, y: 18 }] },
    { name: 'B', data: [{ x: 1, y: 8 }, { x: 2, y: 14 }] }
  ]}
  xLabel="Sessions"
  yLabel="Revenue"
  showLegend
/>

<ComboChart
  labels={['Jan', 'Feb']}
  series={[
    { name: 'Receita', type: 'bar', data: [32, 48] },
    { name: 'Margem', type: 'line', data: [12, 18] }
  ]}
/>

<StackedBarChart
  labels={['Q1', 'Q2']}
  series={[
    { name: 'Novos', data: [12, 18] },
    { name: 'Recorrentes', data: [20, 30] }
  ]}
/>

<FunnelChart
  data={[
    { label: 'Visitantes', value: 1200 },
    { label: 'Leads', value: 480 },
    { label: 'Clientes', value: 120 }
  ]}
/>

<TreeMapChart
  data={[
    { label: 'Enterprise', value: 60 },
    { label: 'SMB', value: 30 },
    { label: 'Startup', value: 10 }
  ]}
/>

<WaterfallChart
  data={[
    { label: 'Receita', value: 120, type: 'total' },
    { label: 'Custos', value: 40, type: 'decrease' },
    { label: 'Margem', value: 80, type: 'total' }
  ]}
/>

<BulletChart
  data={[{ label: 'Receita', value: 78, target: 90, max: 100, ranges: [50, 75, 100] }]}
/>
```

- `LineChart`, `AreaChart`, `BarChart`, `DonutChart`, `PieChart`, `ScatterChart`,
  `RadarChart`, `Gauge`, `Heatmap` e `Sparkline`.
- `ComboChart` combina barras com linhas/áreas; `StackedBarChart` empilha séries por label.
- `FunnelChart`, `TreeMapChart`, `WaterfallChart`, `BulletChart`, `SankeyChart`,
  `ChordChart`, `SunburstChart`, `BoxPlotChart`, `CandlestickChart`, `WordCloud`,
  `StreamGraphChart`, `StepLineChart`, `PolarAreaChart`, `ViolinPlot`, `WaffleChart`,
  `HexbinChart`, `RadialBarChart`, `ParallelCoordinates`, `MekkoChart` e `NetworkGraph`
  completam os gráficos analíticos; `CalendarHeatmap` cobre atividade por dia.
- `PictogramChart` usa ícones (customizáveis) em grid com unidades parciais recortadas;
  `BubbleChart` dimensiona o raio por `sqrt(size)`; `Dendrogram` desenha hierarquias com links
  ortogonais e `layoutDendrogram` exportado para layouts determinísticos.
- `ChartContainer` adiciona responsividade (`ResizeObserver`), loading/empty, data table
  acessível (`showDataTable`) e export SVG/PNG; `animated` respeita `prefers-reduced-motion`.
- `ChartDataTable`, `exportChartSvg`/`exportChartPng` e `serializeChartSvg` são reutilizáveis.
- Tooltip por hover/focus, legenda e eixos configuráveis.
- `interactiveLegend` em `LineChart`/`AreaChart`/`BarChart` permite ocultar e reexibir séries
  pelo botão da legenda (`aria-pressed`), mantendo pelo menos uma série visível.
- `zoomable` + `onZoomChange` em `LineChart`/`AreaChart`: arraste sobre o plot para ampliar
  um intervalo de labels; duplo clique ou **Reset zoom** restaura a visão completa. Eixos,
  tooltip, legenda e data table acompanham o recorte.
- Pontos/barras/segmentos são focáveis e clicáveis via `onPointClick`/`onBarClick`/`onSegmentClick`.
- `ariaLabel` obrigatório na prática para descrever o gráfico.
- Sem dependências externas de charting; SVG puro.

## Arquivos, imagens e organizações

```tsx
<OrgChart nodes={org} collapsible onNodeClick={openPerson} />

<FileManager
  items={files}
  onOpen={openFile}
  onCreateFolder={createFolder}
  onDelete={deleteItem}
  searchable
  draggable
  onMove={moveNodes}
  sortBy="name"
  preview
/>

<ImageCropper src="/cover.png" aspectRatio={16 / 9} onChange={setCrop} />
<AvatarEditor src="/avatar.png" shape="circle" onChange={setCrop} />

<FileInput multiple maxFiles={5} accept="image/*" />
```

- `OrgChart`: hierarquia com conectores, expansão e teclado.
- `FileManager`: navegação, multi-seleção (Ctrl/Shift/select all), upload com progresso,
  menu de contexto (abrir/renomear/download/excluir) e ações em lote; `draggable`/`onMove`
  movem itens entre pastas (com `Ctrl/Cmd+X`/`Ctrl/Cmd+V`), `sortBy`/`sortDirection` ordenam
  pastas e arquivos, e `preview` abre o painel lateral com fallback para imagem/texto ou
  `renderPreview`.
- `ImageCropper`/`AvatarEditor`: recorte por pointer/teclado e zoom.
- `FileInput` múltiplo com limite e remoção individual.

## Filtros, kanban e dashboards

```tsx
<FilterBuilder
  fields={[
    { key: 'name', label: 'Nome' },
    { key: 'status', label: 'Status', type: 'select', options: statusOptions }
  ]}
  conjunction="and"
  onChange={setRules}
  onApply={applyRules}
/>

<MultiSelect
  label="Permissões"
  searchable
  clearable
  data={permissionOptions}
  value={permissions}
  onChange={setPermissions}
/>

<Wizard
  steps={[
    { key: 'basic', title: 'Dados', content: <BasicForm />, validate: validateBasic },
    { key: 'review', title: 'Revisão', content: <Review /> }
  ]}
  onComplete={finish}
/>

<SplitButton label="Salvar" onClick={save} items={[{ key: 'draft', label: 'Salvar rascunho', onClick: saveDraft }]} />
<SpeedDial actions={[{ key: 'new', label: 'Novo', icon: <Icon icon="plus-outline" /> }]} />

<JsonEditor value={json} onChange={setJson} height={240} />

<SortableList
  items={items}
  keyExtractor={(item) => item.id}
  renderItem={(item) => <ItemRow item={item} />}
  onReorder={(next) => setItems(next)}
/>

<Masonry columns={{ base: 1, md: 2, lg: 3 }} gap={16}>
  {cards}
</Masonry>

<PivotTable
  data={sales}
  rows={['region', 'country']}
  column="product"
  measures={[
    { key: 'revenue', label: 'Receita', aggregate: 'sum', value: (row) => row.revenue },
    { key: 'orders', label: 'Pedidos', aggregate: 'count' }
  ]}
  defaultExpandedKeys={['North']}
  exportable
/>

<GanttChart
  tasks={tasks}
  view="week"
  showDependencies
  resourceView
  editableProgress
  exportable
  onTaskClick={openTask}
/>

<Kanban
  columns={columns}
  onCardMove={moveCard}
  renderCard={renderCard}
  editable
  showChecklistProgress
/>

<DashboardGrid
  widgets={widgets}
  columns={12}
  editable
  onLayoutChange={setLayout}
/>
```

- `FilterBuilder`: regras AND/OR, operadores por tipo e helpers
  `matchesFilterBuilderRule`/`applyFilterBuilderRules`.
- `MultiSelect`: chips com busca, clear, limite e remoção individual; aceita
  `OptionGroup` (grupos com cabeçalho e grupo desabilitado), `onSearchChange`/`loading`
  para busca assíncrona, `virtualized`/`virtualizedMaxHeight`/`itemHeight` para listas
  grandes e `renderOption` para conteúdo rico mantendo o label acessível.
- `Wizard`: etapas com validação sync/async, navegação e finalização.
- `SplitButton`/`SpeedDial`: ações compostas e flutuantes.
- `JsonEditor`: edição com realce, números de linha, validação com linha/coluna e formatar/minificar.
- `SortableList`: reordenação por pointer e teclado (Space/setas/Escape) com anúncio em `role="status"`.
- `Masonry`: layout responsivo por colunas com fallback CSS para SSR.
- `PivotTable`: agregações `sum`/`avg`/`min`/`max`/`count`, múltiplas medidas por célula,
  níveis de linha, totais e export CSV; drill-down via `onCellClick`/`onRowClick`/`renderCell`;
  helper `buildPivotTable`.
- `GanttChart`: timeline day/week/month, progresso, dependências e linha "today";
  `editable`/`onTaskChange` movem/redimensionam tarefas, `onDependencyCreate` cria links,
  `showCriticalPath` destaca o caminho crítico, `showBaseline` compara planejado,
  `resources`/`resourceIds` coloram e legendam recursos, `resourceView` cria lanes por recurso,
  `editableProgress`/`onProgressChange` arrastam o progresso (snap de 5%) e `exportable`
  gera SVG/PNG; helpers `computeCriticalPath`/`normalizeGanttTasks`/`getGanttRange`/`getGanttColumns`.
- `Kanban`: drag and drop entre colunas/lanes, `Alt+ArrowLeft/Right` e `Alt+Shift+ArrowUp/Down`,
  WIP limits (`wipLimits`/`onWipLimitExceeded`) e virtualização de cards (`virtualizeCards`);
  `editable`/`onCardEdit`/`renderCardEditor` editam o card inline, `checklist` +
  `onChecklistChange` mostram progresso `x/y`, e `labels`/`assignees` renderizam chips/avatares.
- `DashboardGrid`: grid de 12 colunas, `columnSpan`/`rowSpan`, layout controlado, edição acessível e fallback mobile.

## Diff, listas virtuais e scroll infinito

```tsx
<DiffViewer before={previous} after={current} mode="split" />

<VirtualList
  items={rows}
  height={360}
  itemHeight={40}
  renderItem={(row) => <Row data={row} />}
  onEndReached={loadMore}
/>

<InfiniteScroll loadMore={loadMore} hasMore={hasMore}>
  {items.map((item) => (
    <Card key={item.id}>{item.title}</Card>
  ))}
</InfiniteScroll>
```

- `DiffViewer`: diff por linhas (LCS), modos split/unified, contadores e `diffLines` exportado.
- `VirtualList`: janela virtual com spacers, `aria-setsize`/`aria-posinset` e `onEndReached`.
- `InfiniteScroll`: `IntersectionObserver` com fallback de scroll, loader e mensagem de fim.

## Mídia, árvores e navegação

```tsx
<Image src="/cover.png" alt="Capa" fit="cover" radius={12} withSkeleton caption="Capa" />

<QRCode value="https://example.com" size={160} ariaLabel="QR code do site" />

<Anchor
  items={[
    { key: 'intro', label: 'Introdução', href: '#intro' },
    { key: 'api', label: 'API', href: '#api', depth: 1 }
  ]}
/>

<TreeSelect
  searchable
  clearable
  label="Categoria"
  data={[{ value: 'a', label: 'A', children: [{ value: 'a1', label: 'A1' }] }]}
  onChange={(value) => setCategory(value)}
/>

<Cascader
  label="Localização"
  options={[
    { value: 'br', label: 'Brasil', children: [{ value: 'sp', label: 'São Paulo' }] }
  ]}
  onChange={(path) => setLocation(path)}
/>

<Carousel withIndicators withControls>
  <div>Slide 1</div>
  <div>Slide 2</div>
  <div>Slide 3</div>
</Carousel>

<ImageViewer src="/cover.png" alt="Capa" caption="Capa do relatório" withDownload />

<Barcode value="5901234123457" format="EAN13" />

<CodeBlock
  language="ts"
  title="Exemplo"
  code={'export const sum = (a: number, b: number) => a + b;'}
/>

<JsonViewer data={{ id: 1, roles: ['admin', 'user'] }} expandDepth={2} searchable />
```

- `Image`: skeleton, fallback e `object-fit`.
- `QRCode`: encoder em SVG puro; `encodeQRCodeMatrix` exportado para uso direto.
- `Anchor`: navegação por âncoras com `aria-current` e scroll suave.
- `TreeSelect`: seleção hierárquica com busca, expansão e clear; `checkable` habilita
  checkboxes em cascata (`checkedValues`/`onCheckedChange`), `checkStrictly` limita ao nó
  clicado e `loadData`/`onLoadError` carregam filhos sob demanda (`hasChildren`).
- `Cascader`: seleção por níveis com caminho e `changeOnSelect`; `searchable` mostra
  resultados por caminho em lista plana e `loadData`/`onLoadError` carregam níveis remotos.
- `Search`: API controlada (`value`/`onChange`), submit, clear e callbacks de abrir/fechar.
- `Tags`: `withAutocomplete`/`autocompleteData` com seleção por sugestão, além de Enter/Backspace.
- `Carousel`: slides com setas, indicadores, teclado, loop e autoplay.
- `ImageViewer`: miniatura + overlay ampliado com foco, Escape e download opcional.
- `Barcode`: EAN-13/EAN-8/Code128/Code39 em SVG puro; `encodeBarcode` exportado.
- `CodeBlock`: highlight leve, números de linha, cópia e scroll; `tokenizeCode` exportado.
- `JsonViewer`: árvore colapsável com busca e cópia; `parseJsonSafely` exportado.

## Chat

```tsx
<Chat
  messages={messages}
  onSend={send}
  typingUsers={typingUsers}
  showReadReceipts
  threads={threads}
  onThreadReply={replyInThread}
  searchable
  editable
  deletable
  virtualize
/>
```

- Threads com painel, contagem de respostas e foco gerenciado.
- Indicador de digitação com `aria-live="polite"` e espaço reservado.
- Recibos de leitura por mensagem (`readBy`) ou globais (`readStatus`).
- Anexos usam `ChatFile` (`url` ou `icon`).
- Busca com contador e destaque `<mark>` seguro (`searchable`/`highlightMatches`).
- Edição inline e exclusão com confirmação (`editable`/`deletable`/`canEdit`), reações com
  `quickReactions`/`renderReactionPicker`, e virtualização com altura fixa (`virtualize`).

## RichTextEditor

```tsx
<RichTextEditor value={html} onChange={setHtml} placeholder="Write a description" minHeight={160} />
```

- API controlada (`value`/`onChange`) ou não controlada (`defaultValue`).
- Toolbar: bold, italic, underline, strike, H1/H2, listas, alinhamento, undo/redo e limpar
  formatação.
- Atalhos `Ctrl/Cmd+B`, `Ctrl/Cmd+I` e `Ctrl/Cmd+U`.
- `readOnly`, `disabled`, `toolbar`, `minHeight`/`maxHeight`.
- `contentEditable` com `role="textbox"`, `aria-multiline` e placeholder acessível.
- Tabelas: inserir, adicionar/remover linhas e colunas, excluir.
- Imagens via `onImageUpload` (com progresso/erro) ou URL, com alt.
- Links/unlink com `target="_blank"` + `rel="noopener noreferrer"`.
- Mentions com `mentions`/`mentionTrigger`/`onMention` (popup acessível e chip).
- Code inline/block (`Ctrl/Cmd+E` e `Ctrl/Cmd+Shift+E`).
- Find/replace (`findable`) com contador, case-sensitive, next/previous, replace e replace all;
  helpers `findText`/`replaceText` exportados.
- Paste sanitizado (`sanitizeHtml`) remove scripts, `on*` e URLs perigosas.
- O HTML retornado deve ser sanitizado pelo consumidor antes de renderizar em outro lugar.

## Scheduler

```tsx
<Scheduler
  events={events}
  defaultView="month"
  defaultDate={new Date()}
  onEventClick={(event) => openEvent(event)}
  onDateChange={setDate}
  onViewChange={setView}
/>
```

- Views: `day`, `week` e `month`.
- `date`/`defaultDate`/`onDateChange` controlam o período visível.
- `view`/`defaultView`/`onViewChange` controlam a visualização.
- `onEventClick` e `renderEvent` customizam os eventos.
- Navegação por período e botão **Today**.
- Eventos usam `start`, `end`, `allDay`, `color` e `data`.
- `dateType` segue o adapter de datas configurado.
- `editable`/`onEventChange`/`onEventResize` habilitam drag e resize com `snapMinutes`.
- `recurrence` (daily/weekly/monthly) expande ocorrências com `count`/`until`/`interval`;
  helper `expandRecurrence`.
- `timeZone` por evento preserva o wall clock e callbacks emitem instantes absolutos.
- `selectable`/`onRangeSelect` (ou `onEventCreate`) criam eventos arrastando na grade,
  com snapping, duração padrão e `Escape` para cancelar; `N`/`Enter` criam por teclado.
- `resources`/`resourceId` + `resourceView` renderizam lanes por recurso (com "Unassigned").
- Eventos `allDay` arrastam horizontalmente entre dias preservando a duração em dias.

## TreeTable

```tsx
<TreeTable
  data={nodes}
  columns={[
    { key: 'name', title: 'Name' },
    { key: 'type', title: 'Type' },
    {
      key: 'size',
      title: 'Size',
      render: (node) => node.data.size
    }
  ]}
  defaultExpandedIds={['src']}
  selectable
  caption="Files"
/>
```

- `data` usa `TreeTableNode<T>` com `id`, `data` e `children`.
- A primeira coluna recebe o expander e a indentação.
- `expandedIds`/`defaultExpandedIds`/`onExpandedChange` controlam a expansão.
- `selectedId`/`defaultSelectedId`/`onSelectionChange` controlam a seleção.
- `selectable` habilita seleção por clique/teclado.
- `checkable` adiciona checkboxes em cascata (`checkedIds`/`defaultCheckedIds`/`onCheckedChange`);
  `checkStrictly` limita a mudança ao nó clicado. O checkbox do cabeçalho seleciona/limpa todos
  e mostra estado indeterminado.
- Colunas com `sortable` ordenam os irmãos em cada nível; `sortValue(node)` permite ordenar por
  valor derivado. `sortBy`/`sortDirection` são controlados por `onSortChange` e o cabeçalho expõe
  `aria-sort`.
- `render(node, depth)` permite células customizadas.
- Navegação por teclado: `ArrowLeft`/`ArrowRight` expande/colapsa, `Enter`/`Space` seleciona
  (ou marca/desmarca no modo `checkable`).

## Novos componentes

```tsx
<SegmentedControl data={['List', 'Grid']} defaultValue="List" />

<Textarea aria-label="Notes" autosize minRows={3} />
<NumberInput aria-label="Quantity" min={0} max={100} />
<PasswordInput aria-label="Password" />

<Rating defaultValue={3} />
<Slider label="Opacity" defaultValue={40} />
<RangeSlider label="Price" defaultValue={[20, 80]} />
<ColorPicker label="Accent" defaultValue="#3366ff" />
<Dropzone accept="image/*" onDrop={setFiles} />

<Divider label="Section" />
<Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Users' }]} />
<Stat label="Active users" value="12,430" trend={{ value: '+12%', direction: 'up' }} />
<Timeline items={[{ title: 'Created', time: '09:00' }]} />
<Descriptions columns={2} items={[{ label: 'Name', value: 'Alice' }]} />

<Transfer data={permissions} value={value} onChange={setValue} />
<Tree data={nodes} defaultExpandedValues={['users']} />

<Drawer opened={opened} onClose={close} title="Filters">...</Drawer>
<ConfirmDialog opened={opened} onCancel={close} onConfirm={remove} />
<CommandPalette opened={opened} onClose={close} actions={actions} />
<HoverCard content={<ProfileCard />}><Button>Profile</Button></HoverCard>

<ScrollArea maxHeight={240}>...</ScrollArea>
<Spoiler maxHeight={80} showLabel="Read more">...</Spoiler>
<LoadingOverlay visible={loading}>...</LoadingOverlay>
```

Consulte o Storybook em **Catalog/Form components**, **Catalog/Display components** e
**Catalog/Overlay and data components** para exemplos interativos.

## Datas

- O adapter de datas é plugável (`Date`, `Moment`, `dayjs`, `date-fns`, `Temporal`).
- Veja [Date adapter](date-adapter.md) para registrar um adapter.
- `min`/`max`/`filter` estão disponíveis no Calendar e pickers.

### Timezone

```tsx
<DatetimePicker
  timeZone="America/New_York"
  date={instant}
  onDateChange={setInstant}
  format="DD/MM/YYYY HH:mm"
/>

<DateTimeRangePicker
  timeZone="America/New_York"
  value={range}
  onChange={setRange}
  presets
/>

<TimeRangePicker value={timeRange} onChange={setTimeRange} minuteStep={15} />

<MonthPicker value={month} onChange={setMonth} clearable />
<YearPicker value={year} onChange={setYear} clearable />
<WeekPicker value={week} onChange={setWeek} clearable />
<QuarterPicker value={quarter} onChange={setQuarter} clearable />
<MonthRangePicker value={monthRange} onChange={setMonthRange} />
<YearRangePicker value={yearRange} onChange={setYearRange} />
<TimeZonePicker value={timeZone} onChange={setTimeZone} clearable />

<Datepicker timeZone="Asia/Tokyo" date={instant} onDateChange={setInstant} />
<Rangepicker timeZone="Europe/London" range={range} onRangeChange={setRange} />
<Timepicker timeZone="America/Sao_Paulo" date={time} onDateChange={setTime} />
```

- O valor continua sendo um **instante absoluto** (`Date` ou `Moment`).
- `timeZone` (IANA) controla exibição, parse e navegação do calendário (wall clock).
- Disponível em `Calendar`, `Datepicker`, `Rangepicker`, `DatetimePicker`, `Timepicker`,
  `DateTimeRangePicker`, `TimeRangePicker`, `MonthPicker`, `YearPicker`, `WeekPicker`,
  `QuarterPicker`, `MonthRangePicker` e `YearRangePicker`; `TimeZonePicker` lista zonas IANA
  agrupadas por região e com offset.
- Fuso inválido/ausente mantém o comportamento local.
- DST é resolvido via `Intl`; horários inexistentes na transição são normalizados para frente.
- Helpers exportados: `toTimeZone`, `fromTimeZone`, `getTimeZoneOffset`, `isValidTimeZone`.

### Máscara e edição por teclado

```tsx
<Datepicker format="DD/MM/YYYY" withInputMask withKeyboardEdit />
<DatetimePicker format="DD/MM/YYYY HH:mm" withInputMask withKeyboardEdit />
<Rangepicker format="DD/MM/YYYY" withInputMask withKeyboardEdit />
<Timepicker withInputMask withKeyboardEdit />
```

- `withInputMask` aplica a máscara derivada do `format` numérico (`DD/MM/YYYY` → `99/99/9999`).
- `withKeyboardEdit` (default `true`) usa `ArrowUp`/`ArrowDown` para ajustar o segmento sob o caret
  (dia, mês, ano, hora, minuto, segundo), com wrap nos limites.
- Formatos com nomes de mês/AM-PM não são mascarados.
- `withInputMask` default é `false`; ambas as opções exigem `format` definido (exceto Timepicker,
  que usa o formato de hora interno).

### Datas desabilitadas

```tsx
// lista de datas
<Datepicker disabledDates={[new Date(2026, 10, 20)]} />

// predicado
<Datepicker disabledDates={(date) => date.getDay() === 0} />
```

`disabledDates` aceita uma lista ou um predicado. Datas desabilitadas não podem ser
selecionadas e recebem a classe `disabled` no calendário. Funciona em `Calendar`,
`CalendarRange`, `Datepicker`, `Rangepicker`, `DatetimePicker` e `CalendarWithTime`.

### Presets

```tsx
<Datepicker presets />
<Rangepicker presets />
```

`presets` como `true` usa os presets embutidos:

- `Datepicker`/`DatetimePicker`: **Today**.
- `Rangepicker`: **Today**, **Last 7 days**, **This month**.

Para personalizar ou localizar:

```tsx
<Rangepicker
  presets={[
    { label: 'Hoje', getValue: () => ({ start: today, end: today }) },
    { label: 'Últimos 7 dias', getValue: () => ({ start: start7, end: today }) },
    { label: 'Este mês', getValue: () => ({ start: monthStart, end: today }) }
  ]}
/>
```

Também é possível criar os presets embutidos manualmente com
`createDatePresets(dateFns, dateType)` e `createRangePresets(dateFns, dateType)`.

## Componentes utilitários

### Chip e ChipGroup

```tsx
<Chip defaultChecked onChange={(checked) => save(checked)}>
  React
</Chip>

<ChipGroup
  label="Tecnologias"
  description="Selecione todas as que usa"
  data={['React', { value: 'vue', label: 'Vue' }]}
  multiple
  value={selected}
  onChange={setSelected}
  error={errors.technologies}
/>
```

- `Chip` usa `role="checkbox"`, `aria-checked` e variantes `filled`/`outline`/`light`.
- `ChipGroup` aceita `data` com strings ou `{ value, label, disabled }`; `multiple` alterna entre
  seleção única e múltipla. `label`/`description`/`error`/`required`/`orientation` são suportados.
- Em seleção múltipla o `onChange` recebe `string[]`; na única, `string` (ou `''` ao desmarcar).

### Fieldset e NativeSelect

```tsx
<Fieldset legend="Conta" description="Dados básicos" disabled={readonly}>
  <NativeSelect
    label="País"
    data={['BR', { value: 'US', label: 'Estados Unidos' }]}
    value={country}
    onChange={setCountry}
    required
  />
</Fieldset>
```

- `Fieldset` agrupa controles com `legend`, `description`, `variant="filled"` e `withBorder`.
- `NativeSelect` embrulha o `<select>` nativo e normaliza o callback para
  `onChange(value, event)`. Suporta `placeholder`, `error`, `description`, `size` e `required`.
- O asterisco de obrigatório é decorativo (`aria-hidden`); o nome acessível vem do `<label>`.

### SwitchGroup e RadioGroup

```tsx
<SwitchGroup
  label="Notificações"
  data={['email', 'push', 'sms']}
  value={channels}
  onChange={setChannels}
/>

<RadioGroup
  label="Plano"
  data={[
    { value: 'basic', label: 'Básico' },
    { value: 'pro', label: 'Pro' }
  ]}
  value={plan}
  onChange={setPlan}
  orientation="horizontal"
  name="plan"
/>
```

- `SwitchGroup` trabalha com arrays (`value`/`defaultValue`/`onChange`) e renderiza `Toggle` com
  `role="switch"`.
- `RadioGroup` continua aceitando filhos (`Radio`) e agora também `data`, `label`, `description`,
  `error`, `required`, `orientation` e `name`.
- Ambos usam `role="group"`/`role="radiogroup"` com nome acessível derivado de `label` ou
  `ariaLabel`.

### FileButton

```tsx
<FileButton onChange={(files) => setFiles(files)} multiple accept="image/*" reset>
  <Button>Enviar imagens</Button>
</FileButton>
```

O input de arquivo fica oculto e é aberto pelo clique no elemento filho. `onChange` recebe
`File[] | null`; `reset` limpa o input após cada seleção para permitir reenviar o mesmo arquivo.

### ThemeIcon, ColorSwatch e Overlay

```tsx
<ThemeIcon status="success" variant="light" ariaLabel="Concluído">
  <Icon icon="checkmark" />
</ThemeIcon>

<ColorSwatch color="#3366ff" checked ariaLabel="Azul" onClick={selectColor} />

<Overlay fixed={false} opacity={0.6} blur={2} ariaLabel="Carregando" />
```

- `ThemeIcon`: `size`, `radius`, `variant` (`filled`/`light`/`outline`), `status`/`color`.
  Sem `ariaLabel` o ícone é decorativo (`aria-hidden`).
- `ColorSwatch`: `size`, `radius`, `withBorder`, `checked`; cores `transparent`/`none` usam o fundo
  quadriculado. A cor é o nome acessível padrão, sobrescrito por `ariaLabel`.
- `Overlay`: `opacity`, `color`, `blur`, `zIndex`, `fixed`, `center`; sem filhos e sem `ariaLabel`
  é puramente decorativo.

### NumberFormatter e PasswordStrength

```tsx
<NumberFormatter value={1234.5} locale="pt-BR" options={{ style: 'currency', currency: 'BRL' }} />

<PasswordStrength value={password} minLength={10} onStrengthChange={setScore} />
```

- `formatNumber(value, locale?, options?)` é exportado como helper. Valores inválidos retornam
  `''`; o componente usa `fallback` (padrão `—`) e aceita `prefix`/`suffix`/`as`.
- `getPasswordStrength(value, minLength?, labels?)` retorna `{ score, label, percentage }` com score
  de 0 a 4. O componente expõe `role="meter"` e `aria-valuenow`/`aria-valuetext`.

## Filtros, formulários e operações

| Componente            | Props e comportamento                                                                                                                                                                                                                                                                                                       |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ResponsiveFilterBar` | Recebe um `editor` como elemento ou função que recebe `close`. Mostra os `filters` ativos e chama `onRemoveFilter` ou `onClearFilters` se definidos. O consumidor administra `savedViews` e `selectedViewId` por meio de `onSelectView`. `layout="auto"` usa um painel inferior até `mobileBreakpoint` (767 px por padrão). |
| `FormErrorSummary`    | Recebe `errors` com `fieldId` e `message`. Quando há erros, mostra o `title` e permite mover o foco para cada campo com um link. `focusOnMount` determina se o resumo recebe foco quando aparece.                                                                                                                           |
| `PermissionMatrix`    | Recebe `resources` e `actions` como linhas e colunas. O `value` indexado por recurso e ação indica decisões explícitas, herdadas ou parciais. `onChange` recebe `{ resourceId, actionId, allowed }` para a aplicação atualizar o estado. Suporta `readOnly`, `caption` e `labels`.                                          |
| `AuditTrail`          | Recebe `groups` com eventos na ordem de exibição. Cada evento inclui título, autor e data, com comparações opcionais por campo em `changes`. Cada comparação recebe `before` e `after`. `labels` personaliza textos e `headingLevel` define a hierarquia dos grupos.                                                        |
| `UploadQueue`         | Recebe `items` com IDs estáveis e estados `queued`, `uploading`, `success`, `error` ou `cancelled`. `onAddFiles` habilita o Dropzone e `onRejectFiles` recebe as rejeições de `accept` e `maxSize`. `onCancel` e `onRetry` recebem o ID. A aplicação executa o upload e atualiza o progresso e os estados.                  |

```tsx
<ResponsiveFilterBar
  editor={(close) => (
    <FilterBuilder
      fields={fields}
      value={draft}
      onChange={setDraft}
      onApply={(rules) => {
        applyRules(rules);
        close();
      }}
    />
  )}
  filters={appliedFilters}
  onRemoveFilter={removeFilter}
  onClearFilters={clearFilters}
  savedViews={views}
  selectedViewId={viewId}
  onSelectView={applyView}
/>
```

Passe o estado do editor por props para preservá-lo ao alternar entre o painel e a versão
inline. Use `close()` no botão Aplicar quando o formulário também confirmar a edição.

```tsx
<FormErrorSummary
  title="Revise os campos"
  errors={[{ fieldId: 'email', message: 'Informe um e-mail válido.' }]}
/>
<label htmlFor="email">E-mail</label>
<Input id="email" type="email" aria-invalid="true" />
```

Consulte as stories de cada componente para exemplos interativos e variações de largura.

## Logs, datas e formulários tabulares

- `LogViewer` recebe `entries` em ordem cronológica, com `id`, `message` e
  `timestamp` e `level` opcionais. A busca filtra as entradas visíveis. Os estados
  `following` e `wrap` podem ser controlados pela aplicação. `height`, `rowHeight`
  e `overscan` ajustam a janela virtualizada.
- `DateField` edita uma data civil por segmentos. `value`, `defaultValue`,
  `min` e `max` usam o formato ISO `YYYY-MM-DD`. `locale` define a ordem
  dos segmentos e os numerais. `name` habilita o envio pelo formulário nativo.
- `MatrixField` recebe `columns` e `value` controlado. Cada linha tem `id` estável
  e `values` por coluna. Use `createRow` para adicionar linhas e `getCellError`
  para ligar mensagens de validação a seus campos. As colunas aceitam
  `text`, `number`, `select` e `checkbox`.

## Seleção, disponibilidade e regras

| Componente | Contrato principal |
| --- | --- |
| `RecordPicker` | `searchRecords` recebe consulta, página e `signal` e devolve os registros e o total. Forneça identificadores estáveis com `getRecordId` para manter seleções ao trocar de página. `columns` configura a pesquisa detalhada. |
| `AvailabilityEditor` | `value` descreve os horários semanais, as exceções por data e o fuso. `onChange` recebe o rascunho e os problemas encontrados, como sobreposições. |
| `DecisionTableEditor` | `fields` e `outcomes` definem as colunas da tabela. `onChange` recebe as regras na ordem exibida. `evaluate` conecta um motor de regras da aplicação à simulação. |
| `ChoiceCardGroup` | `options` descreve as escolhas. Em modo padrão, `value` é a chave escolhida. Com `multiple`, use uma lista de chaves. |
| `IconPicker` | Escolhe um par `{ pack, name }` nos catálogos registrados no provedor. Use `packs` para limitar os catálogos e `fontIcons` para listar ícones de fontes. |
| `OnboardingChecklist` | Recebe `tasks` e informa mudanças com `onTaskStatusChange`. Cada tarefa pode ter um link, uma ação ou um `Tour`. A aplicação pode persistir o progresso. |
| `TraceWaterfall` | Recebe `spans` com identificador, relação de pai, horário inicial e duração em milissegundos. `renderDetails` permite adicionar os detalhes que a aplicação disponibiliza. |

### Edição em lote no DataGrid

`batchEditing.onCommit` recebe as alterações de células em uma chamada. Cada alteração inclui o
identificador da linha, a coluna, o valor anterior, o valor editado e a linha na hora da edição.
Use `getRowId` estável para preservar rascunhos ao paginar. Com `withRangeSelection` e
`withFillHandle`, colagem e preenchimento também ficam pendentes até **Aplicar**.

O grid valida as células e chama `batchEditing.validate` antes de confirmar. Se a confirmação
assíncrona falhar, o rascunho continua disponível para corrigir, tentar novamente ou descartar.
Atualize `data` com os registros persistidos. A edição em lote mantém os callbacks de edição
imediata disponíveis no modo padrão e segue a compatibilidade da edição de células.

### Navegação de PDF no FilePreview

Além de `pageCount` e `renderPage`, o adaptador de PDF aceita `renderThumbnail`, `outline` e
`search` como capacidades opcionais. A busca recebe um `AbortSignal` e devolve páginas e trechos de texto.
Ao escolher um resultado, `renderPage` recebe `match` para o renderizador poder destacar o trecho.
A story **Pdf Navigation** mostra as três capacidades juntas.

## Polimento de componentes

### Button com carregamento

```tsx
<Button loading loadingText="Salvando…" onClick={save}>
  Salvar
</Button>
```

`loading` desabilita o botão, define `aria-busy` e remove o foco da sequência de tabulação.
`loadingText` substitui o conteúdo; sem ele, o rótulo permanece e o spinner ocupa o lugar do
`prefixIcon`. O `suffixIcon` é ocultado durante o carregamento.

### RingProgress

```tsx
<RingProgress value={72} label="72%" ariaLabel="Armazenamento usado" />
<RingProgress
  sections={[
    { value: 40, color: 'var(--color-primary-500)' },
    { value: 25, color: 'var(--color-success-500)' }
  ]}
  label="3/5"
  ariaLabel="Uso por equipe"
/>
```

Com `value`, o anel é um `progressbar` de 0 a 100. Com `sections`, os pesos são normalizados
para preencher o anel e o elemento usa `role="img"`; `size`, `thickness`, `roundCaps`,
`status` e `label` controlam a aparência. O rótulo visual fica `aria-hidden` para não
duplicar o nome acessível.

### Tabset fechável e keepMounted

```tsx
<Tabset onTabClose={closeTab} keepMounted lazyLoad>
  <Tabset.Tab title="Rascunho" closable>
    <DraftForm />
  </Tabset.Tab>
</Tabset>
```

`Tab.closable` mostra o affordance de fechar e envia o índice para `onTabClose`. A tecla
`Delete`/`Backspace` no tab também fecha; `closeLabel` personaliza o título acessível.
`keepMounted` mantém todos os painéis montados desde o início, preservando estado de
formulários mesmo com `lazyLoad`.

### Tree com checkboxes e carregamento assíncrono

```tsx
<Tree
  checkable
  checkedValues={checked}
  onCheckedChange={setChecked}
  data={permissions}
  loadData={(node) => fetchChildren(node.value)}
/>
```

`checkable` habilita seleção em cascata com estado `indeterminate` (`aria-checked="mixed"`).
`checkStrictly` limita a mudança ao nó clicado; nós `disabled` são ignorados pela cascata.
Para nós remotos, marque `hasChildren` e forneça `loadData`; `onLoadError` recebe falhas e
`loadingLabel` nomeia o indicador de carregamento.

### CommandPalette assíncrono

```tsx
<CommandPalette
  opened={opened}
  onClose={close}
  actions={results}
  onSearch={search}
  loading={loading}
  recentActions={recent}
/>
```

Com `onSearch`, o filtro local é desligado e o consumidor controla os resultados; `loading`
mostra `loadingMessage` com `role="status"`. `action.group` cria seções e `recentActions`
aparece apenas com a busca vazia, sem duplicar itens presentes em `actions`.

## Desktop (window manager)

```tsx
const apps = [
  { id: 'notes', title: 'Notes', content: <NotesApp />, defaultWidth: 520 },
  { id: 'settings', title: 'Settings', content: <SettingsApp /> }
];

<Desktop
  fullscreen
  apps={apps}
  taskbarPosition="bottom"
  systemTray={<NotificationButton />}
  defaultWindows={[
    { id: 'welcome', appId: 'notes', x: 80, y: 64, width: 520, height: 340,
      minimized: false, maximized: false, zIndex: 1 }
  ]}
/>
```

- `apps` alimenta o menu **Iniciar** e o taskbar; cada app abre uma ou mais janelas.
- Janelas de app usam sempre o `title` e o `icon` do app na title bar, no menu Iniciar e no
  botão do taskbar, mantendo o mesmo rótulo e ícone nos três lugares. Janelas avulsas
  (sem `appId`) usam `title`/`icon` da própria janela ou de `openWindow`.
- Janelas são posicionadas por `x`/`y`/`width`/`height`, com `zIndex` para sobreposição.
- `draggable`/`resizable`/`minimizable`/`maximizable`/`closable` podem ser definidos por app ou
  por janela; arraste pela title bar e redimensione pelas bordas.
- Minimizar envia para a barra; maximizar ocupa a área do desktop; restaurar volta ao tamanho
  anterior.
- `taskbarPosition`: `bottom`, `top`, `left` ou `right`; `showClock`, `clock`, `clockFormat`,
  `systemTray` e `taskbarActions` controlam o canto de status.
- Use `useDesktop()` para abrir/fechar/focar janelas e `useDesktopWindow()` dentro de uma
  janela para abrir filhos:
  ```tsx
  const { openWindow } = useDesktopWindow();
  openWindow({ title: 'Confirmar', modal: true, content: <Confirm /> });
  ```
- Filhos `modal` recebem backdrop, `aria-modal` e deixam a janela-mãe `inert`/`aria-hidden`
  até fecharem; `Escape` fecha o modal ativo.
- A janela é rolável no body e o desktop preenche o container; `fullscreen` fixa em
  `inset: 0` para uso como modo de exibição da aplicação.

## Overlays

- `Tooltip` e `Popover` aceitam `triggerRef` (API atual).
- `Dialog`/`Window` são abertos por `showDialog`/`showWindow` e exigem os providers
  correspondentes.
- `Toastr` usa `showToastr` e `ToastrProvider`.
- Overlays usam portal, restauração de foco e fechamento por `Esc`/backdrop quando
  configurado.

## Acessibilidade

- `Select`/`Autocomplete`: `combobox`, `listbox`, `option`, `aria-expanded`,
  `aria-activedescendant` (Autocomplete).
- `Tabset`: `tablist`/`tab`/`tabpanel`, `aria-selected`, `aria-controls`; abas fecháveis
  expõem `aria-keyshortcuts="Delete"`.
- `Tree`: `treeitem` com `aria-checked` (incluindo `mixed`) no modo `checkable`.
- `Dialog`/`Window`: `role="dialog"`, `aria-modal`, `aria-label`.
- `DataGrid`: `role="region"`, `aria-sort`, `aria-selected` nas linhas, checkbox
  “selecionar todos” com estado indeterminado.
- `Accordion`: header com `role="button"` e `aria-expanded`.

Sempre forneça nome acessível (`aria-label` ou label associado) para controles sem texto
visível.
