import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { addTask, removeTask, setTasks, updateTask } from '../store/tasksSlice'
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

  // view / update modal state
  const [viewOpen, setViewOpen] = useState(false)
  const [viewTask, setViewTask] = useState(null)

  const [updateOpen, setUpdateOpen] = useState(false)
  const [editId, setEditId] = useState('')
  const [editTaskPriority, setEditTaskPriority] = useState('')
  const [editTaskStatus, setEditTaskStatus] = useState('')
  const [editComment, setEditComment] = useState('')

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
        const processingResult = await res.json();
        setErrors({ submit: `Server error: ${processingResult.error || 'Unknown error'}` });
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

  const openView = (task) => {
    setViewTask(task)
    setViewOpen(true)
  }
  const closeView = () => {
    setViewOpen(false)
    setViewTask(null)
  }

  const openUpdate = (task) => {
    setEditId(task.id)
    setEditTaskPriority(task.taskPriority ?? '')
    const latestStatus = (task.taskStatusHistory && task.taskStatusHistory[0] && task.taskStatusHistory[0].taskStatusId) || ''
    setEditTaskStatus(latestStatus)
    setEditComment('')
    setUpdateOpen(true)
  }
  const closeUpdate = () => {
    setUpdateOpen(false)
    setEditId('')
    setEditTaskPriority('')
    setEditTaskStatus('')
    setEditComment('')
  }

  const handleUpdateSubmit = async (ev) => {
    ev && ev.preventDefault && ev.preventDefault()
    const payload = {
      id: editId,
      taskPriority: editTaskPriority === '' ? null : Number(editTaskPriority),
      taskStatus: editTaskStatus === '' ? null : Number(editTaskStatus),
      comment: editComment || '',
    }

    try {
      const res = await fetch('https://localhost:7026/api/TaskManager/UpdateTask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const processingResult = await res.json();
        setErrors({ submit: `Server error: ${processingResult.error || 'Unknown error'}` });
        return;
      }

      const processingResult = await res.json()
      if (processingResult.succeeded) {
        // refresh the tasks list using current filter
        await handleFilterSubmit()
        closeUpdate()
      } else {
        setErrors({ submit: processingResult.error || 'Update failed' })
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
          <li key={t.id} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div><strong>{t.title}</strong></div>
                <div style={{ fontSize: '0.9em', color: '#555' }}>
                  Priority: {t.taskPriority ?? 'None'} — Assigned: {t.userId}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={() => openView(t)}>View</button>
                <button type="button" onClick={() => openUpdate(t)}>Update</button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {viewOpen && viewTask && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: 20, maxWidth: 720, width: '90%', borderRadius: 6 }}>
            <h3>Task Details</h3>
            <div><strong>Title:</strong> {viewTask.title}</div>
            <div><strong>Description:</strong> {viewTask.description}</div>
            <div><strong>Priority:</strong> {viewTask.taskPriority ?? 'None'}</div>
            <div><strong>Assigned:</strong> {viewTask.userId}</div>
            <div><strong>Created:</strong> {viewTask.createdDate}</div>
            <div><strong>Modified:</strong> {viewTask.modifiedDate}</div>
            <h4>Task Status History</h4>
            <ul>
              {(viewTask.taskStatusHistory || []).slice().sort((a,b) => new Date(b.createdDate) - new Date(a.createdDate)).map((h, i) => (
                <li key={i} style={{ marginBottom: 6 }}>
                  <div><strong>Status:</strong> {h.taskStatusId}</div>
                  <div><strong>Priority:</strong> {h.taskPriorityId}</div>
                  <div><strong>Comment:</strong> {h.comment}</div>
                  <div style={{ fontSize: '0.85em', color: '#666' }}>{h.createdDate}</div>
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 12, textAlign: 'right' }}>
              <button onClick={closeView}>Close</button>
            </div>
          </div>
        </div>
      )}

      {updateOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: 20, maxWidth: 520, width: '90%', borderRadius: 6 }}>
            <h3>Update Task</h3>
            <form onSubmit={handleUpdateSubmit}>
              <div style={{ marginBottom: 8 }}>
                <label>
                  Id:
                  <input value={editId} readOnly />
                </label>
              </div>

              <div style={{ marginBottom: 8 }}>
                <label>
                  Task Priority:
                  <select value={editTaskPriority} onChange={(e) => setEditTaskPriority(e.target.value)}>
                    <option value="">-- none --</option>
                    <option value={1}>1 - Low</option>
                    <option value={2}>2 - Medium</option>
                    <option value={3}>3 - High</option>
                  </select>
                </label>
              </div>

              <div style={{ marginBottom: 8 }}>
                <label>
                  Task Status:
                  <select value={editTaskStatus} onChange={(e) => setEditTaskStatus(e.target.value)}>
                    <option value="">-- select --</option>
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

              <div style={{ marginBottom: 8 }}>
                <label>
                  Comment:
                  <input value={editComment} onChange={(e) => setEditComment(e.target.value)} />
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" onClick={closeUpdate}>Cancel</button>
                <button type="submit">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
