# Guia de migração

Este guia cobre as mudanças acumuladas na linha `0.4.x` e como migrar código de versões
anteriores.

## Resumo

| Área | Mudança | Ação necessária |
|---|---|---|
| TypeScript | `strictNullChecks` em todos os pacotes | Nenhuma no consumidor; tipos ficaram mais precisos |
| Datas | Adapter plugável + `useDateFns` virou hook | Use `createDateFns` fora de componentes |
| Select | `searchable`, `clearable`, `loading`, virtualização | Opcional |
| Autocomplete | Filtro local, async e estados de loading/empty | Opcional |
| OptionList | Virtualização opt-in, inclusive grupos | Opcional |
| Novos componentes | `Skeleton`, `EmptyState`, `Pagination`, `Table`, `DataGrid` | Opcional |
| `displayName` | Prefixo `@nebular-react/core/` removido | Só afeta quem dependia do valor exato |
| Pacotes | Declarações CJS em `lib-cjs/*.d.cts` | Nenhuma; `require()` agora resolve tipos corretos |

## Datas

### Antes

```tsx
import { useDateFns } from '@nebular-react/hooks';

const dateFns = useDateFns<Date>();
```

### Agora

`useDateFns` continua funcionando, mas lê o adapter do `DateAdapterContext` e deve ser
chamado dentro de um componente React:

```tsx
import { useDateFns } from '@nebular-react/hooks';

function MyComponent() {
  const dateFns = useDateFns<Date>();
}
```

Fora de componentes (testes, utilitários), use a versão pura:

```tsx
import { createDateFns } from '@nebular-react/hooks';

const dateFns = createDateFns<Date>('en-US');
```

`useCalendar` segue a mesma regra; use `createCalendar` fora do React.

### dayjs, date-fns e Temporal

```tsx
import dayjs from 'dayjs';
import * as dateFns from 'date-fns';
import { Temporal } from '@js-temporal/polyfill';
import {
  DateAdapterProvider,
  createDayjsDateAdapter,
  createDateFnsDateAdapter,
  createTemporalDateAdapter
} from '@nebular-react/hooks';

<DateAdapterProvider adapter={createDayjsDateAdapter(dayjs)}>
  <App />
</DateAdapterProvider>;
```

Consulte [Date adapter](date-adapter.md) para detalhes e limitações (timezone explícito
ainda não faz parte do contrato).

## Select e Autocomplete

### Filtro local

```tsx
<Select options={options} searchable />
<Autocomplete data={options} />
```

### Busca assíncrona

```tsx
<Select
  options={options}
  searchable
  loading={loading}
  onSearchChange={fetchOptions}
/>
```

Quando `onSearchChange` é informado, o componente **não** filtra localmente; o consumidor
deve atualizar `options`/`data`.

### Virtualização

```tsx
<Select options={manyOptions} virtualized virtualizedMaxHeight={320} />
<Autocomplete data={manyOptions} virtualized virtualizedMaxHeight={320} />
```

A virtualização preserva `role="group"`, `aria-setsize`/`aria-posinset` e o key manager
por opção. Veja [Virtualização do OptionList](option-list-virtualization.md).

## APIs controladas

O padrão recomendado é `value`/`defaultValue`/`onChange`. Componentes legados mantêm os
nomes históricos (`defaultSelected`/`onSelect`, `activeTabIndex`, etc.) para
compatibilidade. Consulte a tabela em [Componentes e props](components.md).

## DataGrid

Novo componente para telas administrativas:

```tsx
<DataGrid
  data={rows}
  columns={columns}
  pageSize={10}
  withSelection
  onSelectionChange={setSelected}
/>
```

`Table` continua disponível para tabelas estáticas.

## displayName

Os componentes usam `displayName` sem o prefixo de pacote:

```ts
// antes
Button.displayName === '@nebular-react/core/Button';

// agora
Button.displayName === 'Button';
```

A mudança foi necessária para o `react-docgen-typescript` gerar as tabelas de props do
Autodocs. Se você usa `displayName` em testes de snapshot ou DevTools, ajuste o valor
esperado.

## Publicação

O projeto passou a usar Changesets. Para consumidores, nada muda: os pacotes continuam
sendo publicados no npm com os mesmos nomes. Para mantenedores, veja
[Release e publicação](releasing.md).

## Checklist rápida

- [ ] Atualizar React para `19.2+` e Node para `24+`.
- [ ] Se usar `useDateFns` fora de componentes, trocar por `createDateFns`.
- [ ] Se usar busca assíncrona, remover filtro local duplicado.
- [ ] Revisar snapshots que comparam `displayName`.
- [ ] Rodar `yarn lint:package` e `yarn lint:types` no app consumidor.
