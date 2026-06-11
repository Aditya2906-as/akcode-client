import { create } from 'zustand'
import api from '../utils/api'

// Try to get user from localStorage synchronously on store init
// This prevents the flash where loading=false and user=null before fetchMe runs
const storedToken = localStorage.getItem('akcode_token')

const useAuthStore = create((set, get) => ({
  user:      null,
  token:     storedToken || null,
  // If no token exists, we know immediately user is not logged in (loading=false)
  // If token exists, we need to verify it (loading=true)
  loading:   !!storedToken,
  newBadges: [],

  setUser:       (user)    => set({ user }),
  clearNewBadges:()        => set({ newBadges: [] }),

  setToken: (token) => {
    if (token) localStorage.setItem('akcode_token', token)
    else       localStorage.removeItem('akcode_token')
    set({ token })
  },

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    get().setToken(data.token)
    // Set loading: false explicitly so ProtectedRoute lets user through immediately
    set({ user: data.user, loading: false, newBadges: data.newBadges || [] })
    return data
  },

  register: async (username, email, password, preferredLanguage) => {
    const { data } = await api.post('/auth/register', { username, email, password, preferredLanguage })
    get().setToken(data.token)
    set({ user: data.user, loading: false })
    return data
  },

  logout: async () => {
    try { await api.post('/auth/logout') } catch {}
    get().setToken(null)
    set({ user: null, loading: false })
  },

  fetchMe: async () => {
    const token = get().token
    // No token — not logged in, stop loading immediately
    if (!token) {
      set({ loading: false })
      return
    }
    try {
      const { data } = await api.get('/auth/me')
      set({ user: data.user, loading: false })
    } catch {
      // Token invalid or expired — clear it
      localStorage.removeItem('akcode_token')
      set({ user: null, token: null, loading: false })
    }
  },

  updateUser: (updates) => set(state => ({
    user: state.user ? { ...state.user, ...updates } : null
  })),

  addXP: (xp, coins = 0) => set(state => ({
    user: state.user ? {
      ...state.user,
      xp:         state.user.xp + xp,
      totalCoins: state.user.totalCoins + coins
    } : null
  })),
}))

export default useAuthStore
