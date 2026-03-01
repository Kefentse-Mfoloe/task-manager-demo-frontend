import { createSlice } from '@reduxjs/toolkit'

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: { list: [] },
  reducers: {
    addTask(state, action) {
      const payload = action.payload || {}
      const now = new Date().toISOString()
      const task = {
        ...payload,
        createdDate: payload.createdDate || now,
        taskStatusHistory: payload.taskStatusHistory || [
          {
            taskStatusId: payload.taskStatus || 0,
            comment: payload.comment || 'Created',
            taskPriorityId: payload.taskPriority || payload.taskPriorityId || 1,
            createdDate: now,
          },
        ],
      }
      state.list.push(task)
    },
    removeTask(state, action) {
      state.list = state.list.filter((t) => t.id !== action.payload)
    },
    setTasks(state, action) {
      state.list = Array.isArray(action.payload) ? action.payload : []
    },
    updateTask(state, action) {
      const payload = action.payload || {}
      const idx = state.list.findIndex((t) => t.id === payload.id)
      if (idx === -1) return
      const existing = state.list[idx]
      const now = new Date().toISOString()

      const taskPriorityId = payload.taskPriority ?? existing.taskPriority ?? existing.taskPriorityId ?? null
      const taskStatusId = payload.taskStatusId ?? (existing.taskStatusHistory && existing.taskStatusHistory[0] && existing.taskStatusHistory[0].taskStatusId) ?? 0

      const newHistoryItem = {
        taskStatusId,
        comment: payload.comment || '',
        taskPriorityId: taskPriorityId ?? 1,
        createdDate: now,
      }

      const updated = {
        ...existing,
        ...payload,
        taskPriority: taskPriorityId,
        modifiedDate: now,
        taskStatusHistory: [newHistoryItem].concat(existing.taskStatusHistory || []),
      }

      state.list[idx] = updated
    },
  },
})
export const { addTask, removeTask, setTasks, updateTask } = tasksSlice.actions
export default tasksSlice.reducer
