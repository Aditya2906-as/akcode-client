import { Outlet, Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-dark-950 bg-grid-pattern flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-12 overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent-cyan/10 rounded-full blur-[80px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-md text-center"
        >
          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-3 mb-10">
            <div className="w-14 h-14 rounded-2xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center animate-glow-pulse">
              <span className="font-display font-bold text-brand-400 text-2xl">AK</span>
            </div>
            <span className="font-display text-2xl font-bold text-white">
              AK<span className="text-brand-400">.code</span>
            </span>
          </Link>

          <h1 className="font-display text-4xl font-bold text-white mb-4 leading-tight">
            Level up your
            <span className="block glow-text">coding skills</span>
          </h1>
          <p className="text-slate-400 text-lg mb-10">
            Learn to code through gamified challenges, AI-powered tutoring, and interactive lessons across 10+ languages.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { icon: '🎮', text: 'Gamified Learning' },
              { icon: '🤖', text: 'AI Tutor' },
              { icon: '🏆', text: 'Leaderboards' },
              { icon: '🔥', text: 'Daily Streaks' },
              { icon: '💎', text: 'Earn Badges' },
              { icon: '⚔️', text: 'Code Challenges' },
            ].map(f => (
              <div key={f.text} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-dark-700 border border-dark-500 text-sm text-slate-300">
                <span>{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-4">
            {[
              { value: '12+', label: 'Languages' },
              { value: '100+', label: 'Challenges' },
              { value: '∞', label: 'AI Help' },
            ].map(s => (
              <div key={s.label} className="card p-4 text-center">
                <div className="font-display text-2xl font-bold glow-text">{s.value}</div>
                <div className="text-slate-400 text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <Link to="/" className="lg:hidden inline-flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center">
              <span className="font-display font-bold text-brand-400 text-sm">AK</span>
            </div>
            <span className="font-display text-xl font-bold text-white">
              AK<span className="text-brand-400">.code</span>
            </span>
          </Link>

          <Outlet />
        </motion.div>
      </div>
    </div>
  )
}
