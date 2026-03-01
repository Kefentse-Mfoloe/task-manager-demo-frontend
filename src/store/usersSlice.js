import { createSlice } from '@reduxjs/toolkit'

const usersSlice = createSlice({
  name: 'users',
  initialState: { list: [] },
  reducers: {
    addUser(state, action) {
      state.list.push(action.payload)
    },
    removeUser(state, action) {
      state.list = state.list.filter((u) => u.id !== action.payload)
    },
  },
})

export const { addUser, removeUser } = usersSlice.actions
export default usersSlice.reducer
