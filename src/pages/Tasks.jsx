import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { addTask, removeTask, setTasks } from '../store/tasksSlice'
import { setUsers } from '../store/usersSlice'

function isGuid(val) {
  if (!val) return false;
  const guidRe = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return guidRe.test(val);
}

export default function Tasks() {
  const tasks = useSelector((s) => s.tasks.list);
  const users = useSelector((s) => s.users.list);
  const dispatch = useDispatch();

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [taskPriority, setTaskPriority] = useState('')
  const [userId, setUserId] = useState('00000000-0000-0000-0000-000000000000')
  const [errors, setErrors] = useState({})

  // filter state
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [filterUserId, setFilterUserId] = useState('')

  useEffect(() => {
    let mounted = true
    const fetchUsers = async () => {
      try {
        const res = await fetch('https://localhost:7026/api/TaskManager/GetUsers')
        if (!res.ok) return
        const data = await res.json()
        if (mounted && Array.isArray(data)) {
          dispatch(setUsers(data))
        }
      } catch (err) {
        // ignore fetch errors for now
      }
    }
    fetchUsers();
    return () => {
      mounted = false
    }
  }, [dispatch])

  const validate = () => {
    const validationErrors = {};
    if (!title.trim()) validationErrors.title = 'Title is required';
    if (!isGuid(userId)) validationErrors.userId = 'UserId must be a valid GUID';
    return validationErrors;
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const newTask = { title, description, taskPriority: Number(taskPriority), userId };

    try {
      const res = await fetch('https://localhost:7026/api/TaskManager/AddTask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      })

      if (!res.ok) {
        const processingResult = await res.json();
        setErrors({ submit: `Server error: ${processingResult.error || 'Unknown error'}` });
        return;
      }

      const processingResult = await res.json();
      // processingResult: { succeeded: bool, error: string, resultId: guid | null }
      if (processingResult.succeeded) {
        newTask.id = processingResult.resultId || Date.now().toString();
        dispatch(addTask(newTask));

        // clear form
        setTitle('');
        setDescription('');
        setTaskPriority(1);
        setUserId('00000000-0000-0000-0000-000000000000');
        setErrors({});
      } else {
        setErrors({ submit: processingResult.error || 'Processing failed' });
      }
    } catch (err) {
      setErrors({ submit: err.message || 'Network error' });
    }
  }

  const handleFilterSubmit = async () => {
    const filter = {
      TaskStatus: filterStatus === '' ? null : Number(filterStatus),
      TaskPriority: filterPriority === '' ? null : Number(filterPriority),
      user: filterUserId === '' ? null : filterUserId,
    }

    try {
      const res = await fetch('https://localhost:7026/api/TaskManager/GetTasksByFilter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filter),
      })

      if (!res.ok) {
        const text = await res.text()
        setErrors({ submit: `Server error: ${res.status} ${text}` })
        return
      }

      const data = await res.json()
      if (Array.isArray(data)) {
        dispatch(setTasks(data))
      } else {
        setErrors({ submit: 'Invalid response from server' })
      }
    } catch (err) {
      setErrors({ submit: err.message || 'Network error' })
    }
  }

  return (
    <div>
      <h2>Tasks</h2>

      

      <form onSubmit={handleSubmit} style={{ marginBottom: 16 }} noValidate>
        <div>
          <label>
            Title:
            <input value={title} onChange={(e) => setTitle(e.target.value)} aria-invalid={!!errors.title} />
          </label>
          {errors.title && <div style={{ color: 'red' }}>{errors.title}</div>}
        </div>

        <div>
          <label>
            Description:
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
        </div>

        <div>
          <label>
            Task Priority:
            <select value={taskPriority} onChange={(e) => setTaskPriority(e.target.value)}>
              <option value={1}>1 - Low</option>
              <option value={2}>2 - Medium</option>
              <option value={3}>3 - High</option>
            </select>
          </label>
        </div>

        <div>
          <label>
            User:
            <select value={userId} onChange={(e) => setUserId(e.target.value)} aria-invalid={!!errors.userId}>
              <option value="00000000-0000-0000-0000-000000000000">-- select user --</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>
          </label>
          {errors.userId && <div style={{ color: 'red' }}>{errors.userId}</div>}
        </div>
        {errors.submit && <div style={{ color: 'red' }}>{errors.submit}</div>}

        <div>
          <button type="submit">Add Task</button>
        </div>
      </form>

      <div style={{ gap: 24, marginBottom: 16 }}>
        <section style={{ minWidth: 240 }}>
          <h3>Filter</h3>
          <div>
            <label>
              Task Status:
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">-- any --</option>
                <option value={0}>Backlog</option>
                <option value={1}>ToDo</option>
                <option value={2}>InProgress</option>
                <option value={3}>Blocked</option>
                <option value={4}>InReview</option>
                <option value={5}>Completed</option>
                <option value={6}>Cancelled</option>
              </select>
            </label>
          </div>

          <div>
            <label>
              Task Priority:
              <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
                <option value="">-- any --</option>
                <option value={1}>1 - Low</option>
                <option value={2}>2 - Medium</option>
                <option value={3}>3 - High</option>
              </select>
            </label>
          </div>

          <div>
            <label>
              User:
              <select value={filterUserId} onChange={(e) => setFilterUserId(e.target.value)}>
                <option value="">-- any user --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.firstName} {u.lastName}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div style={{ marginTop: 8 }}>
            <button type="button" onClick={handleFilterSubmit}>Submit</button>
          </div>
        </section>

        
      </div>

      <ul>
        {tasks.map((t) => (
          <li key={t.id}>
            {t.title} (Priority: {t.taskPriority || '1'}) - assigned to {t.userId}{' '}
            <button onClick={() => dispatch(removeTask(t.id))}>View</button>
            <button onClick={() => dispatch(removeTask(t.id))}>Update</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
