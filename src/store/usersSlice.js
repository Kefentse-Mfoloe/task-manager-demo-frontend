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
    setUsers(state, action) {
      state.list = action.payload || []
    },
  },
})
export const { addUser, removeUser, setUsers } = usersSlice.actions
export default usersSlice.reducer
