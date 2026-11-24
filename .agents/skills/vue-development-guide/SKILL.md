---
name: vue-development-guide
description: Step-by-step workflow for adding a feature/page/menu to this Vue boilerplate — choose store type (useCrud or custom), then Store → IndexView → FormModal → Route → Sidebar → Barrel → lint/type-check/build. Use whenever the user asks to create a new feature, module, page, menu, CRUD, master data, or "halaman/fitur/menu/modul baru", "buat CRUD", "tambah menu", or asks how to use/extend this project. Pair with the vue-coding-rules skill for code conventions.
---

## When to use me

- Implementing a new feature from scratch (CRUD or not)
- The user asks "how do I add X to this project?" / "cara pakai boilerplate ini"
- You need the pre-push checklist

> Coding conventions, full code examples, import order, and API-call rules live in the **`vue-coding-rules`** skill — load it too. This guide is the order of work.

---

# Vue Development Guide

## Step 0: Decide the store type (do this first)

Answer from the backend endpoints of the feature:

```
Does the feature create + update + delete ONE resource via /x and /x/:id ?
├─ yes → useCrud                     (stores/role.ts)
│        has file/image fields?  → + withFile   (stores/user.ts)
│        extra endpoints (/x/:id/approve)? → add functions next to ...crud
└─ no  → custom store                (stores/permission.ts, profile.ts, notification.ts)
         is it needed as select options elsewhere? → add useLookup to it
```

Also list which **select/dropdown** fields the form needs and where their data comes from:
- Source resource already has a store → use `thatStore.lookup` (never write `fetchAllXxx()`).
- Small dataset (< ~200) → `lookup.load()` in the modal's `show()` + `FormSelect searchable`.
- Large dataset → `FormSelect` async `:options="(q) => store.lookup.search(q).then(toOptions)"` + `:delay="300"` + `:filter-results="false"` (backend must support `?search=`).

Full table: `vue-coding-rules` → "When to use `useCrud`" and "API Call Rules".

---

## CRUD Implementation Flow

| Step | Layer | File Path | Purpose |
|------|-------|-----------|---------|
| 0 | Decide | — | Store type + select sources (above) |
| 1 | Store | `src/stores/{feature}.ts` | Pinia store (`useCrud` / `withFile` / custom) |
| 2 | View | `src/pages/{feature}/IndexView.vue` | List + pagination + permission-guarded buttons |
| 3 | Form/Modal | `src/pages/{feature}/FormModal.vue` | Create/Edit form with Vuelidate + selects |
| 4 | Route | `src/router/index.ts` | Lazy route with `requiresAuth` + `permissions` |
| 5 | Sidebar | `src/layouts/DefaultLayout.vue` | Menu item with matching `permission` |
| 6 | Barrel | `src/stores/index.ts` | Export store + types |
| 7 | Verify | — | `yarn lint`, `yarn vue-tsc --noEmit`, `yarn build` |

### Step 1: Store — `src/stores/{feature}.ts`
Singular file name, `use{Feature}Store`, id `'{feature}'`. Inside stores import files directly (`@/composables/useCrud`), not barrels. Reference: `vue-coding-rules/references/store-crud.ts`, `store-with-file.ts`, `store-custom.ts`.

### Step 2: View — `src/pages/{feature}/IndexView.vue`
Call `store.fetchAll()` once in `onMounted`; pagination calls `fetchAll(page)`. Don't refetch after create/update/delete — the store already does. Guard buttons with `usePermission`. Reference: `references/component.vue`.

### Step 3: Form/Modal — `src/pages/{feature}/FormModal.vue`
- `show()`: call `otherStore.lookup.load()` (not awaited) for every select source, fill/reset the form, `v$.value.$reset()`, `formError.clear()`.
- No `onMounted` data loading in FormModal.
- `handleSubmit`: validate → create/update → `close()` only on success; `catch { // comment }`.
Reference: `references/form-modal.vue`.

### Step 4: Route — `src/router/index.ts`
Child of the `DefaultLayout` route, lazy `component: () => import(...)`, plural kebab-case path, `meta: { requiresAuth: true, permissions: ['{feature}.index'] }`.

### Step 5: Sidebar — `src/layouts/DefaultLayout.vue`
Add to the `menuItems` computed; `permission` must equal the route's `permissions`.

### Step 6: Barrel — `src/stores/index.ts`
`export { use{Feature}Store } from './{feature}'` + `export type { I{Feature}, I{Feature}Payload } from './{feature}'`. Same for any new composable/UI component in its own barrel.

---

## ✅ Pre-Push Checklist
- [ ] Store type chosen via Step 0 (no `useCrud` on read-only/singleton data; no hand-written CRUD when `useCrud` fits)
- [ ] No `fetchAllXxx()` for dropdowns — selects use `store.lookup` (or async `:options` + `:delay` for large data)
- [ ] Select sources loaded in `show()`, not `onMounted`
- [ ] Import order: vue → packages → `@/` → `./` → `import type`; barrels in pages/components
- [ ] Store naming: singular file, `useXxxStore`, `'xxx'` id
- [ ] `<script setup lang="ts">`, typed props/emits
- [ ] Vuelidate `await v$.value.$validate()` before submit; `formError.clear()` in `show()`
- [ ] `close()` only on success, never in `finally`
- [ ] Route has `requiresAuth: true` + `permissions`; sidebar `permission` matches
- [ ] Buttons guarded with `usePermission`
- [ ] Barrel exports updated
- [ ] Responsive: `sm` and `md` breakpoints
- [ ] `yarn lint` clean
- [ ] `yarn vue-tsc --noEmit` clean
- [ ] `yarn build` succeeds
