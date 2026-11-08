import { FormEvent, useState } from 'react'
import { TaskInput } from '../lib/api'
import TaskFields from './TaskFields'

const BLANK: TaskInput = { title: '', description: '', priority: 'medium', due_on: '' }

export default function NewTaskForm({ onCreate }: { onCreate: (input: TaskInput) => Promise<void> }) {
  const [task, setTask] = useState(BLANK)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    try {
      await onCreate(task)
      setTask(BLANK)
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="composer" onSubmit={submit}>
      <div className="composer__bar">
        <input
          className="composer__title"
          aria-label="Task title"
          placeholder="What needs doing?"
          maxLength={200}
          value={task.title}
          onChange={(e) => setTask({ ...task, title: e.target.value })}
        />
        <button className="button button--primary" disabled={saving || task.title.trim() === ''}>
          {saving ? 'Adding…' : 'Add task'}
        </button>
      </div>
      {task.title !== '' && <TaskFields name="new-priority" value={task} onChange={setTask} />}
      {error && <p className="form-error" role="alert">{error}</p>}
    </form>
  )
}
