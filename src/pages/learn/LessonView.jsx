import { useEffect, useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Editor from '@monaco-editor/react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ArrowLeft, ArrowRight, CheckCircle, Bot, Lightbulb,
         Play, RotateCcw, BookOpen, Code2, ChevronDown, ChevronUp } from 'lucide-react'
import api from '../../utils/api'
import useAuthStore from '../../context/authStore'
import toast from 'react-hot-toast'

export default function LessonView() {
  const { id } = useParams()
  const { user, addXP } = useAuthStore()
  const navigate = useNavigate()

  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [completed, setCompleted] = useState(false)
  const [code, setCode] = useState('')
  const [tab, setTab] = useState('content') // content | exercise
  const [testResults, setTestResults] = useState(null)
  const [running, setRunning] = useState(false)
  const [aiExplanation, setAiExplanation] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [selectedCode, setSelectedCode] = useState('')
  const [showAiPanel, setShowAiPanel] = useState(false)
  const [completing, setCompleting] = useState(false)

  useEffect(() => {
    api.get(`/lessons/${id}`).then(r => {
      setLesson(r.data.lesson)
      setCompleted(r.data.completed)
      if (r.data.lesson.exercise?.starterCode) {
        setCode(r.data.lesson.exercise.starterCode)
      }
      setLoading(false)
    }).catch(() => navigate('/courses'))
  }, [id])

  const completeLesson = async () => {
    if (completed || completing) return
    setCompleting(true)
    try {
      const r = await api.post(`/lessons/${id}/complete`)
      setCompleted(true)
      addXP(r.data.xpEarned, r.data.coinsEarned)
      toast.success(`+${r.data.xpEarned} XP! Lesson complete! 🎉`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error')
    }
    setCompleting(false)
  }

  const runCode = async () => {
    if (!code.trim()) return
    setRunning(true)
    setTestResults(null)
    try {
      const r = await api.post(`/lessons/${id}/submit-exercise`, { code })
      setTestResults(r.data)
      if (r.data.allPassed) {
        toast.success('All tests passed! 🎉')
        await completeLesson()
      } else {
        toast.error('Some tests failed. Check the output below.')
      }
    } catch (err) {
      toast.error('Error running code')
    }
    setRunning(false)
  }

  const askAI = async () => {
    const codeToExplain = selectedCode || code
    if (!codeToExplain.trim()) return toast.error('Write or select some code first')
    setAiLoading(true)
    setShowAiPanel(true)
    try {
      const r = await api.post('/ai/explain', {
        code: codeToExplain,
        language: lesson?.exercise?.language || lesson?.language
      })
      setAiExplanation(r.data.explanation)
    } catch {
      setAiExplanation('AI is temporarily unavailable. Please try again.')
    }
    setAiLoading(false)
  }

  const getHint = async () => {
    setAiLoading(true)
    setShowAiPanel(true)
    try {
      const r = await api.post('/ai/hint', {
        code,
        challenge: lesson?.exercise?.description,
        language: lesson?.exercise?.language
      })
      setAiExplanation(r.data.hint)
    } catch {
      setAiExplanation('Could not get hint. Try again.')
    }
    setAiLoading(false)
  }

  if (loading) return <div className="p-6"><div className="skeleton h-96 rounded-xl" /></div>
  if (!lesson) return null

  const hasExercise = lesson.exercise?.enabled

  return (
    <div className="h-full flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-dark-700 bg-dark-900 flex-shrink-0">
        <Link to={lesson.courseId ? `/courses/${lesson.courseId.slug}` : '/courses'}
          className="btn-ghost">
          <ArrowLeft size={16} /> {lesson.courseId?.title || 'Back'}
        </Link>

        <h1 className="font-display text-sm font-bold text-white hidden md:block truncate max-w-xs">
          {lesson.title}
        </h1>

        <div className="flex items-center gap-2">
          {!completed ? (
            <button onClick={completeLesson} disabled={completing}
              className="btn-primary text-xs py-2 px-3">
              {completing ? '...' : <><CheckCircle size={14} /> Mark Complete</>}
            </button>
          ) : (
            <div className="flex items-center gap-1 text-brand-400 text-xs font-bold">
              <CheckCircle size={14} /> Completed
            </div>
          )}
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex border-b border-dark-700 bg-dark-900 flex-shrink-0">
        <button
          onClick={() => setTab('content')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors
            ${tab === 'content' ? 'border-brand-500 text-brand-400' : 'border-transparent text-slate-400 hover:text-white'}`}>
          <BookOpen size={15} /> Lesson
        </button>
        {hasExercise && (
          <button
            onClick={() => setTab('exercise')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors
              ${tab === 'exercise' ? 'border-brand-500 text-brand-400' : 'border-transparent text-slate-400 hover:text-white'}`}>
            <Code2 size={15} /> Exercise
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex">
        {tab === 'content' ? (
          <div className="flex-1 overflow-y-auto p-6 max-w-4xl">
            {/* Lesson info */}
            <div className="flex items-center gap-3 mb-6">
              <span className="badge bg-dark-700 text-slate-400 border border-dark-500">
                ~{lesson.estimatedMinutes} min
              </span>
              <span className={`badge ${lesson.difficulty === 'Easy' ? 'badge-easy' : lesson.difficulty === 'Medium' ? 'badge-medium' : 'badge-hard'}`}>
                {lesson.difficulty}
              </span>
              <span className="text-xs text-brand-400 font-bold ml-auto">+{lesson.xpReward} XP</span>
            </div>

            {/* Content blocks */}
            <div className="space-y-5">
              {lesson.content?.map((block, i) => (
                <ContentBlock key={i} block={block} />
              ))}
            </div>

            {/* Complete button at bottom */}
            {!completed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
                <button onClick={completeLesson} disabled={completing}
                  className="btn-primary w-full justify-center py-3">
                  {completing ? 'Saving...' : <><CheckCircle size={18} /> Complete Lesson & Earn {lesson.xpReward} XP</>}
                </button>
              </motion.div>
            )}
          </div>
        ) : (
          /* Exercise split view */
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Left: description */}
            <div className="w-full lg:w-2/5 border-b lg:border-b-0 lg:border-r border-dark-700 overflow-y-auto p-5 flex-shrink-0">
              <h2 className="font-display text-base font-bold text-white mb-3">{lesson.exercise?.description}</h2>

              {/* Test cases */}
              {lesson.exercise?.testCases?.filter(tc => !tc.hidden).map((tc, i) => (
                <div key={i} className="mb-3 p-3 rounded-lg bg-dark-800 border border-dark-600 text-xs font-code">
                  <div className="text-slate-500 mb-1">Test {i + 1}:</div>
                  {tc.input && <div className="text-slate-300">Input: <span className="text-accent-cyan">{tc.input}</span></div>}
                  <div className="text-slate-300">Expected: <span className="text-brand-400">{tc.expectedOutput}</span></div>
                </div>
              ))}

              {/* Hints */}
              {lesson.exercise?.hints?.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-2">Hints:</p>
                  {lesson.exercise.hints.map((h, i) => (
                    <div key={i} className="text-xs text-yellow-400 mb-1">💡 {h}</div>
                  ))}
                </div>
              )}

              {/* Test results */}
              {testResults && (
                <div className="mt-4">
                  <h3 className="text-sm font-bold text-white mb-2">Results:</h3>
                  {testResults.results?.map((r, i) => (
                    <div key={i} className={`p-2 rounded-lg text-xs mb-2 border ${
                      r.passed ? 'border-brand-500/30 bg-brand-500/10' : 'border-red-500/30 bg-red-500/10'}`}>
                      <div className={r.passed ? 'text-brand-400' : 'text-red-400'}>
                        {r.passed ? '✅' : '❌'} Test {i + 1}
                      </div>
                      <div className="text-slate-400 font-code mt-1">Expected: {r.expected}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: editor */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Editor toolbar */}
              <div className="flex items-center gap-2 px-3 py-2 bg-dark-800 border-b border-dark-700 flex-shrink-0">
                <span className="text-xs text-slate-500 font-code">{lesson.exercise?.language}</span>
                <div className="ml-auto flex items-center gap-2">
                  <button onClick={getHint} className="btn-ghost text-xs py-1 px-2 text-yellow-400">
                    <Lightbulb size={14} /> Hint
                  </button>
                  <button onClick={askAI} className="btn-ghost text-xs py-1 px-2 text-brand-400">
                    <Bot size={14} /> Explain
                  </button>
                  <button onClick={() => setCode(lesson.exercise?.starterCode || '')}
                    className="btn-ghost text-xs py-1 px-2">
                    <RotateCcw size={14} /> Reset
                  </button>
                  <button onClick={runCode} disabled={running}
                    className="btn-primary text-xs py-1.5 px-3">
                    {running ? '...' : <><Play size={14} /> Run</>}
                  </button>
                </div>
              </div>

              {/* Monaco */}
              <div className="flex-1 overflow-hidden">
                <Editor
                  height="100%"
                  language={lesson.exercise?.language || 'python'}
                  value={code}
                  onChange={v => setCode(v || '')}
                  theme="vs-dark"
                  options={{
                    fontSize: user?.fontSize || 14,
                    minimap: { enabled: false },
                    padding: { top: 16 },
                    scrollBeyondLastLine: false,
                    fontFamily: '"JetBrains Mono", monospace',
                    lineNumbers: 'on',
                    wordWrap: 'on',
                    automaticLayout: true,
                  }}
                  onMount={editor => {
                    editor.onDidChangeCursorSelection(() => {
                      const sel = editor.getModel()?.getValueInRange(editor.getSelection())
                      setSelectedCode(sel || '')
                    })
                  }}
                />
              </div>

              {/* AI panel */}
              <AnimatePresence>
                {showAiPanel && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 200, opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-dark-700 bg-dark-900 overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-4 py-2 border-b border-dark-700">
                      <div className="flex items-center gap-2 text-xs font-bold text-brand-400">
                        <Bot size={14} /> AI Assistant
                      </div>
                      <button onClick={() => setShowAiPanel(false)} className="text-slate-500 hover:text-white">
                        <ChevronDown size={16} />
                      </button>
                    </div>
                    <div className="p-4 overflow-y-auto h-[152px] text-xs text-slate-300 font-code whitespace-pre-wrap">
                      {aiLoading ? (
                        <div className="flex gap-1">
                          {[0,1,2].map(i => (
                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce"
                              style={{ animationDelay: `${i * 0.15}s` }} />
                          ))}
                          <span className="text-slate-500 ml-2">AI is thinking...</span>
                        </div>
                      ) : aiExplanation}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ContentBlock({ block }) {
  if (block.type === 'text') {
    return (
      <div className="prose prose-invert prose-sm max-w-none
        prose-headings:font-display prose-headings:text-white
        prose-code:text-brand-400 prose-code:bg-dark-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
        prose-pre:bg-dark-900 prose-pre:border prose-pre:border-dark-600
        prose-a:text-brand-400 prose-strong:text-white
        prose-table:border-dark-600 prose-th:bg-dark-800 prose-td:border-dark-700">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.body}</ReactMarkdown>
      </div>
    )
  }
  if (block.type === 'code') {
    return (
      <div className="rounded-xl overflow-hidden border border-dark-600">
        <div className="flex items-center justify-between px-4 py-2 bg-dark-800 border-b border-dark-600">
          <span className="text-xs font-code text-slate-400">{block.language}</span>
          {block.caption && <span className="text-xs text-slate-500">{block.caption}</span>}
        </div>
        <pre className="p-4 bg-dark-900 overflow-x-auto text-sm font-code text-slate-200 leading-relaxed">
          <code>{block.body}</code>
        </pre>
      </div>
    )
  }
  if (block.type === 'tip') {
    return (
      <div className="flex gap-3 p-4 rounded-xl bg-brand-500/10 border border-brand-500/20">
        <span className="text-xl flex-shrink-0">💡</span>
        <p className="text-sm text-brand-300">{block.body}</p>
      </div>
    )
  }
  if (block.type === 'warning') {
    return (
      <div className="flex gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
        <span className="text-xl flex-shrink-0">⚠️</span>
        <p className="text-sm text-yellow-300">{block.body}</p>
      </div>
    )
  }
  return null
}
