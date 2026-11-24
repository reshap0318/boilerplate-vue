// ============================================================
// Non-CRUD Stores — when useCrud does NOT fit
// (read-only list, singleton like /me or /settings, feed, counters)
// Real examples: stores/permission.ts, stores/profile.ts, stores/notification.ts
// ============================================================
import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import { required } from '@vuelidate/validators'
import { useLookup } from '@/composables/useLookup'
import { ApiMetadataDefaults, get, put, type IApiMetadata, type IApiResponse } from '@/plugins/axios'
import swal from '@/plugins/swal'

// ------------------------------------------------------------
// A) Read-only resource: paginated list page + cached options
// ------------------------------------------------------------
export interface ICategory {
  id: number
  name: string
}

export const useCategoryStore = defineStore('category', () => {
  const categories = ref<ICategory[]>([])
  const pagination = ref<IApiMetadata>({ ...ApiMetadataDefaults })
  const loading = ref<Record<string, boolean>>({ Index: false })

  // Options for selects elsewhere: fetched once, shared by every component
  const lookup = useLookup<ICategory>({ endpoint: '/categories' })

  async function fetchAll(page?: number): Promise<ICategory[]> {
    loading.value.Index = true
    try {
      const { data } = await get<IApiResponse<ICategory[]>>('/categories', {
        params: { page: page ?? pagination.value.page, page_size: pagination.value.page_size },
      })
      categories.value = data.data || []
      pagination.value = data.metadata || { ...ApiMetadataDefaults }
      return categories.value
    } catch (error: any) {
      console.error('Failed to fetch categories', error)
      return []
    } finally {
      loading.value.Index = false
    }
  }

  return { categories, pagination, loading, lookup, fetchAll }
})

// ------------------------------------------------------------
// B) Singleton resource (GET/PUT one object, no id, no list)
// ------------------------------------------------------------
export interface ISettings {
  app_name: string
  maintenance: boolean
}

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<ISettings | null>(null)
  const loading = ref<Record<string, boolean>>({ Fetch: false, Update: false })
  const form = reactive<ISettings>({ app_name: '', maintenance: false })
  const formRules = { app_name: { required } }

  async function fetchSettings() {
    if (settings.value) return settings.value // already loaded — no request
    loading.value.Fetch = true
    try {
      const { data } = await get<IApiResponse<ISettings>>('/settings')
      settings.value = data.data
      Object.assign(form, data.data)
      return settings.value
    } catch (error: any) {
      console.error('Failed to fetch settings', error)
      return null
    } finally {
      loading.value.Fetch = false
    }
  }

  async function updateSettings() {
    loading.value.Update = true
    try {
      const { data } = await put<IApiResponse<ISettings>>('/settings', form)
      settings.value = data.data // use the response — no extra GET
      swal.success('Berhasil', data.message || 'Pengaturan berhasil disimpan.')
    } finally {
      loading.value.Update = false // no catch: interceptor shows the error, caller decides
    }
  }

  return { settings, loading, form, formRules, fetchSettings, updateSettings }
})
