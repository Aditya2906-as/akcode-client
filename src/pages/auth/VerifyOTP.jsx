import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ShieldCheck, RotateCcw, Clock } from 'lucide-react'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function VerifyOTP() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const email     = location.state?.email || ''

  const [digits, setDigits]     = useState(['', '', '', '', '', ''])
  const [loading, setLoading]   = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError]       = useState('')
  const [timeLeft, setTimeLeft] = useState(600)   // 10 min countdown
  const [canResend, setCanResend] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(60) // 60s before resend allowed
  const inputRefs = useRef([])

  // Redirect if no email
  useEffect(() => {
    if (!email) navigate('/auth/forgot-password')
  }, [email])

  // 10 minute OTP expiry countdown
  useEffect(() => {
    if (timeLeft <= 0) return
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000)
    return () => clearTimeout(t)
  }, [timeLeft])

  // Resend cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) { setCanResend(true); return }
    const t = setTimeout(() => setResendCooldown(p => p - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  const fmt = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  // Handle digit input with auto-advance
  const handleChange = (index, value) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1)
    const newDigits = [...digits]
    newDigits[index] = digit
    setDigits(newDigits)
    setError('')

    // Auto-advance to next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all 6 filled
    if (digit && index === 5) {
      const allFilled = newDigits.every(d => d !== '')
      if (allFilled) handleVerify(newDigits.join(''))
    }
  }

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (digits[index] === '' && index > 0) {
        inputRefs.current[index - 1]?.focus()
        const newDigits = [...digits]
        newDigits[index - 1] = ''
        setDigits(newDigits)
      } else {
        const newDigits = [...digits]
        newDigits[index] = ''
        setDigits(newDigits)
      }
    }
    // Allow pasting full OTP
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) return
  }

  // Handle paste of full OTP
  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      const newDigits = pasted.split('')
      setDigits(newDigits)
      inputRefs.current[5]?.focus()
      handleVerify(pasted)
    }
  }

  const handleVerify = async (otpStr) => {
    const otp = otpStr || digits.join('')
    if (otp.length !== 6) return toast.error('Enter all 6 digits')
    if (timeLeft <= 0) return toast.error('OTP has expired. Please request a new one.')

    setLoading(true)
    setError('')
    try {
      const r = await api.post('/password-reset/verify', { email, otp })
      toast.success('OTP verified! 🎉')
      navigate('/auth/reset-password', {
        state: { email, resetToken: r.data.resetToken }
      })
    } catch (err) {
      const msg = err.response?.data?.error || 'Verification failed'
      setError(msg)
      toast.error(msg)
      // Clear digits on wrong OTP
      setDigits(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    }
    setLoading(false)
  }

  const handleResend = async () => {
    if (!canResend) return
    setResending(true)
    try {
      const r = await api.post('/password-reset/resend', { email })
      toast.success('New OTP sent!')
      setDigits(['', '', '', '', '', ''])
      setTimeLeft(600)
      setCanResend(false)
      setResendCooldown(60)
      setError('')
      inputRefs.current[0]?.focus()
      if (r.data.devOTP) {
        toast.success(`Dev OTP: ${r.data.devOTP}`, { duration: 8000 })
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to resend')
    }
    setResending(false)
  }

  const otp = digits.join('')
  const allFilled = otp.length === 6

  return (
    <div>
      <Link to="/auth/forgot-password" state={{ email }}
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft size={15} /> Back
      </Link>

      <div className="mb-8">
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center mb-4">
          <ShieldCheck size={26} className="text-cyan-400" />
        </div>
        <h2 className="font-display text-3xl font-bold text-white mb-2">Verify OTP</h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          We sent a 6-digit code to{' '}
          <span className="text-brand-400 font-medium">{email}</span>
        </p>
      </div>

      {/* Timer */}
      <div className={`flex items-center justify-center gap-2 mb-6 text-sm font-medium
        ${timeLeft < 60 ? 'text-red-400' : timeLeft < 180 ? 'text-orange-400' : 'text-slate-400'}`}>
        <Clock size={14} />
        <span>
          {timeLeft > 0
            ? <>Expires in <span className="font-display font-bold">{fmt(timeLeft)}</span></>
            : <span className="text-red-400">OTP expired — request a new one</span>
          }
        </span>
      </div>

      {/* OTP Input boxes */}
      <div className="flex gap-3 justify-center mb-6" onPaste={handlePaste}>
        {digits.map((digit, i) => (
          <motion.input
            key={i}
            ref={el => inputRefs.current[i] = el}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            onFocus={e => e.target.select()}
            className={`w-12 h-14 text-center text-xl font-display font-bold rounded-xl border-2 bg-dark-800
              transition-all duration-200 outline-none caret-transparent
              ${digit
                ? 'border-brand-500 text-brand-400 shadow-[0_0_15px_rgba(13,224,102,0.2)]'
                : 'border-dark-500 text-white'
              }
              ${error ? 'border-red-500 animate-[shake_0.3s_ease]' : ''}
              focus:border-brand-400 focus:shadow-[0_0_20px_rgba(13,224,102,0.3)]`}
            autoFocus={i === 0}
            disabled={loading || timeLeft <= 0}
          />
        ))}
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/25 mb-4 text-sm text-red-400">
            <span>⚠️</span> {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Verify button */}
      <button
        onClick={() => handleVerify()}
        disabled={loading || !allFilled || timeLeft <= 0}
        className="btn-primary w-full justify-center py-3 mb-4"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-dark-950/30 border-t-dark-950 rounded-full animate-spin" />
        ) : (
          <><ShieldCheck size={17} /> Verify OTP</>
        )}
      </button>

      {/* Resend */}
      <div className="text-center">
        <p className="text-sm text-slate-500 mb-1">Didn't receive the code?</p>
        {canResend ? (
          <button onClick={handleResend} disabled={resending}
            className="text-brand-400 hover:text-brand-300 text-sm font-medium flex items-center gap-1.5 mx-auto transition-colors">
            {resending
              ? <div className="w-4 h-4 border-2 border-brand-400/30 border-t-brand-400 rounded-full animate-spin" />
              : <RotateCcw size={14} />
            }
            Resend OTP
          </button>
        ) : (
          <p className="text-xs text-slate-600">
            Resend available in <span className="text-slate-400 font-medium">{resendCooldown}s</span>
          </p>
        )}
      </div>

      {/* Tip */}
      <div className="mt-6 p-3.5 rounded-xl bg-dark-800 border border-dark-600">
        <p className="text-xs text-slate-400 text-center">
          💡 Tip: You can <strong className="text-slate-300">paste</strong> the OTP directly into the boxes
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0) }
          25% { transform: translateX(-6px) }
          75% { transform: translateX(6px) }
        }
      `}</style>
    </div>
  )
}
