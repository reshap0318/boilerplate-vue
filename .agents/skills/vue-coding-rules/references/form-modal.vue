<!--
  FormModal — create/edit with select options loaded the efficient way.
  Real examples: src/pages/users/FormModal.vue, src/pages/uam/roles/FormModal.vue

  Select options:
    small dataset  → store.lookup.load() in show() (cached) + FormSelect searchable (client search)
    large dataset  → FormSelect async :options + :delay (server search, debounced, stale results ignored)
-->
<script setup lang="ts">
import { computed, ref } from 'vue'
import useVuelidate from '@vuelidate/core'
import { FormInput, FormSelect, UiButton, UiModal } from '@/components/utils'
import { useFormError } from '@/composables'
import { useCategoryStore, useEntityStore, useUserStore } from '@/stores'
import type { TSelectOption } from '@/components/utils'
import type { IEntity, IUser } from '@/stores'

const entityStore = useEntityStore()
const categoryStore = useCategoryStore()
const userStore = useUserStore()
const formError = useFormError()
const v$ = useVuelidate(entityStore.formRules, entityStore.form)

const isVisible = ref(false)
const isEdit = computed(() => !!entityStore.form.id)

// ---- Small dataset: cached in the store, derived with computed (never copy into a local ref)
const categoryOptions = computed<TSelectOption[]>(() =>
  categoryStore.lookup.items.map((c) => ({ value: c.id, label: c.name })),
)

// ---- Large dataset: server-side search
const toUserOption = (u: IUser): TSelectOption => ({ value: u.id, label: `${u.name} (${u.email})` })
const searchUsers = (q: string) => userStore.lookup.search(q).then((list) => list.map(toUserOption))
// Edit mode: currently selected item(s) so the label shows before any search
const selectedOwner = ref<TSelectOption[]>([])

function show(data?: IEntity & { owner?: IUser }) {
  categoryStore.lookup.load() // 1st open = 1 request; next opens = 0 requests. Not awaited.

  if (data) {
    entityStore.form.id = data.id
    entityStore.form.name = data.name
    entityStore.form.description = data.description
    entityStore.form.category_id = data.category?.id ?? null
    selectedOwner.value = data.owner ? [toUserOption(data.owner)] : []
  } else {
    entityStore.resetForm()
    selectedOwner.value = []
  }
  v$.value.$reset()
  formError.clear()
  isVisible.value = true
}

function close() {
  isVisible.value = false
}

async function handleSubmit() {
  const isValid = await v$.value.$validate()
  if (!isValid) return

  try {
    if (isEdit.value && entityStore.form.id) await entityStore.update(entityStore.form.id)
    else await entityStore.create()
    close() // only on success
  } catch {
    // error already shown by the axios interceptor; keep the modal open
  }
}

// ❌ No onMounted(() => loadCategories()) — FormModal mounts with the IndexView,
//    so that would fire a request on every page visit even if the modal never opens.

defineExpose({ show, close })
</script>

<template>
  <UiModal v-model="isVisible" :title="isEdit ? 'Edit Entity' : 'Tambah Entity'" size="lg">
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <FormInput v-model="entityStore.form.name" name="name" label="Nama" :validation="v$.name" />

      <!-- Small dataset: client-side search over cached options -->
      <FormSelect
        v-model="entityStore.form.category_id"
        name="category_id"
        label="Kategori"
        :options="categoryOptions"
        :loading="categoryStore.lookup.loading"
        :searchable="true"
        :validation="v$.category_id"
      />

      <!-- Large dataset: server-side search -->
      <FormSelect
        v-model="entityStore.form.owner_id"
        name="owner_id"
        label="Owner"
        :options="searchUsers"
        :initial-options="selectedOwner"
        :delay="300"
        :min-chars="2"
        :filter-results="false"
        :resolve-on-load="false"
        placeholder="Ketik minimal 2 huruf..."
      />
    </form>

    <template #footer>
      <UiButton variant="secondary" @click="close">Batal</UiButton>
      <UiButton :loading="entityStore.loading.Form" @click="handleSubmit">Simpan</UiButton>
    </template>
  </UiModal>
</template>
