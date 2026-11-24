import { ref, type Ref } from 'vue'
import { get, isCancel, type IApiResponse } from '@/plugins/axios'

export interface UseLookupOptions {
  /** API endpoint, e.g. '/roles'. Backend returns ALL records when page_size is omitted. */
  endpoint: string
  /** Extra query params sent on every request (e.g. { status: 'active' }). */
  params?: Record<string, unknown>
  /** Max results for remote search (`search()`). Default 20. */
  searchLimit?: number
}

/**
 * Cached option source for selects/dropdowns.
 *
 * - `load()`      → fetch ALL records once; later calls return the cache (no request).
 *                   Concurrent calls share one in-flight request.
 * - `invalidate()`→ mark cache stale; the next `load()` refetches.
 * - `search(q)`   → server-side search (`?search=q&page_size=N`) for large datasets.
 *                   A newer search aborts the previous one, so results never arrive out of order.
 *                   Results are cached per query (cleared by `invalidate()`), so reopening a
 *                   modal or retyping the same text does not hit the API again.
 */
export function useLookup<TEntity>(options: UseLookupOptions) {
  const { endpoint, params = {}, searchLimit = 20 } = options

  const items: Ref<TEntity[]> = ref([])
  const loaded = ref(false)
  const loading = ref(false)

  let pending: Promise<TEntity[]> | null = null
  let searchController: AbortController | null = null
  const searchCache = new Map<string, TEntity[]>()
  const SEARCH_CACHE_LIMIT = 50

  async function load(force = false): Promise<TEntity[]> {
    if (loaded.value && !force) return items.value
    if (pending) return pending

    loading.value = true
    pending = (async () => {
      try {
        const { data } = await get<IApiResponse<TEntity[]>>(endpoint, { params })
        items.value = data.data || []
        loaded.value = true
        return items.value
      } catch (error: any) {
        console.error(`Failed to load lookup ${endpoint}`, error)
        return items.value
      } finally {
        loading.value = false
        pending = null
      }
    })()
    return pending
  }

  function invalidate() {
    loaded.value = false
    searchCache.clear()
  }

  async function search(query: string): Promise<TEntity[]> {
    const key = query.trim().toLowerCase()
    const cached = searchCache.get(key)
    if (cached) return cached

    searchController?.abort()
    searchController = new AbortController()
    try {
      const { data } = await get<IApiResponse<TEntity[]>>(endpoint, {
        params: { ...params, search: query.trim() || undefined, page: 1, page_size: searchLimit },
        signal: searchController.signal,
      })
      const results = data.data || []
      if (searchCache.size >= SEARCH_CACHE_LIMIT) {
        searchCache.delete(searchCache.keys().next().value as string)
      }
      searchCache.set(key, results)
      return results
    } catch (error: any) {
      if (!isCancel(error)) console.error(`Failed to search ${endpoint}`, error)
      throw error
    }
  }

  return { items, loaded, loading, load, invalidate, search }
}
