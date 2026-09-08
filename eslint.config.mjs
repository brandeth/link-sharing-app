// @nuxt/eslint generates `.nuxt/eslint.config.mjs` from the project's own
// shape — its pages, components and auto-imports — so extend that rather
// than restating a flat config by hand.
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    /* These props are typed optional, and for several of them absence is
       the meaning: BaseInput renders no label without `label`, and no
       error state without `error`. Giving them an explicit `undefined`
       default to satisfy the rule would add a line per prop and say
       nothing the `?` does not already say. */
    'vue/require-default-prop': 'off',
  },
})
