import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Flame, Swords, BookOpen, Trophy, Star,
  TrendingUp, ChevronRight, Heart, Coins, Zap, Target, Award
} from 'lucide-react'
import useAuthStore from '../../context/authStore'
import api from '../../utils/api'
import { xpProgress, xpForNextLevel, levelTitle, difficultyColor, langIcon, langLabel, formatDate } from '../../utils/helpers'
import Avatar from '../../components/ui/Avatar'

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }
const stagger = { show: { transition: { staggerChildren: 0.08 } } }

export default function Dashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState(null)
  const [courses, setCourses] = useState([])
  const [challenges, setChallenges] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [recentProgress, setRecentProgress] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, coursesRes, challengesRes, lbRes, progressRes] = await Promise.all([
          api.get('/users/stats'),
          api.get('/courses?sort=popular'),
          api.get('/challenges?limit=5'),
          api.get('/leaderboard?limit=5'),
          api.get('/progress?limit=5'),
        ])
        setStats(statsRes.data.stats)
        setCourses(coursesRes.data.courses.slice(0, 4))
        setChallenges(challengesRes.data.challenges.slice(0, 5))
        setLeaderboard(lbRes.data.leaderboard.slice(0, 5))
        setRecentProgress(progressRes.data.progress)
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  const progress = xpProgress(user?.xp || 0, user?.level || 1)
  const xpNeeded = xpForNextLevel(user?.level || 1)

  const statCards = [
    { label: 'Day Streak',       value: user?.streak || 0,        icon: Flame,   color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' },
    { label: 'XP Earned',        value: user?.xp || 0,            icon: Zap,     color: 'text-brand-400',  bg: 'bg-brand-400/10',  border: 'border-brand-400/20'  },
    { label: 'Challenges Solved',value: user?.totalSolved || 0,   icon: Swords,  color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
    { label: 'Badges Earned',    value: user?.badges?.length || 0,icon: Award,   color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
  ]

  if (loading) return <DashboardSkeleton />

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="mb-8">
        <motion.div variants={fadeUp} className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">
              Hey, <span className="glow-text">{user?.username}</span> 👋
            </h1>
            <p className="text-slate-400 mt-1">{levelTitle(user?.level)} · Level {user?.level}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-400/10 border border-red-400/20">
              <Heart size={16} className="text-red-400" />
              <span className="font-bold text-red-400">{user?.hearts}/5</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-400/10 border border-yellow-400/20">
              <Coins size={16} className="text-yellow-400" />
              <span className="font-bold text-yellow-400">{user?.totalCoins}</span>
            </div>
          </div>
        </motion.div>

        {/* XP Progress */}
        <motion.div variants={fadeUp} className="mt-5 card p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
                <Star size={14} className="text-brand-400" />
              </div>
              <div>
                <div className="font-display text-sm font-bold text-white">Level {user?.level} → {user?.level + 1}</div>
                <div className="text-xs text-slate-500">{user?.xp} / {xpNeeded} XP</div>
              </div>
            </div>
            <div className="font-display text-lg font-bold glow-text">{progress}%</div>
          </div>
          <div className="xp-bar">
            <motion.div
              className="xp-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Stat Cards */}
      <motion.div variants={stagger} initial="hidden" animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(s => (
          <motion.div key={s.label} variants={fadeUp}
            className={`card p-4 border ${s.border}`}>
            <div className={`w-10 h-10 rounded-xl ${s.bg} border ${s.border} flex items-center justify-center mb-3`}>
              <s.icon size={20} className={s.color} />
            </div>
            <div className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left col */}
        <div className="lg:col-span-2 space-y-6">
          {/* Continue Learning */}
          <motion.div variants={stagger} initial="hidden" animate="show">
            <motion.div variants={fadeUp} className="flex items-center justify-between mb-4">
              <h2 className="section-title flex items-center gap-2">
                <BookOpen size={20} className="text-brand-400" /> Continue Learning
              </h2>
              <Link to="/courses" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">
                All courses <ChevronRight size={14} />
              </Link>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {courses.map(course => (
                <motion.div key={course._id} variants={fadeUp}>
                  <Link to={`/courses/${course.slug}`}>
                    <div className="card-hover p-4 group">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl"
                          style={{ background: `${course.color}20`, border: `1px solid ${course.color}40` }}>
                          {course.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="font-display text-sm font-bold text-white truncate">{course.title}</div>
                          <div className="text-xs text-slate-500">{course.lessonCount || 0} lessons</div>
                        </div>
                        <ChevronRight size={16} className="text-slate-600 group-hover:text-brand-400 ml-auto transition-colors" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={difficultyColor(course.difficulty)}>{course.difficulty}</span>
                        <span className={`badge lang-${course.language}`}>{langLabel(course.language)}</span>
                      </div>
                      {course.isEnrolled && (
                        <div className="mt-2">
                          <div className="xp-bar">
                            <div className="xp-bar-fill" style={{ width: '30%' }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Daily Challenges */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title flex items-center gap-2">
                <Swords size={20} className="text-purple-400" /> Daily Challenges
              </h2>
              <Link to="/challenges" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">
                All challenges <ChevronRight size={14} />
              </Link>
            </div>
            <div className="space-y-2">
              {challenges.map(ch => (
                <Link key={ch._id} to={`/challenges/${ch.slug}`}>
                  <div className="card-hover p-3.5 flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg
                      ${ch.isSolved ? 'bg-brand-500/20 border border-brand-500/30' : 'bg-dark-700 border border-dark-500'}`}>
                      {ch.isSolved ? '✅' : '⚔️'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-display text-sm font-bold text-white truncate">{ch.title}</div>
                      <div className="text-xs text-slate-500">{ch.category}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={difficultyColor(ch.difficulty)}>{ch.difficulty}</span>
                      <span className="text-xs text-brand-400 font-bold">+{ch.xpReward} XP</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right col */}
        <div className="space-y-6">
          {/* Leaderboard */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title flex items-center gap-2">
                <Trophy size={18} className="text-yellow-400" /> Top Coders
              </h2>
              <Link to="/leaderboard" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">
                Full <ChevronRight size={14} />
              </Link>
            </div>
            <div className="card overflow-hidden">
              {leaderboard.map((u, i) => (
                <Link key={u._id} to={`/profile/${u.username}`}>
                  <div className={`flex items-center gap-3 p-3 hover:bg-dark-700 transition-colors
                    ${i < leaderboard.length - 1 ? 'border-b border-dark-700' : ''}
                    ${u.isCurrentUser ? 'bg-brand-500/5' : ''}`}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-display
                      ${i === 0 ? 'bg-yellow-400/20 text-yellow-400' :
                        i === 1 ? 'bg-slate-400/20 text-slate-400' :
                        i === 2 ? 'bg-orange-400/20 text-orange-400' :
                        'bg-dark-600 text-slate-500'}`}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                    </div>
                    <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
                      <Avatar avatar={u.avatar} username={u.username} size="sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium truncate ${u.isCurrentUser ? 'text-brand-400' : 'text-white'}`}>
                        {u.username}
                      </div>
                      <div className="text-xs text-slate-500">Lv.{u.level}</div>
                    </div>
                    <div className="text-xs font-bold text-brand-400">{u.xp.toLocaleString()} XP</div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          {recentProgress.length > 0 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
              <h2 className="section-title flex items-center gap-2 mb-4">
                <TrendingUp size={18} className="text-cyan-400" /> Recent Activity
              </h2>
              <div className="space-y-2">
                {recentProgress.map(p => (
                  <div key={p._id} className="flex items-center gap-3 p-3 card">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm
                      ${p.type === 'lesson' ? 'bg-blue-500/20 text-blue-400' :
                        p.type === 'challenge' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-brand-500/20 text-brand-400'}`}>
                      {p.type === 'lesson' ? '📚' : p.type === 'challenge' ? '⚔️' : '🎯'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white capitalize">{p.type} completed</div>
                      <div className="text-xs text-slate-500">{p.courseId?.title || 'Challenge'}</div>
                    </div>
                    <div className="text-xs font-bold text-brand-400">+{p.xpEarned}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Quick Actions */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <h2 className="section-title mb-4 flex items-center gap-2">
              <Target size={18} className="text-orange-400" /> Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { to: '/ai-tutor',   icon: '🤖', label: 'Ask AI Tutor',   color: 'border-brand-500/20 hover:border-brand-500/40' },
                { to: '/challenges', icon: '⚔️', label: 'Random Challenge',color: 'border-purple-500/20 hover:border-purple-500/40' },
                { to: '/forum',      icon: '💬', label: 'Community',      color: 'border-cyan-500/20 hover:border-cyan-500/40' },
                { to: '/snippets',   icon: '📋', label: 'Code Snippets',  color: 'border-orange-500/20 hover:border-orange-500/40' },
              ].map(a => (
                <Link key={a.to} to={a.to}>
                  <div className={`card p-3 text-center border ${a.color} transition-all hover:bg-dark-700 cursor-pointer`}>
                    <div className="text-2xl mb-1">{a.icon}</div>
                    <div className="text-xs text-slate-300 font-medium">{a.label}</div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="skeleton h-24 rounded-xl" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <div className="skeleton h-64 rounded-xl" />
          <div className="skeleton h-48 rounded-xl" />
        </div>
        <div className="space-y-4">
          <div className="skeleton h-56 rounded-xl" />
          <div className="skeleton h-40 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
