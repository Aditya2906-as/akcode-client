import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, Send, AlertCircle } from 'lucide-react'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [devOTP, setDevOTP]   = useState(null)   // only shown in dev mode
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return toast.error('Enter your email')
    setLoading(true)
    try {
      const r = await api.post('/password-reset/request', { email })
      setSent(true)

      // Dev mode: server returns OTP directly (no real email configured)
      if (r.data.devOTP) {
        setDevOTP(r.data.devOTP)
        toast.success('Dev mode: OTP shown below (no email sent)')
      } else {
        toast.success('OTP sent! Check your email inbox.')
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Request failed'
      toast.error(msg)
    }
    setLoading(false)
  }

  const handleContinue = () => {
    navigate('/auth/verify-otp', { state: { email } })
  }

  return (
    <div>
      {/* Back link */}
      <Link to="/auth/login"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft size={15} /> Back to Login
      </Link>

      <div className="mb-8">
        <div className="w-14 h-14 rounded-2xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center mb-4">
          <span className="text-2xl">🔐</span>
        </div>
        <h2 className="font-display text-3xl font-bold text-white mb-2">Forgot Password?</h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          No worries! Enter your registered email and we'll send you a 6-digit OTP to reset your password.
        </p>
      </div>

      {!sent ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Registered Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input pl-10"
                required
                autoFocus
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
            {loading ? (
              <div className="w-5 h-5 border-2 border-dark-950/30 border-t-dark-950 rounded-full animate-spin" />
            ) : (
              <><Send size={16} /> Send OTP</>
            )}
          </button>
        </form>
      ) : (
        /* Sent state */
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {/* Success card */}
          <div className="p-5 rounded-2xl bg-brand-500/10 border border-brand-500/25 mb-5">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">📬</span>
              <div>
                <p className="font-display text-sm font-bold text-white mb-1">OTP Sent!</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  We've sent a 6-digit OTP to <span className="text-brand-400 font-medium">{email}</span>.
                  Check your inbox and spam folder. It expires in <span className="text-orange-400 font-medium">10 minutes</span>.
                </p>
              </div>
            </div>
          </div>

          {/* Dev mode OTP display */}
          {devOTP && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 mb-5">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={14} className="text-yellow-400" />
                <span className="text-xs font-bold text-yellow-400 uppercase tracking-wide">Dev Mode — Email Not Configured</span>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Your email credentials aren't set up yet. Here's your OTP for testing:
              </p>
              <div className="text-center">
                <div className="inline-block px-6 py-3 bg-dark-900 border border-yellow-500/30 rounded-xl">
                  <div className="text-xs text-slate-500 mb-1">Your OTP</div>
                  <div className="font-display text-3xl font-bold text-yellow-400 tracking-[10px]">{devOTP}</div>
                </div>
              </div>
              <p className="text-xs text-slate-600 mt-3 text-center">
                Configure EMAIL_USER and EMAIL_PASS in server/.env for real emails
              </p>
            </motion.div>
          )}

          <button onClick={handleContinue} className="btn-primary w-full justify-center py-3 mb-3">
            Enter OTP →
          </button>

          <button
            onClick={() => { setSent(false); setDevOTP(null) }}
            className="w-full text-center text-sm text-slate-500 hover:text-slate-300 transition-colors py-2"
          >
            Use a different email
          </button>
        </motion.div>
      )}

      {/* Info box */}
      <div className="mt-6 p-3.5 rounded-xl bg-dark-800 border border-dark-600">
        <div className="flex gap-2.5 items-start">
          <span className="text-base flex-shrink-0">💡</span>
          <p className="text-xs text-slate-400 leading-relaxed">
            Make sure to check your <strong className="text-slate-300">spam/junk folder</strong> if you don't see the email.
            The OTP is valid for <strong className="text-slate-300">10 minutes</strong>.
          </p>
        </div>
      </div>
    </div>
  )
}
