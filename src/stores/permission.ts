import { defineStore } from 'pinia'
import { ref } from 'vue'
import { get, ApiMetadataDefaults, type IApiResponse, type IApiMetadata } from '@/plugins/axios'

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
    All: false,
  })

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

  async function fetchAllPermissions(): Promise<IPermission[]> {
    loading.value.All = true
    try {
      const { data } = await get<IApiResponse<IPermission[]>>('/permissions')
      return data.data || []
    } catch (error: any) {
      console.error('Failed to fetch all permissions', error)
      return []
    } finally {
      loading.value.All = false
    }
  }

  return {
    permissions,
    pagination,
    loading,
    fetchAll,
    fetchAllPermissions,
  }
})
