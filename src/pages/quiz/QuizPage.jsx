import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, CheckCircle, XCircle, Trophy, ArrowRight, RotateCcw } from 'lucide-react'
import api from '../../utils/api'
import useAuthStore from '../../context/authStore'
import { xpProgress } from '../../utils/helpers'
import toast from 'react-hot-toast'

export default function QuizPage() {
  const { id } = useParams()
  const { addXP } = useAuthStore()
  const navigate = useNavigate()

  const [quiz, setQuiz]         = useState(null)
  const [answers, setAnswers]   = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [results, setResults]   = useState(null)
  const [timeLeft, setTimeLeft] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.get(`/quiz/${id}`).then(r => {
      setQuiz(r.data.quiz)
      setTimeLeft(r.data.quiz.timeLimit || 300)
      setLoading(false)
    }).catch(() => navigate('/dashboard'))
  }, [id])

  // Countdown timer
  useEffect(() => {
    if (!timeLeft || submitted) return
    if (timeLeft <= 0) { handleSubmit(); return }
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000)
    return () => clearTimeout(t)
  }, [timeLeft, submitted])

  const handleSubmit = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      const r = await api.post(`/quiz/${id}/submit`, { answers })
      setResults(r.data)
      setSubmitted(true)
      if (r.data.passed) {
        addXP(r.data.xpEarned, r.data.coinsEarned)
        toast.success(`Quiz passed! +${r.data.xpEarned} XP`)
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Submit failed')
    }
    setSubmitting(false)
  }

  const fmt = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`

  if (loading) return <div className="p-6"><div className="skeleton h-96 rounded-xl" /></div>
  if (!quiz)   return null

  const currentQ   = quiz.questions?.length || 0
  const answered   = Object.keys(answers).length
  const allAnswered = answered === currentQ

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">{quiz.title}</h1>
          <p className="text-slate-400 text-sm">{currentQ} questions · {quiz.passingScore}% to pass</p>
        </div>
        {!submitted && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-display font-bold text-sm
            ${timeLeft < 60 ? 'border-red-500/30 bg-red-500/10 text-red-400 animate-pulse' : 'border-dark-500 bg-dark-700 text-white'}`}>
            <Clock size={16} /> {fmt(timeLeft)}
          </div>
        )}
      </div>

      {/* Progress bar */}
      {!submitted && (
        <div className="mb-6">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>{answered} / {currentQ} answered</span>
          </div>
          <div className="xp-bar">
            <div className="xp-bar-fill" style={{ width: `${(answered / currentQ) * 100}%` }} />
          </div>
        </div>
      )}

      {/* Results summary */}
      {submitted && results && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className={`card p-6 text-center mb-6 border ${
            results.passed ? 'border-brand-500/30 bg-brand-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
          <div className="text-5xl mb-3">{results.passed ? '🎉' : '😔'}</div>
          <h2 className={`font-display text-3xl font-bold mb-2 ${results.passed ? 'text-brand-400' : 'text-red-400'}`}>
            {results.score}%
          </h2>
          <p className="text-slate-400 mb-2">{results.correct} / {results.total} correct</p>
          <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold ${
            results.passed ? 'bg-brand-500/20 text-brand-400' : 'bg-red-500/20 text-red-400'}`}>
            {results.passed ? '✅ Passed!' : '❌ Failed — Try again'}
          </div>
          {results.xpEarned > 0 && (
            <div className="mt-3 text-brand-400 font-bold">+{results.xpEarned} XP · +{results.coinsEarned} Coins</div>
          )}
          <div className="flex gap-3 justify-center mt-5">
            <button onClick={() => navigate('/courses')} className="btn-secondary">Back to Courses</button>
            {!results.passed && (
              <button onClick={() => { setAnswers({}); setSubmitted(false); setResults(null); setTimeLeft(quiz.timeLimit) }}
                className="btn-primary">
                <RotateCcw size={16} /> Try Again
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Questions */}
      <div className="space-y-5">
        {quiz.questions?.map((q, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`card p-5 ${submitted && results ? 'border-dark-600' : ''}`}>
            <p className="text-sm font-medium text-white mb-4">
              <span className="font-display text-brand-400 mr-2">Q{i+1}.</span>{q.question}
            </p>

            <div className="space-y-2">
              {q.options?.map((opt, j) => {
                const selected  = answers[i] === opt
                const isCorrect = submitted && results && opt.toLowerCase().trim() === results.results?.[i]?.correctAnswer?.toLowerCase().trim()
                const isWrong   = submitted && selected && !isCorrect

                return (
                  <button key={j}
                    onClick={() => !submitted && setAnswers(p => ({ ...p, [i]: opt }))}
                    disabled={submitted}
                    className={`w-full text-left p-3.5 rounded-xl border text-sm transition-all flex items-center gap-3
                      ${isCorrect ? 'border-brand-500 bg-brand-500/15 text-brand-300' :
                        isWrong   ? 'border-red-500 bg-red-500/15 text-red-300' :
                        selected  ? 'border-brand-500/60 bg-brand-500/10 text-white' :
                        'border-dark-500 bg-dark-700 text-slate-300 hover:border-dark-400 hover:bg-dark-600'}`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                      ${isCorrect ? 'bg-brand-500 text-dark-950' :
                        isWrong   ? 'bg-red-500 text-white' :
                        selected  ? 'bg-brand-500/40 text-brand-400' :
                        'bg-dark-600 text-slate-400'}`}>
                      {isCorrect ? <CheckCircle size={14} /> : isWrong ? <XCircle size={14} /> : String.fromCharCode(65+j)}
                    </div>
                    {opt}
                  </button>
                )
              })}
            </div>

            {/* Explanation after submit */}
            {submitted && results?.results?.[i]?.explanation && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 p-3 rounded-xl bg-dark-700 border border-dark-500 text-xs text-slate-300">
                💡 {results.results[i].explanation}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Submit button */}
      {!submitted && (
        <div className="mt-6">
          <button onClick={handleSubmit} disabled={submitting}
            className={`btn-primary w-full justify-center py-3 ${!allAnswered ? 'opacity-70' : ''}`}>
            {submitting ? 'Submitting...' : <><Trophy size={18} /> Submit Quiz ({answered}/{currentQ})</>}
          </button>
          {!allAnswered && (
            <p className="text-xs text-slate-500 text-center mt-2">Answer all {currentQ} questions before submitting</p>
          )}
        </div>
      )}
    </div>
  )
}
