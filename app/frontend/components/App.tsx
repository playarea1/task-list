import { useEffect, useState } from 'react'
import { Status } from '../lib/api'
import { useTasks } from '../lib/useTasks'
import FilterTabs from './FilterTabs'
import NewTaskForm from './NewTaskForm'
import TaskRow from './TaskRow'

const EMPTY_MESSAGES: Record<Status, string> = {
  pending: 'Nothing left to do. Add a task above when something comes up.',
  completed: 'No finished tasks yet. Tick one off and it will show up here.',
  all: 'No tasks yet. Add your first one above.',
}

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  return hour < 18 ? 'Good afternoon' : 'Good evening'
}

function summary(pending: number) {
  if (pending === 0) return 'Nothing left to do'
  return `${pending} ${pending === 1 ? 'task' : 'tasks'} left`
}

function statusFromUrl(): Status {
  const status = new URLSearchParams(window.location.search).get('status')
  return status === 'completed' || status === 'all' ? status : 'pending'
}

export default function App() {
  const [status, setStatus] = useState<Status>(statusFromUrl)
  const { tasks, counts, loading, error, retry, create, update, toggle, remove } = useTasks(status)

  useEffect(() => {
    const syncWithUrl = () => setStatus(statusFromUrl())
    window.addEventListener('popstate', syncWithUrl)
    return () => window.removeEventListener('popstate', syncWithUrl)
  }, [])

  const selectStatus = (next: Status) => {
    window.history.pushState(null, '', `?status=${next}`)
    setStatus(next)
  }

  return (
    <main className="glass">
      <h1 className="greeting">{greeting()}</h1>
      <p className="summary">{loading && counts.all === 0 ? '' : summary(counts.pending)}</p>
      {counts.all > 0 && (
        <div className="progress" role="img" aria-label={`${counts.completed} of ${counts.all} tasks done`}>
          <div style={{ width: `${(counts.completed / counts.all) * 100}%` }} />
        </div>
      )}
      <FilterTabs status={status} counts={counts} onSelect={selectStatus} />
      <NewTaskForm onCreate={create} />

      {error && (
        <p className="banner" role="alert">
          {error} <button className="link" onClick={retry}>Reload tasks</button>
        </p>
      )}

      {loading && tasks.length === 0 ? (
        <p className="notice">Loading your tasks…</p>
      ) : tasks.length === 0 && !error ? (
        <p className="notice">{EMPTY_MESSAGES[status]}</p>
      ) : (
        <ul className="tasks">
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} onToggle={toggle} onUpdate={update} onRemove={remove} />
          ))}
        </ul>
      )}
    </main>
  )
}
