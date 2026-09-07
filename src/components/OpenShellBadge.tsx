import { Popover } from '@patternfly/react-core'
import {
  LockIcon,
  NetworkIcon,
  KeyIcon,
  CpuIcon,
  ShieldAltIcon,
} from '@patternfly/react-icons'
import { MOCK_SANDBOX_STATE } from './agentSpaceMockData'

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

const LABEL: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
  letterSpacing: '0.5px', color: 'var(--pf-t--global--text--color--subtle)',
  marginBottom: 4, marginTop: 10,
  display: 'flex', alignItems: 'center', gap: 5,
}

const MONO: React.CSSProperties = {
  fontFamily: '"SF Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  fontSize: 12,
}

const s = MOCK_SANDBOX_STATE

const popoverBody = (
  <div style={{ fontSize: 13, lineHeight: 1.6, minWidth: 260 }}>
    {/* Image */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, ...MONO }}>
      <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>{s.image}</span>
      <span style={{
        fontSize: 11, padding: '0 5px', borderRadius: 4,
        background: '#76B90020', color: '#76B900', fontWeight: 500,
      }}>{s.tag}</span>
    </div>

    {/* Network */}
    <div style={LABEL}>
      <NetworkIcon style={{ fontSize: 11 }} />
      Network
    </div>
    <div style={{ fontSize: 12, color: 'var(--pf-t--global--text--color--regular)' }}>
      <span style={{ fontWeight: 600 }}>{s.networkPolicy}</span>
      <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>, {s.allowedHosts.length} allowed:</span>
    </div>
    <div style={{ paddingLeft: 2, marginTop: 2 }}>
      {s.allowedHosts.map(host => (
        <div key={host} style={{ ...MONO, color: 'var(--pf-t--global--text--color--regular)' }}>{host}</div>
      ))}
    </div>

    {/* Credentials */}
    <div style={LABEL}>
      <KeyIcon style={{ fontSize: 11 }} />
      Credentials
    </div>
    <div style={{ paddingLeft: 2 }}>
      {s.credentials.map(cred => (
        <div key={cred} style={{ fontSize: 12, color: 'var(--pf-t--global--text--color--regular)' }}>
          <LockIcon style={{ fontSize: 9, marginRight: 5, color: 'var(--pf-t--global--text--color--subtle)' }} />
          {cred}
        </div>
      ))}
    </div>

    {/* Resources */}
    <div style={LABEL}>
      <CpuIcon style={{ fontSize: 11 }} />
      Resources
    </div>
    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--pf-t--global--text--color--regular)' }}>
      <span>CPU: <span style={{ fontWeight: 500 }}>{s.cpu}</span></span>
      <span>Memory: <span style={{ fontWeight: 500 }}>{s.memory}</span></span>
    </div>

    {/* Policy source */}
    <div style={LABEL}>
      <ShieldAltIcon style={{ fontSize: 11 }} />
      Policy
    </div>
    <div style={{ ...MONO, fontSize: 11, color: 'var(--pf-t--global--text--color--subtle)' }}>
      {s.policySource}
    </div>
  </div>
)

export function OpenShellBadge() {
  return (
    <Popover
      headerContent="OpenShell Sandbox"
      bodyContent={popoverBody}
      position="bottom"
      maxWidth="360px"
      showClose={false}
    >
      <button
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '0 8px', borderRadius: 4, cursor: 'pointer',
          height: 28,
          fontSize: 13, fontWeight: 500,
          fontFamily: 'inherit',
          color: 'var(--pf-t--global--text--color--subtle)',
          background: 'transparent',
          border: 'none',
          transition: 'all 0.15s ease',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#76B900'; e.currentTarget.style.background = 'rgba(127,127,127,0.1)' }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--pf-t--global--text--color--subtle)'; e.currentTarget.style.background = 'transparent' }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', lineHeight: 0 }}>
          <OpenShellIcon size={14} />
        </span>
        <span className="openshell-label">OpenShell</span>
      </button>
    </Popover>
  )
}
