import { Priority, TaskInput } from '../lib/api'

const PRIORITIES: { value: Priority; label: string }[] = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

interface Props {
  name: string
  value: TaskInput
  onChange: (value: TaskInput) => void
}

export default function TaskFields({ name, value, onChange }: Props) {
  return (
    <div className="fields">
      <label className="field field--wide">
        Notes
        <textarea rows={2} value={value.description} onChange={(e) => onChange({ ...value, description: e.target.value })} />
      </label>

      <fieldset className="priority">
        <legend>Priority</legend>
        {PRIORITIES.map((priority) => (
          <label key={priority.value} className={`chip chip--${priority.value}`}>
            <input
              type="radio"
              name={name}
              checked={value.priority === priority.value}
              onChange={() => onChange({ ...value, priority: priority.value })}
            />
            {priority.label}
          </label>
        ))}
      </fieldset>

      <label className="field">
        Due date
        <input type="date" value={value.due_on} onChange={(e) => onChange({ ...value, due_on: e.target.value })} />
      </label>
    </div>
  )
}
