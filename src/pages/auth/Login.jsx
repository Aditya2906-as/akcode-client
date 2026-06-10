import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react'
import useAuthStore from '../../context/authStore'
import toast from 'react-hot-toast'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await login(form.email, form.password)
      toast.success(data.message || 'Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Login failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-display text-3xl font-bold text-white mb-2">Welcome back</h2>
        <p className="text-slate-400">Continue your coding journey</p>
      </div>

      <form onSubmit={handle} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              className="input pl-10"
              required
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-slate-300">Password</label>
            <Link
              to="/auth/forgot-password"
              className="text-xs text-brand-400 hover:text-brand-300 transition-colors font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type={show ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              className="input pl-10 pr-10"
              required
            />
            <button type="button" onClick={() => setShow(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
          {loading ? (
            <div className="w-5 h-5 border-2 border-dark-950/30 border-t-dark-950 rounded-full animate-spin" />
          ) : (
            <><LogIn size={18} /> Sign In</>
          )}
        </button>
      </form>

      <div className="mt-5 p-3.5 rounded-xl bg-dark-800 border border-dark-600">
        <p className="text-xs text-slate-400 text-center">
          🔐 Forgot your password?{' '}
          <Link to="/auth/forgot-password" className="text-brand-400 hover:text-brand-300 font-medium">
            Reset it here →
          </Link>
        </p>
      </div>

      <p className="text-center text-sm text-slate-500 mt-5">
        Don't have an account?{' '}
        <Link to="/auth/register" className="text-brand-400 hover:text-brand-300 font-medium">
          Create one free →
        </Link>
      </p>
    </div>
  )
}
