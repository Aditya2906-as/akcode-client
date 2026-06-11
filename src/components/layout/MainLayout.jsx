import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, BookOpen, Swords, Trophy, User,
  Code2, MessageSquare, Bot, Menu, X, LogOut,
  Flame, Star, Heart, Coins, ChevronRight, Settings, Award, Info, BookOpen
} from 'lucide-react'
import useAuthStore from '../../context/authStore'
import { xpProgress, levelTitle } from '../../utils/helpers'
import Avatar from '../ui/Avatar'
import BadgeNotification from '../ui/BadgeNotification'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard'   },
  { to: '/courses',    icon: BookOpen,         label: 'Courses'     },
  { to: '/challenges', icon: Swords,           label: 'Challenges'  },
  { to: '/ai-tutor',   icon: Bot,              label: 'AI Tutor'    },
  { to: '/forum',      icon: MessageSquare,    label: 'Forum'       },
  { to: '/snippets',   icon: Code2,            label: 'Snippets'    },
  { to: '/leaderboard',icon: Trophy,           label: 'Leaderboard' },
]

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout, newBadges, clearNewBadges } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  // Close sidebar on route change (mobile)
  useEffect(() => { setSidebarOpen(false) }, [location.pathname])

  const handleLogout = async () => {
    await logout()
    navigate('/auth/login', { replace: true })
    toast.success('Logged out successfully')
  }

  const progressPct = user ? xpProgress(user.xp, user.level) : 0

  return (
    <div className="flex h-screen bg-dark-950 overflow-hidden">
      {/* Badge notification overlay */}
      <AnimatePresence>
        {newBadges?.length > 0 && (
          <BadgeNotification badges={newBadges} onClose={clearNewBadges} />
        )}
      </AnimatePresence>

      {/* Sidebar Overlay (mobile) */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen || window.innerWidth >= 1024 ? 0 : -280 }}
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-dark-900 border-r border-dark-700
                    flex flex-col lg:translate-x-0 transition-transform duration-300`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-dark-700 flex items-center justify-between">
          <NavLink to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center">
              <span className="font-display font-bold text-brand-400 text-sm">AK</span>
            </div>
            <span className="font-display text-lg font-bold text-white">
              AK<span className="text-brand-400">.code</span>
            </span>
          </NavLink>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden btn-ghost p-1.5">
            <X size={18} />
          </button>
        </div>

        {/* User XP card */}
        {user && (
          <div className="mx-3 mt-3 p-3 rounded-xl bg-dark-800 border border-dark-600">
            <div className="flex items-center gap-2.5 mb-2">
              <Avatar avatar={user.avatar} username={user.username} size="sm" />
              <div className="min-w-0">
                <div className="font-display text-sm font-bold text-white truncate">{user.username}</div>
                <div className="text-xs text-slate-500">{levelTitle(user.level)}</div>
              </div>
              <div className="ml-auto text-right">
                <div className="font-display text-xs font-bold text-brand-400">Lv.{user.level}</div>
              </div>
            </div>
            {/* XP Bar */}
            <div className="xp-bar mb-1">
              <div className="xp-bar-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>{user.xp} XP</span>
              <span>{progressPct}%</span>
            </div>
            {/* Stats row */}
            <div className="flex items-center gap-3 mt-2 pt-2 border-t border-dark-600">
              <div className="flex items-center gap-1 text-xs text-orange-400">
                <Flame size={12} /> <span className="font-bold">{user.streak}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-red-400">
                <Heart size={12} /> <span className="font-bold">{user.hearts}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-yellow-400">
                <Coins size={12} /> <span className="font-bold">{user.totalCoins}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-purple-400 ml-auto">
                <Star size={12} /> <span className="font-bold">{user.badges?.length}</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1 mt-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => isActive ? 'nav-link-active' : 'nav-link'}
            >
              <Icon size={18} />
              <span>{label}</span>
              {to === '/ai-tutor' && (
                <span className="ml-auto text-xs px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 font-bold">AI</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom links */}
        <div className="p-3 border-t border-dark-700 space-y-1">
          <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-link-active' : 'nav-link'}>
            <User size={18} /> <span>Profile</span>
          </NavLink>
          <NavLink to="/badges" className={({ isActive }) => isActive ? 'nav-link-active' : 'nav-link'}>
            <Award size={18} /> <span>Badges</span>
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav-link-active' : 'nav-link'}>
            <Settings size={18} /> <span>Settings</span>
          </NavLink>
          <NavLink to="/About" className={({ isActive }) => isActive ? 'nav-link-active' : 'nav-link'}>
            <Info size={18} /> <span>About</span>
          </NavLink>
          <NavLink to="/UserManual" className={({ isActive }) => isActive ? 'nav-link-active' : 'nav-link'}>
            <BookOpen size={18} /> <span>Manual</span>
          </NavLink>
          <button onClick={handleLogout} className="nav-link w-full text-left text-red-400 hover:text-red-300 hover:bg-red-500/10">
            <LogOut size={18} /> <span>Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-dark-700 bg-dark-900">
          <button onClick={() => setSidebarOpen(true)} className="btn-ghost p-2">
            <Menu size={20} />
          </button>
          <NavLink to="/dashboard" className="font-display font-bold text-white text-lg">
            AK<span className="text-brand-400">.code</span>
          </NavLink>
          <NavLink to="/profile" className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400 font-bold text-sm">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </NavLink>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-dark-950">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
