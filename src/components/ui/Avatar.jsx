/**
 * Avatar component
 * Handles:
 *   - Emoji avatar (single character like "😎")  → renders as large text
 *   - URL avatar (starts with http/https or /)   → renders as <img>
 *   - No avatar                                  → renders first letter of username
 */
export default function Avatar({ avatar, username = '?', size = 'md', className = '' }) {
  const sizeMap = {
    xs:  'w-6 h-6 text-xs',
    sm:  'w-8 h-8 text-sm',
    md:  'w-10 h-10 text-base',
    lg:  'w-14 h-14 text-2xl',
    xl:  'w-20 h-20 text-4xl',
  }

  const base = `rounded-full bg-brand-500/20 border border-brand-500/30 
                flex items-center justify-center font-bold text-brand-400 
                overflow-hidden flex-shrink-0 ${sizeMap[size] || sizeMap.md} ${className}`

  // Check if it's a URL
  const isURL = avatar && (avatar.startsWith('http') || avatar.startsWith('/') || avatar.startsWith('data:'))

  // Check if it's an emoji (length 1-2 chars, not a letter/number)
  const isEmoji = avatar && !isURL && avatar.length <= 2

  if (isURL) {
    return (
      <div className={base}>
        <img
          src={avatar}
          alt={username}
          className="w-full h-full object-cover"
          onError={e => {
            // On broken URL, show first letter fallback
            e.currentTarget.style.display = 'none'
            e.currentTarget.parentElement.setAttribute('data-fallback', username[0]?.toUpperCase() || '?')
          }}
        />
      </div>
    )
  }

  if (isEmoji) {
    return (
      <div className={base} style={{ fontSize: size === 'xl' ? '2rem' : size === 'lg' ? '1.5rem' : '1rem' }}>
        {avatar}
      </div>
    )
  }

  // Fallback: first letter of username
  return (
    <div className={base}>
      {username?.[0]?.toUpperCase() || '?'}
    </div>
  )
}
