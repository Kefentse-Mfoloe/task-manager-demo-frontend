import { configureStore } from '@reduxjs/toolkit'
import usersReducer from './usersSlice'
import tasksReducer from './tasksSlice'

export const store = configureStore({
  reducer: {
    users: usersReducer,
    tasks: tasksReducer,
  },
})

export default store
