export type Status = 'pending' | 'completed' | 'all'
export type Priority = 'low' | 'medium' | 'high'

export interface Task {
  id: number
  title: string
  description: string | null
  priority: Priority
  due_on: string | null
  completed_at: string | null
  created_at: string
  overdue: boolean
}

export type Counts = Record<Status, number>

export interface TaskInput {
  title: string
  description: string
  priority: Priority
  due_on: string
}

export class ApiError extends Error {
  messages: string[]

  constructor(messages: string[]) {
    super(messages.join('. '))
    this.messages = messages
  }
}

function humanize(field: string) {
  const words = field.replace(/_/g, ' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}

async function request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? ''

  const response = await fetch(`/api/tasks${path}`, {
    method,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (response.status === 401) {
    window.location.assign('/session/new')
    throw new ApiError(['Sign in to continue'])
  }
  if (response.status === 204) return undefined as T

  const data = await response.json().catch(() => ({}))
  if (response.ok) return data

  if (data.errors) {
    const errors = data.errors as Record<string, string[]>
    throw new ApiError(Object.entries(errors).flatMap(([field, messages]) => messages.map((m) => `${humanize(field)} ${m}`)))
  }
  throw new ApiError([data.error ?? 'The server could not complete that. Try again.'])
}

export const api = {
  list: (status: Status) => request<{ tasks: Task[]; counts: Counts }>(`?status=${status}`),
  create: (task: TaskInput) => request<Task>('', 'POST', { task }),
  update: (id: number, task: TaskInput) => request<Task>(`/${id}`, 'PATCH', { task }),
  remove: (id: number) => request<void>(`/${id}`, 'DELETE'),
  complete: (id: number) => request<Task>(`/${id}/complete`, 'PATCH'),
  reopen: (id: number) => request<Task>(`/${id}/reopen`, 'PATCH'),
}
