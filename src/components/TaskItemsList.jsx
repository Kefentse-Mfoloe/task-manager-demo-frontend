import React from 'react'

export default function TaskItemsList({
  tasks = [],
  onView = () => {},
  onUpdate = () => {},
  getPriorityLabel = (v) => v,
  getAssignedName = (id) => id,
}) {
  return (
    <ul>
      {tasks.map((t) => (
        <li key={t.id} style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div><strong>{t.title}</strong></div>
              <div style={{ fontSize: '0.9em', color: '#555' }}>
                Priority: {getPriorityLabel(t.taskPriority)} — Assigned: {getAssignedName(t.userId)}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => onView(t)}>View</button>
              <button type="button" onClick={() => onUpdate(t)}>Update</button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
