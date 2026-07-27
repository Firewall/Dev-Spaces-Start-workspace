import type { CSSProperties } from 'react'
import { BRAND_ICONS } from './brandIconData'

interface BrandIconProps {
  id: string
  size?: number
  style?: CSSProperties
}

export function BrandIcon({ id, size = 16, style }: BrandIconProps) {
  const icon = BRAND_ICONS[id]
  if (!icon) return null
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
