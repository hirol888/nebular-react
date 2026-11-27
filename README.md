# Nebular React

[![npm](https://img.shields.io/npm/v/@nebular-react/core)](https://www.npmjs.com/package/@nebular-react/core)
[![npm](https://img.shields.io/npm/dm/@nebular-react/hooks)](https://www.npmjs.com/package/@nebular-react/hooks)

> :warning: \*\*This is not a production version yet.

This library is inspired by two popular design systems, [Nebular Angular](https://akveo.github.io/nebular/) and [Mantine](https://mantine.dev/). It has been recreated for React, allowing developers to create customizable and visually appealing user interfaces for their web applications.

## Demo

### [Demo Repo](https://github.com/hirol888/nebular-react-demo)

### [Live Demo](https://nebular-react-demo-vlx2m.ondigitalocean.app/)

## Installation

```bash
# With yarn
yarn add @nebular-react/hooks @nebular-react/core @nebular-react/styles

# With npm
npm install --save @nebular-react/hooks @nebular-react/core @nebular-react/styles
```

## Storybook

```bash
# With yarn
yarn storybook

# With npm
npm run storybook
```

## Packages

- `@nebular-react/hooks` – collection of hooks for state and UI management
- `@nebular-react/styles` – [emotion](https://emotion.sh/) based css-in-js library that is used in all Nebular components
- `@nebular-react/core` – core components library – exports everything from `@nebular-react/styles`
- `@nebular-react/ssr` – server side rendering utilities
- `@nebular-react/next` – server side rendering utilities for Next.js

## Tests

```bash
yarn test          # prettier + syncpack + typecheck + lint + jest
yarn coverage      # cobertura com thresholds
yarn lint:package  # publint (exports/package.json)
yarn lint:types    # attw (tipos ESM/CJS)
yarn e2e           # Storybook estático + Playwright (pointer, janelas, snap, compacto)
yarn e2e:update    # regrava o baseline visual (opcional)
yarn e2e:install   # instala o Chromium do Playwright
```

O workflow `.github/workflows/e2e.yml` roda os testes de ponteiro no Linux a cada push/PR.
O job manual `visual-baseline` gera o PNG Linux e o publica como artifact para ser commitado.

## Documentation

Documentação pública: **https://hirol888.github.io/nebular-react/**

Storybook 10 é a documentação viva dos componentes, com Autodocs, tabelas de props e
checagens de acessibilidade:

```bash
yarn storybook        # desenvolvimento em http://localhost:7618
yarn build-storybook  # build estático em storybook-static/
```

Guias:

- [Primeiros passos](docs/guides/getting-started.md)
- [Componentes e props](docs/guides/components.md)
- [Migração](docs/guides/migration.md)
- [Date adapter](docs/guides/date-adapter.md)
- [Virtualização do OptionList](docs/guides/option-list-virtualization.md)
- [Type safety incremental](docs/guides/type-safety.md)
- [Release e publicação](docs/guides/releasing.md)

## Releases

O projeto usa [Changesets](https://github.com/changesets/changesets):

```bash
yarn changeset         # criar changeset
yarn changeset:status  # ver o que será publicado
```

A publicação no npm roda no workflow `Release` com provenance via OIDC. O Storybook é
publicado no GitHub Pages pelo workflow `Deploy Storybook`. Veja
[`docs/guides/releasing.md`](docs/guides/releasing.md) para secrets e configuração.

## TBD

### Material Styles

## License

MIT
