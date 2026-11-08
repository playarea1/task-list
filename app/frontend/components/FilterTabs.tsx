import { MouseEvent } from 'react'
import { Counts, Status } from '../lib/api'

const TABS: { status: Status; label: string }[] = [
  { status: 'pending', label: 'To do' },
  { status: 'completed', label: 'Done' },
  { status: 'all', label: 'All' },
]

interface Props {
  status: Status
  counts: Counts
  onSelect: (status: Status) => void
}

export default function FilterTabs({ status, counts, onSelect }: Props) {
  const handleClick = (event: MouseEvent, next: Status) => {
    event.preventDefault()
    onSelect(next)
  }

  return (
    <nav className="tabs" aria-label="Filter tasks">
      {TABS.map((tab) => (
        <a
          key={tab.status}
          className="tab"
          href={`?status=${tab.status}`}
          aria-current={tab.status === status ? 'page' : undefined}
          onClick={(event) => handleClick(event, tab.status)}
        >
          {tab.label}
          <span className="tab__count">{counts[tab.status]}</span>
        </a>
      ))}
    </nav>
  )
}
