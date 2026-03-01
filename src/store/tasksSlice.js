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
  },
})

export const { addTask, removeTask } = tasksSlice.actions
export default tasksSlice.reducer
