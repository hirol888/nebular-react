# Changesets

Este diretório guarda os changesets do monorepo. Cada mudança relevante deve ter um
arquivo descrevendo os pacotes afetados e o tipo de bump.

```bash
yarn changeset         # cria um changeset interativo
yarn changeset:status  # mostra o que será publicado
```

O workflow `.github/workflows/release.yml` usa `changesets/action` para abrir o PR de
versão e publicar no npm com provenance.

Consulte `docs/guides/releasing.md` para o fluxo completo.
