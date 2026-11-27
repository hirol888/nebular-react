# Type safety incremental

O `strictNullChecks` está ativado por pacote em todos os pacotes publicados:
`hooks`, `styles`, `ssr`, `core` e `next`.

## Hooks

Config dedicada:

```bash
yarn typecheck:hooks
```

Ela usa `src/nebular-react-hooks/tsconfig.strict.json`, que:

- inclui apenas `src/nebular-react-hooks/src`;
- exclui testes e stories;
- resolve `@nebular-react/styles` pelas declarações publicadas em `lib/`;
- ativa `strictNullChecks`.

`yarn typecheck` executa o typecheck global e, em seguida, o typecheck estrito dos hooks.
O CI roda `yarn build:all` antes de `yarn test`, garantindo que `lib/` exista.

## Styles

Config dedicada:

```bash
yarn typecheck:styles
```

`src/nebular-react-styles/tsconfig.strict.json` segue o mesmo modelo: inclui apenas
`src`, exclui testes/stories, ativa `strictNullChecks` e usa `noEmit`.

## SSR

Config dedicada:

```bash
yarn typecheck:ssr
```

`src/nebular-react-ssr/tsconfig.strict.json` usa o mesmo modelo e já compila sem erros de
nulabilidade.

## Core

Config dedicada:

```bash
yarn typecheck:core
```

`src/nebular-react-core/tsconfig.strict.json` usa o mesmo modelo, com `paths` apontando
para os fontes de `@nebular-react/hooks` e `@nebular-react/styles`. O core foi migrado
corrigindo:

- defaults de contexto (`Accordion`, `Menu`, `Tags`, `Card`, `RadioGroup`, `OptionList`);
- refs de DOM e overlays (`RefObject<T | null>` em vez de `MutableRefObject<T>`);
- guards em `Portal`, `Icon`, `Datepicker`, `Rangepicker`, `DatetimePicker`, `Timepicker`;
- `createStyles`/`useComponentDefaultProps` para refletir os defaults aplicados;
- retornos `null` em estilos convertidos para `{}`/`''`.

## Next

Config dedicada:

```bash
yarn typecheck:next
```

`src/nebular-react-next/tsconfig.strict.json` usa o mesmo modelo, com `paths` para
`@nebular-react/ssr` e `@nebular-react/styles`. O pacote já compila sem erros de
nulabilidade.

## Cobertura

Todos os pacotes publicados compilam com `strictNullChecks`:

| Pacote | Script |
|---|---|
| `@nebular-react/hooks` | `yarn typecheck:hooks` |
| `@nebular-react/styles` | `yarn typecheck:styles` |
| `@nebular-react/ssr` | `yarn typecheck:ssr` |
| `@nebular-react/core` | `yarn typecheck:core` |
| `@nebular-react/next` | `yarn typecheck:next` |

## Regras

- Não habilitar `strict` global de uma vez.
- Preferir `RefObject<T | null>` a `MutableRefObject<T>` quando o ref realmente começa nulo.
- Manter guards explícitos para refs de DOM e APIs opcionais.
- Não usar `@ts-ignore` para silenciar erros.
