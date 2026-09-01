import { type CSSProperties, useSyncExternalStore } from 'react'
import { BRAND_ICONS } from './brandIconData'

export function JiraIcon({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="jira-a" gradientUnits="userSpaceOnUse" x1="22.034" y1="9.773" x2="17.118" y2="14.842" gradientTransform="scale(4)"><stop offset=".176" stopColor="#0052cc"/><stop offset="1" stopColor="#2684ff"/></linearGradient>
        <linearGradient id="jira-b" gradientUnits="userSpaceOnUse" x1="16.641" y1="15.564" x2="10.957" y2="21.094" gradientTransform="scale(4)"><stop offset=".176" stopColor="#0052cc"/><stop offset="1" stopColor="#2684ff"/></linearGradient>
      </defs>
      <path d="M108.023 16H61.805c0 11.52 9.324 20.848 20.847 20.848h8.5v8.226c0 11.52 9.328 20.848 20.848 20.848V19.977A3.98 3.98 0 00108.023 16z" fill="#2684ff"/>
      <path d="M85.121 39.04H38.902c0 11.519 9.325 20.847 20.844 20.847h8.504v8.226c0 11.52 9.328 20.848 20.848 20.848V43.016a3.983 3.983 0 00-3.977-3.977z" fill="url(#jira-a)"/>
      <path d="M62.219 62.078H16c0 11.524 9.324 20.848 20.848 20.848h8.5v8.23c0 11.52 9.328 20.844 20.847 20.844V66.059a3.984 3.984 0 00-3.976-3.98z" fill="url(#jira-b)"/>
    </svg>
  )
}

const BASE = import.meta.env.BASE_URL

function subscribeTheme(cb: () => void) {
  const observer = new MutationObserver(cb)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  return () => observer.disconnect()
}

function getIsDark() {
  return document.documentElement.classList.contains('pf-v6-theme-dark')
}

interface BrandIconProps {
  id: string
  size?: number
  style?: CSSProperties
}

export function BrandIcon({ id, size = 16, style }: BrandIconProps) {
  const icon = BRAND_ICONS[id]
  const isDark = useSyncExternalStore(subscribeTheme, getIsDark)
  if (!icon) return null

  if (icon.src) {
    const src = isDark && icon.srcDark ? icon.srcDark : icon.src
    return (
      <img
        src={`${BASE}${src}`}
        alt=""
        width={size}
        height={size}
        role="img"
        style={{ flexShrink: 0, objectFit: 'contain', display: 'block', ...style }}
      />
    )
  }

  const vb = icon.viewBox ?? 24
  return (
    <svg
      viewBox={`0 0 ${vb} ${vb}`}
      width={size}
      height={size}
      fill={icon.color}
      role="img"
      style={{ flexShrink: 0, ...style }}
    >
      {icon.paths
        ? icon.paths.map((p, i) => <path key={i} d={p.d} fill={p.fill} />)
        : <path d={icon.path} />
      }
    </svg>
  )
}
