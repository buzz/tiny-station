function callApi(url: string, options?: CallApiOptions) {
  const method = options?.method ?? 'POST'
  const headers: HeadersInit = { 'Content-Type': 'application/json' }

  if (options?.token) {
    headers.Authorization = `Bearer ${options.token}`
  }

  const emptyBody = options?.method === 'GET' || options?.method === 'HEAD' ? null : '{}'
  const body = options?.body ? JSON.stringify(options.body) : emptyBody

  return fetch(url, { method, headers, body })
}

interface CallApiOptions {
  method?: string
  body?: Record<string, unknown>
  token?: string
}

function getCookie(cookies: Record<string, unknown>, key: string): string | undefined {
  const value = cookies[key]
  return typeof value === 'string' ? value : undefined
}

export { callApi, getCookie }
