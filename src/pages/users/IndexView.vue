<script setup lang="ts">
import { UiCard, UiButton, UiPagination, UiEmptyState, UiSkeleton } from '@/components/utils'
import FormModal from './FormModal.vue'
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import type { IUser } from '@/stores/user'
import { usePermission } from '@/composables'
import { PhPlus, PhPencil, PhTrash, PhEnvelope, PhCalendar, PhCrown } from '@phosphor-icons/vue'

const userStore = useUserStore()
const { hasAllPermissions } = usePermission()
const formModalRef = ref<InstanceType<typeof FormModal> | null>(null)

const colorPalette = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-indigo-500',
  'bg-teal-500',
]

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return words[0].charAt(0).toUpperCase()
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase()
}

function getAvatarBg(index: number): string {
  return colorPalette[index % colorPalette.length]
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function openCreate() {
  formModalRef.value?.show()
}

function openEdit(user: IUser) {
  formModalRef.value?.show(user)
}

async function handleDelete(id: number) {
  await userStore.remove(id)
}

function handlePageChange(page: number) {
  userStore.fetchAll(page)
}

onMounted(() => {
  userStore.fetchAll()
})
</script>

<template>
  <div class="mx-auto px-4">
    <!-- Header Section -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Users</h1>
        <p class="hidden sm:block text-sm text-gray-600 mt-1">Kelola daftar user dalam sistem.</p>
      </div>
      <UiButton v-if="hasAllPermissions(['user.create'])" size="sm" @click="openCreate">
        <template #icon>
          <PhPlus class="w-4 h-4" />
        </template>
        Tambah User
      </UiButton>
    </div>

    <!-- Loading State -->
    <div
      v-if="userStore.loading.Index"
      class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <UiSkeleton
        v-for="i in userStore.indexData.pagination.page_size"
        :key="i"
        variant="rect"
        width="w-full"
        height="h-64"
        rounded
      />
    </div>

    <!-- Empty State -->
    <UiEmptyState
      v-else-if="userStore.indexData.items.length === 0"
      :icon="PhPlus"
      title="Belum ada User"
      description="Silakan buat user baru untuk mulai mengelola akses pengguna."
    >
      <UiButton v-if="hasAllPermissions(['user.create'])" size="lg" @click="openCreate">
        <template #icon>
          <PhPlus class="w-5 h-5" />
        </template>
        Buat User Pertama
      </UiButton>
    </UiEmptyState>

    <!-- Data List -->
    <template v-else>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <UiCard
          v-for="(user, index) in userStore.indexData.items"
          :key="user.id"
          :padded="false"
          :classes="{
            wrapper: 'h-full',
            card: 'group hover:shadow-md transition-all duration-200 h-full rounded-2xl border border-gray-200 bg-white overflow-hidden',
            body: 'flex flex-col h-full justify-between',
          }"
        >
          <!-- Content Header & Avatar -->
          <div class="p-5 flex flex-col items-center text-center flex-1">
            <!-- Avatar -->
            <div
              class="w-16 h-16 rounded-full overflow-hidden shrink-0 shadow-sm border-2 border-white ring-2 ring-gray-100"
            >
              <img
                v-if="user.avatar"
                :src="user.avatar"
                :alt="user.name"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                :class="[
                  'flex items-center justify-center w-full h-full text-lg font-bold',
                  getAvatarBg(index),
                ]"
              >
                <span class="text-white">{{ getInitials(user.name) }}</span>
              </div>
            </div>

            <!-- Name + Email -->
            <h3 class="mt-3 text-sm font-bold text-gray-900 truncate w-full">
              {{ user.name }}
            </h3>
            <p
              class="text-xs text-gray-500 truncate flex items-center justify-center gap-1 mt-0.5 w-full"
            >
              <PhEnvelope class="w-3.5 h-3.5 shrink-0" />
              <span class="truncate">{{ user.email }}</span>
            </p>

            <!-- Divider -->
            <div class="my-3.5 border-t border-gray-100 w-full"></div>

            <!-- Joined Date & Roles -->
            <div class="w-full space-y-2 text-xs">
              <div class="flex items-center justify-center gap-1.5 text-gray-500">
                <div
                  class="flex items-center justify-center w-6 h-6 rounded-md bg-cyan-100 text-cyan-600 shrink-0"
                >
                  <PhCalendar class="w-3.5 h-3.5" />
                </div>
                <span>{{ formatDate(user.created_at) }}</span>
              </div>

              <div
                v-if="user.roles?.length"
                class="flex items-center justify-center gap-1.5 flex-wrap"
              >
                <div
                  class="flex items-center justify-center w-6 h-6 rounded-md bg-cyan-100 text-cyan-600 shrink-0"
                >
                  <PhCrown class="w-3.5 h-3.5" />
                </div>
                <span
                  v-for="role in user.roles.slice(0, 2)"
                  :key="role.id"
                  class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 truncate"
                >
                  {{ role.name }}
                </span>
                <span
                  v-if="user.roles.length > 2"
                  class="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-500"
                >
                  +{{ user.roles.length - 2 }}
                </span>
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div
            v-if="hasAllPermissions(['user.edit']) || hasAllPermissions(['user.delete'])"
            class="border-t border-gray-100 bg-gray-50/80 px-3 py-2 flex items-center justify-end gap-1 flex-wrap"
          >
            <button
              v-if="hasAllPermissions(['user.edit'])"
              class="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              @click="openEdit(user)"
            >
              <PhPencil class="w-3.5 h-3.5" />
              Edit
            </button>
            <button
              v-if="hasAllPermissions(['user.delete'])"
              class="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              :disabled="userStore.loading.Delete"
              @click="handleDelete(user.id)"
            >
              <PhTrash class="w-3.5 h-3.5" />
              Hapus
            </button>
          </div>
        </UiCard>
      </div>

      <!-- Pagination -->
      <div class="mt-6 flex justify-center">
        <UiPagination
          :page="userStore.indexData.pagination.page"
          :total-pages="userStore.indexData.pagination.total_pages"
          @update:page="handlePageChange"
        />
      </div>
    </template>
  </div>

  <FormModal ref="formModalRef" />
</template>
