# Virtualização do OptionList

`OptionList` suporta virtualização opt-in para listas grandes, incluindo listas agrupadas.

```tsx
<OptionList
  data={options}
  virtualized
  virtualizedItemHeight={36}
  virtualizedMaxHeight={320}
  overscan={3}
/>
```

`Select` e `Autocomplete` expõem as mesmas opções:

```tsx
<Select options={options} virtualized virtualizedMaxHeight={320} searchable />
```

## Listas agrupadas

Grupos e opções são achatados em uma lista uniforme de linhas:

- o cabeçalho do grupo ocupa uma linha;
- cada opção ocupa uma linha (`virtualizedItemHeight`);
- o segmento visível mantém `role="group"` e `aria-label` do grupo;
- opções recebem `aria-setsize` e `aria-posinset` considerando todas as opções;
- o key manager de `Select`/`Autocomplete` continua indexando apenas opções, não cabeçalhos.

Exemplo:

```tsx
const data = [
  {
    type: 'group',
    label: 'Frutas',
    options: [
      { type: 'option', label: 'Apple', value: 'apple' },
      { type: 'option', label: 'Banana', value: 'banana' }
    ]
  }
];

<Select options={data} virtualized searchable />;
```

## Scroll e item ativo

O `OptionList` rola automaticamente até a linha da opção ativa, inclusive quando a opção
está em um grupo. O cabeçalho do grupo não interfere no índice de opções usado pelo
`useListKeyManager`.

## Observações

- `virtualizedItemHeight` é usado tanto para opções quanto para cabeçalhos de grupo.
- Listas pequenas devem manter `virtualized={false}` para evitar overhead.
