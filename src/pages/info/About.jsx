import { motion } from 'framer-motion'
import {
  Swords, BookOpen, Bot, Trophy, MessageSquare, Code2,
  Flame, Zap, Target, Users, Award, Shield, Star,
  GraduationCap, TrendingUp, Heart, Sparkles, CheckCircle2
} from 'lucide-react'
import { Link } from 'react-router-dom'

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }
const stagger = { show: { transition: { staggerChildren: 0.08 } } }

const features = [
  {
    icon: BookOpen,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/20',
    title: 'Structured Courses',
    desc: 'Step-by-step learning paths covering languages from Python and JavaScript to C++ and more. Theory, examples, and quizzes in one place.',
  },
  {
    icon: Swords,
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    border: 'border-orange-400/20',
    title: 'Coding Challenges',
    desc: 'Hundreds of challenges across four difficulty levels — from beginner-friendly exercises to expert-grade algorithmic problems.',
  },
  {
    icon: Bot,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    border: 'border-purple-400/20',
    title: 'AI-Powered Tutor',
    desc: 'Get instant, contextual help from an AI tutor. Ask questions, request code reviews, or get hints without spoiling the challenge.',
  },
  {
    icon: Trophy,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/20',
    title: 'Gamified Progress',
    desc: 'Earn XP, level up, maintain daily streaks, and unlock badges as you grow. Learning is rewarding when progress is visible.',
  },
  {
    icon: MessageSquare,
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
    border: 'border-cyan-400/20',
    title: 'Community Forum',
    desc: 'Ask questions, share solutions, and learn alongside thousands of other developers. The best programmers learn together.',
  },
  {
    icon: Code2,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/20',
    title: 'Code Snippets',
    desc: 'Save and organise reusable code snippets. Build your personal reference library of algorithms, patterns, and utilities.',
  },
]

const whyItems = [
  { icon: Target,      text: 'Goal-oriented curriculum that takes you from zero to job-ready' },
  { icon: Zap,         text: 'Instant feedback on code submissions with detailed test results' },
  { icon: Flame,       text: 'Daily streaks and rewards keep you consistent and motivated' },
  { icon: Users,       text: 'Active community of learners and mentors to support your journey' },
  { icon: Shield,      text: 'All skill levels welcome — beginner to advanced paths available' },
  { icon: TrendingUp,  text: 'Track measurable growth with XP, levels, and challenge history' },
]

const stats = [
  { value: '50+',   label: 'Courses',         icon: GraduationCap },
  { value: '500+',  label: 'Challenges',       icon: Swords },
  { value: '24/7',  label: 'AI Tutor Support', icon: Bot },
  { value: '∞',     label: 'Possibilities',    icon: Sparkles },
]

export default function About() {
  return (
    <div className="min-h-full p-4 md:p-8 max-w-3xl mx-auto">

      {/* Hero */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="mb-10">
        <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
            <span className="font-display font-bold text-brand-400 text-lg">AK</span>
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-white">
              About AK<span className="text-brand-400">.code</span>
            </h1>
            <p className="text-slate-500 text-sm">Learn to code. Level up. Ship things.</p>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="card p-5 bg-gradient-to-br from-brand-500/5 to-transparent border-brand-500/20">
          <p className="text-slate-300 text-sm leading-relaxed">
            <span className="text-brand-400 font-semibold">AK.code</span> is an interactive coding education platform designed to make learning programming
            engaging, structured, and effective. Whether you're picking up your first language or sharpening
            competitive programming skills, AK.code gives you the tools, challenges, and community to grow fast.
          </p>
        </motion.div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        {stats.map(({ value, label, icon: Icon }) => (
          <motion.div key={label} variants={fadeUp} className="card p-4 text-center">
            <Icon size={18} className="text-brand-400 mx-auto mb-2" />
            <div className="font-display text-2xl font-bold text-white">{value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Our Purpose */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="mb-10">
        <motion.h2 variants={fadeUp} className="section-title mb-1">Our Purpose</motion.h2>
        <motion.p variants={fadeUp} className="text-slate-500 text-sm mb-5">Why AK.code exists</motion.p>
        <motion.div variants={fadeUp} className="card p-5 space-y-3">
          <p className="text-slate-300 text-sm leading-relaxed">
            Traditional programming tutorials are either too passive (watch a video, copy-paste code) or
            too abstract (read docs, figure the rest out yourself). <span className="text-white font-medium">AK.code bridges that gap.</span>
          </p>
          <p className="text-slate-300 text-sm leading-relaxed">
            We believe the best way to learn code is to <span className="text-brand-400 font-medium">write code</span> — with instant feedback,
            real challenges, and an AI mentor that meets you exactly where you are. Pair that with a streak
            system and leaderboard, and progress stops feeling like a chore.
          </p>
          <p className="text-slate-300 text-sm leading-relaxed">
            Our goal is simple: help every learner go from writing their first "Hello World" to solving
            real-world algorithmic problems — with confidence, speed, and a solid community behind them.
          </p>
        </motion.div>
      </motion.div>

      {/* Why use AK.code */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="mb-10">
        <motion.h2 variants={fadeUp} className="section-title mb-1">Why Use AK.code?</motion.h2>
        <motion.p variants={fadeUp} className="text-slate-500 text-sm mb-5">What sets us apart</motion.p>
        <motion.div variants={stagger} className="space-y-2.5">
          {whyItems.map(({ icon: Icon, text }) => (
            <motion.div key={text} variants={fadeUp} className="card p-3.5 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0">
                <Icon size={15} className="text-brand-400" />
              </div>
              <span className="text-slate-300 text-sm leading-relaxed pt-0.5">{text}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Feature Grid */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="mb-10">
        <motion.h2 variants={fadeUp} className="section-title mb-1">Platform Features</motion.h2>
        <motion.p variants={fadeUp} className="text-slate-500 text-sm mb-5">Everything included in AK.code</motion.p>
        <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {features.map(({ icon: Icon, color, bg, border, title, desc }) => (
            <motion.div key={title} variants={fadeUp} className="card p-4 flex gap-3">
              <div className={`w-9 h-9 rounded-lg ${bg} border ${border} flex items-center justify-center shrink-0 mt-0.5`}>
                <Icon size={16} className={color} />
              </div>
              <div>
                <div className="font-display font-bold text-white text-sm mb-1">{title}</div>
                <div className="text-xs text-slate-400 leading-relaxed">{desc}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Who it's for */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="card p-5 bg-gradient-to-br from-dark-800 to-dark-900 border-brand-500/20 mb-6"
      >
        <div className="flex items-center gap-2 mb-3">
          <Heart size={16} className="text-red-400" />
          <h3 className="font-display font-bold text-white text-sm">Who is AK.code for?</h3>
        </div>
        <div className="space-y-2">
          {[
            'Beginners taking their first steps into programming',
            'Students looking to strengthen their CS fundamentals',
            'Developers preparing for coding interviews',
            'Experienced coders who want to stay sharp and competitive',
          ].map(item => (
            <div key={item} className="flex items-start gap-2">
              <CheckCircle2 size={13} className="text-brand-400 shrink-0 mt-0.5" />
              <span className="text-slate-300 text-xs">{item}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="text-center"
      >
        <Link to="/dashboard" className="btn-primary inline-flex">
          <Star size={15} />
          Back to Dashboard
        </Link>
        <p className="text-slate-600 text-xs mt-3">Questions? Use the AI Tutor or visit the Forum</p>
      </motion.div>
    </div>
  )
}
