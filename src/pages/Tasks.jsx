import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { addTask, removeTask, setTasks, updateTask } from '../store/tasksSlice'
import { setUsers } from '../store/usersSlice'
import { getJson, postJson } from '../utils/api'
import GenericSelect from '../components/GenericSelect'
import { isGuid, validate } from '../utils/validateTask'
import { API_BASE } from '../store/store'
import LabelField from '../components/LabelField'
import TaskItemsList from '../components/TaskItemsList'
import ViewTasksModal from '../components/ViewTasksModal'
import UpdateTasksModal from '../components/UpdateTasksModal'


const TASK_PRIORITIES = {
  1: 'Low',
  2: 'Medium',
  3: 'High',
}

const TASK_STATUS = {
  0: 'Backlog',
  1: 'ToDo',
  2: 'InProgress',
  3: 'Blocked',
  4: 'InReview',
  5: 'Completed',
  6: 'Cancelled',
}

function getPriorityLabel(val) {
  if (val === null || val === undefined || val === '') return 'None'
  return TASK_PRIORITIES[val] || String(val)
}

function getStatusLabel(val) {
  if (val === null || val === undefined || val === '') return ''
  return TASK_STATUS[val] || String(val)
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
        const responseObj = await getJson(`${API_BASE}GetUsers`)
        if (!responseObj.ok) return
        const data = responseObj.data
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

  const handleFormattedAssignedName = (userId) => {
    if (!userId) return ''
    const u = users.find((x) => x.id === userId)
    return u ? `${u.firstName} ${u.lastName}` : userId
  }

  // validation moved to src/utils/validateTask.js

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const validationErrors = validate({ title, userId });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const newTask = { title, description, taskPriority: Number(taskPriority), userId };

    try {
      const responseObj = await postJson(`${API_BASE}AddTask`, newTask)
      if (!responseObj.ok) {
        setErrors({ submit: `Server error: ${responseObj.text || 'Unknown error'}` })
          return 
      }
      const processingResult = responseObj.data
      // processingResult: { succeeded: bool, error: string, resultId: guid | null }
      if (processingResult.succeeded) {
        newTask.id = processingResult.resultId || Date.now().toString()
        dispatch(addTask(newTask))

        // clear form
        setTitle('')
        setDescription('')
        setTaskPriority(1)
        setUserId('00000000-0000-0000-0000-000000000000')
        setErrors({})
      } else {
        setErrors({ submit: processingResult.error || 'Processing failed' })
      }
    } catch (err) {
      setErrors({ submit: err.message || 'Network error' })
    }
  }

  const handleFilterSubmit = async () => {
    const filter = {
      TaskStatus: filterStatus === '' ? null : Number(filterStatus),
      TaskPriority: filterPriority === '' ? null : Number(filterPriority),
      user: filterUserId === '' ? null : filterUserId,
    }

    try {
      const responseObj = await postJson(`${API_BASE}GetTasksByFilter`, filter)
      if (!responseObj.ok) {
        setErrors({ submit: `Server error: ${responseObj.text || 'Unknown error'}` })
          return 
      }
      const data = responseObj.data
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
      const responseObj = await postJson(`${API_BASE}UpdateTask`, payload)
      if (!responseObj.ok) {
        setErrors({ submit: `Server error: ${responseObj.text || 'Unknown error'}` })
          return 
      }
      const processingResult = responseObj.data
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
        <LabelField label="Title:" error={errors.title}>
            <input value={title} onChange={(e) => setTitle(e.target.value)} aria-invalid={!!errors.title} />
        </LabelField>

        <LabelField label="Description:">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </LabelField>

        <div>
          <GenericSelect label="Task Priority:" value={taskPriority} onChange={(e) => setTaskPriority(e.target.value)}>
            {Object.entries(TASK_PRIORITIES).map(([k, v]) => (
              <option key={k} value={k}>{k} - {v}</option>
            ))}
          </GenericSelect>
        </div>

        <div>
          <GenericSelect label="User:" value={userId} onChange={(e) => setUserId(e.target.value)} ariaInvalid={!!errors.userId}>
            <option value="00000000-0000-0000-0000-000000000000">-- select user --</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName}
              </option>
            ))}
          </GenericSelect>
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
            <GenericSelect label="Task Status:" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">-- any --</option>
              {Object.entries(TASK_STATUS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </GenericSelect>
          </div>

          <div>
            <GenericSelect label="Task Priority:" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
              <option value="">-- any --</option>
              {Object.entries(TASK_PRIORITIES).map(([k, v]) => (
                <option key={k} value={k}>{k} - {v}</option>
              ))}
            </GenericSelect>
          </div>

          <div>
            <GenericSelect label="User:" value={filterUserId} onChange={(e) => setFilterUserId(e.target.value)}>
              <option value="">-- any user --</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName}
                </option>
              ))}
            </GenericSelect>
          </div>
          <div style={{ marginTop: 8 }}>
            <button type="button" onClick={handleFilterSubmit}>Submit</button>
          </div>
        </section>
      </div>

      <TaskItemsList
        tasks={tasks}
        onView={openView}
        onUpdate={openUpdate}
        getPriorityLabel={getPriorityLabel}
        getAssignedName={handleFormattedAssignedName}
      />

      <ViewTasksModal
        viewTask={viewTask}
        onClose={closeView}
        getPriorityLabel={getPriorityLabel}
        getStatusLabel={getStatusLabel}
        getAssignedName={handleFormattedAssignedName}
      />

      <UpdateTasksModal
        open={updateOpen}
        editId={editId}
        editTaskPriority={editTaskPriority}
        editTaskStatus={editTaskStatus}
        editComment={editComment}
        onCancel={closeUpdate}
        onSubmit={handleUpdateSubmit}
        onChangePriority={(e) => setEditTaskPriority(e.target.value)}
        onChangeStatus={(e) => setEditTaskStatus(e.target.value)}
        onChangeComment={(e) => setEditComment(e.target.value)}
      />
    </div>
  )
}
