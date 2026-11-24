import { reactive, ref, type Ref, type Reactive } from 'vue'
import {
  ApiMetadataDefaults,
  del,
  get,
  isCancel,
  post,
  put,
  type IApiMetadata,
  type IApiResponse,
} from '@/plugins/axios'
import { capitalize } from '@/helpers/string'
import swal from '@/plugins/swal'
import { useLookup } from './useLookup'

type TLoadingKey = 'Index' | 'Form' | 'Delete'

export interface UseCrudOptions<TPayload> {
  endpoint: string
  entityName: string
  initialForm: TPayload
  formRules: Record<string, any>
  pageSize?: number
}

export function useCrud<
  TEntity extends { id: number | string },
  TPayload extends Record<string, any>,
>(options: UseCrudOptions<TPayload>) {
  const { endpoint, entityName, initialForm, formRules, pageSize = 9 } = options

  const indexData: Ref<{ items: TEntity[]; pagination: IApiMetadata }> = ref({
    items: [],
    pagination: { ...ApiMetadataDefaults, page_size: pageSize },
  })

  const singleData: Ref<TEntity | null> = ref(null)

  const loading: Ref<Record<TLoadingKey, boolean>> = ref({
    Index: false,
    Form: false,
    Delete: false,
  })

  const form: Reactive<TPayload> = reactive({ ...initialForm })

  // Cached "all records" list for selects in OTHER features (e.g. roles in the user form).
  // Invalidated automatically after create/update/remove.
  const lookup = useLookup<TEntity>({ endpoint })

  let fetchController: AbortController | null = null

  function resetForm() {
    Object.keys(initialForm).forEach((key) => {
      const k = key as keyof TPayload
      const initial = initialForm[k]
      ;(form as any)[k] = Array.isArray(initial) ? [...initial] : initial
    })
    ;(form as any).id = undefined
  }

  function getCollection(): TEntity[] {
    return indexData.value.items
  }

  async function fetchAll(page?: number): Promise<TEntity[]> {
    // Abort the previous list request so a slow old page never overwrites a newer one
    fetchController?.abort()
    const controller = new AbortController()
    fetchController = controller

    loading.value.Index = true
    const currentPage = page ?? indexData.value.pagination.page
    try {
      const { data } = await get<IApiResponse<TEntity[]>>(endpoint, {
        params: {
          page: currentPage,
          page_size: indexData.value.pagination.page_size,
        },
        signal: controller.signal,
      })
      const meta = data.metadata || { ...ApiMetadataDefaults, page_size: pageSize }

      // Page became empty (e.g. last item on the last page was deleted) → go back one page
      if ((data.data || []).length === 0 && currentPage > 1 && meta.total > 0) {
        return fetchAll(meta.total_pages)
      }

      indexData.value.items = data.data || []
      indexData.value.pagination = meta
      return indexData.value.items
    } catch (error: any) {
      if (!isCancel(error)) console.error(`Failed to fetch ${entityName}s`, error)
      return indexData.value.items
    } finally {
      if (fetchController === controller) loading.value.Index = false
    }
  }

  async function fetchById(id: number | string): Promise<TEntity | null> {
    try {
      const { data } = await get<IApiResponse<TEntity>>(`${endpoint}/${id}`)
      singleData.value = data.data || null
      return singleData.value
    } catch (error: any) {
      console.error(`Failed to fetch ${entityName}`, error)
      return null
    }
  }

  // Shared tail of create/update/remove: notify, drop stale select cache, refresh list
  async function afterMutation(message: string | undefined, action: string) {
    swal.success('Berhasil', message || `${capitalize(entityName)} berhasil ${action}.`)
    lookup.invalidate()
    await fetchAll()
  }

  // `payload` defaults to the form; withFile passes the prepared (uploaded) payload
  async function create(payload: Record<string, any> = form) {
    loading.value.Form = true
    try {
      const { data } = await post<IApiResponse<TEntity>>(endpoint, payload)
      await afterMutation(data?.message, 'dibuat')
    } finally {
      loading.value.Form = false
    }
  }

  async function update(id: number | string, payload: Record<string, any> = form) {
    loading.value.Form = true
    try {
      const { data } = await put<IApiResponse<TEntity>>(`${endpoint}/${id}`, payload)
      await afterMutation(data?.message, 'diperbarui')
    } finally {
      loading.value.Form = false
    }
  }

  async function remove(id: number | string) {
    const result = await swal.warning(
      'Hapus Data',
      `Apakah Anda yakin ingin menghapus ${entityName} ini? Tindakan ini tidak dapat dibatalkan.`,
    )

    if (!result.isConfirmed) {
      return
    }

    loading.value.Delete = true
    try {
      const { data } = await del<IApiResponse<null>>(`${endpoint}/${id}`)
      await afterMutation(data?.message, 'dihapus')
    } finally {
      loading.value.Delete = false
    }
  }

  return {
    endpoint,
    entityName,
    indexData,
    singleData,
    loading,
    form,
    formRules,
    lookup,
    getCollection,
    resetForm,
    fetchAll,
    fetchById,
    create,
    update,
    remove,
  }
}
