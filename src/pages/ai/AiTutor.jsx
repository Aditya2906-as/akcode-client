import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Send, RotateCcw, Code2, Lightbulb, Bug, Sparkles, User, Copy, Check } from 'lucide-react'
import Editor from '@monaco-editor/react'
import api from '../../utils/api'
import useAuthStore from '../../context/authStore'
import toast from 'react-hot-toast'

const SUGGESTIONS = [
  { icon: '📚', text: 'Explain recursion with an example' },
  { icon: '🔍', text: 'What is Big O notation?' },
  { icon: '🐍', text: 'How do Python decorators work?' },
  { icon: '⚡', text: 'Explain JavaScript promises vs async/await' },
  { icon: '🧩', text: 'What is dynamic programming?' },
  { icon: '🌳', text: 'Explain binary trees with code' },
  { icon: '🔄', text: 'How does a hash map work internally?' },
  { icon: '🎯', text: 'Difference between stack and queue' },
]

const TOOLS = [
  { id: 'chat',    icon: Bot,       label: 'AI Chat',    color: 'text-brand-400',   desc: 'Ask anything about coding' },
  { id: 'explain', icon: Code2,     label: 'Explain Code', color: 'text-cyan-400', desc: 'Paste code to understand it' },
  { id: 'debug',   icon: Bug,       label: 'Debug Code', color: 'text-red-400',     desc: 'Find bugs in your code' },
  { id: 'improve', icon: Sparkles,  label: 'Improve Code', color: 'text-purple-400',desc: 'Get code quality suggestions' },
  { id: 'quiz',    icon: Lightbulb, label: 'AI Quiz',    color: 'text-yellow-400',  desc: 'Generate quiz questions' },
  { id: 'concept', icon: Bot,       label: 'Learn Concept', color: 'text-orange-400', desc: 'Deep dive any concept' },
]

export default function AiTutor() {
  const { user } = useAuthStore()
  const [activeTool, setActiveTool] = useState('chat')
  const [messages, setMessages]     = useState([])
  const [input, setInput]           = useState('')
  const [code, setCode]             = useState('# Paste your code here\n')
  const [language, setLanguage]     = useState(user?.preferredLanguage || 'python')
  const [loading, setLoading]       = useState(false)
  const [response, setResponse]     = useState('')
  const [quizTopic, setQuizTopic]   = useState('')
  const [quizDiff, setQuizDiff]     = useState('medium')
  const [quizQs, setQuizQs]         = useState([])
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [copied, setCopied]         = useState(false)
  const messagesEndRef              = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Chat ───────────────────────────────────────────────────────────────────
  const sendChat = async (text) => {
    const msg = text || input.trim()
    if (!msg) return
    setInput('')
    const userMsg = { role: 'user', content: msg }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const r = await api.post('/ai/chat', {
        messages: [...messages, userMsg],
        context: `User level: ${user?.level}, preferred language: ${user?.preferredLanguage}`
      })
      setMessages(prev => [...prev, { role: 'assistant', content: r.data.message }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ AI is temporarily unavailable. Please try again.' }])
    }
    setLoading(false)
  }

  // ── Code tools ─────────────────────────────────────────────────────────────
  const runCodeTool = async () => {
    if (!code.trim() || code === '# Paste your code here\n') {
      return toast.error('Paste some code first')
    }
    setLoading(true)
    setResponse('')
    try {
      let r
      if (activeTool === 'explain') {
        r = await api.post('/ai/explain', { code, language })
        setResponse(r.data.explanation)
      } else if (activeTool === 'debug') {
        r = await api.post('/ai/debug', { code, language })
        setResponse(r.data.debug)
      } else if (activeTool === 'improve') {
        r = await api.post('/ai/improve', { code, language })
        setResponse(r.data.improvements)
      }
    } catch {
      setResponse('⚠️ AI temporarily unavailable. Try again.')
    }
    setLoading(false)
  }

  // ── Quiz generator ─────────────────────────────────────────────────────────
  const generateQuiz = async () => {
    if (!quizTopic.trim()) return toast.error('Enter a topic first')
    setLoading(true)
    setQuizQs([])
    setQuizAnswers({})
    setQuizSubmitted(false)
    try {
      const r = await api.post('/ai/generate-quiz', {
        topic: quizTopic, language, difficulty: quizDiff, count: 5
      })
      setQuizQs(r.data.questions || [])
      if (!r.data.questions?.length) toast.error('Could not generate quiz. Try a different topic.')
    } catch {
      toast.error('AI quiz unavailable')
    }
    setLoading(false)
  }

  const submitQuiz = () => {
    setQuizSubmitted(true)
    const correct = quizQs.filter((q, i) => quizAnswers[i]?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()).length
    toast.success(`You scored ${correct}/${quizQs.length}!`)
  }

  // ── Concept explainer ──────────────────────────────────────────────────────
  const explainConcept = async () => {
    const msg = input.trim()
    if (!msg) return toast.error('Enter a concept to explain')
    setLoading(true)
    setResponse('')
    try {
      const r = await api.post('/ai/concept', {
        concept: msg, language, userLevel: user?.level <= 3 ? 'beginner' : user?.level <= 6 ? 'intermediate' : 'advanced'
      })
      setResponse(r.data.explanation)
      setInput('')
    } catch {
      setResponse('AI unavailable. Try again.')
    }
    setLoading(false)
  }

  const copy = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Copied!')
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-dark-700 bg-dark-900 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
            <Bot size={18} className="text-brand-400" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-white">AI Tutor</h1>
            <p className="text-xs text-slate-500">Powered by Llama 3.3-70b via Groq</p>
          </div>
          <div className="ml-auto">
            <select value={language} onChange={e => setLanguage(e.target.value)}
              className="input py-1.5 text-xs w-36">
              {['python','javascript','java','cpp','html','sql','typescript','rust','go'].map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tool switcher */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
          {TOOLS.map(t => (
            <button key={t.id} onClick={() => { setActiveTool(t.id); setResponse('') }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                activeTool === t.id
                  ? 'bg-dark-600 border border-dark-400 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-dark-700'}`}>
              <t.icon size={13} className={t.color} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">

        {/* CHAT */}
        {activeTool === 'chat' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-5xl mb-3 animate-float">🤖</div>
                  <h2 className="font-display text-xl font-bold text-white mb-2">Hey, I'm your AI Tutor!</h2>
                  <p className="text-slate-400 text-sm mb-6">Ask me anything about coding, algorithms, or programming concepts.</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-w-2xl mx-auto">
                    {SUGGESTIONS.map(s => (
                      <button key={s.text} onClick={() => sendChat(s.text)}
                        className="p-3 card-hover text-left text-xs text-slate-300 hover:text-white">
                        <div className="text-lg mb-1">{s.icon}</div>
                        {s.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm
                    ${msg.role === 'user'
                      ? 'bg-brand-500/20 border border-brand-500/30 text-brand-400'
                      : 'bg-dark-700 border border-dark-500 text-slate-300'}`}>
                    {msg.role === 'user'
                      ? <User size={14} />
                      : <Bot size={14} />}
                  </div>
                  <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-brand-500/20 border border-brand-500/20 text-white rounded-br-sm'
                        : 'bg-dark-700 border border-dark-600 text-slate-200 rounded-bl-sm font-code text-xs'}`}>
                      {msg.content}
                    </div>
                    {msg.role === 'assistant' && (
                      <button onClick={() => copy(msg.content)}
                        className="mt-1 text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1">
                        {copied ? <><Check size={10} /> Copied</> : <><Copy size={10} /> Copy</>}
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-dark-700 border border-dark-500 flex items-center justify-center">
                    <Bot size={14} className="text-slate-400" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-dark-700 border border-dark-600">
                    <div className="flex gap-1">
                      {[0,1,2].map(i => (
                        <div key={i} className="w-2 h-2 rounded-full bg-brand-500 animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-dark-700 p-4 bg-dark-900 flex-shrink-0">
              <div className="flex gap-3 max-w-3xl mx-auto">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendChat()}
                  placeholder="Ask anything about coding..."
                  className="input flex-1"
                  disabled={loading}
                />
                <button onClick={() => sendChat()} disabled={loading || !input.trim()}
                  className="btn-primary px-4">
                  <Send size={16} />
                </button>
                {messages.length > 0 && (
                  <button onClick={() => setMessages([])} className="btn-secondary px-3">
                    <RotateCcw size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CODE TOOLS: explain / debug / improve */}
        {['explain','debug','improve'].includes(activeTool) && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            <div className="flex-1 flex flex-col overflow-hidden border-b md:border-b-0 md:border-r border-dark-700">
              <div className="px-4 py-2 bg-dark-800 border-b border-dark-700 text-xs text-slate-500 flex items-center justify-between">
                <span>Your Code</span>
                <button onClick={runCodeTool} disabled={loading} className="btn-primary text-xs py-1 px-3">
                  {loading ? '...' : activeTool === 'explain' ? '🔍 Explain' : activeTool === 'debug' ? '🐛 Debug' : '✨ Improve'}
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <Editor height="100%" language={language} value={code}
                  onChange={v => setCode(v || '')} theme="vs-dark"
                  options={{ fontSize: 13, minimap: { enabled: false }, padding: { top: 12 },
                    fontFamily: '"JetBrains Mono", monospace', automaticLayout: true }} />
              </div>
            </div>
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="px-4 py-2 bg-dark-800 border-b border-dark-700 text-xs text-slate-500 flex items-center justify-between">
                <span>AI Response</span>
                {response && <button onClick={() => copy(response)} className="text-slate-400 hover:text-white">
                  <Copy size={14} />
                </button>}
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {loading ? (
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <div className="flex gap-1">
                      {[0,1,2].map(i => (
                        <div key={i} className="w-2 h-2 rounded-full bg-brand-500 animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                    AI analyzing your code...
                  </div>
                ) : response ? (
                  <pre className="text-xs text-slate-300 whitespace-pre-wrap font-code leading-relaxed">{response}</pre>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <div className="text-4xl mb-3">{activeTool === 'explain' ? '🔍' : activeTool === 'debug' ? '🐛' : '✨'}</div>
                    <p>Paste your code on the left, then click the button</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* QUIZ GENERATOR */}
        {activeTool === 'quiz' && (
          <div className="flex-1 overflow-y-auto p-6 max-w-2xl mx-auto w-full">
            <div className="mb-6">
              <h2 className="font-display text-lg font-bold text-white mb-1">AI Quiz Generator</h2>
              <p className="text-slate-400 text-sm">Enter any coding topic and get a personalized quiz</p>
            </div>

            <div className="flex gap-3 mb-4">
              <input value={quizTopic} onChange={e => setQuizTopic(e.target.value)}
                placeholder="e.g. Python functions, Binary search, React hooks..."
                className="input flex-1"
                onKeyDown={e => e.key === 'Enter' && generateQuiz()} />
              <select value={quizDiff} onChange={e => setQuizDiff(e.target.value)}
                className="input w-32">
                {['easy','medium','hard'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <button onClick={generateQuiz} disabled={loading} className="btn-primary">
                {loading ? '...' : 'Generate'}
              </button>
            </div>

            {quizQs.length > 0 && (
              <div className="space-y-4">
                {quizQs.map((q, i) => (
                  <div key={i} className="card p-4">
                    <p className="text-sm font-medium text-white mb-3">{i+1}. {q.question}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {q.options?.map((opt, j) => {
                        const selected = quizAnswers[i] === opt
                        const isCorrect = quizSubmitted && opt.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()
                        const isWrong   = quizSubmitted && selected && !isCorrect
                        return (
                          <button key={j} onClick={() => !quizSubmitted && setQuizAnswers(p => ({ ...p, [i]: opt }))}
                            className={`text-left p-3 rounded-xl border text-xs transition-all ${
                              isCorrect ? 'border-brand-500 bg-brand-500/20 text-brand-300' :
                              isWrong   ? 'border-red-500 bg-red-500/20 text-red-300' :
                              selected  ? 'border-brand-500/50 bg-brand-500/10 text-white' :
                              'border-dark-500 bg-dark-700 text-slate-300 hover:border-dark-400'}`}>
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                    {quizSubmitted && (
                      <div className="mt-2 p-2 rounded-lg bg-dark-700 text-xs text-slate-400">
                        ✅ {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
                {!quizSubmitted ? (
                  <button onClick={submitQuiz} className="btn-primary w-full justify-center">Submit Quiz</button>
                ) : (
                  <button onClick={() => { setQuizQs([]); setQuizAnswers({}); setQuizSubmitted(false) }}
                    className="btn-secondary w-full justify-center">
                    <RotateCcw size={16} /> New Quiz
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* CONCEPT EXPLAINER */}
        {activeTool === 'concept' && (
          <div className="flex-1 overflow-y-auto p-6 max-w-2xl mx-auto w-full">
            <div className="mb-6">
              <h2 className="font-display text-lg font-bold text-white mb-1">Concept Explorer</h2>
              <p className="text-slate-400 text-sm">Enter any programming concept for a deep explanation</p>
            </div>
            <div className="flex gap-3 mb-6">
              <input value={input} onChange={e => setInput(e.target.value)}
                placeholder="e.g. closures, memoization, binary search..."
                className="input flex-1"
                onKeyDown={e => e.key === 'Enter' && explainConcept()} />
              <button onClick={explainConcept} disabled={loading} className="btn-primary">
                {loading ? '...' : 'Explain'}
              </button>
            </div>

            {loading ? (
              <div className="flex items-center gap-2 text-slate-400">
                <div className="flex gap-1">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-2 h-2 rounded-full bg-brand-500 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
                Generating explanation...
              </div>
            ) : response ? (
              <div className="card p-5">
                <pre className="text-sm text-slate-200 whitespace-pre-wrap font-code leading-relaxed">{response}</pre>
                <button onClick={() => copy(response)} className="mt-3 btn-ghost text-xs">
                  <Copy size={13} /> Copy explanation
                </button>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-500">
                <span className="text-5xl">💡</span>
                <p className="mt-3">Type a concept above to get started</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
