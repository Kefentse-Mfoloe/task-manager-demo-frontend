import { configureStore } from '@reduxjs/toolkit'
import usersReducer from './usersSlice'
import tasksReducer from './tasksSlice'

// Base API URL used throughout the app
export const API_BASE = 'https://localhost:7026/api/TaskManager/'

export const store = configureStore({
  reducer: {
    users: usersReducer,
    tasks: tasksReducer,
  },
})

export default store
