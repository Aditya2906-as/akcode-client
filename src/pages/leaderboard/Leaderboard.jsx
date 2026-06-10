import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trophy, Flame, Zap, Swords, Award, Crown } from 'lucide-react'
import api from '../../utils/api'
import useAuthStore from '../../context/authStore'
import { levelTitle } from '../../utils/helpers'

export default function Leaderboard() {
  const { user } = useAuthStore()
  const [board, setBoard]   = useState([])
  const [loading, setLoading] = useState(true)
  const [myRank, setMyRank]   = useState(null)

  useEffect(() => {
    api.get('/leaderboard?limit=50').then(r => {
      setBoard(r.data.leaderboard)
      const me = r.data.leaderboard.find(u => u.isCurrentUser)
      if (me) setMyRank(me.rank)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const top3 = board.slice(0, 3)
  const rest  = board.slice(3)

  const rankStyle = (rank) => {
    if (rank === 1) return { bg: 'bg-yellow-400/10', border: 'border-yellow-400/30', text: 'text-yellow-400', medal: '🥇' }
    if (rank === 2) return { bg: 'bg-slate-400/10',  border: 'border-slate-400/30',  text: 'text-slate-400',  medal: '🥈' }
    if (rank === 3) return { bg: 'bg-orange-400/10', border: 'border-orange-400/30', text: 'text-orange-400', medal: '🥉' }
    return { bg: '', border: 'border-dark-600', text: 'text-slate-400', medal: '' }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 mb-4">
          <Trophy size={32} className="text-yellow-400" />
        </div>
        <h1 className="font-display text-3xl font-bold text-white mb-2">
          Global <span className="glow-text">Leaderboard</span>
        </h1>
        <p className="text-slate-400">Top coders ranked by total XP earned</p>
        {myRank && (
          <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 font-bold text-sm">
            <Crown size={14} /> Your Rank: #{myRank}
          </div>
        )}
      </motion.div>

      {/* Top 3 podium */}
      {!loading && top3.length >= 3 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex items-end justify-center gap-4 mb-10">
          {/* 2nd */}
          <PodiumCard user={top3[1]} rank={2} height="h-28" />
          {/* 1st */}
          <PodiumCard user={top3[0]} rank={1} height="h-36" />
          {/* 3rd */}
          <PodiumCard user={top3[2]} rank={3} height="h-20" />
        </motion.div>
      )}

      {/* Full table */}
      {loading ? (
        <div className="space-y-2">{[...Array(10)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="grid grid-cols-12 px-5 py-3 bg-dark-800 border-b border-dark-700 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <div className="col-span-1">Rank</div>
            <div className="col-span-4">Coder</div>
            <div className="col-span-2 text-center">Level</div>
            <div className="col-span-2 text-center">Streak</div>
            <div className="col-span-2 text-center">Solved</div>
            <div className="col-span-1 text-right">XP</div>
          </div>

          {board.map((u, i) => {
            const s = rankStyle(u.rank)
            const isMe = u.isCurrentUser
            return (
              <Link key={u._id} to={`/profile/${u.username}`}>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className={`grid grid-cols-12 px-5 py-4 items-center gap-4 border-b border-dark-700 last:border-0
                    hover:bg-dark-700 transition-colors
                    ${isMe ? 'bg-brand-500/5 border-l-2 border-l-brand-500' : ''}`}
                >
                  {/* Rank */}
                  <div className="col-span-1">
                    {u.rank <= 3 ? (
                      <span className="text-lg">{s.medal}</span>
                    ) : (
                      <span className={`font-display font-bold text-sm ${isMe ? 'text-brand-400' : 'text-slate-500'}`}>
                        #{u.rank}
                      </span>
                    )}
                  </div>

                  {/* User */}
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-sm font-bold text-brand-400 overflow-hidden flex-shrink-0">
                      {u.avatar
                        ? <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                        : u.username[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className={`font-display text-sm font-bold truncate ${isMe ? 'text-brand-400' : 'text-white'}`}>
                        {u.username} {isMe && <span className="text-xs font-normal">(you)</span>}
                      </div>
                      <div className="text-xs text-slate-500 truncate">{levelTitle(u.level)}</div>
                    </div>
                  </div>

                  {/* Level */}
                  <div className="col-span-2 text-center">
                    <span className="inline-flex items-center gap-1 badge bg-dark-700 border border-dark-500 text-slate-300">
                      <Zap size={10} className="text-brand-400" /> Lv.{u.level}
                    </span>
                  </div>

                  {/* Streak */}
                  <div className="col-span-2 flex items-center justify-center gap-1 text-sm font-bold text-orange-400">
                    <Flame size={14} /> {u.streak}
                  </div>

                  {/* Solved */}
                  <div className="col-span-2 flex items-center justify-center gap-1 text-sm font-bold text-purple-400">
                    <Swords size={14} /> {u.totalSolved}
                  </div>

                  {/* XP */}
                  <div className="col-span-1 text-right">
                    <span className="font-display text-sm font-bold text-brand-400">
                      {u.xp.toLocaleString()}
                    </span>
                  </div>
                </motion.div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

function PodiumCard({ user, rank, height }) {
  const configs = {
    1: { medal: '🥇', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30', size: 'w-14 h-14' },
    2: { medal: '🥈', color: 'text-slate-400',  bg: 'bg-slate-400/10',  border: 'border-slate-400/30',  size: 'w-12 h-12' },
    3: { medal: '🥉', color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/30', size: 'w-11 h-11' },
  }
  const c = configs[rank]

  return (
    <Link to={`/profile/${user.username}`}>
      <motion.div
        whileHover={{ y: -4 }}
        className={`flex flex-col items-center gap-2 w-28`}
      >
        <div className={`${c.size} rounded-full ${c.bg} border ${c.border} flex items-center justify-center text-xl font-bold ${c.color} overflow-hidden`}>
          {user.avatar
            ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
            : user.username[0].toUpperCase()}
        </div>
        <div className="text-center">
          <div className="font-display text-xs font-bold text-white truncate max-w-24">{user.username}</div>
          <div className={`text-xs font-bold ${c.color}`}>{user.xp.toLocaleString()} XP</div>
        </div>
        <div className={`${height} w-full rounded-t-xl ${c.bg} border ${c.border} flex items-end justify-center pb-2`}>
          <span className="text-2xl">{c.medal}</span>
        </div>
      </motion.div>
    </Link>
  )
}
