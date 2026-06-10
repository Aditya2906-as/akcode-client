import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, Eye, EyeOff, UserPlus, Code2 } from 'lucide-react'
import useAuthStore from '../../context/authStore'
import toast from 'react-hot-toast'
import { langIcon, langLabel } from '../../utils/helpers'

const LANGUAGES = ['python','javascript','java','cpp','html','sql','typescript','rust','go']

export default function Register() {
  const [form, setForm] = useState({
    username: '', email: '', password: '', confirmPassword: '',
    preferredLanguage: 'javascript'
  })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuthStore()
  const navigate = useNavigate()

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handle = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      return toast.error('Passwords do not match')
    }
    setLoading(true)
    try {
      await register(form.username, form.email, form.password, form.preferredLanguage)
      toast.success('Account created! Welcome to AK.code 🎉')
      navigate('/dashboard')
    } catch (err) {
      const errors = err.response?.data?.errors
      const msg = errors?.[0]?.msg || err.response?.data?.error || 'Registration failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const strength = form.password.length === 0 ? 0
    : form.password.length < 6 ? 1
    : form.password.length < 10 ? 2
    : form.password.match(/[A-Z]/) && form.password.match(/[0-9]/) ? 4
    : 3

  const strengthLabel = ['','Weak','Fair','Good','Strong'][strength]
  const strengthColor = ['','bg-red-500','bg-orange-500','bg-yellow-500','bg-brand-500'][strength]

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-3xl font-bold text-white mb-2">Create account</h2>
        <p className="text-slate-400">Start your coding adventure — it's free!</p>
      </div>

      <form onSubmit={handle} className="space-y-4">
        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Username</label>
          <div className="relative">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text" placeholder="coolcoder99"
              value={form.username}
              onChange={e => set('username', e.target.value)}
              className="input pl-10"
              required minLength={3} maxLength={20}
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="email" placeholder="you@example.com"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              className="input pl-10"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type={show ? 'text' : 'password'} placeholder="Min 6 characters"
              value={form.password}
              onChange={e => set('password', e.target.value)}
              className="input pl-10 pr-10"
              required minLength={6}
            />
            <button type="button" onClick={() => setShow(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {form.password && (
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex gap-1 flex-1">
                {[1,2,3,4].map(i => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300
                    ${strength >= i ? strengthColor : 'bg-dark-600'}`} />
                ))}
              </div>
              <span className="text-xs text-slate-400">{strengthLabel}</span>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="password" placeholder="Repeat password"
              value={form.confirmPassword}
              onChange={e => set('confirmPassword', e.target.value)}
              className={`input pl-10 ${form.confirmPassword && form.password !== form.confirmPassword ? 'border-red-500' : ''}`}
              required
            />
          </div>
        </div>

        {/* Preferred Language */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            <Code2 size={14} className="inline mr-1.5" />
            What do you want to learn first?
          </label>
          <div className="grid grid-cols-3 gap-2">
            {LANGUAGES.map(lang => (
              <button
                key={lang} type="button"
                onClick={() => set('preferredLanguage', lang)}
                className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-xs font-medium transition-all
                  ${form.preferredLanguage === lang
                    ? 'border-brand-500 bg-brand-500/20 text-brand-400'
                    : 'border-dark-500 bg-dark-700 text-slate-400 hover:border-dark-400'}`}
              >
                <span>{langIcon(lang)}</span>
                <span className="truncate">{langLabel(lang)}</span>
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
          {loading ? (
            <div className="w-5 h-5 border-2 border-dark-950/30 border-t-dark-950 rounded-full animate-spin" />
          ) : (
            <><UserPlus size={18} /> Create Free Account</>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-5">
        Already have an account?{' '}
        <Link to="/auth/login" className="text-brand-400 hover:text-brand-300 font-medium">
          Sign in →
        </Link>
      </p>
    </div>
  )
}
