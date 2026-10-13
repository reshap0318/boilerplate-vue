<script setup lang="ts">
import { computed } from 'vue'
import type { FormToggleProps } from './types'

const props = withDefaults(defineProps<FormToggleProps>(), {
  label: '',
  size: 'md',
  disabled: false,
  classes: () => ({}),
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const boxSizeClass = computed(() => (props.size === 'sm' ? 'h-4 w-7' : 'h-6 w-11'))

const afterSizeClass = computed(() =>
  props.size === 'sm'
    ? 'after:h-3 after:w-3 peer-checked:after:translate-x-3'
    : 'after:h-5 after:w-5 peer-checked:after:translate-x-5',
)
</script>

<template>
  <label :class="['inline-flex items-center gap-2 cursor-pointer', classes.wrapper]">
    <!-- Input sits opacity-0 but full-size over the visible track (not clipped to 1x1px via
         sr-only) so its geometry always matches what's already on screen — a clipped/off-flow
         hidden input made the browser's focus-scroll-into-view jump the nearest overflow-hidden
         ancestor (the modal panel) to a huge scrollTop trying to reveal it, blanking the modal. -->
    <span :class="['relative inline-block shrink-0', boxSizeClass]">
      <input
        type="checkbox"
        class="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
        :checked="modelValue"
        :disabled="disabled"
        @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
      />
      <span
        :class="[
          'pointer-events-none absolute inset-0 rounded-full bg-slate-200 transition-colors',
          'peer-checked:bg-blue-600 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-600/30',
          'peer-disabled:opacity-50 peer-disabled:cursor-not-allowed',
          'after:absolute after:left-0.5 after:top-0.5 after:rounded-full after:bg-white after:shadow after:transition-transform',
          afterSizeClass,
          classes.track,
        ]"
      />
    </span>
    <span v-if="label" :class="['text-sm text-slate-700', classes.label]">{{ label }}</span>
  </label>
</template>
