import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Code2, Trophy, Bot, Flame, Star, Swords, BookOpen, Users, ChevronRight } from 'lucide-react'

const features = [
  { icon: '🎮', title: 'Gamified Learning', desc: 'Earn XP, level up, maintain streaks and collect badges as you master coding.' },
  { icon: '🤖', title: 'AI Tutor (Groq)', desc: 'Ask anything. Get instant explanations, debug help, code reviews powered by Llama 3.3.' },
  { icon: '⚔️', title: '100+ Challenges', desc: 'From Easy to Expert. Algorithmic challenges across Python, JS, C++, Java and more.' },
  { icon: '📚', title: '12+ Courses', desc: 'Structured learning paths for Python, JavaScript, React, SQL, Rust, Go and more.' },
  { icon: '🏆', title: 'Leaderboards', desc: 'Compete globally. See where you rank among thousands of coders.' },
  { icon: '💬', title: 'Community Forum', desc: 'Ask questions, share knowledge, get help from fellow learners.' },
  { icon: '📋', title: 'Code Snippets', desc: 'Save, organize and share reusable code snippets with the community.' },
  { icon: '🎯', title: 'AI Quiz Generator', desc: 'Generate personalized quizzes on any topic using AI.' },
]

const languages = [
  { icon: '🐍', name: 'Python',     color: '#3776AB' },
  { icon: '⚡', name: 'JavaScript', color: '#F7DF1E' },
  { icon: '☕', name: 'Java',       color: '#ED8B00' },
  { icon: '⚙️', name: 'C++',        color: '#00599C' },
  { icon: '🎨', name: 'HTML/CSS',   color: '#E34F26' },
  { icon: '🗃️', name: 'SQL',        color: '#336791' },
  { icon: '🔷', name: 'TypeScript', color: '#3178C6' },
  { icon: '🦀', name: 'Rust',       color: '#CE422B' },
  { icon: '🐹', name: 'Go',         color: '#00ADD8' },
  { icon: '⚛️', name: 'React',      color: '#61DAFB' },
]

const stats = [
  { value: '12+',  label: 'Languages',   icon: Code2 },
  { value: '100+', label: 'Challenges',  icon: Swords },
  { value: '10+',  label: 'Courses',     icon: BookOpen },
  { value: '∞',    label: 'AI Answers',  icon: Bot },
]

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const fadeUp  = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }

export default function Landing() {
  return (
    <div className="min-h-screen bg-dark-950 bg-grid-pattern overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-dark-700/50 bg-dark-950/80 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center animate-glow-pulse">
              <span className="font-display font-bold text-brand-400 text-sm">AK</span>
            </div>
            <span className="font-display text-lg font-bold text-white">AK<span className="text-brand-400">.code</span></span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth/login" className="btn-ghost text-sm">Sign In</Link>
            <Link to="/auth/register" className="btn-primary text-sm">Start Free <ArrowRight size={14} /></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-36 pb-20 px-6 relative">
        {/* Glow blobs */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-64 h-64 bg-accent-cyan/5 rounded-full blur-[80px] pointer-events-none" />

        <motion.div variants={stagger} initial="hidden" animate="show"
          className="max-w-4xl mx-auto text-center relative">
          <motion.div variants={fadeUp}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            AI-Powered Coding Platform
          </motion.div>

          <motion.h1 variants={fadeUp}
            className="font-display text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
            Level Up Your
            <span className="block glow-text">Coding Skills</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-slate-400 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Learn to code through gamified challenges, AI-powered tutoring, and interactive lessons.
            Compete globally, earn badges, and master 10+ languages.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/auth/register" className="btn-primary text-base px-8 py-3.5 animate-glow-pulse">
              Start Learning Free <ArrowRight size={18} />
            </Link>
            <Link to="/auth/login" className="btn-secondary text-base px-8 py-3.5">
              Sign In
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {stats.map(s => (
              <motion.div key={s.label} variants={fadeUp}
                className="card p-4 text-center border-dark-600">
                <s.icon size={18} className="text-brand-400 mx-auto mb-1.5" />
                <div className="font-display text-2xl font-bold glow-text">{s.value}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Languages strip */}
      <section className="py-10 px-6 border-y border-dark-700 bg-dark-900/50 overflow-hidden">
        <div className="flex gap-6 animate-[scroll_20s_linear_infinite]" style={{ width: 'max-content' }}>
          {[...languages, ...languages].map((l, i) => (
            <div key={i} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-dark-800 border border-dark-600 flex-shrink-0">
              <span className="text-xl">{l.icon}</span>
              <span className="font-display text-sm font-bold text-white">{l.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-14">
            <h2 className="font-display text-4xl font-bold text-white mb-4">
              Everything you need to <span className="glow-text">excel</span>
            </h2>
            <p className="text-slate-400 text-lg">A complete coding education ecosystem</p>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map(f => (
              <motion.div key={f.title} variants={fadeUp}
                className="card-hover p-5 group">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{f.icon}</div>
                <h3 className="font-display text-sm font-bold text-white mb-2">{f.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-dark-900/50">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-14">
            <h2 className="font-display text-4xl font-bold text-white mb-4">
              How <span className="glow-text">AK.code</span> works
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '01', icon: '📝', title: 'Create Account', desc: 'Sign up for free in seconds. Choose your first language and learning path.' },
              { step: '02', icon: '📚', title: 'Learn & Practice', desc: 'Work through interactive lessons, solve challenges, and get AI help when stuck.' },
              { step: '03', icon: '🏆', title: 'Earn & Compete', desc: 'Earn XP, unlock badges, climb the leaderboard and track your daily streak.' },
            ].map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="card p-6 text-center relative">
                <div className="font-display text-6xl font-bold text-dark-600 absolute top-4 right-4 leading-none">{step.step}</div>
                <div className="text-4xl mb-3">{step.icon}</div>
                <h3 className="font-display text-base font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[200px] bg-brand-500/10 rounded-full blur-[100px]" />
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center relative">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Ready to become a
            <span className="block glow-text">better coder?</span>
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            Join thousands of learners. It's completely free.
          </p>
          <Link to="/auth/register" className="btn-primary text-lg px-10 py-4 animate-glow-pulse">
            Start Coding Now <ArrowRight size={20} />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-700 py-8 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
            <span className="font-display font-bold text-brand-400 text-xs">AK</span>
          </div>
          <span className="font-display font-bold text-white">AK<span className="text-brand-400">.code</span></span>
        </div>
        <p className="text-slate-500 text-sm">© 2026 AK.code · Built for learners, by learners</p>
      </footer>

      <style>{`
        @keyframes scroll {
          from { transform: translateX(0) }
          to   { transform: translateX(-50%) }
        }
      `}</style>
    </div>
  )
}
