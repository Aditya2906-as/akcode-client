import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle, KeyRound } from 'lucide-react'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function ResetPassword() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const email      = location.state?.email      || ''
  const resetToken = location.state?.resetToken || ''

  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' })
  const [show, setShow] = useState({ new: false, confirm: false })
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)

  // Redirect if came here without proper state
  useEffect(() => {
    if (!email || !resetToken) navigate('/auth/forgot-password')
  }, [email, resetToken])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  // Password strength
  const pw = form.newPassword
  const strength = pw.length === 0 ? 0
    : pw.length < 6 ? 1
    : pw.length < 8 ? 2
    : pw.match(/[A-Z]/) && pw.match(/[0-9]/) && pw.length >= 10 ? 4
    : pw.match(/[A-Z]/) || pw.match(/[0-9]/) ? 3
    : 2

  const strengthLabel = ['', 'Too Short', 'Weak', 'Good', 'Strong'][strength]
  const strengthColor = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-brand-500'][strength]
  const strengthText  = ['', 'text-red-400', 'text-orange-400', 'text-yellow-400', 'text-brand-400'][strength]

  const passwordsMatch = form.newPassword && form.confirmPassword && form.newPassword === form.confirmPassword
  const mismatch       = form.confirmPassword && form.newPassword !== form.confirmPassword

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.newPassword.length < 6) return toast.error('Password must be at least 6 characters')
    if (form.newPassword !== form.confirmPassword) return toast.error('Passwords do not match')

    setLoading(true)
    try {
      await api.post('/password-reset/reset', {
        email,
        resetToken,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword
      })
      setSuccess(true)
      toast.success('Password reset successfully! 🎉')
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Reset failed'
      toast.error(msg)
      // If token expired, redirect to start
      if (msg.includes('expired') || msg.includes('Invalid')) {
        setTimeout(() => navigate('/auth/forgot-password'), 2000)
      }
    }
    setLoading(false)
  }

  // ── Success screen ────────────────────────────────────────────────────────
  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="w-20 h-20 rounded-full bg-brand-500/15 border border-brand-500/30 flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={36} className="text-brand-400" />
        </div>
        <h2 className="font-display text-3xl font-bold text-white mb-3">Password Reset!</h2>
        <p className="text-slate-400 mb-8 leading-relaxed">
          Your password has been reset successfully. You can now sign in with your new password.
        </p>

        {/* Animated checkmarks */}
        <div className="space-y-2 mb-8 text-left max-w-xs mx-auto">
          {['OTP Verified', 'Password Updated', 'Account Secured'].map((step, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className="flex items-center gap-2.5 text-sm text-brand-400"
            >
              <div className="w-5 h-5 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center flex-shrink-0">
                <CheckCircle size={12} />
              </div>
              {step}
            </motion.div>
          ))}
        </div>

        <Link to="/auth/login" className="btn-primary w-full justify-center py-3">
          Sign In Now →
        </Link>
      </motion.div>
    )
  }

  // ── Form screen ───────────────────────────────────────────────────────────
  return (
    <div>
      <Link to="/auth/forgot-password"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft size={15} /> Back
      </Link>

      <div className="mb-8">
        <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center mb-4">
          <KeyRound size={26} className="text-purple-400" />
        </div>
        <h2 className="font-display text-3xl font-bold text-white mb-2">New Password</h2>
        <p className="text-slate-400 text-sm">
          Create a strong password for{' '}
          <span className="text-brand-400 font-medium">{email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* New password */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">New Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type={show.new ? 'text' : 'password'}
              placeholder="Min 6 characters"
              value={form.newPassword}
              onChange={e => set('newPassword', e.target.value)}
              className="input pl-10 pr-10"
              required
              minLength={6}
              autoFocus
            />
            <button type="button" onClick={() => setShow(p => ({ ...p, new: !p.new }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              {show.new ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Strength bar */}
          {form.newPassword && (
            <div className="mt-2">
              <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4].map(i => (
                  <div key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-300
                      ${strength >= i ? strengthColor : 'bg-dark-600'}`} />
                ))}
              </div>
              <p className={`text-xs font-medium ${strengthText}`}>{strengthLabel}</p>
            </div>
          )}
        </div>

        {/* Confirm password */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type={show.confirm ? 'text' : 'password'}
              placeholder="Repeat new password"
              value={form.confirmPassword}
              onChange={e => set('confirmPassword', e.target.value)}
              className={`input pl-10 pr-10 transition-colors
                ${mismatch ? 'border-red-500 focus:border-red-500' : ''}
                ${passwordsMatch ? 'border-brand-500' : ''}`}
              required
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {passwordsMatch && <CheckCircle size={14} className="text-brand-400" />}
              <button type="button" onClick={() => setShow(p => ({ ...p, confirm: !p.confirm }))}
                className="text-slate-500 hover:text-slate-300">
                {show.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          {mismatch && (
            <p className="text-xs text-red-400 mt-1">Passwords don't match</p>
          )}
          {passwordsMatch && (
            <p className="text-xs text-brand-400 mt-1">✓ Passwords match</p>
          )}
        </div>

        {/* Password tips */}
        <div className="p-3.5 rounded-xl bg-dark-800 border border-dark-600">
          <p className="text-xs text-slate-500 font-medium mb-2">Strong password tips:</p>
          <div className="space-y-1">
            {[
              { check: pw.length >= 8,    text: 'At least 8 characters' },
              { check: /[A-Z]/.test(pw),  text: 'One uppercase letter' },
              { check: /[0-9]/.test(pw),  text: 'One number' },
              { check: /[^A-Za-z0-9]/.test(pw), text: 'One special character (optional)' },
            ].map(tip => (
              <div key={tip.text} className={`flex items-center gap-2 text-xs transition-colors
                ${tip.check ? 'text-brand-400' : 'text-slate-600'}`}>
                <span>{tip.check ? '✓' : '○'}</span>
                {tip.text}
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || mismatch || !form.newPassword || !form.confirmPassword}
          className="btn-primary w-full justify-center py-3"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-dark-950/30 border-t-dark-950 rounded-full animate-spin" />
          ) : (
            <><KeyRound size={17} /> Reset Password</>
          )}
        </button>
      </form>
    </div>
  )
}
