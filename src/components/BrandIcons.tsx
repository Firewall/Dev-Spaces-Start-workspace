import { type CSSProperties, useSyncExternalStore } from 'react'
import { BRAND_ICONS } from './brandIconData'

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
        style={{ flexShrink: 0, objectFit: 'contain', ...style }}
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
