import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Code2, Heart, Trash2, Globe, Lock, Copy, Check } from 'lucide-react'
import Editor from '@monaco-editor/react'
import api from '../../utils/api'
import useAuthStore from '../../context/authStore'
import { langClass, langLabel, langIcon, timeAgo } from '../../utils/helpers'
import toast from 'react-hot-toast'

const LANGUAGES = ['python','javascript','java','cpp','html','sql','typescript','rust','go']

export default function Snippets() {
  const { user } = useAuthStore()
  const [snippets, setSnippets] = useState([])
  const [mySnippets, setMySnippets] = useState([])
  const [tab, setTab]   = useState('community') // community | mine
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState(null)

  const [form, setForm] = useState({
    title: '', description: '', code: '# Your code here\n',
    language: 'python', tags: '', isPublic: true
  })
  const [creating, setCreating] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [pubRes, myRes] = await Promise.all([
        api.get('/snippets'),
        api.get(`/snippets?userId=${user?._id}`)
      ])
      setSnippets(pubRes.data.snippets)
      setMySnippets(myRes.data.snippets)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const create = async () => {
    if (!form.title.trim() || !form.code.trim()) return toast.error('Title and code required')
    setCreating(true)
    try {
      await api.post('/snippets', {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
      })
      toast.success('Snippet saved!')
      setShowCreate(false)
      setForm({ title: '', description: '', code: '# Your code here\n', language: 'python', tags: '', isPublic: true })
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save')
    }
    setCreating(false)
  }

  const deleteSnippet = async (id) => {
    try {
      await api.delete(`/snippets/${id}`)
      setMySnippets(p => p.filter(s => s._id !== id))
      setSnippets(p => p.filter(s => s._id !== id))
      toast.success('Deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const copy = (code, id) => {
    navigator.clipboard.writeText(code)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
    toast.success('Copied to clipboard!')
  }

  const display = tab === 'community' ? snippets : mySnippets
  const filtered = display.filter(s =>
    !search ||
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.language.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">
            Code <span className="glow-text">Snippets</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Share and discover reusable code</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus size={16} /> New Snippet
        </button>
      </div>

      {/* Tabs + search */}
      <div className="flex items-center gap-4 mb-5 flex-wrap">
        <div className="flex gap-1 bg-dark-800 rounded-lg p-1 border border-dark-600">
          {['community','mine'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${
                tab === t ? 'bg-dark-600 text-white' : 'text-slate-400 hover:text-white'}`}>
              {t === 'mine' ? 'My Snippets' : 'Community'}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search snippets..." className="input pl-9 py-2 text-sm" />
        </div>
      </div>

      {/* Snippets grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-56 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Code2 size={48} className="mx-auto mb-3 opacity-30" />
          <p>{tab === 'mine' ? 'No snippets yet. Create your first!' : 'No public snippets found'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(snippet => (
            <motion.div key={snippet._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="card overflow-hidden group">
              {/* Header */}
              <div className="flex items-start justify-between p-4 border-b border-dark-700">
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-sm font-bold text-white truncate">{snippet.title}</h3>
                  {snippet.description && (
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{snippet.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`badge ${langClass(snippet.language)}`}>{langLabel(snippet.language)}</span>
                    <span className="badge bg-dark-700 text-slate-500 border border-dark-500">
                      {snippet.isPublic ? <Globe size={10} /> : <Lock size={10} />}
                    </span>
                    {snippet.tags?.slice(0, 2).map(t => (
                      <span key={t} className="badge bg-dark-700 text-slate-500 border border-dark-500">{t}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Code preview */}
              <div className="relative">
                <pre className="p-4 font-code text-xs text-slate-300 overflow-hidden h-32 leading-relaxed bg-dark-900">
                  <code>{snippet.code.slice(0, 300)}</code>
                </pre>
                <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-dark-900 to-transparent" />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-3 border-t border-dark-700 bg-dark-800">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <div className="w-5 h-5 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-xs text-brand-400 font-bold">
                    {snippet.userId?.username?.[0]?.toUpperCase() || '?'}
                  </div>
                  <span>{snippet.userId?.username || 'Anonymous'}</span>
                  <span>·</span>
                  <span>{timeAgo(snippet.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => copy(snippet.code, snippet._id)}
                    className="btn-ghost text-xs py-1 px-2">
                    {copied === snippet._id ? <Check size={13} className="text-brand-400" /> : <Copy size={13} />}
                  </button>
                  {tab === 'mine' && snippet.userId?._id === user?._id && (
                    <button onClick={() => deleteSnippet(snippet._id)}
                      className="btn-ghost text-xs py-1 px-2 text-red-400 hover:text-red-300">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b border-dark-700">
                <h2 className="font-display text-lg font-bold text-white">New Snippet</h2>
                <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Title *</label>
                  <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Quick sort implementation" className="input" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
                  <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="Brief description..." className="input" />
                </div>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Language *</label>
                    <select value={form.language} onChange={e => setForm(p => ({ ...p, language: e.target.value }))}
                      className="input">
                      {LANGUAGES.map(l => <option key={l} value={l}>{langLabel(l)}</option>)}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Tags (comma separated)</label>
                    <input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                      placeholder="sorting, arrays, beginner" className="input" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Code *</label>
                  <div className="rounded-xl overflow-hidden border border-dark-600 h-48">
                    <Editor height="100%" language={form.language} value={form.code}
                      onChange={v => setForm(p => ({ ...p, code: v || '' }))} theme="vs-dark"
                      options={{ fontSize: 13, minimap: { enabled: false }, padding: { top: 8 },
                        fontFamily: '"JetBrains Mono", monospace', automaticLayout: true }} />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button onClick={() => setForm(p => ({ ...p, isPublic: !p.isPublic }))}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                      form.isPublic
                        ? 'border-brand-500 bg-brand-500/20 text-brand-400'
                        : 'border-dark-500 bg-dark-700 text-slate-400'}`}>
                    {form.isPublic ? <><Globe size={14} /> Public</> : <><Lock size={14} /> Private</>}
                  </button>
                  <p className="text-xs text-slate-500">
                    {form.isPublic ? 'Visible to community' : 'Only visible to you'}
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowCreate(false)} className="btn-secondary flex-1 justify-center">
                    Cancel
                  </button>
                  <button onClick={create} disabled={creating} className="btn-primary flex-1 justify-center">
                    {creating ? '...' : <><Plus size={16} /> Save Snippet</>}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
