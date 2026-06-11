import { create } from 'zustand'
import api from '../utils/api'

// ── Persist user in localStorage so app loads instantly ──────────────────────
// This means page refreshes and cold starts never cause redirects to landing
const storedToken = localStorage.getItem('akcode_token')
const storedUser  = (() => {
  try {
    const raw = localStorage.getItem('akcode_user')
    return raw ? JSON.parse(raw) : null
  } catch { return null }
})()

const saveUser  = (user)  => { try { localStorage.setItem('akcode_user', JSON.stringify(user)) } catch {} }
const clearUser = ()      => { localStorage.removeItem('akcode_user'); localStorage.removeItem('akcode_token') }

const useAuthStore = create((set, get) => ({
  // Initialize synchronously from localStorage — no flicker, no cold-start redirect
  user:    storedToken && storedUser ? storedUser : null,
  token:   storedToken || null,
  // loading=false immediately if we have cached user — they see the app right away
  // loading=true only if we have a token but no cached user (first login on new device)
  loading: storedToken && !storedUser,
  newBadges: [],

  setUser: (user) => {
    saveUser(user)
    set({ user })
  },

  clearNewBadges: () => set({ newBadges: [] }),

  setToken: (token) => {
    if (token) localStorage.setItem('akcode_token', token)
    else       clearUser()
    set({ token })
  },

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('akcode_token', data.token)
    saveUser(data.user)
    set({ user: data.user, token: data.token, loading: false, newBadges: data.newBadges || [] })
    return data
  },

  register: async (username, email, password, preferredLanguage) => {
    const { data } = await api.post('/auth/register', { username, email, password, preferredLanguage })
    localStorage.setItem('akcode_token', data.token)
    saveUser(data.user)
    set({ user: data.user, token: data.token, loading: false })
    return data
  },

  logout: async () => {
    try { await api.post('/auth/logout') } catch {}
    clearUser()
    set({ user: null, token: null, loading: false })
  },

  // fetchMe runs in background to refresh user data from server
  // But it NEVER clears the user on network errors (cold start, timeout)
  // It only clears user on explicit 401 (token genuinely expired/invalid)
  fetchMe: async () => {
    const token = get().token
    if (!token) {
      set({ loading: false })
      return
    }
    try {
      const { data } = await api.get('/auth/me')
      saveUser(data.user)
      set({ user: data.user, loading: false })
    } catch (err) {
      const status = err.response?.status
      if (status === 401) {
        // Token is genuinely invalid — log out
        clearUser()
        set({ user: null, token: null, loading: false })
      } else {
        // Network error, timeout, server sleeping — keep cached user, stop loading
        // User stays logged in with cached data until server wakes up
        console.warn('fetchMe network error — using cached user data:', err.message)
        set({ loading: false })
      }
    }
  },

  updateUser: (updates) => {
    const updated = { ...get().user, ...updates }
    saveUser(updated)
    set({ user: updated })
  },

  addXP: (xp, coins = 0) => {
    const user = get().user
    if (!user) return
    const updated = { ...user, xp: user.xp + xp, totalCoins: user.totalCoins + coins }
    saveUser(updated)
    set({ user: updated })
  },
}))

export default useAuthStore
