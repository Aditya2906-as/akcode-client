import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Clock, Users, Star, CheckCircle, Lock, ChevronRight, ArrowLeft, Zap } from 'lucide-react'
import api from '../../utils/api'
import useAuthStore from '../../context/authStore'
import { difficultyColor, langLabel, langClass } from '../../utils/helpers'
import toast from 'react-hot-toast'

export default function CourseDetail() {
  const { slug } = useParams()
  const { user, updateUser } = useAuthStore()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)

  useEffect(() => {
    api.get(`/courses/${slug}`).then(r => {
      setCourse(r.data.course)
      setLoading(false)
    }).catch(() => { navigate('/courses'); })
  }, [slug])

  const enroll = async () => {
    setEnrolling(true)
    try {
      await api.post(`/courses/${course._id}/enroll`)
      setCourse(p => ({ ...p, isEnrolled: true, enrolledCount: p.enrolledCount + 1 }))
      updateUser({ enrolledCourses: [...(user?.enrolledCourses || []), course._id] })
      toast.success(`Enrolled in ${course.title}! 🎉`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to enroll')
    }
    setEnrolling(false)
  }

  if (loading) return <div className="p-6"><div className="skeleton h-96 rounded-xl" /></div>
  if (!course) return null

  const completedCount = course.completedLessonIds?.length || 0
  const totalLessons   = course.lessons?.length || 0
  const progressPct    = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Back */}
      <Link to="/courses" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Courses
      </Link>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="card overflow-hidden mb-6">
        <div className="h-1.5" style={{ background: course.color }} />
        <div className="p-6">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
              style={{ background: `${course.color}20`, border: `1px solid ${course.color}40` }}>
              {course.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-2xl font-bold text-white mb-1">{course.title}</h1>
              <p className="text-slate-400 mb-3">{course.description}</p>
              <div className="flex flex-wrap gap-2">
                <span className={difficultyColor(course.difficulty)}>{course.difficulty}</span>
                <span className={`badge ${langClass(course.language)}`}>{langLabel(course.language)}</span>
                {course.tags?.map(t => (
                  <span key={t} className="badge bg-dark-600 text-slate-400 border border-dark-500">{t}</span>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {course.isEnrolled ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-500/20 border border-brand-500/30 text-brand-400 font-bold text-sm">
                  <CheckCircle size={16} /> Enrolled
                </div>
              ) : (
                <button onClick={enroll} disabled={enrolling} className="btn-primary">
                  {enrolling ? '...' : 'Enroll Free'}
                </button>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-6 mt-5 pt-5 border-t border-dark-600 text-sm text-slate-400">
            <div className="flex items-center gap-2"><BookOpen size={15} /> {totalLessons} lessons</div>
            <div className="flex items-center gap-2"><Clock size={15} /> ~{course.estimatedHours}h</div>
            <div className="flex items-center gap-2"><Users size={15} /> {course.enrolledCount} enrolled</div>
            <div className="flex items-center gap-2"><Zap size={15} className="text-brand-400" /> {course.totalXP} XP available</div>
          </div>

          {/* Progress bar (if enrolled) */}
          {course.isEnrolled && totalLessons > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Progress</span>
                <span>{completedCount}/{totalLessons} lessons · {progressPct}%</span>
              </div>
              <div className="xp-bar">
                <div className="xp-bar-fill" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Lessons list */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <h2 className="section-title mb-4">Course Content</h2>
        <div className="space-y-2">
          {course.lessons?.map((lesson, i) => {
            const completed = course.completedLessonIds?.includes(lesson._id)
            const isLocked  = !course.isEnrolled && i > 0

            return (
              <div key={lesson._id}>
                {isLocked ? (
                  <div className="card p-4 flex items-center gap-3 opacity-60 cursor-not-allowed">
                    <div className="w-8 h-8 rounded-lg bg-dark-600 border border-dark-500 flex items-center justify-center text-xs font-bold text-slate-500">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-400">{lesson.title}</div>
                      <div className="text-xs text-slate-600">{lesson.estimatedMinutes} min</div>
                    </div>
                    <Lock size={14} className="text-slate-600" />
                  </div>
                ) : (
                  <Link to={`/lessons/${lesson._id}`}>
                    <div className={`card-hover p-4 flex items-center gap-3 ${completed ? 'border-brand-500/20' : ''}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold
                        ${completed ? 'bg-brand-500/20 border border-brand-500/30 text-brand-400'
                          : 'bg-dark-700 border border-dark-500 text-slate-400'}`}>
                        {completed ? <CheckCircle size={16} /> : i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white">{lesson.title}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-2">
                          <span>{lesson.estimatedMinutes} min</span>
                          <span className={difficultyColor(lesson.difficulty)}>{lesson.difficulty}</span>
                          {lesson.exercise?.enabled && (
                            <span className="badge bg-purple-500/20 text-purple-400 border border-purple-500/30">Exercise</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-brand-400 font-bold">
                        +{lesson.xpReward} XP <ChevronRight size={14} />
                      </div>
                    </div>
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
