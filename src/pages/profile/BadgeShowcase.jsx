import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Award, Lock } from 'lucide-react'
import api from '../../utils/api'
import useAuthStore from '../../context/authStore'

export default function BadgeShowcase() {
  const { user } = useAuthStore()
  const [allBadges, setAllBadges] = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    api.get('/badges').then(r => {
      setAllBadges(r.data.badges)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const earned = user?.badges || []
  const earnedIds = earned.map(b => b.id)

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white mb-2">
          Badge <span className="glow-text">Collection</span>
        </h1>
        <p className="text-slate-400">
          You've earned <span className="text-brand-400 font-bold">{earned.length}</span> of {allBadges.length} badges
        </p>
        <div className="mt-3 xp-bar max-w-sm">
          <div className="xp-bar-fill" style={{ width: `${allBadges.length > 0 ? (earned.length / allBadges.length) * 100 : 0}%` }} />
        </div>
      </motion.div>

      {/* Earned */}
      {earned.length > 0 && (
        <div className="mb-8">
          <h2 className="section-title flex items-center gap-2 mb-4">
            <Award size={18} className="text-yellow-400" /> Earned Badges
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {earned.map(badge => (
              <motion.div key={badge.id}
                whileHover={{ y: -4, scale: 1.02 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card p-4 text-center border-brand-500/20 bg-brand-500/5">
                <div className="text-4xl mb-2">{badge.icon}</div>
                <div className="font-display text-xs font-bold text-white mb-1">{badge.name}</div>
                <div className="text-xs text-slate-500">{badge.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Locked */}
      <div>
        <h2 className="section-title flex items-center gap-2 mb-4">
          <Lock size={18} className="text-slate-500" /> Locked Badges
        </h2>
        {loading ? (
          <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
            {[...Array(12)].map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {allBadges.filter(b => !earnedIds.includes(b.id)).map(badge => (
              <div key={badge.id} className="card p-4 text-center opacity-50">
                <div className="text-4xl mb-2 grayscale">{badge.icon}</div>
                <div className="font-display text-xs font-bold text-slate-500 mb-1">{badge.name}</div>
                <div className="text-xs text-slate-600">{badge.desc}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
