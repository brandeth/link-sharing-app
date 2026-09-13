<script setup lang="ts" generic="T extends string">
export interface SelectOption<V extends string = string> {
  value: V
  label: string
  /** Iconify name, shown before the label in the trigger and the menu. */
  icon?: string
}

const props = defineProps<{
  /** Visible label, rendered above the field. */
  label?: string
  options: readonly SelectOption<T>[]
}>()

const value = defineModel<T>({ required: true })

/* The ARIA "select-only combobox" pattern: focus never leaves the
   trigger. The menu's active option is tracked with
   `aria-activedescendant` instead of moving focus into the list, so
   Tab always leaves the field in one step and a screen reader hears
   each option as the arrow keys move over it. */
const id = useId()
const labelId = `${id}-label`
const listboxId = `${id}-listbox`
const optionId = (index: number) => `${id}-option-${index}`

const trigger = ref<HTMLButtonElement>()
const menu = ref<HTMLUListElement>()

const open = ref(false)
const activeIndex = ref(0)

const selectedIndex = computed(() =>
  Math.max(0, props.options.findIndex(option => option.value === value.value)),
)
const selected = computed(() => props.options[selectedIndex.value])

function openMenu() {
  activeIndex.value = selectedIndex.value
  open.value = true
}

function closeMenu() {
  open.value = false
}

function choose(index: number) {
  const option = props.options[index]
  if (option) value.value = option.value
  closeMenu()
  trigger.value?.focus()
}

/* ─── Positioning ────────────────────────────────────────────────
   The menu is teleported to the body and placed with `fixed`
   coordinates read off the trigger. Rendered in place it would be
   clipped by the links list, which is a scroll container — and a
   14-option menu is taller than most of what it would sit inside.

   It opens 16px below the trigger, or above it when there is not room
   for a useful height below and there is more room above. Its height
   is capped to the space on the side it opens towards, and the list
   scrolls within that. */
const GAP = 16
const EDGE = 16
const menuStyle = ref<Record<string, string>>({})

function place() {
  const rect = trigger.value?.getBoundingClientRect()
  if (!rect) return

  const below = window.innerHeight - rect.bottom - GAP - EDGE
  const above = rect.top - GAP - EDGE
  const openUp = below < 240 && above > below

  menuStyle.value = {
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    maxHeight: `${Math.max(openUp ? above : below, 120)}px`,
    ...(openUp
      ? { bottom: `${window.innerHeight - rect.top + GAP}px` }
      : { top: `${rect.bottom + GAP}px` }),
  }
}

/* While open, follow the trigger through any scroll — capture phase,
   because the scrolling element is usually an ancestor list rather
   than the window — and close on a press anywhere outside both the
   trigger and the menu. */
function onPointerDown(event: PointerEvent) {
  const target = event.target as Node
  if (!trigger.value?.contains(target) && !menu.value?.contains(target)) closeMenu()
}

watch(open, async (isOpen) => {
  if (isOpen) {
    place()
    window.addEventListener('scroll', place, true)
    window.addEventListener('resize', place)
    document.addEventListener('pointerdown', onPointerDown)
    await nextTick()
    scrollActiveIntoView()
  }
  else {
    window.removeEventListener('scroll', place, true)
    window.removeEventListener('resize', place)
    document.removeEventListener('pointerdown', onPointerDown)
  }
})

onBeforeUnmount(closeMenu)

function scrollActiveIntoView() {
  document.getElementById(optionId(activeIndex.value))?.scrollIntoView({ block: 'nearest' })
}

function moveTo(index: number) {
  activeIndex.value = Math.min(Math.max(index, 0), props.options.length - 1)
  nextTick(scrollActiveIntoView)
}

/* ─── Typeahead ──────────────────────────────────────────────────
   Typing jumps to the first option starting with what has been typed
   in the last half-second, searching forward from the current one. */
let typed = ''
let typedTimer: ReturnType<typeof setTimeout> | undefined

function typeahead(char: string) {
  clearTimeout(typedTimer)
  typed += char.toLowerCase()
  typedTimer = setTimeout(() => (typed = ''), 500)

  const count = props.options.length
  const start = typed.length === 1 ? activeIndex.value + 1 : activeIndex.value
  for (let step = 0; step < count; step++) {
    const index = (start + step) % count
    if (props.options[index]!.label.toLowerCase().startsWith(typed)) {
      if (!open.value) openMenu()
      moveTo(index)
      return
    }
  }
}

function onKeydown(event: KeyboardEvent) {
  const { key } = event

  if (!open.value) {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(key)) {
      event.preventDefault()
      openMenu()
    }
    else if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      typeahead(key)
    }
    return
  }

  switch (key) {
    case 'ArrowDown':
      event.preventDefault()
      moveTo(activeIndex.value + 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      moveTo(activeIndex.value - 1)
      break
    case 'Home':
      event.preventDefault()
      moveTo(0)
      break
    case 'End':
      event.preventDefault()
      moveTo(props.options.length - 1)
      break
    case 'Enter':
    case ' ':
      event.preventDefault()
      choose(activeIndex.value)
      break
    case 'Escape':
      event.preventDefault()
      closeMenu()
      break
    /* Tab keeps the highlighted option, per the pattern, and lets focus
       move on normally. */
    case 'Tab':
      value.value = props.options[activeIndex.value]!.value
      closeMenu()
      break
    default:
      if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) typeahead(key)
  }
}
</script>

<template>
  <div class="flex w-full flex-col gap-2">
    <!-- A plain span, not a <label>: a label's click would focus the
         trigger AND fire its click, opening the menu from the label. -->
    <span v-if="label" :id="labelId" class="text-preset-4 text-fg-heading">
      {{ label }}
    </span>

    <!-- The same 56px frame as BaseInput — border, radius, 16px padding
         and brand focus glow — so a select and a text field stack as one
         form. Open counts as focused, so the glow stays while the pointer
         is in the menu. -->
    <button
      ref="trigger"
      type="button"
      role="combobox"
      :aria-labelledby="label ? labelId : undefined"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :aria-controls="listboxId"
      :aria-activedescendant="open ? optionId(activeIndex) : undefined"
      class="flex h-14 w-full items-center gap-4 rounded-lg border bg-surface px-4 text-left transition-[border-color,box-shadow] outline-none focus-visible:border-brand focus-visible:glow-brand"
      :class="open ? 'border-brand glow-brand' : 'border-border'"
      @click="open ? closeMenu() : openMenu()"
      @keydown="onKeydown"
    >
      <Icon
        v-if="selected?.icon"
        :name="selected.icon"
        size="16"
        class="shrink-0 text-fg-secondary"
      />
      <span class="min-w-0 flex-1 truncate text-preset-3 text-fg-heading">
        {{ selected?.label }}
      </span>
      <!-- Flips to point up while the menu is open. -->
      <Icon
        name="ph:caret-down-bold"
        size="16"
        class="shrink-0 text-brand transition-transform"
        :class="{ 'rotate-180': open }"
      />
    </button>

    <Teleport to="#teleports">
      <!-- `-1` tabindex keeps the list out of the tab order: focus stays
           on the trigger, and a pointer press on the list's scrollbar
           does not pull focus away from it. -->
      <ul
        v-if="open"
        :id="listboxId"
        ref="menu"
        role="listbox"
        tabindex="-1"
        :aria-labelledby="label ? labelId : undefined"
        class="fixed z-50 overflow-y-auto rounded-lg border border-border bg-surface px-4 py-3 shadow-[0_0_32px_0_rgb(0_0_0/0.1)]"
        :style="menuStyle"
        @mousedown.prevent
      >
        <!-- Options are divided by a 1px rule with 12px either side. The
             rule is a border on every option after the first, so it is
             part of the option's box and the pointer never falls in a gap
             between two. -->
        <li
          v-for="(option, index) in options"
          :id="optionId(index)"
          :key="option.value"
          role="option"
          :aria-selected="index === selectedIndex"
          class="flex cursor-pointer items-center gap-3 py-3 text-preset-3 transition-colors not-first:border-t not-first:border-border first:pt-0 last:pb-0 hover:text-brand"
          :class="index === selectedIndex || index === activeIndex ? 'text-brand' : 'text-fg-heading'"
          @click="choose(index)"
          @mousemove="activeIndex = index"
        >
          <Icon
            v-if="option.icon"
            :name="option.icon"
            size="16"
            class="shrink-0"
            :class="index === selectedIndex || index === activeIndex ? 'text-brand' : 'text-fg-secondary'"
          />
          <span>
            {{ option.label }}
            <!-- The design spells the current choice out rather than
                 marking it with colour alone. -->
            <template v-if="index === selectedIndex">(Selected)</template>
          </span>
        </li>
      </ul>
    </Teleport>
  </div>
</template>
