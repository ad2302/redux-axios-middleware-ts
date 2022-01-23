import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios';

const client = axios.create({ //all axios can be used, shown in axios documentation
    baseURL:'https://api.backend.dev',
    responseType: 'json'
  });

export const fetchUser = createAsyncThunk('user/fetchUser', async () => {
  const response = await client.get('/api/user')
  return response.data
})

const userSlice = createSlice({
  name: 'user',
  initialState: {
    name: 'No user',
    status: 'idle'
  },
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchUser.pending, (state, _) => {
      state.status = 'loading'
    })
    builder.addCase(fetchUser.fulfilled, (state, action) => {
      state.status = 'complete'
      state.name = action.payload
    })
  }
})

// @ts-ignore
export const selectUser = state => state.user.name
// @ts-ignore
export const selectUserFetchStatus = state => state.user.status

export default userSlice.reducer