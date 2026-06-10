import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Lock, Palette, Code2, Save, Eye, EyeOff } from 'lucide-react'
import api from '../../utils/api'
import useAuthStore from '../../context/authStore'
import toast from 'react-hot-toast'
import { langIcon, langLabel } from '../../utils/helpers'
import Avatar from '../../components/ui/Avatar'

const LANGUAGES = ['python','javascript','java','cpp','html','sql','typescript','rust','go']
const AVATARS   = ['😎','🧑‍💻','👩‍💻','🦸','🧙','🦊','🐺','🦁','🐯','🦉','🦅','🐉']

export default function Settings() {
  const { user, updateUser } = useAuthStore()
  const [tab, setTab] = useState('profile')
  const [saving, setSaving] = useState(false)

  const [profile, setProfile] = useState({
    bio: user?.bio || '',
    githubUrl: user?.githubUrl || '',
    avatar: user?.avatar || '',
    preferredLanguage: user?.preferredLanguage || 'javascript',
    theme: user?.theme || 'dark',
    fontSize: user?.fontSize || 14,
  })

  const [passwords, setPasswords] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  })
  const [showPw, setShowPw] = useState(false)

  const saveProfile = async () => {
    setSaving(true)
    try {
      const r = await api.put('/users/profile', profile)
      updateUser(r.data.user)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save')
    }
    setSaving(false)
  }

  const changePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error('Passwords do not match')
    }
    if (passwords.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters')
    }
    setSaving(true)
    try {
      await api.put('/users/password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      })
      toast.success('Password changed!')
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password')
    }
    setSaving(false)
  }

  const tabs = [
    { id: 'profile',    icon: User,    label: 'Profile'    },
    { id: 'security',   icon: Lock,    label: 'Security'   },
    { id: 'appearance', icon: Palette, label: 'Appearance' },
    { id: 'editor',     icon: Code2,   label: 'Editor'     },
  ]

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white mb-1">Settings</h1>
        <p className="text-slate-400">Manage your account and preferences</p>
      </motion.div>

      <div className="flex gap-1 mb-6 bg-dark-800 rounded-xl p-1 border border-dark-600">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${
              tab === t.id
                ? 'bg-dark-600 text-white'
                : 'text-slate-400 hover:text-white'}`}>
            <t.icon size={14} />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="card p-6">

        {/* PROFILE */}
        {tab === 'profile' && (
          <div className="space-y-5">
            <h2 className="font-display text-lg font-bold text-white">Profile Info</h2>

            {/* Avatar picker */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Avatar</label>

              {/* Current avatar preview */}
              {profile.avatar && (
                <div className="flex items-center gap-3 mb-3 p-3 rounded-xl bg-dark-700 border border-dark-600">
                  <Avatar avatar={profile.avatar} username={user?.username || ''} size="lg" />
                  <div>
                    <p className="text-sm font-medium text-white">Current Avatar</p>
                    <button onClick={() => setProfile(p => ({ ...p, avatar: '' }))}
                      className="text-xs text-red-400 hover:text-red-300 mt-0.5">
                      Remove avatar
                    </button>
                  </div>
                </div>
              )}

              <p className="text-xs text-slate-500 mb-2">Choose an emoji avatar:</p>
              <div className="flex flex-wrap gap-2">
                {AVATARS.map(a => (
                  <button key={a} onClick={() => setProfile(p => ({ ...p, avatar: a }))}
                    className={`w-10 h-10 rounded-xl text-xl transition-all ${
                      profile.avatar === a
                        ? 'bg-brand-500/30 border-2 border-brand-500'
                        : 'bg-dark-700 border border-dark-500 hover:border-dark-400'}`}>
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Bio</label>
              <textarea value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                placeholder="Tell the community about yourself..."
                className="input resize-none h-24"
                maxLength={200} />
              <div className="text-xs text-slate-600 text-right">{profile.bio.length}/200</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">GitHub URL</label>
              <input type="url" value={profile.githubUrl}
                onChange={e => setProfile(p => ({ ...p, githubUrl: e.target.value }))}
                placeholder="https://github.com/yourusername"
                className="input" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Preferred Language</label>
              <div className="grid grid-cols-3 gap-2">
                {LANGUAGES.map(lang => (
                  <button key={lang} onClick={() => setProfile(p => ({ ...p, preferredLanguage: lang }))}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                      profile.preferredLanguage === lang
                        ? 'border-brand-500 bg-brand-500/20 text-brand-400'
                        : 'border-dark-500 bg-dark-700 text-slate-400 hover:border-dark-400'}`}>
                    {langIcon(lang)} {langLabel(lang)}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={saveProfile} disabled={saving} className="btn-primary w-full justify-center">
              {saving ? '...' : <><Save size={16} /> Save Profile</>}
            </button>
          </div>
        )}

        {/* SECURITY */}
        {tab === 'security' && (
          <div className="space-y-5">
            <h2 className="font-display text-lg font-bold text-white">Security</h2>
            <div className="p-4 rounded-xl bg-dark-700 border border-dark-500 text-sm text-slate-400">
              <div className="font-medium text-white mb-1">Account Email</div>
              <div>{user?.email}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Current Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={passwords.currentPassword}
                  onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))}
                  className="input pr-10" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">New Password</label>
              <input type="password" value={passwords.newPassword}
                onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))}
                className="input" placeholder="Min 6 characters" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm New Password</label>
              <input type="password" value={passwords.confirmPassword}
                onChange={e => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))}
                className={`input ${passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword ? 'border-red-500' : ''}`}
                placeholder="Repeat new password" />
            </div>

            <button onClick={changePassword} disabled={saving} className="btn-primary w-full justify-center">
              {saving ? '...' : <><Lock size={16} /> Change Password</>}
            </button>
          </div>
        )}

        {/* APPEARANCE */}
        {tab === 'appearance' && (
          <div className="space-y-5">
            <h2 className="font-display text-lg font-bold text-white">Appearance</h2>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Theme</label>
              <div className="grid grid-cols-2 gap-3">
                {['dark', 'darker'].map(t => (
                  <button key={t} onClick={() => setProfile(p => ({ ...p, theme: t }))}
                    className={`p-4 rounded-xl border text-sm font-medium capitalize transition-all ${
                      profile.theme === t
                        ? 'border-brand-500 bg-brand-500/10 text-brand-400'
                        : 'border-dark-500 bg-dark-700 text-slate-400 hover:border-dark-400'}`}>
                    {t === 'dark' ? '🌙 Dark' : '⬛ Darker'}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={saveProfile} disabled={saving} className="btn-primary w-full justify-center">
              {saving ? '...' : <><Save size={16} /> Save</>}
            </button>
          </div>
        )}

        {/* EDITOR */}
        {tab === 'editor' && (
          <div className="space-y-5">
            <h2 className="font-display text-lg font-bold text-white">Editor Preferences</h2>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Font Size: <span className="text-brand-400 font-bold">{profile.fontSize}px</span>
              </label>
              <input type="range" min={10} max={24} value={profile.fontSize}
                onChange={e => setProfile(p => ({ ...p, fontSize: Number(e.target.value) }))}
                className="w-full accent-brand-500" />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>10px</span><span>24px</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-dark-900 border border-dark-600 font-code text-sm" style={{ fontSize: `${profile.fontSize}px` }}>
              <span className="text-blue-400">def </span>
              <span className="text-brand-400">hello</span>
              <span className="text-white">():</span>
              <br />
              <span className="text-slate-400">    </span>
              <span className="text-blue-400">print</span>
              <span className="text-white">(</span>
              <span className="text-orange-400">"Hello, AK.code!"</span>
              <span className="text-white">)</span>
            </div>
            <button onClick={saveProfile} disabled={saving} className="btn-primary w-full justify-center">
              {saving ? '...' : <><Save size={16} /> Save Editor Settings</>}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
