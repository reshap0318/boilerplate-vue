<script setup lang="ts">
import { UiCard, UiPagination, UiEmptyState, UiSkeleton } from '@/components/utils'
import { onMounted } from 'vue'
import { usePermissionStore } from '@/stores'
import { PhShieldCheck } from '@phosphor-icons/vue'

const permissionStore = usePermissionStore()

function handlePageChange(page: number) {
  permissionStore.fetchAll(page)
}

onMounted(() => {
  permissionStore.fetchAll()
})
</script>

<template>
  <div class="mx-auto px-4">
    <!-- Header Section -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Permissions</h1>
      <p class="hidden sm:block text-sm text-gray-600 mt-1">
        Daftar akses permission yang tersedia dalam sistem.
      </p>
    </div>

    <!-- Loading State -->
    <div
      v-if="permissionStore.loading.Index"
      class="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
    >
      <UiSkeleton
        v-for="i in permissionStore.pagination.page_size"
        :key="i"
        variant="rect"
        width="w-full"
        height="h-26"
        rounded
      />
    </div>

    <!-- Empty State -->
    <UiEmptyState
      v-else-if="permissionStore.permissions.length === 0"
      :icon="PhShieldCheck"
      title="Belum ada Permission"
      description="Permission dikelola oleh sistem dan akan tampil di sini setelah tersedia."
    />

    <!-- Data List -->
    <div v-else class="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <UiCard
        v-for="permission in permissionStore.permissions"
        :key="permission.id"
        class="hover:shadow-md transition-shadow"
      >
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-1">
            {{ permission.name }}
          </h3>
          <p class="text-sm text-gray-600 line-clamp-2">
            {{ permission.description }}
          </p>
        </div>
      </UiCard>
    </div>

    <!-- Pagination -->
    <div class="mt-8 flex justify-center">
      <UiPagination
        :page="permissionStore.pagination.page"
        :total-pages="permissionStore.pagination.total_pages"
        @update:page="handlePageChange"
      />
    </div>
  </div>
</template>
