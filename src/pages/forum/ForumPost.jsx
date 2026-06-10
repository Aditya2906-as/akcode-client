import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ChevronUp, CheckCircle, MessageSquare, Eye, Send } from 'lucide-react'
import api from '../../utils/api'
import useAuthStore from '../../context/authStore'
import { timeAgo } from '../../utils/helpers'
import toast from 'react-hot-toast'

export default function ForumPost() {
  const { id } = useParams()
  const { user } = useAuthStore()
  const [post, setPost]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [reply, setReply]     = useState('')
  const [code, setCode]       = useState('')
  const [posting, setPosting] = useState(false)

  const load = () => {
    api.get(`/forum/${id}`).then(r => {
      setPost(r.data.post)
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  const submitReply = async () => {
    if (!reply.trim()) return toast.error('Write a reply first')
    setPosting(true)
    try {
      const r = await api.post(`/forum/${id}/reply`, {
        body: reply, codeSnippet: code, codeLanguage: 'python'
      })
      setPost(r.data.post)
      setReply('')
      setCode('')
      toast.success('Reply posted!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed')
    }
    setPosting(false)
  }

  const upvote = async () => {
    try {
      await api.put(`/forum/${id}/upvote`)
      load()
    } catch {
      toast.error('Login to upvote')
    }
  }

  if (loading) return <div className="p-6"><div className="skeleton h-96 rounded-xl" /></div>
  if (!post)   return <div className="p-6 text-center text-slate-500">Post not found</div>

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Link to="/forum" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Forum
      </Link>

      {/* Post */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6 mb-6">
        <div className="flex gap-4">
          {/* Vote */}
          <div className="flex flex-col items-center gap-1">
            <button onClick={upvote} className="p-2 rounded-xl hover:bg-brand-500/20 text-slate-400 hover:text-brand-400 transition-colors">
              <ChevronUp size={20} />
            </button>
            <span className="font-bold text-white">{post.upvotes?.length || 0}</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="badge bg-dark-700 text-slate-500 border border-dark-500">{post.category}</span>
              {post.isSolved && <span className="badge badge-easy"><CheckCircle size={10} /> Solved</span>}
            </div>
            <h1 className="font-display text-xl font-bold text-white mb-3">{post.title}</h1>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap mb-4">{post.body}</p>

            {post.codeSnippet && (
              <pre className="p-4 bg-dark-900 rounded-xl border border-dark-600 text-xs font-code text-slate-200 overflow-x-auto mb-4">
                <code>{post.codeSnippet}</code>
              </pre>
            )}

            {post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {post.tags.map(t => (
                  <span key={t} className="badge bg-dark-700 text-slate-400 border border-dark-500">{t}</span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3 text-xs text-slate-500 border-t border-dark-700 pt-3">
              <Link to={`/profile/${post.userId?.username}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
                <div className="w-5 h-5 rounded-full bg-brand-500/20 flex items-center justify-center text-xs text-brand-400 font-bold">
                  {post.userId?.username?.[0]?.toUpperCase()}
                </div>
                {post.userId?.username}
                <span className="badge bg-dark-700 border-dark-500 text-slate-500">Lv.{post.userId?.level}</span>
              </Link>
              <span>·</span>
              <span>{timeAgo(post.createdAt)}</span>
              <span className="flex items-center gap-1"><Eye size={10} /> {post.views}</span>
              <span className="flex items-center gap-1"><MessageSquare size={10} /> {post.replies?.length}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Replies */}
      <div className="mb-6">
        <h2 className="section-title mb-4">{post.replies?.length || 0} Replies</h2>
        <div className="space-y-3">
          {post.replies?.map((r, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
              className={`card p-4 ${r.isAccepted ? 'border-brand-500/30 bg-brand-500/5' : ''}`}>
              {r.isAccepted && (
                <div className="flex items-center gap-1 text-xs text-brand-400 font-bold mb-2">
                  <CheckCircle size={12} /> Accepted Answer
                </div>
              )}
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{r.body}</p>
              {r.codeSnippet && (
                <pre className="p-3 mt-3 bg-dark-900 rounded-xl border border-dark-600 text-xs font-code text-slate-200 overflow-x-auto">
                  <code>{r.codeSnippet}</code>
                </pre>
              )}
              <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                <Link to={`/profile/${r.userId?.username}`} className="flex items-center gap-1.5 hover:text-white">
                  <div className="w-4 h-4 rounded-full bg-brand-500/20 flex items-center justify-center text-xs text-brand-400 font-bold">
                    {r.userId?.username?.[0]?.toUpperCase()}
                  </div>
                  {r.userId?.username}
                </Link>
                <span>·</span>
                <span>{timeAgo(r.createdAt)}</span>
                <span className="flex items-center gap-1"><ChevronUp size={10} /> {r.upvotes?.length || 0}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Reply form */}
      {user && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
          <h3 className="font-display text-base font-bold text-white mb-4">Your Answer</h3>
          <textarea value={reply} onChange={e => setReply(e.target.value)}
            placeholder="Write a helpful answer..."
            className="input h-28 resize-none mb-3" />
          <textarea value={code} onChange={e => setCode(e.target.value)}
            placeholder="Optional: paste code snippet..."
            className="input font-code text-xs h-20 resize-none mb-3" />
          <button onClick={submitReply} disabled={posting || !reply.trim()} className="btn-primary w-full justify-center">
            {posting ? '...' : <><Send size={16} /> Post Reply</>}
          </button>
        </motion.div>
      )}
    </div>
  )
}
