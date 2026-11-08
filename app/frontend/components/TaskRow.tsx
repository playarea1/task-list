import { FormEvent, KeyboardEvent, useState } from 'react'
import { Task, TaskInput } from '../lib/api'
import { dueLabel } from '../lib/dates'
import TaskFields from './TaskFields'

interface Props {
  task: Task
  onToggle: (task: Task) => void
  onUpdate: (task: Task, input: TaskInput) => Promise<void>
  onRemove: (task: Task) => void
}

function toInput(task: Task): TaskInput {
  return { title: task.title, description: task.description ?? '', priority: task.priority, due_on: task.due_on ?? '' }
}

export default function TaskRow({ task, onToggle, onUpdate, onRemove }: Props) {
  const [draft, setDraft] = useState<TaskInput | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const done = task.completed_at !== null

  const cancel = () => {
    setDraft(null)
    setError(null)
  }

  const save = async (event: FormEvent) => {
    event.preventDefault()
    try {
      await onUpdate(task, draft!)
      cancel()
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const cancelOnEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape') cancel()
  }

  const className = `task task--${task.priority}${done ? ' task--done' : ''}`

  if (draft) {
    return (
      <li className={className}>
        <form className="task__inner task__edit" onSubmit={save} onKeyDown={cancelOnEscape}>
          <label className="field field--wide">
            Title
            <input autoFocus maxLength={200} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          </label>
          <TaskFields name={`priority-${task.id}`} value={draft} onChange={setDraft} />
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="task__edit-actions">
            <button className="button button--primary">Save changes</button>
            <button type="button" className="button button--ghost" onClick={cancel}>Cancel</button>
          </div>
        </form>
      </li>
    )
  }

  return (
    <li className={className}>
      <div className="task__inner">
        <input
          className="task__check"
          type="checkbox"
          checked={done}
          aria-label={`Mark "${task.title}" as ${done ? 'not done' : 'done'}`}
          onChange={() => onToggle(task)}
        />
        <div className="task__body">
          <button className="task__title" title="Edit task" onClick={() => setDraft(toInput(task))}>
            {task.title}
          </button>
          {task.description && <p className="task__notes">{task.description}</p>}
          <p className="task__meta">
            <span className="task__priority">{task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} priority</span>
            {task.due_on && !done && (
              <span className={task.overdue ? 'task__overdue' : undefined}>
                {task.overdue ? 'Overdue, was due' : 'Due'} {dueLabel(task.due_on)}
              </span>
            )}
          </p>
        </div>
        <button
          className="task__delete"
          aria-label={confirmingDelete ? `Confirm delete "${task.title}"` : `Delete "${task.title}"`}
          onBlur={() => setConfirmingDelete(false)}
          onClick={() => (confirmingDelete ? onRemove(task) : setConfirmingDelete(true))}
        >
          {confirmingDelete ? 'Really delete?' : 'Delete'}
        </button>
      </div>
    </li>
  )
}
