import { create } from 'zustand'
import api from '../utils/api'

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('akcode_token') || null,
  loading: true,
  newBadges: [],

  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (token) localStorage.setItem('akcode_token', token)
    else localStorage.removeItem('akcode_token')
    set({ token })
  },
  clearNewBadges: () => set({ newBadges: [] }),

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    get().setToken(data.token)
    set({ user: data.user, newBadges: data.newBadges || [] })
    return data
  },

  register: async (username, email, password, preferredLanguage) => {
    const { data } = await api.post('/auth/register', { username, email, password, preferredLanguage })
    get().setToken(data.token)
    set({ user: data.user })
    return data
  },

  logout: async () => {
    try { await api.post('/auth/logout') } catch {}
    get().setToken(null)
    set({ user: null })
  },

  fetchMe: async () => {
    const token = get().token
    if (!token) { set({ loading: false }); return }
    try {
      const { data } = await api.get('/auth/me')
      set({ user: data.user, loading: false })
    } catch {
      get().setToken(null)
      set({ user: null, loading: false })
    }
  },

  updateUser: (updates) => set(state => ({ user: { ...state.user, ...updates } })),

  addXP: (xp, coins = 0) => set(state => ({
    user: state.user ? {
      ...state.user,
      xp: state.user.xp + xp,
      totalCoins: state.user.totalCoins + coins
    } : null
  })),
}))

export default useAuthStore
