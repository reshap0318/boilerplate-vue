import { post, type IApiResponse } from '@/plugins/axios'

export interface IUploadedFile {
  uuid: string
  url: string
}

// Same File object → same upload. Prevents re-uploading when a submit is retried
// (e.g. after a 422 validation error). WeakMap lets the File be garbage-collected.
const uploadCache = new WeakMap<File, Promise<IUploadedFile>>()

export function uploadFile(file: File): Promise<IUploadedFile> {
  const cached = uploadCache.get(file)
  if (cached) return cached

  const formData = new FormData()
  formData.append('file', file)

  const request = post<IApiResponse<IUploadedFile>>('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  }).then((response) => response.data.data)

  uploadCache.set(file, request)
  // Failed uploads must be retryable
  request.catch(() => uploadCache.delete(file))
  return request
}
