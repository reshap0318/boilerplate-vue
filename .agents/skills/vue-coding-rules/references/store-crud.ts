// ============================================================
// Standard CRUD Store (no file upload)
// Use when: list page + create/edit/delete of ONE REST resource.
// Not CRUD? → see store-custom.ts
// ============================================================
import { defineStore } from 'pinia'
import { minLength, required } from '@vuelidate/validators'
import { useCrud } from '@/composables/useCrud' // direct path inside stores (no barrel)
import { get, type IApiResponse } from '@/plugins/axios'
import type { ICategory } from './category'

export interface IEntity {
  id: number
  name: string
  description: string
  category: ICategory
}

export interface IEntityPayload {
  id?: number
  name: string
  description: string
  category_id: number | null
}

export const useEntityStore = defineStore('entity', () => {
  const crud = useCrud<IEntity, IEntityPayload>({
    endpoint: '/entities',
    entityName: 'entity',
    initialForm: { name: '', description: '', category_id: null },
    formRules: {
      name: { required, minLength: minLength(3) },
      description: {},
      category_id: { required },
    },
    // pageSize: 12, // list page size (default 9)
  })

  // What you get from `crud` — don't re-implement any of these:
  //   indexData, loading.{Index,Form,Delete}, form, formRules, resetForm
  //   fetchAll(page)  — aborts previous request, steps back a page when empty
  //   fetchById(id), create(), update(id), remove(id) — swal + refetch built in
  //   lookup          — cached ALL-rows list for selects in OTHER features:
  //                     lookup.load(), lookup.items, lookup.loading, lookup.search(q)
  //                     auto-invalidated after create/update/remove
  //
  // ❌ Do NOT add `fetchAllEntities()` for dropdowns — use `entityStore.lookup`.

  // ✅ Extra endpoints that are NOT plain CRUD go here, next to ...crud
  async function fetchHistory(id: number): Promise<unknown[]> {
    try {
      const { data } = await get<IApiResponse<unknown[]>>(`/entities/${id}/history`)
      return data.data || []
    } catch (error: any) {
      console.error('Failed to fetch entity history', error)
      return []
    }
  }

  return {
    ...crud,
    fetchHistory,
  }
})
