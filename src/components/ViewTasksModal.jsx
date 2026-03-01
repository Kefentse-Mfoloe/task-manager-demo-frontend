import React from 'react'

export default function ViewTasksModal({ viewTask, onClose, getPriorityLabel = (v) => v, getStatusLabel = (v) => v, getAssignedName = (id) => id }) {
  if (!viewTask) return null

  const history = (viewTask.taskStatusHistory || []).slice().sort((a,b) => new Date(b.createdDate) - new Date(a.createdDate))

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', padding: 20, maxWidth: 720, width: '90%', borderRadius: 6 }}>
        <h3>Task Details</h3>
        <div><strong>Title:</strong> {viewTask.title}</div>
        <div><strong>Description:</strong> {viewTask.description}</div>
        <div><strong>Priority:</strong> {getPriorityLabel(viewTask.taskPriority)}</div>
        <div><strong>Assigned:</strong> {getAssignedName(viewTask.userId)}</div>
        <div><strong>Created:</strong> {viewTask.createdDate}</div>
        <div><strong>Modified:</strong> {viewTask.modifiedDate}</div>
        <h4>Task Status History</h4>
        <ul>
          {history.map((h, i) => (
            <li key={i} style={{ marginBottom: 6 }}>
              <div><strong>Status:</strong> {getStatusLabel(h.taskStatusId)}</div>
              <div><strong>Priority:</strong> {getPriorityLabel(h.taskPriorityId)}</div>
              <div><strong>Comment:</strong> {h.comment}</div>
              <div style={{ fontSize: '0.85em', color: '#666' }}>{h.createdDate}</div>
            </li>
          ))}
        </ul>
        <div style={{ marginTop: 12, textAlign: 'right' }}>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
