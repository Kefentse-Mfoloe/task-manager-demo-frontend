import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { addTask, removeTask } from '../store/tasksSlice'

export default function Tasks() {
  const tasks = useSelector((s) => s.tasks.list)
  const dispatch = useDispatch()

  const handleAdd = () => {
    const id = Date.now().toString()
    dispatch(addTask({ id, title: `Task ${tasks.length + 1}` }))
  }

  return (
    <div>
      <h2>Tasks</h2>
      <button onClick={handleAdd}>Add sample task</button>
      <ul>
        {tasks.map((t) => (
          <li key={t.id}>
            {t.title} <button onClick={() => dispatch(removeTask(t.id))}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
