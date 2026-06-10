import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import ReactConfetti from 'react-confetti'
import { useWindowSize } from '../../hooks/useWindowSize'

export default function BadgeNotification({ badges, onClose }) {
  const { width, height } = useWindowSize()

  return (
    <>
      <ReactConfetti width={width} height={height} recycle={false} numberOfPieces={300}
        colors={['#0de066','#00e5ff','#a855f7','#eab308','#f97316']} />
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: 'spring', damping: 15 }}
          className="card max-w-sm w-full p-6 text-center relative border-brand-500/40 shadow-[0_0_60px_rgba(13,224,102,0.2)]"
        >
          <button onClick={onClose} className="absolute top-3 right-3 btn-ghost p-1.5">
            <X size={16} />
          </button>

          <div className="text-5xl mb-3 animate-bounce-in">🏅</div>
          <h2 className="font-display text-xl font-bold text-white mb-1">
            {badges.length === 1 ? 'New Badge Earned!' : `${badges.length} New Badges!`}
          </h2>
          <p className="text-slate-400 text-sm mb-5">Keep learning to unlock more!</p>

          <div className="space-y-3">
            {badges.map(badge => (
              <div key={badge.id} className="flex items-center gap-3 p-3 rounded-xl bg-dark-700 border border-brand-500/20">
                <div className="w-12 h-12 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-2xl">
                  {badge.icon}
                </div>
                <div className="text-left">
                  <div className="font-display text-sm font-bold text-white">{badge.name}</div>
                  <div className="text-xs text-slate-400">{badge.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <button onClick={onClose} className="btn-primary w-full mt-5 justify-center">
            Awesome! 🎉
          </button>
        </motion.div>
      </div>
    </>
  )
}
