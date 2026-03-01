import React from 'react'
import GenericSelect from './GenericSelect'

export default function UpdateTasksModal({
  open,
  editId,
  editTaskPriority,
  editTaskStatus,
  editComment,
  onCancel = () => {},
  onSubmit = () => {},
  onChangePriority = () => {},
  onChangeStatus = () => {},
  onChangeComment = () => {},
}) {
  if (!open) return null

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', padding: 20, maxWidth: 520, width: '90%', borderRadius: 6 }}>
        <h3>Update Task</h3>
        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: 8 }}>
            <label>
              Id:
              <input value={editId} readOnly />
            </label>
          </div>

          <div style={{ marginBottom: 8 }}>
            <label>
              Task Priority:
              <GenericSelect value={editTaskPriority} onChange={onChangePriority}>
                <option value="">-- none --</option>
                <option value={1}>1 - Low</option>
                <option value={2}>2 - Medium</option>
                <option value={3}>3 - High</option>
              </GenericSelect>
            </label>
          </div>

          <div style={{ marginBottom: 8 }}>
            <label>
              Task Status:
              <GenericSelect value={editTaskStatus} onChange={onChangeStatus}>
                <option value="">-- select --</option>
                <option value={0}>Backlog</option>
                <option value={1}>ToDo</option>
                <option value={2}>InProgress</option>
                <option value={3}>Blocked</option>
                <option value={4}>InReview</option>
                <option value={5}>Completed</option>
                <option value={6}>Cancelled</option>
              </GenericSelect>
            </label>
          </div>

          <div style={{ marginBottom: 8 }}>
            <label>
              Comment:
              <input value={editComment} onChange={onChangeComment} />
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button type="button" onClick={onCancel}>Cancel</button>
            <button type="submit">Submit</button>
          </div>
        </form>
      </div>
    </div>
  )
}
