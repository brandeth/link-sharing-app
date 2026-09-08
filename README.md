# Link Sharing App

A Nuxt 4 app for sharing a personal set of links. The UI is being built up
as a small design system first — see `/design-system` for the live
component and token reference.

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server with HMR |
| `npm run build` | Production build into `.output` |
| `npm run preview` | Serve the production build |
| `npm run lint` | ESLint (`npm run lint:fix` to autofix) |
| `npm run typecheck` | `vue-tsc` over the app and its generated types |

## How the styling is organised

Colour is defined in `app/assets/css/main.css` in two tiers, and the
distinction is load-bearing:

- **Primitives** (`grey-500`, `purple-600`, …) are the raw palette, named
  by scale and never by usage. They live in `@theme static` so the whole
  palette is readable at runtime — the design-system page reads its own
  swatch values back out of `:root`.
- **Semantic roles** (`brand`, `danger`, `fg-secondary`, `surface-muted`,
  …) map a primitive to a job. **Components should use only these.**

Roles live in `@theme inline`, which resolves to the primitive at the
point of use and emits no custom property of its own. Hand-written CSS in
that file therefore has to name the primitive directly — the `glow-*`
utilities do, and the comment there explains why.

## Components

`app/components/` holds the `Base*` components that make up the app's UI.
`app/components/ds/` holds the design-system page's own furniture, which
is page chrome rather than app UI and is not meant for reuse elsewhere.

Every specimen on `/design-system` renders from the same props its code
snippet is generated from, and prop defaults are read off the component
at runtime, so a snippet cannot drift from the component it documents.

## Accessibility notes

Contrast is checked against WCAG 1.4.3 (4.5:1 for body text). Two pairings
needed care and are commented where they are defined:

- The primary button's hover fill is a *lighter* purple, so its label
  switches to `fg-on-brand-hover` — white would sit at 1.98:1.
- Disabled controls carry their state with a muted fill rather than
  opacity. Fading a control multiplies through content that is already
  light and makes it read as missing rather than as inactive.
