import {
  CodeBranchIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InProgressIcon,
  ExternalLinkAltIcon,
  ShieldAltIcon,
  GithubIcon,
} from '@patternfly/react-icons'
import type { ThreadContext } from './agentSpaceMockData'
import type { LinkedIssue } from './agentSpaceTypes'
import { JiraIcon } from './BrandIcons'

const CI_ICON: Record<string, { icon: typeof CheckCircleIcon; color: string }> = {
  passed: { icon: CheckCircleIcon, color: 'var(--pf-t--global--color--status--success--default)' },
  failed: { icon: ExclamationCircleIcon, color: 'var(--pf-t--global--color--status--danger--default)' },
  pending: { icon: InProgressIcon, color: 'var(--pf-t--global--color--status--warning--default)' },
}

const PR_STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  open: { bg: '#1a7f3720', color: '#1a7f37' },
  draft: { bg: '#8b949e20', color: '#8b949e' },
  merged: { bg: '#8957e520', color: '#8957e5' },
  closed: { bg: '#da363420', color: '#da3634' },
}

const SECTION_HEADER: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
  letterSpacing: '0.5px', color: 'var(--pf-t--global--text--color--subtle)',
  marginBottom: 6, marginTop: 16,
}

export function ThreadContextCard({ context, agentBranch, issue }: { context: ThreadContext; agentBranch?: string; issue?: LinkedIssue }) {
  const branch = agentBranch ?? context.branch

  return (
    <div style={{ padding: '12px 16px', fontSize: 13 }}>
      {/* Repo & branch */}
      <div style={{ marginBottom: 4, fontSize: 12, color: 'var(--pf-t--global--text--color--subtle)' }}>
        {context.repo}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <CodeBranchIcon style={{ fontSize: 13, color: 'var(--pf-t--global--text--color--subtle)' }} />
        <span style={{
          fontFamily: 'var(--pf-t--global--font--family--mono)', fontSize: 12,
          padding: '1px 6px', borderRadius: 4,
          background: 'var(--pf-t--global--background--color--action--plain--hover)',
          color: 'var(--pf-t--global--text--color--regular)',
        }}>
          {branch}
        </span>
        {context.pushed === false && (
          <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 4, background: '#8b949e20', color: '#8b949e', fontWeight: 500 }}>
            not pushed
          </span>
        )}
        {context.ci && (() => {
          const ci = CI_ICON[context.ci.status]
          const Icon = ci.icon
          return (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: ci.color }}>
              <Icon style={{ fontSize: 12 }} />
              CI {context.ci.status} ({context.ci.duration})
            </span>
          )
        })()}
      </div>

      {/* Linked issue */}
      {issue && (
        <>
          <div style={SECTION_HEADER}>
            {issue.source === 'github' ? <GithubIcon style={{ fontSize: 11, marginRight: 4 }} /> : <JiraIcon size={11} />}
            Linked issue
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
            <span style={{
              fontSize: 11, padding: '0 5px', borderRadius: 4,
              background: PR_STATUS_STYLE[issue.status]?.bg ?? PR_STATUS_STYLE.open.bg,
              color: PR_STATUS_STYLE[issue.status]?.color ?? PR_STATUS_STYLE.open.color,
              fontWeight: 500, flexShrink: 0,
            }}>
              {issue.status}
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontFamily: 'var(--pf-t--global--font--family--mono)', fontSize: 12, color: 'var(--pf-t--global--text--color--link--default)' }}>
                  {issue.source === 'github' ? `#${issue.number}` : issue.id}
                </span>
                <span style={{ color: 'var(--pf-t--global--text--color--regular)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {issue.title}
                </span>
              </div>
              {issue.description && (
                <div style={{ fontSize: 12, color: 'var(--pf-t--global--text--color--subtle)', marginTop: 2, lineHeight: 1.4 }}>
                  {issue.description.length > 120 ? issue.description.slice(0, 120) + '...' : issue.description}
                </div>
              )}
            </div>
          </div>
          {issue.pr && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, paddingLeft: 2 }}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill={PR_STATUS_STYLE[issue.pr.status]?.color ?? '#1a7f37'}>
                <path d="M7.177 3.073L9.573.677A.25.25 0 0110 .854v4.792a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354zM3.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122v5.256a2.251 2.251 0 11-1.5 0V5.372A2.25 2.25 0 011.5 3.25zM11 2.5h-1V4h1a1 1 0 011 1v5.628a2.251 2.251 0 101.5 0V5A2.5 2.5 0 0011 2.5zm1 10.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM3.75 12a.75.75 0 100 1.5.75.75 0 000-1.5z"/>
              </svg>
              <span style={{
                fontSize: 11, padding: '0 5px', borderRadius: 4,
                background: PR_STATUS_STYLE[issue.pr.status]?.bg ?? PR_STATUS_STYLE.open.bg,
                color: PR_STATUS_STYLE[issue.pr.status]?.color ?? PR_STATUS_STYLE.open.color,
                fontWeight: 500,
              }}>
                {issue.pr.status}
              </span>
              <span style={{ fontFamily: 'var(--pf-t--global--font--family--mono)', fontSize: 12, color: 'var(--pf-t--global--text--color--link--default)' }}>
                #{issue.pr.number}
              </span>
              <span style={{ fontSize: 12, color: 'var(--pf-t--global--text--color--regular)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {issue.pr.title}
              </span>
            </div>
          )}
        </>
      )}

      {/* Open PRs */}
      {context.prs && context.prs.length > 0 && (
        <>
          <div style={SECTION_HEADER}>Open PRs</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {context.prs.map(pr => {
              const ci = CI_ICON[pr.ciStatus]
              const Icon = ci.icon
              const st = PR_STATUS_STYLE[pr.status] ?? PR_STATUS_STYLE.open
              return (
                <div key={pr.number} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    fontSize: 11, padding: '0 5px', borderRadius: 4,
                    background: st.bg, color: st.color, fontWeight: 500,
                  }}>
                    {pr.status}
                  </span>
                  <span style={{ fontFamily: 'var(--pf-t--global--font--family--mono)', fontSize: 12, color: 'var(--pf-t--global--text--color--link--default)' }}>
                    #{pr.number}
                  </span>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--pf-t--global--text--color--regular)' }}>
                    {pr.title}
                  </span>
                  <Icon style={{ fontSize: 12, color: ci.color, flexShrink: 0 }} />
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Developer Hub */}
      {context.catalog && context.catalog.length > 0 && (
        <>
          <div style={SECTION_HEADER}>Developer Hub</div>
          {context.catalog.map(entry => (
            <div key={entry.component} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <span style={{ color: 'var(--pf-t--global--text--color--regular)' }}>{entry.component}</span>
              <span style={{ fontSize: 11, color: 'var(--pf-t--global--text--color--subtle)' }}>({entry.owner})</span>
              <ExternalLinkAltIcon style={{ fontSize: 10, color: 'var(--pf-t--global--text--color--link--default)', cursor: 'pointer' }} />
            </div>
          ))}
        </>
      )}

      {/* Policies */}
      {context.policies && context.policies.length > 0 && (
        <>
          <div style={SECTION_HEADER}>
            <ShieldAltIcon style={{ fontSize: 11, marginRight: 4 }} />
            Policies
          </div>
          {context.policies.map(p => (
            <div key={p.label} style={{ fontSize: 12, color: 'var(--pf-t--global--text--color--regular)', marginBottom: 2 }}>
              {p.label}
            </div>
          ))}
        </>
      )}
    </div>
  )
}
