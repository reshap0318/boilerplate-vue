---
name: vue-coding-rules
description: Coding rules for this Vue 3 + Pinia + TypeScript boilerplate. MUST be used whenever writing, editing or reviewing any file under src/ — .vue components, Pinia stores, composables (useCrud, withFile, useLookup), router, axios/API calls, Vuelidate forms, FormModal, FormSelect/dropdown options, permissions, Tailwind styling, barrel exports, import order. Also use when deciding whether a store should use useCrud, or how to load select options without redundant API calls. Triggers (EN/ID) - "buat store", "buat komponen", "tambah field", "select/dropdown", "modal form", "panggil API", "rapikan import", "review kode".
---

## When to use me

Use this skill when:

- Creating or modifying Vue components, Pinia stores, or route configurations
- Writing TypeScript interfaces, types, or validation rules
- Implementing API calls, error handling, or form validation
- Styling components with Tailwind CSS
- Setting up barrel exports for stores or components
- Reviewing code for adherence to project conventions

Do NOT use this skill for:

- Backend code or API server implementation
- Non-Vue/TypeScript files

---

# Vue Coding Rules

## Project Structure

```
src/
├── assets/           # Static assets
├── components/       # Reusable components
│   ├── directives/   # Custom directives
│   ├── layouts/      # Layout components
│   └── utils/        # UI components (UiButton, UiCard, etc)
├── composables/      # useCrud, withFile, useLookup, usePermission, useFormError
├── helpers/          # Utility functions
├── layouts/          # Page layout wrappers
├── pages/            # Page/view components (route-level)
├── plugins/          # Vue plugins (axios, swal)
├── router/           # Vue Router config
├── stores/           # Pinia state management
└── main.ts           # Entry point
```

**Folder naming:** kebab-case, plural for features (`users/`, `roles/`)
**View files:** `IndexView.vue` as main view per folder

## Code Examples

All examples are in `references/` folder:

- `references/store-crud.ts` — Standard CRUD store with useCrud
- `references/store-with-file.ts` — Store with file upload (withFile HOF)
- `references/store-custom.ts` — Non-CRUD store (read-only list / singleton) + useLookup
- `references/component.vue` — Component structure + import order
- `references/form-modal.vue` — FormModal with cached select options + remote-search select
- `references/types.ts` — Types file pattern (grouped by component)
- `references/barrel.ts` — Barrel export patterns
- `references/permission.ts` — Permission composable usage

**Before creating a new UI component, always list `src/components/utils/` first.** The examples in `references/types.ts` are illustrative only, not the full catalog — check the real folder (and its `index.ts` barrel) to see what's already available (buttons, cards, modals, form inputs, badges, tables, etc.) and reuse an existing one instead of duplicating it.

---

## File Naming

| Type            | Pattern             | Example                                     |
| --------------- | ------------------- | ------------------------------------------- |
| Vue Components  | PascalCase          | `HelloWorld.vue`, `SidebarMenu.vue`         |
| UI Utilities    | `Ui` prefix         | `UiButton.vue`, `UiCard.vue`, `UiModal.vue` |
| Form Components | `Form` prefix       | `FormInput.vue`, `FormSelect.vue`           |
| Views           | `View` suffix       | `HomeView.vue`, `IndexView.vue`             |
| Modal/Form      | `FormModal.vue`     | `FormModal.vue`                             |
| TypeScript      | camelCase           | `storage.ts`, `axios.ts`                    |
| Stores          | singular, lowercase | `auth.ts`, `user.ts`, `role.ts`             |
| Interfaces      | `I` prefix          | `IUser`, `IApiResponse`                     |
| Type aliases    | `T` prefix          | `TLoadingKey`                               |

---

## Import Order

**Every `.ts` file and `<script setup>` block uses this order** — no blank lines between groups. Within each group sort alphabetically by path; inside `{ }` sort names alphabetically.

| # | Group | Example |
|---|-------|---------|
| 1 | Vue core: `vue`, `vue-router`, `pinia` (in that order) | `import { computed, ref } from 'vue'` |
| 2 | Third-party packages | `@phosphor-icons/vue`, `@vuelidate/core`, `@vuelidate/validators`, `@vueform/multiselect` |
| 3 | Internal `@/` aliases (alphabetical ⇒ components → composables → helpers → plugins → stores) | `import { UiButton } from '@/components/utils'` |
| 4 | Relative `./` | `import FormModal from './FormModal.vue'` |
| 5 | `import type` statements last (same order as 1–4) | `import type { IUser } from '@/stores'` |

```typescript
import { computed, onMounted, ref } from 'vue'
import { PhPencil, PhPlus } from '@phosphor-icons/vue'
import useVuelidate from '@vuelidate/core'
import { FormInput, UiButton, UiModal } from '@/components/utils'
import { useFormError, usePermission } from '@/composables'
import { formatTimeForHuman } from '@/helpers/date'
import swal from '@/plugins/swal'
import { useRoleStore, useUserStore } from '@/stores'
import FormModal from './FormModal.vue'
import type { IUser } from '@/stores'
```

**Barrel vs direct path:**
- In `pages/` and `components/` → import from barrels: `@/components/utils`, `@/composables`, `@/stores`. One import per barrel (merge them).
- Inside `stores/`, `composables/`, `plugins/`, `helpers/` → import the **file directly** (`@/composables/useCrud`, `./role`) to avoid circular imports through barrels.
- Type-only imports always use `import type` (or inline `type` in a mixed import: `import { get, type IApiResponse } from '@/plugins/axios'`). Never import an interface as a value (`import { IRole } from './role'` ❌).

---

## Component Rules

### 1. Always use `<script setup lang="ts">`

See `references/component.vue` for full structure order.

### 2. Props & Emits — TypeScript syntax

```typescript
const props = defineProps<{ userId: number }>()
const emit = defineEmits<{ update: [id: number]; delete: [id: number] }>()
```

### 3. Component Refs

```typescript
const formModalRef = ref<InstanceType<typeof FormModal> | null>(null)
defineExpose({ openModal })
```

### 4. Classes Props Pattern

Use `classes` object prop, NOT multiple individual class props:

```typescript
// GOOD
interface UiCardClasses {
  wrapper?: string
  card?: string
  header?: string
}
const props = defineProps<{ classes?: UiCardClasses }>()

// BAD - Don't do this
const props = defineProps<{ wrapperClass?: string; cardClass?: string }>()
```

See `references/types.ts` for full pattern.

### 5. Types Organization

- Group related types in single `types.ts` per component folder
- If component only uses store interfaces, import from store — don't duplicate in `types.ts`

---

## Pinia Store Rules

### 1. When to use `useCrud` — decide BEFORE writing the store

`useCrud` assumes a REST resource: `GET /x` (paginated), `GET /x/:id`, `POST /x`, `PUT /x/:id`, `DELETE /x/:id`, one `form` for create/edit, and a list page with pagination.

| The feature is… | Use | Example in repo |
|---|---|---|
| List page + create/edit/delete of ONE resource | `useCrud` | `stores/role.ts` |
| Same as above, form has file/image fields | `useCrud` + `withFile` | `stores/user.ts` |
| CRUD resource + a few extra endpoints (`/roles/:id/permissions`, `/x/:id/approve`) | `useCrud` + extra functions in the same store, returned next to `...crud` | `stores/role.ts` → `fetchRolePermissions` |
| Read-only list (no create/update/delete) | Custom store (no `useCrud`) | `stores/permission.ts` |
| Singleton resource (`/me`, `/settings`) | Custom store | `stores/profile.ts` |
| Feed / infinite scroll / counters / mark-as-read | Custom store | `stores/notification.ts` |
| Auth / session | Custom store | `stores/auth.ts` |
| Only needed as **options for a select** in another feature | `store.lookup` if the resource already has a `useCrud` store; otherwise `useLookup` inside a custom store | `roleStore.lookup`, `permissionStore.lookup` |

**Rules of thumb:**
- Don't force `useCrud` onto something without create/update/delete — you'd get a dead `form`/`create`/`remove` and a misleading API.
- Don't hand-write list/create/update/delete in a store when `useCrud` fits — that's duplication.
- Never add a `fetchAllXxx()` function to load dropdown options — every `useCrud` store already has `lookup` (see **API Call Rules**).

See `references/store-crud.ts`, `references/store-with-file.ts`, `references/store-custom.ts`.

### 2. File Upload — use `withFile` HOF

For stores with file uploads, wrap `useCrud` with `withFile`. See `references/store-with-file.ts`.

```typescript
const userCrud = withFile<IUser, IUserPayload>(crud, ['avatar'])
```

### 3. Store Naming

| Item     | Pattern                      | Example        |
| -------- | ---------------------------- | -------------- |
| File     | singular, lowercase          | `user.ts`      |
| Function | `use` + PascalCase + `Store` | `useUserStore` |
| Store ID | singular, lowercase string   | `'user'`       |

### 4. Loading State Pattern

```typescript
loading: Record<TLoadingKey, boolean> // keys: 'Index', 'Form', 'Delete'
// Access: store.loading.Index, store.loading.Form
```

### 5. No Function Redefinition

DO NOT redefine same function across stores. Import and reuse from original store.

### 6. Non-CRUD Stores

Not every feature is list+create+update+delete of one resource — singleton resources, feeds/streams, or features with custom actions beyond CRUD don't fit `useCrud`.

**Before writing a non-CRUD store, list `src/stores/` and skim any existing store with a similar shape** (e.g. a singleton resource, a paginated feed) — reuse its structure instead of inventing a new one from scratch.

Even without `useCrud`, still follow the shared conventions: TypeScript interfaces for state/payload, the `loading: Record<TLoadingKey, boolean>` pattern (name keys for the store's actual operations, not necessarily `Index`/`Form`/`Delete`), try-catch-finally with `swal`/interceptor error handling, and barrel export.

---

## API & Axios Rules

### 1. API Response Interface

```typescript
interface IApiMetadata {
  total: number
  page: number
  page_size: number
  total_pages: number
}
interface IApiResponse<TData> {
  code: string
  message: string
  data: TData
  metadata?: IApiMetadata
}
```

### 2. API Calls

- All API calls from stores, NOT components
- Use `useCrud` for standard CRUD — handles loading, errors, swal automatically
- Use `withFile` for CRUD with file uploads
- Use try-catch-finally for custom API calls

### 3. Error Handling

The axios interceptor handles all standard HTTP errors (400, 401, 403, 404, 409, 422, 500, etc.) automatically via `swal`. **Default to the global interceptor — do not add a custom `swal.error` in catch blocks.** Only add custom error handling when the user explicitly asks for a specific message or action.

**Default — always start here, for every store method and component `handleSubmit`:**
```typescript
try {
  await store.create()
  close()
} catch {
  // error already shown by the axios interceptor; keep the modal open
}
```
The comment inside `catch` is required — an empty `catch {}` fails ESLint (`no-empty`). In stores don't write `catch (e) { throw e }` (fails `no-useless-catch`) — use `try { … } finally { … }`.
For methods that need to react to failure without a custom message (e.g. return `[]`, stop a loading flag), catch and `console.error` only — do not call `swal.error`:
```typescript
catch (error: any) {
  console.error('Failed to fetch entities', error)
  return []
}
```

**Custom — ONLY when the user explicitly requests a specific message or action beyond the interceptor's default:**

The axios call MUST pass `{ hideError: true }` (see `stores/auth.ts` → `login()`), otherwise the interceptor's swal fires too and the user sees a duplicate popup:
```typescript
await post('/auth/login', payload, { hideError: true })
```
```typescript
catch (error: any) {
  const message = error?.response?.data?.message || 'Default error message.'
  swal.error('Gagal', message)
  throw error
}
```

---

### 4. API Call Rules — no redundant requests

**Select / dropdown options (data from another resource):**

| Dataset size | Pattern | How |
|---|---|---|
| Small (< ~200 rows: roles, permissions, categories, statuses) | **Load once, cache in store, search on client** | `store.lookup.load()` + `<FormSelect searchable :options>` |
| Large / unbounded (users, products, locations) | **Server-side search** | `<FormSelect :options="(q) => store.lookup.search(q).then(toOptions)" :delay="300" :filter-results="false">` |

- `lookup.load()` fetches ALL rows (the backend returns everything when `page_size` is omitted) **once**; later calls return the cache with no request, and concurrent calls share one request.
- Call `lookup.load()` **inside the modal's `show()`** — not in `onMounted`, not on close. FormModal components mount together with their IndexView, so `onMounted` fires a request on every page visit even if the modal is never opened.
- Don't `await` it in `show()` — open the modal immediately; the select shows `:loading="store.lookup.loading"`.
- Build options with a `computed` over `store.lookup.items` — never copy them into a local `ref`.
- `useCrud`/`withFile` invalidate their own `lookup` after create/update/remove, so the next `load()` refetches. Only call `lookup.invalidate()` yourself when data changes through a custom endpoint.
- Remote search (`lookup.search(q)`) sends `?search=q&page=1&page_size=20` and aborts the previous request; `FormSelect` debounces 300 ms. The backend handler must read the `search` query param.
- Edit mode with remote search: pass the currently selected items as `:initial-options` so their labels render before any search.

**`FormSelect` props** (same names as `@vueform/multiselect`):

| Prop | Default | Meaning |
|---|---|---|
| `options` | `[]` | Array, **or** async loader `(query) => Promise<TSelectOption[]>` |
| `delay` | `-1` | Async loader: `-1` = load once, filter on the client; `>= 0` = call loader per search, debounced N ms |
| `minChars` | `0` | Server search: min characters before calling the loader |
| `resolveOnLoad` | `true` | Async: call loader with `''` on mount (`false` = wait until the dropdown opens) |
| `filterResults` | `true` | Client-side filtering — set `false` for server search |
| `searchable` | `false` | Show the search input (forced on when `delay >= 0`) |
| `creatable` | `false` | Allow creating an option from the typed text |
| `initialOptions` | `[]` | Async only: labels for values already selected (edit form) |
| `mode` | `'single'` | `'single'` \| `'multiple'` \| `'tags'` |

FormSelect itself guarantees: only the newest async response is applied, and selected values keep their label. `lookup.search()` caches results per query, so reopening a modal (its content re-mounts) does not refetch.

**List pages:**
- `useCrud.fetchAll()` aborts the previous list request (fast pagination clicks never show a stale page) and steps back one page when the current page becomes empty after a delete.
- Call `fetchAll()` once in the IndexView's `onMounted`; `create`/`update`/`remove` already refetch — never call `fetchAll()` again after them.

**Files:**
- `uploadFile()` caches per `File` object, so retrying a submit after a 422 does not re-upload. `withFile` uploads all file fields in parallel. Don't call `/upload` manually.

**Never:**
- Fetch inside a `watch` on modal visibility, or in both `onMounted` and `show()`.
- Fetch the same list in two components — put it in the store and share it.
- Write your own debounce/abort for selects — use `FormSelect` async `options` + `lookup.search`.

---

## Routing Rules

- Lazy load all routes: `component: () => import('@/pages/...')`
- Group by layout using `children`
- Route meta: `requiresAuth: true` or `guest: true`
- URLs: kebab-case, plural resources (`/users`, `/uam/roles`)
- Add `permissions` meta for restricted routes — string format: `{resource}.{action}`

```typescript
{
  path: 'feature',
  name: 'Feature',
  component: () => import('@/pages/feature/IndexView.vue'),
  meta: { requiresAuth: true, permissions: ['feature.index'] },
},
```

---

## Sidebar Menu

Menu items are defined in `src/layouts/DefaultLayout.vue` inside the `menuItems` computed block. Items are filtered automatically by permission.

**Flat item:**
```typescript
{ icon: PhIconName, label: 'Feature', to: '/feature', permission: ['feature.index'] },
```

**Grouped item (parent with children):**
```typescript
{
  icon: PhIconName,
  label: 'Group',
  children: [
    { label: 'Feature', to: '/feature', permission: ['feature.index'] },
  ],
},
```

**Section title (separator, no link):**
```typescript
{ isTitle: true, label: 'Management' },
```
- Use to group related items visually (e.g. before a run of admin/management items)
- `filterMenuByPermission` auto-hides a title if every item that would follow it gets filtered out — don't add manual visibility logic for this

- Import icon from `@phosphor-icons/vue`
- `permission` must match the route's `permissions` meta value

---

## Permission & Access Control

### 1. Permission Composable

Use `usePermission()` composable for permission checks in components:

```typescript
import { usePermission } from '@/composables'
const permission = usePermission()
```

**Read `references/permission.ts` for the complete API and usage examples.**

### 2. Conditional Render Pattern

Use `usePermission` composable to conditionally render action buttons in IndexView:

```vue
<UiButton v-if="..." @click="openCreate">Tambah</UiButton>
<button v-if="..." @click="openEdit(item)">Edit</button>
<button v-if="..." @click="handleDelete(item.id)">Hapus</button>
```

**Always read `references/permission.ts` first to understand the full API before implementing permission logic.**

### 3. Frontend Permission is UI Only

**IMPORTANT:** Permission checks on frontend are for **UI/UX purposes only** (show/hide buttons, menu filtering).

**DO NOT** add permission validation before sending data to backend. The backend already handles permission validation and will return appropriate errors.

```typescript
// ❌ WRONG - Don't check permission before API call
async function handleSubmit() {
  if (!hasPermission('user.create')) {
    swal.error('Access Denied')
    return
  }
  await store.create() // Backend already validates permission
}

// ✅ CORRECT - Just call the API, let backend handle validation
async function handleSubmit() {
  await store.create() // Backend will reject if no permission
}
```

See `references/permission.ts` for full examples.

---

## Validation (Vuelidate)

```typescript
const v$ = useVuelidate(rules, store.form)
await v$.value.$validate() // before submission
v$.value.$reset() // on form open
```

**Create vs edit rules:** use `computed()` to override rules based on `isEdit`. Common case — password not required on edit:

```typescript
const dynamicRules = computed(() => {
  if (isEdit.value) {
    return { ...store.formRules, password: { minLength: minLength(6) } }
  }
  return store.formRules
})
```

**Custom Validation Rules**

Use `helpers.withMessage` for any validation logic beyond built-in validators. Custom rules belong in the **store**, defined after `useCrud` (or after `form`) so they can reference form state. The validator function is called lazily during validation — it always reads the current reactive value.

**Pattern 1 — Store with `useCrud`:** define extended `formRules` after `useCrud`, referencing `crud.form`:

```typescript
import { helpers, required, requiredIf } from '@vuelidate/validators'

const crud = useCrud<IUser, IUserPayload>({
  ...,
  formRules: {
    password: { required, minLength: minLength(6) },
    password_confirmation: {},
  },
})

// Extended formRules — defined after useCrud so crud.form is accessible
const formRules = {
  ...crud.formRules,

  // Field equality + conditional required (required only when password is filled)
  password_confirmation: {
    requiredIf: requiredIf(() => !!crud.form.password),
    sameAsPassword: helpers.withMessage(
      'Password tidak cocok',
      (value: string) => !crud.form.password || value === crud.form.password,
    ),
  },

  // Array minimum items
  roles: {
    minItems: helpers.withMessage(
      'Minimal pilih 1 role',
      (value: number[]) => value.length > 0,
    ),
  },
}

// Expose formRules (overrides the one from crud spread)
return { ...crud, formRules }
```

**Pattern 2 — Store without `useCrud`:** define `form` first, then `formRules` referencing it:

```typescript
import { helpers, required, requiredIf } from '@vuelidate/validators'

const form = reactive({ password: '', password_confirmation: '', contact_method: '', phone: '' })

const formRules = {
  // Field equality + conditional required
  password_confirmation: {
    requiredIf: requiredIf(() => !!form.password),
    sameAsPassword: helpers.withMessage(
      'Password tidak cocok',
      (value: string) => !form.password || value === form.password,
    ),
  },

  // Conditional required
  phone: {
    conditionalRequired: helpers.withMessage(
      'Nomor telepon wajib diisi jika metode kontak adalah telepon',
      (value: string) => form.contact_method !== 'phone' || !!value,
    ),
  },

  // Custom format (e.g. permission name: resource.action)
  name: {
    format: helpers.withMessage(
      'Format harus resource.action (contoh: user.index)',
      (value: string) => /^[a-z]+\.[a-z]+$/.test(value),
    ),
  },
}
```

---

**Modal open — always clear server errors before showing:**
```typescript
import { useFormError } from '@/composables/useFormError'
const formError = useFormError()

function show(data?: ...) {
  // populate form...
  v$.value.$reset()
  formError.clear()
  isVisible.value = true
}
```

**`handleSubmit` — call `close()` only on success, never in `finally`:**
```typescript
async function handleSubmit() {
  const isValid = await v$.value.$validate()
  if (!isValid) return

  try {
    if (isEdit.value) await store.update(store.form.id)
    else await store.create()
    close() // only reached on success
  } catch {
    // error already shown by the axios interceptor; keep the modal open
  }
}
```

---

## TypeScript Rules

- Always `lang="ts"` in Vue components
- Avoid `any` — use proper interfaces or `unknown`
- Define interfaces in stores when shared, locally when component-specific
- Use generics for reusable functions

---

## Styling (Tailwind CSS)

- Utility-first — avoid custom CSS
- Mobile-first responsive design
- **Always implement at minimum `sm` and `md` breakpoints**
- Always use `scoped` in `<style>` tags
- Design style: **Modern Clean UI (SaaS Admin Minimalism)** with **Card-Based Layout** — neutral base, semantic colors only, no gradients, no heavy shadows

---

## State Management

| Use Stores               | Use Local State                    |
| ------------------------ | ---------------------------------- |
| Shared across components | Local to one component             |
| Server state (API data)  | UI state specific to one component |
| Authentication state     | Temporary form state               |
| Complex form state       |                                    |

---

## Error Handling & Notifications

```typescript
import swal from '@/plugins/swal'
swal.success('Berhasil', 'Message')
swal.error('Gagal', 'Message')
await swal.warning('Title', 'Message') // confirmation
```

- User-facing messages in the app's target language (e.g., Indonesian)
- Use `console.error()` for developer debugging

---

## Helpers

Reusable utility functions live in `src/helpers/` (date formatting, file upload, Vuelidate error translation, storage access, etc.).

**Before writing a new utility function, always list the contents of `src/helpers/` and skim any file that looks related to what you need.** Do not reinvent a helper that already exists there — import and reuse it instead. If no existing helper fits, add the new function to the most relevant existing file, or create a new file in `src/helpers/` following the same naming (camelCase filename) and export style as its neighbors.

---

## Barrel Exports

Use `index.ts` files for cleaner imports. `references/barrel.ts` shows the **pattern only** — it is not an exhaustive or current list.

**Before adding a new export, always open the real barrel file first** (`src/stores/index.ts`, `src/composables/index.ts`, `src/components/utils/index.ts`) to see what's currently exported. Every new store, composable, or UI component MUST be added to its barrel — a component/store that exists on disk but is missing from its barrel is a bug (unreachable via the clean-import path), not just a doc gap.

**Rules:**

- Export both module and types in barrel
- Use explicit named exports, avoid `export * from`
- Keep alphabetically sorted when possible
- After creating a new file in `stores/`, `composables/`, or `components/utils/`, verify it was actually added to that folder's `index.ts` before considering the task done

---

## Environment Variables

- Prefix: `VITE_` (e.g., `VITE_API_BASE_URL`)
- Access: `import.meta.env.VITE_*`
- Provide fallbacks: `import.meta.env.VITE_APP_NAME || 'Default'`

---

## Anti-Patterns

| ❌ WRONG                             | ✅ CORRECT                                     |
| ------------------------------------ | ---------------------------------------------- |
| API calls in components              | API calls in stores                            |
| `any` type without justification     | Proper interfaces or `unknown`                 |
| Mutate props directly                | Use emits or local state                       |
| Index as key in `v-for`              | Unique identifiers                             |
| Business logic in templates          | Computed properties or methods                 |
| `Page` suffix for views              | `View` suffix                                  |
| Redefine functions across stores     | Import and reuse from original store           |
| Multiple individual class props      | `classes` object prop                          |
| Skip `sm`/`md` breakpoints           | Always implement responsive                    |
| Manual CRUD logic in stores          | `useCrud` composable                           |
| Duplicate file upload logic          | `withFile` HOF                                 |
| `createEntity`/`updateEntity` naming | `create`/`update` or `createForm`/`updateForm` |
| `fetchAllXxx()` for select options   | `store.lookup.load()` (cached)                 |
| Load select options in `onMounted`   | `store.lookup.load()` in modal `show()`        |
| Copy options into a local `ref([])`  | `computed` over `store.lookup.items`           |
| Load thousands of rows into a select | async `:options` + `:delay` + `lookup.search`  |
| Component import before `vue`        | vue → packages → `@/` → `./` → `import type`   |
| `import { IUser } from …` (value)    | `import type { IUser } from …`                 |
| Empty `catch {}`                     | `catch { // reason }`                          |

---

## Pre-Implementation Checklist

- [ ] Component uses `<script setup lang="ts">`
- [ ] Props/Emits use TypeScript syntax
- [ ] Store type chosen with the "When to use `useCrud`" table
- [ ] Imports follow the Import Order table (barrels in pages/components, `import type` for types)
- [ ] Select options use `store.lookup` (loaded in `show()`, cached) or async `:options` + `:delay` for large data
- [ ] Store naming: singular file, `useXxxStore` function, `'xxx'` ID
- [ ] Interfaces prefixed with `I`, types with `T`
- [ ] Types grouped in `types.ts` per component folder
- [ ] Barrel exports updated for new stores/components
- [ ] API calls in stores, NOT components
- [ ] Error messages in the app's target language (e.g., Indonesian)
- [ ] Responsive: `sm` and `md` breakpoints implemented
- [ ] CRUD buttons protected with `usePermission` composable
- [ ] Lint clean: `yarn lint`
- [ ] Type check clean: `yarn vue-tsc --noEmit`
- [ ] Format clean: `yarn format`
