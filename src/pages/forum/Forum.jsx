import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, MessageSquare, ChevronUp, Eye, Tag, CheckCircle } from 'lucide-react'
import api from '../../utils/api'
import { timeAgo, langClass, langLabel } from '../../utils/helpers'
import toast from 'react-hot-toast'

const CATEGORIES = ['All','General','Help','JavaScript','Python','Java','C++','SQL','Algorithms','Career']

export default function Forum() {
  const [posts, setPosts]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [category, setCat]    = useState('All')
  const [sort, setSort]       = useState('newest')
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ title: '', body: '', category: 'General', tags: '', language: '', codeSnippet: '', codeLanguage: 'python' })
  const [creating, setCreating] = useState(false)
  const navigate = useNavigate()

  const load = () => {
    const params = new URLSearchParams()
    if (category !== 'All') params.set('category', category)
    if (search) params.set('search', search)
    params.set('sort', sort)
    api.get(`/forum?${params}`).then(r => {
      setPosts(r.data.posts)
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [category, sort])
  useEffect(() => {
    const t = setTimeout(load, 400)
    return () => clearTimeout(t)
  }, [search])

  const create = async () => {
    if (!form.title.trim() || !form.body.trim()) return toast.error('Title and body required')
    setCreating(true)
    try {
      const r = await api.post('/forum', {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
      })
      toast.success('Post created!')
      setShowCreate(false)
      navigate(`/forum/${r.data.post._id}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed')
    }
    setCreating(false)
  }

  const upvote = async (id, e) => {
    e.preventDefault()
    try {
      await api.put(`/forum/${id}/upvote`)
      setPosts(prev => prev.map(p => p._id === id
        ? { ...p, upvotes: p._upvoted ? p.upvotes.slice(1) : [...p.upvotes, 'me'], _upvoted: !p._upvoted }
        : p))
    } catch {
      toast.error('Login to upvote')
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">
            Community <span className="glow-text">Forum</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Ask questions, share knowledge</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus size={16} /> New Post
        </button>
      </div>

      {/* Filters */}
      <div className="space-y-3 mb-5">
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search posts..." className="input pl-9 py-2 text-sm" />
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)} className="input w-36 text-sm">
            <option value="newest">Newest</option>
            <option value="popular">Popular</option>
            <option value="unsolved">Unsolved</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                category === c
                  ? 'bg-brand-500 text-dark-950'
                  : 'bg-dark-700 text-slate-400 border border-dark-500 hover:bg-dark-600'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Posts list */}
      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <MessageSquare size={48} className="mx-auto mb-3 opacity-30" />
          <p>No posts found. Be the first to post!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <Link key={post._id} to={`/forum/${post._id}`}>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="card-hover p-4 flex gap-4">
                {/* Upvote */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <button onClick={(e) => upvote(post._id, e)}
                    className="p-1.5 rounded-lg hover:bg-brand-500/20 text-slate-400 hover:text-brand-400 transition-colors">
                    <ChevronUp size={16} />
                  </button>
                  <span className="text-xs font-bold text-slate-400">{post.upvotes?.length || 0}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {post.isPinned && <span className="text-xs text-yellow-400">📌 Pinned</span>}
                    {post.isSolved && (
                      <span className="flex items-center gap-1 text-xs text-brand-400 font-bold">
                        <CheckCircle size={12} /> Solved
                      </span>
                    )}
                    <span className="badge bg-dark-700 text-slate-500 border border-dark-500 text-xs">{post.category}</span>
                  </div>
                  <h3 className="font-display text-sm font-bold text-white mb-1 truncate">{post.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-2">{post.body}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-brand-500/20 flex items-center justify-center text-xs text-brand-400 font-bold">
                        {post.userId?.username?.[0]?.toUpperCase()}
                      </div>
                      <span>{post.userId?.username}</span>
                    </div>
                    <span>·</span>
                    <span>{timeAgo(post.createdAt)}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1"><Eye size={10} /> {post.views}</span>
                    <span className="flex items-center gap-1"><MessageSquare size={10} /> {post.replies?.length || 0}</span>
                    {post.tags?.slice(0, 2).map(t => (
                      <span key={t} className="flex items-center gap-1"><Tag size={10} /> {t}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}

      {/* Create post modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b border-dark-700">
                <h2 className="font-display text-lg font-bold text-white">New Forum Post</h2>
                <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Title *</label>
                  <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="What's your question?" className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Body *</label>
                  <textarea value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
                    placeholder="Describe your question or topic in detail..." className="input h-32 resize-none" />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Category</label>
                    <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                      className="input">
                      {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Tags</label>
                    <input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                      placeholder="arrays, sorting, ..." className="input" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Code Snippet (optional)</label>
                  <textarea value={form.codeSnippet} onChange={e => setForm(p => ({ ...p, codeSnippet: e.target.value }))}
                    placeholder="Paste relevant code here..." className="input font-code text-xs h-24 resize-none" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowCreate(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                  <button onClick={create} disabled={creating} className="btn-primary flex-1 justify-center">
                    {creating ? '...' : <><Plus size={16} /> Post</>}
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
