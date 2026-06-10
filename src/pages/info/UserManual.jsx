import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, LayoutDashboard, Swords, Trophy, Bot, MessageSquare,
  Code2, User, Settings, ChevronDown, ChevronRight, Flame, Heart,
  Coins, Star, Award, Play, CheckCircle, Search, Zap, Target,
  GraduationCap, Users, HelpCircle, BookMarked
} from 'lucide-react'

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }
const stagger = { show: { transition: { staggerChildren: 0.07 } } }

const sections = [
  {
    id: 'getting-started',
    icon: Play,
    color: 'text-brand-400',
    bg: 'bg-brand-400/10',
    border: 'border-brand-400/20',
    title: 'Getting Started',
    steps: [
      { heading: 'Create Your Account', text: 'Sign up with your email and a secure password. You\'ll receive an OTP verification to keep your account safe.' },
      { heading: 'Set Up Your Profile', text: 'Choose an avatar, set your username, and pick your preferred programming language to personalise your experience.' },
      { heading: 'Explore the Dashboard', text: 'Your Dashboard is the home base — it shows your current streak, XP progress, recent activity, and quick links to continue learning.' },
    ],
  },
  {
    id: 'courses',
    icon: BookOpen,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/20',
    title: 'Courses & Lessons',
    steps: [
      { heading: 'Browse Courses', text: 'Head to Courses in the sidebar to explore all available learning paths, filtered by language or difficulty.' },
      { heading: 'Enroll & Learn', text: 'Click on any course to see its lessons. Work through lessons in order — each one builds on the last with theory, examples, and mini-tasks.' },
      { heading: 'Track Your Progress', text: 'A progress bar shows how far along each course you are. Completed lessons are marked with a green checkmark.' },
    ],
  },
  {
    id: 'challenges',
    icon: Swords,
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    border: 'border-orange-400/20',
    title: 'Coding Challenges',
    steps: [
      { heading: 'Pick a Challenge', text: 'Go to Challenges to find problems ranked Easy, Medium, Hard, and Expert. Filter by tag or language to find the right one for you.' },
      { heading: 'Write & Run Code', text: 'Use the built-in Monaco editor to write your solution. Hit "Run" to test against sample inputs before submitting.' },
      { heading: 'Earn Rewards', text: 'Successfully passing all test cases awards you XP and coins. Harder challenges give more rewards!' },
    ],
  },
  {
    id: 'ai-tutor',
    icon: Bot,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    border: 'border-purple-400/20',
    title: 'AI Tutor',
    steps: [
      { heading: 'Ask Anything', text: 'The AI Tutor is your personal coding mentor. Ask it to explain concepts, debug your code, or walk you through a problem step by step.' },
      { heading: 'Code Review', text: 'Paste your code into the chat and ask for a review — the AI will suggest improvements, spot bugs, and explain best practices.' },
      { heading: 'Contextual Help', text: 'While solving a challenge or lesson, open the AI Tutor for hints without spoiling the full answer.' },
    ],
  },
  {
    id: 'forum',
    icon: MessageSquare,
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
    border: 'border-cyan-400/20',
    title: 'Forum & Community',
    steps: [
      { heading: 'Browse Discussions', text: 'Visit the Forum to read questions, solutions, and tips shared by the community. Filter by tag to find topics you care about.' },
      { heading: 'Post a Question', text: 'Stuck on something? Create a new post with your code snippet and a clear description — the community is here to help.' },
      { heading: 'Upvote & Reply', text: 'Help others by answering questions. Upvote helpful replies to surface the best answers for everyone.' },
    ],
  },
  {
    id: 'snippets',
    icon: Code2,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/20',
    title: 'Snippets',
    steps: [
      { heading: 'Save Useful Code', text: 'Snippets is your personal code notebook. Save reusable pieces of code — algorithms, templates, helpers — for quick reference.' },
      { heading: 'Organise by Language', text: 'Tag snippets by language and topic so you can find them instantly when you need them.' },
      { heading: 'Copy with One Click', text: 'Each snippet has a Copy button so you can paste your saved code straight into a challenge or project.' },
    ],
  },
  {
    id: 'progress',
    icon: Trophy,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/20',
    title: 'XP, Levels & Badges',
    steps: [
      { heading: 'Earning XP', text: 'Complete lessons, solve challenges, and stay active to earn XP. The more XP you gain, the higher your level.' },
      { heading: 'Daily Streak', text: 'Log in and complete at least one task each day to keep your streak alive. Streaks boost your XP multiplier!' },
      { heading: 'Badges & Leaderboard', text: 'Unlock badges for milestones like "First Challenge" or "10-Day Streak". Check the Leaderboard to see how you rank globally.' },
    ],
  },
  {
    id: 'profile',
    icon: User,
    color: 'text-pink-400',
    bg: 'bg-pink-400/10',
    border: 'border-pink-400/20',
    title: 'Profile & Settings',
    steps: [
      { heading: 'View Your Profile', text: 'Your public profile shows your level, badges, challenge stats, and recent activity. You can view other users\' profiles too.' },
      { heading: 'Customise Your Account', text: 'In Settings, update your avatar, display name, email, and password. You can also set notification preferences.' },
      { heading: 'Badge Showcase', text: 'Visit the Badges page to see all earned and locked badges — a record of every milestone you\'ve hit.' },
    ],
  },
]

function Section({ section }) {
  const [open, setOpen] = useState(false)
  const Icon = section.icon

  return (
    <motion.div variants={fadeUp} className="card overflow-visible">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-dark-700/40 transition-colors rounded-xl"
      >
        <div className={`w-10 h-10 rounded-xl ${section.bg} border ${section.border} flex items-center justify-center shrink-0`}>
          <Icon size={18} className={section.color} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display font-bold text-white text-sm">{section.title}</div>
          <div className="text-xs text-slate-500">{section.steps.length} topics</div>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} className="text-slate-500" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-dark-700 pt-3">
              {section.steps.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className={`w-5 h-5 rounded-full ${section.bg} border ${section.border} flex items-center justify-center shrink-0 mt-0.5`}>
                    <span className={`text-xs font-bold ${section.color}`}>{i + 1}</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white mb-0.5">{step.heading}</div>
                    <div className="text-xs text-slate-400 leading-relaxed">{step.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function UserManual() {
  const [search, setSearch] = useState('')

  const filtered = sections.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.steps.some(st =>
      st.heading.toLowerCase().includes(search.toLowerCase()) ||
      st.text.toLowerCase().includes(search.toLowerCase())
    )
  )

  return (
    <div className="min-h-full p-4 md:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="mb-8">
        <motion.div variants={fadeUp} className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
            <BookMarked size={20} className="text-brand-400" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-white">User Manual</h1>
            <p className="text-slate-500 text-sm">Everything you need to master AK.code</p>
          </div>
        </motion.div>

        {/* Quick stats */}
        <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3 mt-5 mb-6">
          {[
            { icon: GraduationCap, label: 'Courses & Lessons', color: 'text-blue-400', bg: 'bg-blue-400/10' },
            { icon: Zap,           label: 'Challenges & XP',   color: 'text-orange-400', bg: 'bg-orange-400/10' },
            { icon: Users,         label: 'Community',         color: 'text-cyan-400',   bg: 'bg-cyan-400/10' },
          ].map(({ icon: Icon, label, color, bg }) => (
            <div key={label} className="card p-3 flex flex-col items-center gap-1.5 text-center">
              <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
                <Icon size={15} className={color} />
              </div>
              <span className="text-xs text-slate-400 leading-tight">{label}</span>
            </div>
          ))}
        </motion.div>

        {/* Search */}
        <motion.div variants={fadeUp} className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search the manual…"
            className="input pl-9"
          />
        </motion.div>
      </motion.div>

      {/* Sections */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
        {filtered.length > 0
          ? filtered.map(s => <Section key={s.id} section={s} />)
          : (
            <motion.div variants={fadeUp} className="card p-10 text-center">
              <HelpCircle size={32} className="text-slate-600 mx-auto mb-3" />
              <div className="text-slate-400 text-sm">No results for "{search}"</div>
            </motion.div>
          )
        }
      </motion.div>

      {/* Footer tip */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="mt-8 p-4 rounded-xl bg-brand-500/5 border border-brand-500/20 flex gap-3 items-start"
      >
        <CheckCircle size={18} className="text-brand-400 shrink-0 mt-0.5" />
        <div className="text-sm text-slate-400">
          <span className="text-brand-400 font-semibold">Pro tip: </span>
          Use the <span className="text-white font-medium">AI Tutor</span> anytime you're stuck — it's available 24/7 and understands your code in context.
        </div>
      </motion.div>
    </div>
  )
}
