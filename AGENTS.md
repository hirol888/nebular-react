# NebularCore

Nebular React UI component library. A monorepo of npm packages published separately, vendored into the AllApp monorepo via `file:` dependencies.

Excluded from Nx scanning (listed in `.nxignore`).

## Structure

```
src/
  nebular-react-core/    — Main component library (React 19, Emotion-based CSS-in-JS)
  nebular-react-hooks/   — React hooks
  nebular-react-next/    — Next.js SSR utilities
  nebular-react-ssr/     — SSR utilities
  nebular-react-styles/  — Emotion-based style library
```

Each package under `src/` is a standalone npm package with its own `package.json`, `tsconfig.build.json`, and `README.md`.

## How it's consumed

Other domains reference it via `file:` dependencies in root `package.json`:
- `@nebular-react/core` → `Common/webapp/external-libs/nebular-react-core`
- `@nebular-react/hooks` → `Common/webapp/external-libs/nebular-react-hooks`
- `@nebular-react/styles` → `Common/webapp/external-libs/nebular-react-styles`

These vendored copies are built from this submodule using its build scripts.

## Commands

```sh
npm run build         # Build all packages
npm run release       # Publish packages
npm run storybook     # Storybook dev server
npm test              # Jest tests
npm run lint          # ESLint
```

## Tooling

- Yarn (has `yarn.lock`)
- Storybook for component development
- Emotion for CSS-in-JS
- Syncpack for dependency version management
- ESLint flat config, Prettier
