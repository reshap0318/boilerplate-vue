<!--
  Component Structure — <script setup lang="ts">
  Import order: vue core → packages → @/ (alphabetical) → ./ relative → import type
  Pages/components import from barrels (@/components/utils, @/composables, @/stores).
-->
<script setup lang="ts">
// 1. Imports (see "Import Order" in SKILL.md)
import { computed, onMounted, ref } from 'vue'
import { PhPencil, PhPlus, PhTrash } from '@phosphor-icons/vue'
import { UiButton, UiCard, UiPagination } from '@/components/utils'
import { usePermission } from '@/composables'
import { useEntityStore } from '@/stores'
import FormModal from './FormModal.vue'
import type { IEntity } from '@/stores'

// 2. Props & Emits
const props = defineProps<{
  title?: string
}>()

const emit = defineEmits<{
  selected: [id: number]
}>()

// 3. Store / composable usage
const entityStore = useEntityStore()
const { hasPermission } = usePermission()

// 4. Reactive state & template refs
const formModalRef = ref<InstanceType<typeof FormModal> | null>(null)

// 5. Computed
const heading = computed(() => props.title ?? 'Entities')

// 6. Methods
function openCreate() {
  formModalRef.value?.show()
}

function openEdit(item: IEntity) {
  formModalRef.value?.show(item)
}

async function handleDelete(id: number) {
  await entityStore.remove(id) // remove() confirms, deletes and refetches — nothing else to call
}

function handlePageChange(page: number) {
  entityStore.fetchAll(page) // previous in-flight page request is aborted automatically
}

// 7. Lifecycle — fetch the list ONCE here. Do NOT load select options here (see form-modal.vue)
onMounted(() => {
  entityStore.fetchAll()
})

// 8. Expose (if needed)
defineExpose({ openCreate })
</script>

<template>
  <UiCard>
    <template #header>
      <h1 class="text-xl font-semibold text-gray-900 sm:text-2xl">{{ heading }}</h1>
      <UiButton v-if="hasPermission('entity.create')" @click="openCreate">
        <template #icon><PhPlus :size="16" /></template>
        Tambah
      </UiButton>
    </template>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      <div
        v-for="item in entityStore.indexData.items"
        :key="item.id"
        @click="emit('selected', item.id)"
      >
        {{ item.name }}
        <button v-if="hasPermission('entity.edit')" @click.stop="openEdit(item)">
          <PhPencil :size="16" />
        </button>
        <button v-if="hasPermission('entity.delete')" @click.stop="handleDelete(item.id)">
          <PhTrash :size="16" />
        </button>
      </div>
    </div>

    <UiPagination
      :page="entityStore.indexData.pagination.page"
      :total-pages="entityStore.indexData.pagination.total_pages"
      @update:page="handlePageChange"
    />
  </UiCard>

  <FormModal ref="formModalRef" />
</template>

<style scoped>
/* Only when Tailwind utilities are not enough — always scoped */
</style>
