import { createSlice } from '@reduxjs/toolkit'

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: { list: [] },
  reducers: {
    addTask(state, action) {
      state.list.push(action.payload)
    },
    removeTask(state, action) {
      state.list = state.list.filter((t) => t.id !== action.payload)
    },
  },
})

export const { addTask, removeTask } = tasksSlice.actions
export default tasksSlice.reducer
