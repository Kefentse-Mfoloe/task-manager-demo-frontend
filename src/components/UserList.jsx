import React from 'react'

export default function UserList({ users = [], onDeactivate = () => {}, formatDate = (d) => d }) {
  return (
    <ul>
      {users.map((user) => (
        <li key={user.id} style={{ marginBottom: 8 }}>
          <div>
            <strong>{user.firstName} {user.lastName}</strong> ({user.email}) {user.isActive ? '• active' : '• inactive'}
          </div>
          <div style={{ fontSize: '0.9em', color: '#555' }}>
            Created: {formatDate(user.createdDate || user.CreatedDate)} — Modified: {formatDate(user.modifiedDate || user.ModifiedDate)}
          </div>
          <div>
            <button onClick={() => onDeactivate(user.id)}>Deactivate</button>
          </div>
        </li>
      ))}
    </ul>
  )
}
