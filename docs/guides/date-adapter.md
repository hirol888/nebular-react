# Date adapter

Os componentes de data (`Calendar`, `Datepicker`, `Rangepicker`, `DatetimePicker`,
`Timepicker` e `CalendarWithTime`) usam uma camada de adapter em
`@nebular-react/hooks`.

## Padrão

Sem configuração, o adapter mantém o comportamento histórico:

- aceita `Date` nativo e objetos `Moment`;
- cria valores `Date` por padrão;
- usa `moment` para locale, parsing e formatação.

```tsx
import { Datepicker } from '@nebular-react/core';

<Datepicker placeholder="Selecione uma data" />;
```

## Adapters embutidos

```tsx
import {
  DateAdapterProvider,
  momentDateAdapter,
  nativeDateAdapter
} from '@nebular-react/hooks';

// Datas nativas em todo o app
<DateAdapterProvider adapter={nativeDateAdapter}>{children}</DateAdapterProvider>;

// Datas Moment em todo o app
<DateAdapterProvider adapter={momentDateAdapter}>{children}</DateAdapterProvider>;
```

## dayjs

O adapter de dayjs recebe a instância da biblioteca, então `dayjs` não é uma dependência
obrigatória do pacote:

```tsx
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { DateAdapterProvider, createDayjsDateAdapter } from '@nebular-react/hooks';

dayjs.extend(customParseFormat);

const adapter = createDayjsDateAdapter(dayjs);

<DateAdapterProvider adapter={adapter}>
  <Datepicker />
</DateAdapterProvider>;
```

O plugin `customParseFormat` é necessário para parsing com formato explícito.

## date-fns

```tsx
import * as dateFns from 'date-fns';
import { DateAdapterProvider, createDateFnsDateAdapter } from '@nebular-react/hooks';

const adapter = createDateFnsDateAdapter(dateFns);

<DateAdapterProvider adapter={adapter}>
  <Datepicker />
</DateAdapterProvider>;
```

O adapter traduz os tokens usados pelos componentes (`YYYY`, `DD`, `A`) para os tokens do
date-fns (`yyyy`, `dd`, `a`) e usa `Intl` para nomes de meses/dias e primeiro dia da semana.

## Temporal

```tsx
import { Temporal } from '@js-temporal/polyfill';
import { DateAdapterProvider, createTemporalDateAdapter } from '@nebular-react/hooks';

const adapter = createTemporalDateAdapter(Temporal);

<DateAdapterProvider adapter={adapter}>
  <Datepicker />
</DateAdapterProvider>;
```

O adapter usa `Temporal.PlainDateTime`, aceita ISO strings e os formatos usados pelos
componentes. Datas são imutáveis; `clone` retorna o próprio valor. Timezone explícito não
faz parte do contrato atual.

## Adapters customizados

Para outra biblioteca, implemente a interface `DateFns` e registre via
`createDateAdapter`:

```tsx
import { createDateAdapter, DateAdapterProvider } from '@nebular-react/hooks';

const adapter = createDateAdapter('minha-lib', 'native', (locale) => ({
  // createDate, today, parse, format, addDays, getYear, startOfMonth, ...
  ...minhaImplementacao
}));

<DateAdapterProvider adapter={adapter}>{children}</DateAdapterProvider>;
```

A interface completa está em `DateFns` e `DateAdapter` em
`src/nebular-react-hooks/src/use-date-fns/use-date-fns.tsx`.

## Compatibilidade

- `dateType` continua existindo nos componentes por compatibilidade (`native`, `moment`,
  `dayjs`, `date-fns`, `temporal`).
- O adapter registrado no provider é a fonte de verdade para criação, parsing e
  formatação; o `dateType` é usado apenas por adapters legados.
- `useDateFns` e `useCalendar` agora são hooks; para uso fora de componentes React use
  `createDateFns` e `createCalendar`.
