import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Swords, CheckCircle, Filter } from 'lucide-react'
import api from '../../utils/api'
import { difficultyColor, langLabel, langClass } from '../../utils/helpers'

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard', 'Expert']
const CATEGORIES   = ['All', 'Strings', 'Arrays', 'Loops', 'Recursion', 'Dynamic Programming', 'Stacks', 'Trees', 'Graphs']

export default function Challenges() {
  const [challenges, setChallenges] = useState([])
  const [filtered, setFiltered]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [difficulty, setDiff]       = useState('All')
  const [category, setCategory]     = useState('All')

  useEffect(() => {
    api.get('/challenges').then(r => {
      setChallenges(r.data.challenges)
      setFiltered(r.data.challenges)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    let res = [...challenges]
    if (search)     res = res.filter(c => c.title.toLowerCase().includes(search.toLowerCase()) || c.category.toLowerCase().includes(search.toLowerCase()))
    if (difficulty !== 'All') res = res.filter(c => c.difficulty === difficulty)
    if (category   !== 'All') res = res.filter(c => c.category === category)
    setFiltered(res)
  }, [search, difficulty, category, challenges])

  const solved   = challenges.filter(c => c.isSolved).length
  const total    = challenges.length
  const pct      = total > 0 ? Math.round((solved / total) * 100) : 0

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white mb-2">
          Code <span className="glow-text">Challenges</span>
        </h1>
        <p className="text-slate-400">Solve algorithmic challenges to earn XP and climb the leaderboard</p>

        {/* Progress summary */}
        {total > 0 && (
          <div className="mt-4 card p-4 max-w-md">
            <div className="flex justify-between text-xs text-slate-400 mb-2">
              <span>Challenges solved</span>
              <span className="text-brand-400 font-bold">{solved} / {total}</span>
            </div>
            <div className="xp-bar">
              <motion.div className="xp-bar-fill" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }} />
            </div>
          </div>
        )}
      </motion.div>

      {/* Filters */}
      <div className="mb-5 space-y-3">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search challenges..." className="input pl-10" />
        </div>
        <div className="flex flex-wrap gap-2">
          {DIFFICULTIES.map(d => (
            <button key={d} onClick={() => setDiff(d)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                difficulty === d ? 'bg-brand-500 text-dark-950' : 'bg-dark-700 text-slate-400 border border-dark-500 hover:bg-dark-600'}`}>
              {d}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                category === c ? 'bg-purple-500/30 text-purple-300 border border-purple-500/40'
                  : 'bg-dark-700 text-slate-400 border border-dark-500 hover:bg-dark-600'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="text-xs text-slate-500 mb-4">{filtered.length} challenges</div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">{[...Array(8)].map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <Swords size={48} className="mx-auto mb-3 opacity-30" />
          <p>No challenges found</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-dark-800 border-b border-dark-700 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <div className="col-span-1">Status</div>
            <div className="col-span-4">Title</div>
            <div className="col-span-2">Difficulty</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Language</div>
            <div className="col-span-1">XP</div>
          </div>

          {filtered.map((ch, i) => (
            <Link key={ch._id} to={`/challenges/${ch.slug}`}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className={`grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-dark-700 transition-colors
                  ${i < filtered.length - 1 ? 'border-b border-dark-700' : ''}
                  ${ch.isSolved ? 'bg-brand-500/3' : ''}`}
              >
                <div className="col-span-1">
                  {ch.isSolved
                    ? <CheckCircle size={16} className="text-brand-500" />
                    : <div className="w-4 h-4 rounded-full border-2 border-dark-500" />
                  }
                </div>
                <div className="col-span-8 md:col-span-4">
                  <div className="font-display text-sm font-bold text-white">{ch.title}</div>
                  <div className="text-xs text-slate-500 md:hidden">{ch.category} · {ch.difficulty}</div>
                </div>
                <div className="col-span-2 hidden md:block">
                  <span className={difficultyColor(ch.difficulty)}>{ch.difficulty}</span>
                </div>
                <div className="col-span-2 hidden md:block text-xs text-slate-400">{ch.category}</div>
                <div className="col-span-2 hidden md:block">
                  <span className={`badge ${langClass(ch.language)}`}>{langLabel(ch.language)}</span>
                </div>
                <div className="col-span-3 md:col-span-1 text-xs font-bold text-brand-400 text-right md:text-left">
                  +{ch.xpReward}
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
