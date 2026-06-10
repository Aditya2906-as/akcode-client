// XP thresholds per level
const XP_THRESHOLDS = [0, 500, 1200, 2200, 3500, 5200, 7200, 9700, 12700, 16200, 20000]

export const xpForLevel = (level) => XP_THRESHOLDS[Math.min(level - 1, XP_THRESHOLDS.length - 1)]
export const xpForNextLevel = (level) => XP_THRESHOLDS[Math.min(level, XP_THRESHOLDS.length - 1)]

export const xpProgress = (xp, level) => {
  const curr = xpForLevel(level)
  const next = xpForNextLevel(level)
  if (next === curr) return 100
  return Math.min(100, Math.round(((xp - curr) / (next - curr)) * 100))
}

export const difficultyColor = (d) => ({
  Easy:         'badge-easy',
  Beginner:     'badge-easy',
  Medium:       'badge-medium',
  Intermediate: 'badge-medium',
  Hard:         'badge-hard',
  Advanced:     'badge-hard',
  Expert:       'badge-expert',
}[d] || 'badge-easy')

export const langClass = (lang) => `lang-${lang?.toLowerCase()}`

export const langLabel = (lang) => ({
  python:     'Python',
  javascript: 'JavaScript',
  java:       'Java',
  cpp:        'C++',
  html:       'HTML/CSS',
  sql:        'SQL',
  typescript: 'TypeScript',
  rust:       'Rust',
  go:         'Go',
}[lang?.toLowerCase()] || lang)

export const langIcon = (lang) => ({
  python:     '🐍',
  javascript: '⚡',
  java:       '☕',
  cpp:        '⚙️',
  html:       '🎨',
  sql:        '🗃️',
  typescript: '🔷',
  rust:       '🦀',
  go:         '🐹',
}[lang?.toLowerCase()] || '💻')

export const formatDate = (date) => {
  if (!date) return ''
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date))
}

export const timeAgo = (date) => {
  const now = Date.now()
  const diff = now - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)   return 'just now'
  if (mins < 60)  return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)   return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30)  return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

export const levelTitle = (level) => {
  if (level <= 2)  return 'Script Kiddie'
  if (level <= 4)  return 'Code Padawan'
  if (level <= 6)  return 'Dev Apprentice'
  if (level <= 8)  return 'Code Ninja'
  if (level <= 10) return 'Algorithm Ace'
  return 'Code Legend'
}

export const truncate = (str, n = 80) => str?.length > n ? str.slice(0, n) + '...' : str
