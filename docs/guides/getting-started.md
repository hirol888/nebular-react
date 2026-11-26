# Primeiros passos

## Requisitos

- Node.js **24+**
- React **19.2+**
- React DOM **19.2+**

## Instalação

```bash
yarn add @nebular-react/core @nebular-react/hooks @nebular-react/styles
```

Para SSR com Next.js:

```bash
yarn add @nebular-react/ssr @nebular-react/next
```

## Provider

`NebularProvider` injeta tema, direção (LTR/RTL) e os icon packs usados pelos
componentes.

```tsx
import { NebularProvider, DEFAULT_THEME } from '@nebular-react/styles';
import {
  DialogProvider,
  ToastrProvider,
  WindowProvider
} from '@nebular-react/core';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <NebularProvider theme={DEFAULT_THEME} dir="ltr">
      <WindowProvider>
        <DialogProvider>
          <ToastrProvider>{children}</ToastrProvider>
        </DialogProvider>
      </WindowProvider>
    </NebularProvider>
  );
}
```

Os providers de overlay são necessários apenas se você usar `showDialog`,
`showWindow` ou `showToastr`. Componentes locais como `Popover`, `Tooltip`, `Menu` e
`Select` funcionam sem eles.

## Tema e direção

```tsx
import {
  NebularProvider,
  DEFAULT_THEME,
  COSMIC_THEME,
  CORPORATE_THEME,
  DARK_THEME
} from '@nebular-react/styles';

<NebularProvider theme={DARK_THEME} dir="rtl">
  <App />
</NebularProvider>;
```

Os temas usam variáveis CSS e podem ser sobrescritos via `theme` ou pelas variáveis
`--<component>-*` documentadas no Storybook.

## Estilos globais

```tsx
import { GlobalStyles, NormalizeCSS } from '@nebular-react/styles';

<>
  <NormalizeCSS />
  <GlobalStyles />
  <App />
</>;
```

## Primeiro componente

```tsx
import { Button, Card, DataGrid, Select } from '@nebular-react/core';

<Card>
  <Card.Header>Usuários</Card.Header>
  <Card.Body>
    <Select
      options={[
        { type: 'option', label: 'Ativo', value: 'active' },
        { type: 'option', label: 'Inativo', value: 'inactive' }
      ]}
      placeholder="Status"
      searchable
      clearable
    />
    <Button status="primary">Filtrar</Button>
  </Card.Body>
</Card>;
```

## Importação e tree-shaking

Os pacotes publicam ESM e CJS com `exports` map e declarações separadas:

- `import` → `esm/` + `lib/` (`.d.ts`)
- `require` → `cjs/` + `lib-cjs/` (`.d.cts`)

```ts
import { Button } from '@nebular-react/core'; // ESM
const { Button } = require('@nebular-react/core'); // CJS
```

## SSR e Next.js

```tsx
// pages/_document.tsx
import { createGetInitialProps } from '@nebular-react/next';

const getInitialProps = createGetInitialProps();

export default class Document extends NextDocument {
  static getInitialProps = getInitialProps;
}
```

Para outros servidores, use `ServerStyles` e `createStylesServer` de
`@nebular-react/ssr`.

## Acessibilidade

Os componentes seguem padrões ARIA quando aplicável (`combobox`/`listbox` no
Select/Autocomplete, `tablist`/`tabpanel` no Tabset, `dialog` em Dialog/Window,
`region` no DataGrid). Use sempre um label acessível:

```tsx
<Select aria-label="Status" options={options} />
<DataGrid ariaLabel="Usuários" data={rows} columns={columns} />
```
