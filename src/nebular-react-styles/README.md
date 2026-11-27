# Nebular styles

Nebular CSS-in-JS library built on top of emotion

## Installation

```bash
# With yarn
yarn add @nebular-react/styles

# With npm
npm install @nebular-react/styles
```

## Lightweight icon catalog

The standard entry point includes Eva and uses it as the default icon pack.
Applications that only need the built-in `nebular-essentials` icons can enable
the `nebular-light` resolution condition for their build. Imports stay the same,
including imports through `@nebular-react/core` and `@nebular-react/hooks`.

For webpack or Rspack, add the condition alongside the default conditions:

```js
export default {
  resolve: { conditionNames: ['nebular-light', '...'] }
};
```

For Node.js, run with `--conditions=nebular-light`. Apply the same condition
to the browser and server builds when using SSR. The light catalog defaults to
`nebular-essentials`. To render other icons in this mode, register their pack
through the `svgIconPacks` prop of `NebularProvider`.

## License

MIT
