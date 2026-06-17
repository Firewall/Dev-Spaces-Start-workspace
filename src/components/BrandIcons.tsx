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
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={icon.color}
      role="img"
      style={{ flexShrink: 0, ...style }}
    >
      <path d={icon.path} />
    </svg>
  )
}
