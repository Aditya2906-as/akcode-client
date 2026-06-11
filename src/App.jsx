import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import useAuthStore from './context/authStore'

// Layout
import MainLayout from './components/layout/MainLayout'
import AuthLayout from './components/layout/AuthLayout'

// Pages
import Landing        from './pages/Landing'
import Login          from './pages/auth/Login'
import Register       from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import VerifyOTP      from './pages/auth/VerifyOTP'
import ResetPassword  from './pages/auth/ResetPassword'
import Dashboard      from './pages/dashboard/Dashboard'
import Courses        from './pages/learn/Courses'
import CourseDetail   from './pages/learn/CourseDetail'
import LessonView     from './pages/learn/LessonView'
import Challenges     from './pages/challenges/Challenges'
import ChallengeView  from './pages/challenges/ChallengeView'
import Leaderboard    from './pages/leaderboard/Leaderboard'
import Profile        from './pages/profile/Profile'
import Snippets       from './pages/snippets/Snippets'
import Forum          from './pages/forum/Forum'
import ForumPost      from './pages/forum/ForumPost'
import AiTutor        from './pages/ai/AiTutor'
import QuizPage       from './pages/quiz/QuizPage'
import Settings       from './pages/profile/Settings'
import BadgeShowcase  from './pages/profile/BadgeShowcase'
import NotFound       from './pages/NotFound'

// ── Full-screen loader ────────────────────────────────────────────────────────
const PageLoader = () => (
  <div className="min-h-screen bg-dark-950 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center animate-pulse">
        <span className="font-display font-bold text-brand-400 text-lg">AK</span>
      </div>
      <div className="flex gap-1">
        {[0,1,2].map(i => (
          <div key={i} className="w-2 h-2 rounded-full bg-brand-500 animate-bounce"
               style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  </div>
)

// ── Route guards ──────────────────────────────────────────────────────────────
// Shows loader while auth is being checked, then redirects if needed
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore()
  if (loading) return <PageLoader />
  if (!user)   return <Navigate to="/auth/login" replace />
  return children
}

// Only redirects to dashboard AFTER auth check is complete and user IS logged in
// While loading → show loader (prevents flash redirect to dashboard)
const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuthStore()
  if (loading) return <PageLoader />
  if (user)    return <Navigate to="/dashboard" replace />
  return children
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const fetchMe = useAuthStore(s => s.fetchMe)
  useEffect(() => { fetchMe() }, [])

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#19232f',
            color: '#fff',
            border: '1px solid #1e2d3d',
            fontFamily: '"DM Sans", sans-serif'
          },
          success: { iconTheme: { primary: '#0de066', secondary: '#060a0f' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#060a0f' } },
          duration: 3000,
        }}
      />

      <Routes>
        {/* ── Public landing ── */}
        <Route path="/" element={<Landing />} />

        {/* ── Auth pages ── */}
        <Route path="/auth" element={<AuthLayout />}>
          {/* Login & Register only accessible when NOT logged in */}
          <Route path="login"    element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />

          {/* Password reset — accessible always (even if logged in, edge case) */}
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="verify-otp"      element={<VerifyOTP />} />
          <Route path="reset-password"  element={<ResetPassword />} />
        </Route>

        {/* ── Protected app pages ── */}
        <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="dashboard"         element={<Dashboard />} />
          <Route path="courses"           element={<Courses />} />
          <Route path="courses/:slug"     element={<CourseDetail />} />
          <Route path="lessons/:id"       element={<LessonView />} />
          <Route path="challenges"        element={<Challenges />} />
          <Route path="challenges/:slug"  element={<ChallengeView />} />
          <Route path="leaderboard"       element={<Leaderboard />} />
          <Route path="profile"           element={<Profile />} />
          <Route path="profile/:username" element={<Profile />} />
          <Route path="badges"            element={<BadgeShowcase />} />
          <Route path="snippets"          element={<Snippets />} />
          <Route path="forum"             element={<Forum />} />
          <Route path="forum/:id"         element={<ForumPost />} />
          <Route path="ai-tutor"          element={<AiTutor />} />
          <Route path="quiz/:id"          element={<QuizPage />} />
          <Route path="settings"          element={<Settings />} />
        </Route>

        {/* ── 404 ── */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
