import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md">
        <div className="font-display text-[120px] font-bold leading-none glow-text mb-4">404</div>
        <h1 className="font-display text-2xl font-bold text-white mb-3">Page not found</h1>
        <p className="text-slate-400 mb-8">
          Looks like this page went off into the void. Let's get you back on track.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => window.history.back()} className="btn-secondary">
            <ArrowLeft size={16} /> Go Back
          </button>
          <Link to="/dashboard" className="btn-primary">
            <Home size={16} /> Dashboard
          </Link>
        </div>
        <div className="mt-8 font-code text-sm text-slate-600">
          <span className="text-red-400">Error</span>: 404 Not Found<br />
          <span className="text-slate-500">// Page does not exist</span>
        </div>
      </motion.div>
    </div>
  )
}
