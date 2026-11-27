# Release e publicação

## Pré-requisitos

- Acesso ao repositório `hirol888/nebular-react`.
- Secret `NPM_TOKEN` com permissão de publicação nos pacotes `@nebular-react/*`.
- GitHub Pages configurado com **Source: GitHub Actions**.
- Branch de release: `develop`.

## Changesets

Cada PR que altera comportamento deve incluir um changeset:

```bash
yarn changeset
```

Escolha os pacotes afetados e o tipo de bump (`patch`, `minor`, `major`). O arquivo gerado
em `.changeset/` deve ser commitado junto com o código.

Verificar o estado sem alterar arquivos:

```bash
yarn changeset:status
```

## Fluxo de publicação

1. O PR é revisado e mergeado em `develop`.
2. O workflow **Release** (`release.yml`) roda `changesets/action`.
3. Sem changesets pendentes de versão, a action publica os pacotes alterados no npm.
4. Com changesets pendentes, a action abre/atualiza um PR `chore: release packages`.
5. Ao mergear o PR de versão, a action publica com provenance.

O script de publicação é:

```json
"release": "yarn build:all && changeset publish"
```

A publicação usa:

- `NODE_AUTH_TOKEN` ← secret `NPM_TOKEN`
- `NPM_CONFIG_PROVENANCE=true`
- `publishConfig.provenance: true` em cada pacote
- permissão `id-token: write` no workflow

## Validação local antes do merge

```bash
yarn build:all
yarn lint:package
yarn lint:types
yarn exports
yarn conflicts
yarn test
yarn build-storybook
```

## Documentação publicada

O workflow **Deploy Storybook** (`.github/workflows/pages.yml`) roda em push para
`develop`:

1. instala dependências;
2. builda os pacotes;
3. gera `storybook-static/` com Autodocs;
4. publica no GitHub Pages.

URL esperada: `https://hirol888.github.io/nebular-react/`.

Para habilitar no GitHub:

1. **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Executar o workflow uma vez (`workflow_dispatch`).

## Secrets e permissões

| Nome | Onde | Uso |
|---|---|---|
| `NPM_TOKEN` | Actions secrets | `npm publish` com provenance |
| `GITHUB_TOKEN` | Automático | Abrir PR de versão e criar releases |

O `GITHUB_TOKEN` precisa de `contents: write` e `pull-requests: write`, já declarados no
workflow.

## Troubleshooting

- **`EOTP`/`403` no npm**: renove o `NPM_TOKEN` e confirme acesso ao escopo
  `@nebular-react`.
- **Provenance indisponível**: verifique `id-token: write` e se o repositório é público.
- **Pages 404**: confirme que o Source está em “GitHub Actions” e que o build gerou
  `storybook-static/index.html`.
- **Pacote não publicado**: confira se o changeset foi mergeado e se a versão em
  `package.json` mudou.
