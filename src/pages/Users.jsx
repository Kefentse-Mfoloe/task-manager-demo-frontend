import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { addUser, removeUser } from '../store/usersSlice'

export default function Users() {
  const users = useSelector((s) => s.users.list)
  const dispatch = useDispatch()

  const handleAdd = () => {
    const id = Date.now().toString()
    dispatch(addUser({ id, name: `User ${users.length + 1}` }))
  }

  return (
    <div>
      <h2>Users</h2>
      <button onClick={handleAdd}>Add sample user</button>
      <ul>
        {users.map((u) => (
          <li key={u.id}>
            {u.name} <button onClick={() => dispatch(removeUser(u.id))}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
