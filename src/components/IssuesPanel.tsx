import { Tooltip } from '@patternfly/react-core'
import {
  CodeBranchIcon,
  ExternalLinkAltIcon,
  GithubIcon,
} from '@patternfly/react-icons'
import type { LinkedIssue } from './agentSpaceTypes'
import { JiraIcon } from './AgentSidebar'

const MONO_FONT = '"SF Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  'open': { bg: '#1a7f3720', color: '#1a7f37' },
  'in-progress': { bg: '#1f6feb20', color: '#1f6feb' },
  'closed': { bg: '#8b949e20', color: '#8b949e' },
  'merged': { bg: '#8957e520', color: '#8957e5' },
}

const PR_STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  'open': { bg: '#1a7f3720', color: '#1a7f37', label: 'Open' },
  'draft': { bg: '#8b949e20', color: '#8b949e', label: 'Draft' },
  'merged': { bg: '#8957e520', color: '#8957e5', label: 'Merged' },
  'closed': { bg: '#cf222e20', color: '#cf222e', label: 'Closed' },
}

function SourceIcon({ source }: { source: 'github' | 'jira' }) {
  if (source === 'github') return <GithubIcon style={{ fontSize: 14 }} />
  return <JiraIcon size={14} />
}

function Badge({ children, bg, color }: { children: React.ReactNode; bg: string; color: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 11, fontWeight: 500,
      padding: '2px 8px', borderRadius: 12,
      background: bg, color,
    }}>
      {children}
    </span>
  )
}

export function IssuesPanel({ issue }: { issue: LinkedIssue }) {
  const statusStyle = STATUS_STYLES[issue.status] ?? STATUS_STYLES['open']

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--pf-t--global--border--color--default)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <SourceIcon source={issue.source} />
        <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>
          {issue.source === 'github' ? 'GitHub Issue' : 'Jira Ticket'}
        </span>
        <Tooltip content="Open in browser">
          <a
            href={issue.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center',
              color: 'var(--pf-t--global--text--color--subtle)',
              fontSize: 13,
            }}
          >
            <ExternalLinkAltIcon />
          </a>
        </Tooltip>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {/* Issue ID + Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{
            fontFamily: MONO_FONT, fontSize: 13, fontWeight: 600,
            color: 'var(--pf-t--global--text--color--link--default)',
          }}>
            {issue.source === 'github' ? `#${issue.number}` : issue.id}
          </span>
          <Badge bg={statusStyle.bg} color={statusStyle.color}>
            {issue.status.replace('-', ' ')}
          </Badge>
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: 15, fontWeight: 600, margin: '0 0 12px 0',
          color: 'var(--pf-t--global--text--color--regular)',
          lineHeight: 1.4,
        }}>
          {issue.title}
        </h3>

        {/* Description */}
        <p style={{
          fontSize: 13, lineHeight: 1.6, margin: '0 0 20px 0',
          color: 'var(--pf-t--global--text--color--subtle)',
        }}>
          {issue.description}
        </p>

        {/* Metadata grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Labels */}
          {issue.labels && issue.labels.length > 0 && (
            <div>
              <div style={{
                fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: '0.5px', marginBottom: 6,
                color: 'var(--pf-t--global--text--color--subtle)',
              }}>
                Labels
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {issue.labels.map(label => (
                  <span key={label} style={{
                    fontSize: 11, padding: '2px 8px', borderRadius: 12,
                    border: '1px solid var(--pf-t--global--border--color--default)',
                    color: 'var(--pf-t--global--text--color--regular)',
                  }}>
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Assignee */}
          {issue.assignee && (
            <div>
              <div style={{
                fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: '0.5px', marginBottom: 4,
                color: 'var(--pf-t--global--text--color--subtle)',
              }}>
                Assignee
              </div>
              <span style={{ fontSize: 13, color: 'var(--pf-t--global--text--color--regular)' }}>
                {issue.assignee}
              </span>
            </div>
          )}

          {/* Branch */}
          {issue.branch && (
            <div>
              <div style={{
                fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: '0.5px', marginBottom: 4,
                color: 'var(--pf-t--global--text--color--subtle)',
              }}>
                Branch
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CodeBranchIcon style={{ fontSize: 12, color: 'var(--pf-t--global--text--color--subtle)' }} />
                <span style={{
                  fontFamily: MONO_FONT, fontSize: 12,
                  color: 'var(--pf-t--global--text--color--regular)',
                }}>
                  {issue.branch}
                </span>
              </div>
            </div>
          )}

          {/* Pull Request */}
          {issue.pr && (() => {
            const prStyle = PR_STATUS_STYLES[issue.pr.status] ?? PR_STATUS_STYLES['open']
            return (
              <div>
                <div style={{
                  fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                  letterSpacing: '0.5px', marginBottom: 6,
                  color: 'var(--pf-t--global--text--color--subtle)',
                }}>
                  Pull Request
                </div>
                <a
                  href={issue.pr.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    padding: '10px 12px',
                    border: '1px solid var(--pf-t--global--border--color--default)',
                    borderRadius: 8,
                    textDecoration: 'none',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--pf-t--global--background--color--secondary--default)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill={prStyle.color} style={{ flexShrink: 0, marginTop: 1 }}>
                    <path d="M7.177 3.073L9.573.677A.25.25 0 0110 .854v4.792a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354zM3.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122v5.256a2.251 2.251 0 11-1.5 0V5.372A2.25 2.25 0 011.5 3.25zM11 2.5h-1V4h1a1 1 0 011 1v5.628a2.251 2.251 0 101.5 0V5A2.5 2.5 0 0011 2.5zm1 10.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM3.75 12a.75.75 0 100 1.5.75.75 0 000-1.5z"/>
                  </svg>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        fontFamily: MONO_FONT, fontSize: 12,
                        color: 'var(--pf-t--global--text--color--subtle)',
                      }}>
                        #{issue.pr.number}
                      </span>
                      <Badge bg={prStyle.bg} color={prStyle.color}>
                        {prStyle.label}
                      </Badge>
                    </div>
                    <div style={{
                      fontSize: 13, marginTop: 3,
                      color: 'var(--pf-t--global--text--color--regular)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {issue.pr.title}
                    </div>
                  </div>
                  <ExternalLinkAltIcon style={{ fontSize: 11, color: 'var(--pf-t--global--text--color--subtle)', flexShrink: 0, marginTop: 2 }} />
                </a>
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
