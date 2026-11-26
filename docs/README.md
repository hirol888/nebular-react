# Documentação — Nebular React

Documentação pública: **https://hirol888.github.io/nebular-react/**

## Guias

- [Primeiros passos](guides/getting-started.md)
- [Componentes e props](guides/components.md)
- [Migração](guides/migration.md)
- [Date adapter](guides/date-adapter.md)
- [Virtualização do OptionList](guides/option-list-virtualization.md)
- [Type safety incremental](guides/type-safety.md)
- [Release e publicação](guides/releasing.md)

## Storybook

O Storybook é a referência viva de componentes, props e variações. Cada componente possui
uma página de documentação gerada por Autodocs com tabela de props, exemplos e checagens
de acessibilidade.

```bash
yarn storybook        # desenvolvimento em http://localhost:7618
yarn build-storybook  # build estático em storybook-static/
```

O workflow `.github/workflows/pages.yml` publica o build estático no GitHub Pages a cada
push em `develop`.
