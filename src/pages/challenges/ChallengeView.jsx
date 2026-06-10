import { useEffect, useState, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Editor from '@monaco-editor/react'
import {
  ArrowLeft, Play, RotateCcw, Bot, Lightbulb, Bug,
  CheckCircle, XCircle, ChevronDown, Send,
  Terminal, Clock, Cpu, ChevronRight, Lock
} from 'lucide-react'
import api from '../../utils/api'
import useAuthStore from '../../context/authStore'
import toast from 'react-hot-toast'
import ReactConfetti from 'react-confetti'

const LANG_CONFIG = {
  python:     { label:'Python 3',   monaco:'python',     color:'text-blue-400',   bg:'bg-blue-500/10',   border:'border-blue-500/30' },
  javascript: { label:'JavaScript', monaco:'javascript', color:'text-yellow-400', bg:'bg-yellow-500/10', border:'border-yellow-500/30' },
  java:       { label:'Java',       monaco:'java',       color:'text-orange-400', bg:'bg-orange-500/10', border:'border-orange-500/30' },
  cpp:        { label:'C++',        monaco:'cpp',        color:'text-cyan-400',   bg:'bg-cyan-500/10',   border:'border-cyan-500/30' },
  go:         { label:'Go',         monaco:'go',         color:'text-teal-400',   bg:'bg-teal-500/10',   border:'border-teal-500/30' },
  rust:       { label:'Rust',       monaco:'rust',       color:'text-red-400',    bg:'bg-red-500/10',    border:'border-red-500/30' },
  typescript: { label:'TypeScript', monaco:'typescript', color:'text-blue-300',   bg:'bg-blue-400/10',   border:'border-blue-400/30' },
  csharp:     { label:'C#',         monaco:'csharp',     color:'text-purple-400', bg:'bg-purple-500/10', border:'border-purple-500/30' },
  ruby:       { label:'Ruby',       monaco:'ruby',       color:'text-red-300',    bg:'bg-red-400/10',    border:'border-red-400/30' },
  kotlin:     { label:'Kotlin',     monaco:'kotlin',     color:'text-violet-400', bg:'bg-violet-500/10', border:'border-violet-500/30' },
  swift:      { label:'Swift',      monaco:'swift',      color:'text-orange-300', bg:'bg-orange-400/10', border:'border-orange-400/30' },
}

function difficultyBg(d) {
  if (d==='Easy')   return 'bg-green-500/20 text-green-400 border border-green-500/30'
  if (d==='Medium') return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
  if (d==='Hard')   return 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
  return 'bg-red-500/20 text-red-400 border border-red-500/30'
}

function LangSelector({ langs, selected, onChange }) {
  const [open, setOpen] = useState(false)
  const cfg = LANG_CONFIG[selected] || { label: selected, color:'text-slate-300', bg:'bg-dark-700', border:'border-dark-600' }
  return (
    <div className="relative">
      <button onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold
          transition-all ${cfg.bg} ${cfg.border} ${cfg.color} hover:opacity-90`}>
        <span>{cfg.label}</span>
        <ChevronDown size={11} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-6 }}
            className="absolute top-full left-0 mt-1 z-50 bg-dark-800 border border-dark-600
              rounded-xl shadow-2xl overflow-hidden min-w-[160px]">
            {langs.map(lang => {
              const lc = LANG_CONFIG[lang] || { label:lang, color:'text-slate-300' }
              return (
                <button key={lang} onClick={() => { onChange(lang); setOpen(false) }}
                  className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs text-left
                    transition-colors hover:bg-dark-700
                    ${lang === selected ? 'bg-dark-700 ' + lc.color + ' font-semibold' : 'text-slate-300'}`}>
                  {lang === selected && <ChevronRight size={10} />}
                  <span>{lc.label}</span>
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function TestResultRow({ r, i }) {
  const [expanded, setExpanded] = useState(!r.passed)
  return (
    <div className={`rounded-xl border text-xs overflow-hidden
      ${r.passed ? 'border-green-500/25 bg-green-500/5' : 'border-red-500/25 bg-red-500/5'}`}>
      <button onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-2 p-3 text-left hover:bg-white/5 transition-colors">
        {r.passed
          ? <CheckCircle size={13} className="text-green-400 flex-shrink-0" />
          : <XCircle    size={13} className="text-red-400 flex-shrink-0" />}
        <span className={`font-semibold ${r.passed ? 'text-green-400' : 'text-red-400'}`}>
          Test {i+1}{r.description ? ` — ${r.description}` : ''}
        </span>
        {r.time && <span className="ml-auto flex items-center gap-1 text-slate-500"><Clock size={10}/>{r.time}s</span>}
        {r.memory && <span className="flex items-center gap-1 text-slate-500"><Cpu size={10}/>{r.memory}KB</span>}
        <ChevronDown size={12} className={`text-slate-500 transition-transform flex-shrink-0 ${expanded?'rotate-180':''}`} />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height:0 }} animate={{ height:'auto' }} exit={{ height:0 }} className="overflow-hidden">
            <div className="px-3 pb-3 space-y-1.5 font-mono border-t border-white/5 pt-2">
              {r.input!==undefined && r.input!=='' && r.input!=='[hidden]' && (
                <div><span className="text-slate-500">Input:    </span><span className="text-slate-300">{r.input}</span></div>
              )}
              <div><span className="text-slate-500">Expected: </span><span className="text-green-300">{r.expected}</span></div>
              <div>
                <span className="text-slate-500">Got:      </span>
                <span className={r.passed ? 'text-green-300' : 'text-red-300'}>
                  {r.actual || <em className="text-slate-600">no output</em>}
                </span>
              </div>
              {r.error && (
                <div className="mt-1.5 p-2 bg-red-900/20 rounded-lg border border-red-500/20">
                  <span className="text-red-400 whitespace-pre-wrap">{r.error}</span>
                </div>
              )}
              {r.status && r.status !== 'Accepted' && !r.error && (
                <div className="text-slate-500">Status: <span className="text-orange-400">{r.status}</span></div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function RunOutputPanel({ results, onClear }) {
  const noExec = results?.[0]?.status === 'No executor configured'
  return (
    <motion.div initial={{ height:0 }} animate={{ height:'auto' }} exit={{ height:0 }}
      className="border-t border-dark-700 bg-dark-900 flex-shrink-0 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-dark-700">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <Terminal size={13} className="text-green-400" /> Run Output
        </div>
        <button onClick={onClear} className="text-slate-500 hover:text-white text-xs">clear ✕</button>
      </div>
      <div className="p-3 max-h-52 overflow-y-auto space-y-2">
        {noExec ? (
          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-xs">
            <p className="text-yellow-400 font-semibold mb-1">⚠ Code executor not configured</p>
            <p className="text-slate-400 mb-1">
              Add <code className="bg-dark-700 px-1 rounded">JUDGE0_KEY</code> to your{' '}
              <code className="bg-dark-700 px-1 rounded">server/.env</code> to enable real execution.
            </p>
            <p className="text-slate-500">
              Free key: <span className="text-blue-400">rapidapi.com/judge0-official/api/judge0-ce</span>
            </p>
          </div>
        ) : (
          results.map((r, i) => (
            <div key={i} className="font-mono text-xs">
              {r.error ? (
                <div className="p-2 bg-red-900/20 rounded-lg border border-red-500/20">
                  <div className="text-red-400 font-semibold mb-1">Runtime Error / Compile Error</div>
                  <pre className="text-red-300 whitespace-pre-wrap">{r.error}</pre>
                </div>
              ) : (
                <div className="p-2 bg-dark-800 rounded-lg border border-dark-600">
                  {r.description && <div className="text-slate-500 mb-1 text-xs"># {r.description}</div>}
                  {r.input && <div className="text-slate-500 mb-1">stdin: <span className="text-slate-400">{r.input}</span></div>}
                  <pre className="text-green-300 whitespace-pre-wrap min-h-[1em]">
                    {r.actual || <span className="text-slate-600 italic">no output</span>}
                  </pre>
                  {r.time && <div className="text-slate-600 mt-1 text-xs">{r.time}s · {r.memory}KB · {r.status}</div>}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </motion.div>
  )
}

export default function ChallengeView() {
  const { slug } = useParams()
  const { user, addXP } = useAuthStore()
  const navigate = useNavigate()

  const [challenge, setChallenge]         = useState(null)
  const [loading, setLoading]             = useState(true)
  const [language, setLanguage]           = useState('python')
  const [code, setCode]                   = useState('')
  const [running, setRunning]             = useState(false)
  const [submitting, setSubmitting]       = useState(false)
  const [runResults, setRunResults]       = useState(null)
  const [submitResults, setSubmitResults] = useState(null)
  const [solved, setSolved]               = useState(false)
  const [showConfetti, setShowConfetti]   = useState(false)
  const [activeTab, setActiveTab]         = useState('description')
  const [aiResponse, setAiResponse]       = useState('')
  const [aiLoading, setAiLoading]         = useState(false)
  const [showAI, setShowAI]               = useState(false)
  const [aiMode, setAiMode]               = useState('hint')
  const [winW, setWinW]                   = useState(window.innerWidth)
  const [winH, setWinH]                   = useState(window.innerHeight)

  useEffect(() => {
    const onR = () => { setWinW(window.innerWidth); setWinH(window.innerHeight) }
    window.addEventListener('resize', onR)
    return () => window.removeEventListener('resize', onR)
  }, [])

  useEffect(() => {
    api.get(`/challenges/${slug}`).then(r => {
      const ch = r.data.challenge
      setChallenge(ch)
      setSolved(r.data.isSolved)
      const defLang = ch.defaultLanguage || ch.languages?.[0] || 'python'
      setLanguage(defLang)
      const starter = ch.starterCodes?.find(s => s.language === defLang)
      setCode(starter?.code || ch.starterCode || '')
      setLoading(false)
    }).catch(() => navigate('/challenges'))
  }, [slug])

  const handleLangChange = useCallback((lang) => {
    setLanguage(lang)
    setRunResults(null)
    const starter = challenge?.starterCodes?.find(s => s.language === lang)
    if (starter?.code) setCode(starter.code)
  }, [challenge])

  const resetCode = () => {
    const starter = challenge?.starterCodes?.find(s => s.language === language)
    setCode(starter?.code || challenge?.starterCode || '')
    setRunResults(null)
    toast.success('Code reset')
  }

  const runCode = async () => {
    if (!code.trim()) return toast.error('Write some code first!')
    setRunning(true)
    setRunResults(null)
    try {
      const r = await api.post(`/challenges/${challenge._id}/run`, { code, language })
      setRunResults(r.data.results)
      const noExec = r.data.results?.[0]?.status === 'No executor configured'
      if (noExec) toast('Add JUDGE0_KEY to .env for full execution', { icon: '⚠️' })
      else if (r.data.results?.some(x => x.error)) toast.error('Runtime error — see output below')
      else toast.success('Code ran! Check output below ↓')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Run failed')
    }
    setRunning(false)
  }

  const submit = async () => {
    if (!code.trim()) return toast.error('Write your solution first!')
    setSubmitting(true)
    setRunResults(null)
    try {
      const r = await api.post(`/challenges/${challenge._id}/submit`, { code, language })
      setSubmitResults(r.data)
      setActiveTab('results')
      if (r.data.allPassed) {
        if (!r.data.alreadySolved) {
          setSolved(true)
          addXP(r.data.xpEarned, r.data.coinsEarned)
          setShowConfetti(true)
          setTimeout(() => setShowConfetti(false), 6000)
          toast.success(`🎉 +${r.data.xpEarned} XP — Challenge solved!`)
        } else {
          toast.success('Already solved! Great review 👍')
        }
      } else {
        const p = r.data.results?.filter(x => x.passed).length
        const t = r.data.results?.length
        toast.error(`${p}/${t} test cases passed — keep trying!`)
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Submission failed'
      toast.error(msg)
    }
    setSubmitting(false)
  }

  const askAI = async (mode) => {
    setAiMode(mode); setAiLoading(true); setShowAI(true)
    try {
      let r
      if (mode === 'hint')        r = await api.post('/ai/hint',    { code, challenge: challenge?.description, language })
      else if (mode === 'debug')  r = await api.post('/ai/debug',   { code, language })
      else                        r = await api.post('/ai/explain', { code, language })
      setAiResponse(
        mode === 'hint'   ? r.data.hint :
        mode === 'debug'  ? r.data.debug :
        r.data.explanation
      )
    } catch { setAiResponse('AI is temporarily unavailable.') }
    setAiLoading(false)
  }

  if (loading) return (
    <div className="p-6 space-y-4">
      <div className="skeleton h-10 w-48 rounded-xl" />
      <div className="skeleton h-96 rounded-xl" />
    </div>
  )
  if (!challenge) return null

  const availableLangs = challenge.languages?.length ? challenge.languages : ['python']
  const passedCount    = submitResults?.results?.filter(r => r.passed).length ?? 0
  const totalCount     = submitResults?.results?.length ?? 0
  const allPassed      = submitResults?.allPassed

  return (
    <div className="h-full flex flex-col">
      {showConfetti && (
        <ReactConfetti width={winW} height={winH} recycle={false} numberOfPieces={350}
          colors={['#22c55e','#00e5ff','#a855f7','#eab308','#f97316']} />
      )}

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-dark-700 bg-dark-900 flex-shrink-0">
        <Link to="/challenges" className="btn-ghost text-xs">
          <ArrowLeft size={15} /> Challenges
        </Link>
        <h1 className="font-display text-sm font-bold text-white hidden md:block truncate max-w-xs">
          {challenge.title}
        </h1>
        <div className="flex items-center gap-2">
          {solved && (
            <span className="flex items-center gap-1 text-green-400 text-xs font-semibold">
              <CheckCircle size={13} /> Solved
            </span>
          )}
          <button onClick={runCode} disabled={running || submitting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
              bg-dark-700 border border-dark-600 text-slate-300 hover:bg-dark-600 transition-colors disabled:opacity-50">
            {running
              ? <><div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"/>Running...</>
              : <><Terminal size={13} className="text-green-400"/> Run</>}
          </button>
          <button onClick={submit} disabled={submitting || running}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
              bg-brand-600 hover:bg-brand-500 text-white transition-colors disabled:opacity-50">
            {submitting
              ? <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"/>Submitting...</>
              : <><Send size={13}/> Submit</>}
          </button>
        </div>
      </div>

      {/* Main split */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

        {/* Left panel */}
        <div className="w-full lg:w-[42%] border-b lg:border-b-0 lg:border-r border-dark-700 overflow-y-auto flex-shrink-0 flex flex-col min-h-0">
          {/* Tabs */}
          <div className="flex border-b border-dark-700 bg-dark-900 flex-shrink-0">
            {['description','results'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-4 py-2.5 text-xs font-medium capitalize border-b-2 transition-colors
                  ${activeTab===t ? 'border-brand-500 text-brand-400' : 'border-transparent text-slate-400 hover:text-white'}`}>
                {t}
                {t==='results' && submitResults && (
                  <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-bold
                    ${allPassed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {passedCount}/{totalCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {activeTab === 'description' ? (
              <div className="space-y-5">
                <div>
                  <h2 className="font-display text-lg font-bold text-white mb-2">{challenge.title}</h2>
                  <div className="flex flex-wrap gap-2">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${difficultyBg(challenge.difficulty)}`}>
                      {challenge.difficulty}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-dark-600 text-slate-400 border border-dark-500">
                      {challenge.category}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30">
                      +{challenge.xpReward} XP
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                      +{challenge.coinReward} 🪙
                    </span>
                  </div>
                </div>

                {/* Available languages */}
                <div>
                  <p className="text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wider">Solve in</p>
                  <div className="flex flex-wrap gap-1.5">
                    {availableLangs.map(lang => {
                      const lc = LANG_CONFIG[lang] || { label:lang, color:'text-slate-300', bg:'bg-dark-700', border:'border-dark-600' }
                      return (
                        <span key={lang} className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${lc.color} ${lc.bg} ${lc.border}`}>
                          {lc.label}
                        </span>
                      )
                    })}
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">{challenge.description}</p>

                {challenge.examples?.length > 0 && (
                  <div>
                    <h3 className="font-display text-sm font-bold text-white mb-3">Examples</h3>
                    {challenge.examples.map((ex, i) => (
                      <div key={i} className="p-3 rounded-xl bg-dark-800 border border-dark-600 mb-3 text-xs font-mono">
                        {ex.input  && <div className="text-slate-400 mb-0.5">Input: <span className="text-cyan-300">{ex.input}</span></div>}
                        {ex.output && <div className="text-slate-400 mb-0.5">Output: <span className="text-green-300">{ex.output}</span></div>}
                        {ex.explanation && <div className="text-slate-500 mt-1 font-sans italic">{ex.explanation}</div>}
                      </div>
                    ))}
                  </div>
                )}

                {challenge.constraints?.length > 0 && (
                  <div>
                    <h3 className="font-display text-sm font-bold text-white mb-2">Constraints</h3>
                    <ul className="space-y-1">
                      {challenge.constraints.map((c, i) => (
                        <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                          <span className="text-brand-500 mt-0.5">•</span>{c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {challenge.testCases?.length > 0 && (
                  <div>
                    <h3 className="font-display text-sm font-bold text-white mb-2">Test Cases</h3>
                    {challenge.testCases.map((tc, i) => (
                      <div key={i} className="p-3 rounded-xl bg-dark-800 border border-dark-600 mb-2 text-xs font-mono">
                        {tc.input && <div className="text-slate-400">Input: <span className="text-cyan-300">{tc.input}</span></div>}
                        <div className="text-slate-400">Expected: <span className="text-green-300">{tc.expectedOutput}</span></div>
                        {tc.description && <div className="text-slate-600 mt-1 font-sans italic">{tc.description}</div>}
                      </div>
                    ))}
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
                      <Lock size={11}/> Additional hidden test cases are used during submission
                    </div>
                  </div>
                )}

                {challenge.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {challenge.tags.map(t => (
                      <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-dark-700 text-slate-500 border border-dark-600">{t}</span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                {!submitResults ? (
                  <div className="text-center py-16 text-slate-600">
                    <Send size={36} className="mx-auto mb-3 opacity-30"/>
                    <p className="text-sm">Submit your code to see results</p>
                    <p className="text-xs mt-1 text-slate-700">Use the Submit button at the top right</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className={`p-4 rounded-xl border text-center
                      ${allPassed ? 'border-green-500/30 bg-green-500/10' : 'border-red-500/30 bg-red-500/10'}`}>
                      <div className={`font-display text-2xl font-bold mb-1 ${allPassed ? 'text-green-400' : 'text-red-400'}`}>
                        {allPassed ? '✅ Accepted' : '❌ Wrong Answer'}
                      </div>
                      <div className="text-xs text-slate-400">{passedCount} / {totalCount} test cases passed</div>
                      {submitResults.xpEarned > 0 && (
                        <div className="mt-2 text-brand-400 font-bold text-sm">
                          +{submitResults.xpEarned} XP · +{submitResults.coinsEarned} 🪙
                        </div>
                      )}
                    </div>
                    {submitResults.results?.map((r, i) => <TestResultRow key={i} r={r} i={i}/>)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: editor */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          {/* Toolbar */}
          <div className="flex items-center gap-2 px-4 py-2 bg-dark-800 border-b border-dark-700 flex-shrink-0 flex-wrap gap-y-1.5">
            <LangSelector langs={availableLangs} selected={language} onChange={handleLangChange}/>
            <div className="ml-auto flex items-center gap-1.5 flex-wrap">
              <button onClick={() => askAI('hint')}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-yellow-400 hover:bg-yellow-500/10 transition-colors">
                <Lightbulb size={12}/> Hint
              </button>
              <button onClick={() => askAI('debug')}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors">
                <Bug size={12}/> Debug
              </button>
              <button onClick={() => askAI('explain')}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-brand-400 hover:bg-brand-500/10 transition-colors">
                <Bot size={12}/> Explain
              </button>
              <button onClick={resetCode}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-slate-400 hover:bg-dark-700 transition-colors">
                <RotateCcw size={12}/> Reset
              </button>
            </div>
          </div>

          {/* Monaco */}
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language={LANG_CONFIG[language]?.monaco || language}
              value={code}
              onChange={v => setCode(v || '')}
              theme="vs-dark"
              options={{
                fontSize: user?.fontSize || 14,
                minimap: { enabled: false },
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                fontFamily: '"JetBrains Mono","Fira Code",monospace',
                lineNumbers: 'on',
                wordWrap: 'on',
                automaticLayout: true,
                bracketPairColorization: { enabled: true },
                renderWhitespace: 'boundary',
                quickSuggestions: true,
                tabSize: language === 'python' ? 4 : 2,
              }}
            />
          </div>

          {/* Run output */}
          <AnimatePresence>
            {runResults && <RunOutputPanel results={runResults} onClear={() => setRunResults(null)}/>}
          </AnimatePresence>

          {/* AI panel */}
          <AnimatePresence>
            {showAI && (
              <motion.div
                initial={{ height:0, opacity:0 }} animate={{ height:230, opacity:1 }} exit={{ height:0, opacity:0 }}
                className="border-t border-dark-700 bg-dark-900 overflow-hidden flex-shrink-0">
                <div className="flex items-center justify-between px-4 py-2 border-b border-dark-700">
                  <div className="flex items-center gap-2 text-xs font-bold text-brand-400">
                    <Bot size={13}/>
                    AI {aiMode==='hint'?'Hint':aiMode==='debug'?'Debugger':'Explanation'}
                    <span className={`px-1.5 py-0.5 rounded border text-xs font-normal
                      ${LANG_CONFIG[language]?.bg} ${LANG_CONFIG[language]?.color} ${LANG_CONFIG[language]?.border}`}>
                      {LANG_CONFIG[language]?.label || language}
                    </span>
                  </div>
                  <button onClick={() => setShowAI(false)} className="text-slate-500 hover:text-white">
                    <ChevronDown size={15}/>
                  </button>
                </div>
                <div className="p-4 overflow-y-auto h-[182px] text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                  {aiLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {[0,1,2].map(i => (
                          <div key={i} className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce"
                            style={{ animationDelay:`${i*0.15}s` }}/>
                        ))}
                      </div>
                      <span className="text-slate-500">AI thinking...</span>
                    </div>
                  ) : aiResponse}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}