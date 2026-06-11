import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'

const api = axios.create({
  baseURL,
  timeout: 30000,
})

// Attach JWT on every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('akcode_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 — clear storage and redirect using hash navigation
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('akcode_token')
      localStorage.removeItem('akcode_user')
      // Use hash-based redirect — works with HashRouter
      // Only redirect if not already on an auth page
      if (!window.location.hash.includes('/auth')) {
        window.location.replace('/#/auth/login')
      }
    }
    return Promise.reject(err)
  }
)

export default api
