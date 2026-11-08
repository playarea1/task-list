// due_on is a plain date; new Date("2026-11-08") would parse as UTC and can show the previous day.
function parseLocal(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function dueLabel(dueOn: string) {
  const due = parseLocal(dueOn)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const days = Math.round((due.getTime() - today.getTime()) / 86_400_000)

  if (days === 0) return 'today'
  if (days === 1) return 'tomorrow'
  return due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
