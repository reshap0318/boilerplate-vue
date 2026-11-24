import { uploadFile } from '@/helpers/upload'
import type { useCrud } from './useCrud'

type CrudBaseReturn<
  TEntity extends { id: number | string },
  TPayload extends Record<string, any>,
> = ReturnType<typeof useCrud<TEntity, TPayload>>

export function withFile<
  TEntity extends { id: number | string },
  TPayload extends Record<string, any>,
>(crud: CrudBaseReturn<TEntity, TPayload>, fileFields: (keyof TPayload)[]) {
  // File → uuid, File[] → uuid[], anything else unchanged (null, existing url, ...)
  async function upload(value: unknown) {
    if (value instanceof File) return (await uploadFile(value)).uuid
    if (Array.isArray(value) && value[0] instanceof File) {
      return (await Promise.all(value.map((f: File) => uploadFile(f)))).map((u) => u.uuid)
    }
    return value
  }

  // Uploads all file fields in parallel; uploadFile caches per File, so a retry
  // (e.g. after a 422) never uploads the same file twice
  async function preparePayload(excludeFields: (keyof TPayload)[] = []) {
    const keys = (Object.keys(crud.form) as (keyof TPayload)[]).filter(
      (key) => !excludeFields.includes(key),
    )
    const values = await Promise.all(
      keys.map((key) => {
        const value = (crud.form as TPayload)[key]
        return fileFields.includes(key) ? upload(value) : value
      }),
    )
    return Object.fromEntries(keys.map((key, i) => [key, values[i]]))
  }

  async function createForm(excludeFields?: (keyof TPayload)[]) {
    crud.loading.value.Form = true // covers the upload phase too
    try {
      await crud.create(await preparePayload(excludeFields))
    } finally {
      crud.loading.value.Form = false
    }
  }

  async function updateForm(id: number | string, excludeFields?: (keyof TPayload)[]) {
    crud.loading.value.Form = true
    try {
      await crud.update(id, await preparePayload(excludeFields))
    } finally {
      crud.loading.value.Form = false
    }
  }

  return {
    ...crud,
    createForm,
    updateForm,
  }
}
