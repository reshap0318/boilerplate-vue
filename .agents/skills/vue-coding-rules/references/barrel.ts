// ============================================================
// Barrel Exports — PATTERN EXAMPLE ONLY, not an exhaustive list.
// Always read the real barrel (src/stores/index.ts, src/composables/index.ts,
// src/components/utils/index.ts) before adding a new export.
// ============================================================

// ============================================================
// stores/index.ts — value export + type export per store
// ============================================================
export { useRoleStore } from './role'
export type { IRole, IRolePayload } from './role'

export { useUserStore } from './user'
export type { IUser, IUserPayload } from './user'

// Usage (pages/components only — inside stores/ import files directly):
// import { useRoleStore, useUserStore } from '@/stores'
// import type { IUser } from '@/stores'

// ============================================================
// composables/index.ts — alphabetical
// ============================================================
export { useCrud } from './useCrud'
export type { UseCrudOptions } from './useCrud'
export { useFormError } from './useFormError'
export { useLookup } from './useLookup'
export type { UseLookupOptions } from './useLookup'
export { usePermission } from './usePermission'
export { withFile } from './withFile'

// Usage: import { useFormError, usePermission } from '@/composables'

// ============================================================
// components/utils/index.ts — components, then one type block
// ============================================================
export { default as FormInput } from './FormInput.vue'
export { default as FormSelect } from './FormSelect.vue'
export { default as UiButton } from './UiButton.vue'
export { default as UiModal } from './UiModal.vue'

export type { FormSelectProps, TSelectOption, UiModalProps } from './types'

// Usage: import { FormInput, UiButton, UiModal } from '@/components/utils'
