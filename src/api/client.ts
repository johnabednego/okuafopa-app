import axios from 'axios'
import { getToken } from '../utils/asyncStorageHelpers'

const api = axios.create({
  baseURL: 'http://10.198.101.15:5000/api',
  headers: { 'Content-Type': 'application/json' }
})

// attach JWT
api.interceptors.request.use(async config => {
  const token = await getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api
