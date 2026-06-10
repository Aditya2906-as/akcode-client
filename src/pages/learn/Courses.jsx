import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Filter, BookOpen, Clock, Users, Star, ChevronRight, CheckCircle } from 'lucide-react'
import api from '../../utils/api'
import { difficultyColor, langLabel, langClass, truncate } from '../../utils/helpers'

const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Expert']
const CATEGORIES    = ['All', 'Programming Basics', 'Web Development', 'Data Science', 'Systems Programming', 'Computer Science', 'Backend', 'Data']

export default function Courses() {
  const [courses, setCourses]     = useState([])
  const [filtered, setFiltered]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [difficulty, setDiff]     = useState('All')
  const [category, setCategory]   = useState('All')

  useEffect(() => {
    api.get('/courses').then(r => {
      setCourses(r.data.courses)
      setFiltered(r.data.courses)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    let res = [...courses]
    if (search)     res = res.filter(c =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      c.language.toLowerCase().includes(search.toLowerCase()))
    if (difficulty !== 'All') res = res.filter(c => c.difficulty === difficulty)
    if (category   !== 'All') res = res.filter(c => c.category === category)
    setFiltered(res)
  }, [search, difficulty, category, courses])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white mb-2">
          Explore <span className="glow-text">Courses</span>
        </h1>
        <p className="text-slate-400">Master {courses.length} courses across 10+ programming languages</p>
      </motion.div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div className="relative max-w-lg">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search courses, languages..."
            className="input pl-10"
          />
        </div>

        {/* Filter pills */}
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {DIFFICULTIES.map(d => (
              <button key={d} onClick={() => setDiff(d)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  difficulty === d
                    ? 'bg-brand-500 text-dark-950'
                    : 'bg-dark-700 text-slate-400 hover:bg-dark-600 border border-dark-500'}`}>
                {d}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  category === c
                    ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30'
                    : 'bg-dark-700 text-slate-400 hover:bg-dark-600 border border-dark-500'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-slate-500 mb-4">
        {filtered.length} course{filtered.length !== 1 ? 's' : ''} found
      </div>

      {/* Course grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-56 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <BookOpen size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No courses match your filters</p>
          <button onClick={() => { setSearch(''); setDiff('All'); setCategory('All') }}
            className="mt-3 text-brand-400 hover:text-brand-300 text-sm">Clear filters</button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {filtered.map((course, i) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link to={`/courses/${course.slug}`}>
                <div className="card-hover h-full flex flex-col group">
                  {/* Color header */}
                  <div className="h-2 w-full" style={{ background: course.color }} />
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-3xl"
                        style={{ background: `${course.color}20`, border: `1px solid ${course.color}40` }}>
                        {course.icon}
                      </div>
                      {course.isEnrolled && (
                        <div className="flex items-center gap-1 text-xs text-brand-400 font-bold">
                          <CheckCircle size={14} /> Enrolled
                        </div>
                      )}
                    </div>

                    <h3 className="font-display text-base font-bold text-white mb-1 group-hover:text-brand-400 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-400 mb-3 flex-1">{truncate(course.description, 80)}</p>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <span className={difficultyColor(course.difficulty)}>{course.difficulty}</span>
                      <span className={`badge ${langClass(course.language)}`}>{langLabel(course.language)}</span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 border-t border-dark-600 pt-3">
                      <div className="flex items-center gap-1">
                        <BookOpen size={12} /> {course.lessonCount || 0} lessons
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={12} /> ~{course.estimatedHours}h
                      </div>
                      <div className="flex items-center gap-1">
                        <Users size={12} /> {course.enrolledCount || 0}
                      </div>
                      <div className="ml-auto flex items-center gap-1 text-brand-400">
                        <Star size={12} /> {course.totalXP} XP
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
