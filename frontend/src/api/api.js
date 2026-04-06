import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:5000',
  headers: { 'Content-Type': 'application/json' },
})

export const register    = (username, password)          => api.post('/register', { username, password })
export const login       = (username, password)          => api.post('/login',    { username, password })
export const getHabits   = (user_id)                    => api.get('/habits', { params: { user_id } })
export const createHabits= (user_id, habits, duration)  => api.post('/habits', { user_id, habits, duration })
export const deleteHabit = (habit_id)                   => api.delete(`/habits/${habit_id}`)
export const toggleHabit = (habit_id, day_index)        => api.post('/toggle', { habit_id, day_index })
export const saveNote    = (habit_id, day_index, note)  => api.post('/note',   { habit_id, day_index, note })
export const getStats    = ()                           => api.get('/stats')

export default api
