import { useCallback, useEffect, useRef, useState } from 'react'
import { api, Counts, Status, Task, TaskInput } from './api'

const NO_COUNTS: Counts = { pending: 0, completed: 0, all: 0 }

function messageFrom(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong. Try again.'
}

export function useTasks(status: Status) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [counts, setCounts] = useState<Counts>(NO_COUNTS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Switching tabs quickly can resolve requests out of order; only the newest may render.
  const latestRequest = useRef(0)

  const reload = useCallback(async () => {
    const requestId = ++latestRequest.current
    try {
      const data = await api.list(status)
      if (requestId !== latestRequest.current) return
      setTasks(data.tasks)
      setCounts(data.counts)
      setError(null)
    } catch (e) {
      if (requestId === latestRequest.current) setError(messageFrom(e))
    } finally {
      if (requestId === latestRequest.current) setLoading(false)
    }
  }, [status])

  useEffect(() => {
    setLoading(true)
    reload()
  }, [reload])

  const optimistically = async (change: (current: Task[]) => Task[], send: () => Promise<unknown>) => {
    setTasks(change)
    try {
      await send()
      await reload()
    } catch (e) {
      await reload()
      setError(messageFrom(e))
    }
  }

  const toggle = (task: Task) => {
    const completed_at = task.completed_at ? null : new Date().toISOString()
    return optimistically(
      (current) => current.map((t) => (t.id === task.id ? { ...t, completed_at, overdue: false } : t)),
      () => (task.completed_at ? api.reopen(task.id) : api.complete(task.id)),
    )
  }

  const remove = (task: Task) =>
    optimistically(
      (current) => current.filter((t) => t.id !== task.id),
      () => api.remove(task.id),
    )

  const create = async (input: TaskInput) => {
    await api.create(input)
    await reload()
  }

  const update = async (task: Task, input: TaskInput) => {
    await api.update(task.id, input)
    await reload()
  }

  return { tasks, counts, loading, error, retry: reload, create, update, toggle, remove }
}
