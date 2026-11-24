import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useLookup } from '@/composables/useLookup'
import { ApiMetadataDefaults, get, type IApiMetadata, type IApiResponse } from '@/plugins/axios'

export interface IPermission {
  id: number
  name: string
  description: string
}

export const usePermissionStore = defineStore('permission', () => {
  const permissions = ref<IPermission[]>([])
  const pagination = ref<IApiMetadata>({ ...ApiMetadataDefaults })
  const loading = ref<Record<string, boolean>>({
    Index: false,
  })

  // Permissions are seeded by the backend and rarely change → load once per session
  const lookup = useLookup<IPermission>({ endpoint: '/permissions' })

  async function fetchAll(page?: number): Promise<IPermission[]> {
    loading.value.Index = true
    const currentPage = page ?? pagination.value.page
    try {
      const { data } = await get<IApiResponse<IPermission[]>>('/permissions', {
        params: {
          page: currentPage,
          page_size: pagination.value.page_size,
        },
      })
      permissions.value = data.data || []
      pagination.value = data.metadata || { ...ApiMetadataDefaults }
      return permissions.value
    } catch (error: any) {
      console.error('Failed to fetch permissions', error)
      return []
    } finally {
      loading.value.Index = false
    }
  }

  return {
    permissions,
    pagination,
    loading,
    fetchAll,
    lookup,
  }
})
