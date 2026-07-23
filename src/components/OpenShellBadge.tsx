import { useState } from 'react'
import { Tooltip } from '@patternfly/react-core'

function OpenShellIcon({ size = 14 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="12 7 78 88" width={size} height={size}>
      <path d="M50 9 L84 23 V51 C84 72 69 86 50 92 C31 86 16 72 16 51 V23 Z" fill="#76B900" />
      <g fill="none" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M37 41 L49 50 L37 59" />
        <path d="M55 59 H67" />
      </g>
    </svg>
  )
}

const TOOLTIP_CONTENT = (
  <div style={{ maxWidth: 260, fontSize: 13, lineHeight: 1.5 }}>
    <div style={{ fontWeight: 600, marginBottom: 4 }}>OpenShell Sandbox</div>
    <div>
      This agent runs inside an isolated OpenShell container with
      restricted network, filesystem, and process access.
    </div>
  </div>
)

export function OpenShellBadge() {
  const [hovered, setHovered] = useState(false)

  return (
    <Tooltip content={TOOLTIP_CONTENT}>
      <span
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '1px 6px', borderRadius: 4, cursor: 'default', position: 'relative', top: 2,
          fontSize: 11, fontWeight: 500,
          color: hovered
            ? '#76B900'
            : 'var(--pf-t--global--text--color--subtle)',
          background: hovered ? 'rgba(127,127,127,0.1)' : 'transparent',
          transition: 'all 0.15s ease',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', lineHeight: 0 }}>
          <OpenShellIcon size={14} />
        </span>
        OpenShell
      </span>
    </Tooltip>
  )
}
