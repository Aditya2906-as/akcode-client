import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Edit3, Flame, Zap, Swords, Award, BookOpen,
         Calendar, TrendingUp, Star, Settings } from 'lucide-react'
import api from '../../utils/api'
import { FaGithub } from 'react-icons/fa';
import useAuthStore from '../../context/authStore'
import { levelTitle, xpProgress, xpForNextLevel, formatDate } from '../../utils/helpers'
import Avatar from '../../components/ui/Avatar'

export default function Profile() {
  const { username } = useParams()
  const { user: me } = useAuthStore()
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)

  const isOwnProfile = !username || username === me?.username

  useEffect(() => {
    const load = async () => {
      try {
        if (isOwnProfile) {
          const [statsRes] = await Promise.all([
            api.get('/users/stats'),
          ])
          setProfile(me)
          setStats(statsRes.data.stats)
        } else {
          const profileRes = await api.get(`/users/profile/${username}`)
          setProfile(profileRes.data.user)
        }
      } catch {
        navigate('/dashboard')
      }
      setLoading(false)
    }
    load()
  }, [username, me])

  if (loading) return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <div className="skeleton h-48 rounded-xl" />
      <div className="skeleton h-32 rounded-xl" />
    </div>
  )

  if (!profile) return null

  const xp    = profile.xp || 0
  const level = profile.level || 1
  const pct   = xpProgress(xp, level)
  const next  = xpForNextLevel(level)

  const statItems = [
    { icon: Zap,     value: xp.toLocaleString(), label: 'Total XP',     color: 'text-brand-400'  },
    { icon: Flame,   value: profile.streak || 0, label: 'Day Streak',   color: 'text-orange-400' },
    { icon: Swords,  value: profile.totalSolved || 0, label: 'Solved',  color: 'text-purple-400' },
    { icon: BookOpen,value: profile.completedLessons?.length || 0, label: 'Lessons', color: 'text-cyan-400' },
    { icon: Award,   value: profile.badges?.length || 0, label: 'Badges', color: 'text-yellow-400' },
    { icon: Star,    value: profile.totalCoins || 0, label: 'Coins',    color: 'text-yellow-500'  },
  ]

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Hero card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="card p-6 mb-6 relative overflow-hidden">
        {/* Background accent */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 relative">
          {/* Avatar */}
          <Avatar avatar={profile.avatar} username={profile.username} size="xl"
            className="rounded-2xl border-2 border-brand-500/40 flex-shrink-0" />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="font-display text-2xl font-bold text-white">{profile.username}</h1>
              <div className="badge bg-brand-500/20 text-brand-400 border border-brand-500/30">
                Level {level}
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-1">{levelTitle(level)}</p>
            {profile.bio && <p className="text-slate-300 text-sm mt-1 mb-2">{profile.bio}</p>}
            <div className="flex items-center gap-4 text-xs text-slate-500">
              {profile.githubUrl && (
                <a href={profile.githubUrl} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 hover:text-white transition-colors">
                  <FaGithub size={13} /> GitHub
                </a>
              )}
              <span className="flex items-center gap-1">
                <Calendar size={13} /> Joined {formatDate(profile.createdAt || profile.joinedAt)}
              </span>
              {profile.longestStreak > 0 && (
                <span className="flex items-center gap-1 text-orange-400">
                  <Flame size={13} /> Best: {profile.longestStreak} days
                </span>
              )}
            </div>
          </div>

          {/* Edit button */}
          {isOwnProfile && (
            <Link to="/settings" className="btn-secondary text-xs py-2 flex-shrink-0">
              <Edit3 size={14} /> Edit Profile
            </Link>
          )}
        </div>

        {/* XP Bar */}
        <div className="mt-5 pt-5 border-t border-dark-600">
          <div className="flex justify-between text-xs text-slate-400 mb-2">
            <span>Level {level} Progress</span>
            <span className="text-brand-400 font-bold">{xp.toLocaleString()} / {next.toLocaleString()} XP</span>
          </div>
          <div className="xp-bar">
            <motion.div className="xp-bar-fill" initial={{ width: 0 }}
              animate={{ width: `${pct}%` }} transition={{ duration: 1, delay: 0.3 }} />
          </div>
        </div>
      </motion.div>

      {/* Stat cards */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
        {statItems.map(s => (
          <div key={s.label} className="card p-4 text-center">
            <s.icon size={18} className={`${s.color} mx-auto mb-1.5`} />
            <div className={`font-display text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500">{s.label}</div>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Badges */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title flex items-center gap-2">
              <Award size={18} className="text-yellow-400" /> Badges ({profile.badges?.length || 0})
            </h2>
            {isOwnProfile && (
              <Link to="/badges" className="text-xs text-brand-400 hover:text-brand-300">View all →</Link>
            )}
          </div>

          {profile.badges?.length === 0 ? (
            <div className="card p-8 text-center text-slate-500">
              <div className="text-4xl mb-3">🏅</div>
              <p className="text-sm">No badges yet — keep learning!</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {profile.badges?.map(badge => (
                <motion.div key={badge.id} whileHover={{ scale: 1.05 }}
                  className="card p-3 text-center cursor-default group"
                  title={badge.desc}>
                  <div className="text-3xl mb-1">{badge.icon}</div>
                  <div className="text-xs font-bold text-white leading-tight">{badge.name}</div>
                  <div className="text-xs text-slate-600 group-hover:text-slate-400 transition-colors mt-0.5 hidden group-hover:block absolute bg-dark-700 border border-dark-500 rounded-lg p-2 z-10 w-32 -translate-x-1/4">
                    {badge.desc}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Activity heatmap */}
        {isOwnProfile && stats?.activityMap && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="section-title flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-cyan-400" /> Activity
            </h2>
            <div className="card p-4">
              <ActivityHeatmap data={stats.activityMap} />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

function ActivityHeatmap({ data }) {
  const days = 91 // 13 weeks
  const today = new Date()
  const cells = []

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const key   = date.toISOString().split('T')[0]
    const count = data[key] || 0
    cells.push({ date: key, count })
  }

  const maxCount = Math.max(...cells.map(c => c.count), 1)

  const getColor = (count) => {
    if (count === 0) return 'bg-dark-700'
    const intensity = count / maxCount
    if (intensity < 0.25) return 'bg-brand-900'
    if (intensity < 0.5)  return 'bg-brand-700'
    if (intensity < 0.75) return 'bg-brand-600'
    return 'bg-brand-500'
  }

  return (
    <div>
      <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(13, 1fr)' }}>
        {Array.from({ length: 13 }, (_, week) => (
          <div key={week} className="flex flex-col gap-1">
            {cells.slice(week * 7, week * 7 + 7).map(cell => (
              <div
                key={cell.date}
                title={`${cell.date}: ${cell.count} activities`}
                className={`w-full aspect-square rounded-sm ${getColor(cell.count)} transition-colors`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
        <span>Less</span>
        {['bg-dark-700', 'bg-brand-900', 'bg-brand-700', 'bg-brand-600', 'bg-brand-500'].map(c => (
          <div key={c} className={`w-3 h-3 rounded-sm ${c}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}
