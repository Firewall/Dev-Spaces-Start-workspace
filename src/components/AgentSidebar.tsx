import { useEffect, useMemo, useRef, useState } from 'react'
import type React from 'react'
import {
  ArchiveIcon,
  AngleDownIcon,
  AngleRightIcon,
  PlusCircleIcon,
  CodeBranchIcon,
  GithubIcon,
} from '@patternfly/react-icons'
import type { Agent, Project } from './agentSpaceTypes'
import { BrandIcon } from './BrandIcons'

interface ContextMenuState {
  projectId: string
  x: number
  y: number
}

interface AgentSidebarProps {
  projects: Project[]
  agents: Agent[]
  selectedAgentId: string | null
  showIssues?: boolean
  viewedComplete?: Set<string>
  onSelectAgent: (agentId: string) => void
  onAddAgent: (projectId: string) => void
  onDeleteAgent: (agentId: string) => void
  onDeleteProject: (projectId: string) => void
  onRenameProject: (projectId: string, newName: string) => void
}

const ISSUE_STATUS_COLORS: Record<string, string> = {
  'open': '#1a7f37',
  'in-progress': '#1f6feb',
  'closed': '#8b949e',
  'merged': '#8957e5',
}

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

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function branchShort(branch?: string): string {
  if (!branch) return 'main'
  const parts = branch.split('/')
  return parts.length > 1 ? parts.slice(1).join('/') : branch
}

const SIDEBAR_FONT = {
  primary: 14,
  secondary: 11,
  icon: 10,
  projectName: 14,
} as const

const INITIAL_VISIBLE = 4

export function AgentSidebar({
  projects,
  agents,
  selectedAgentId,
  showIssues,
  viewedComplete,
  onSelectAgent,
  onAddAgent,
  onDeleteAgent,
  onDeleteProject,
  onRenameProject,
}: AgentSidebarProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)
  const [renamingProjectId, setRenamingProjectId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const renameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!contextMenu) return
    const close = () => setContextMenu(null)
    document.addEventListener('click', close)
    document.addEventListener('contextmenu', close)
    return () => {
      document.removeEventListener('click', close)
      document.removeEventListener('contextmenu', close)
    }
  }, [contextMenu])

  useEffect(() => {
    if (renamingProjectId) renameInputRef.current?.focus()
  }, [renamingProjectId])

  const commitRename = (projectId: string) => {
    const trimmed = renameValue.trim()
    if (trimmed) onRenameProject(projectId, trimmed)
    setRenamingProjectId(null)
  }

  const agentsByProject = useMemo(() => {
    const map = new Map<string, Agent[]>()
    for (const agent of agents) {
      const list = map.get(agent.projectId) ?? []
      list.push(agent)
      map.set(agent.projectId, list)
    }
    for (const [key, list] of map) {
      map.set(key, list.sort((a, b) => b.lastActivity - a.lastActivity))
    }
    return map
  }, [agents])

  return (
    <div style={{ flex: 1, overflowY: 'auto', outline: 'none' }}>
      <style>{`
        .agent-sidebar-item { position: relative; }
        .agent-sidebar-archive { visibility: hidden; }
        .agent-sidebar-time { visibility: visible; }
        .agent-sidebar-item:hover .agent-sidebar-archive { visibility: visible; }
        .agent-sidebar-item:hover .agent-sidebar-time { visibility: hidden; }
        .agent-sidebar-item:hover { background: var(--pf-t--global--background--color--action--plain--hover); }
        @keyframes pulse-status { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .agent-status-dot { animation: pulse-status 2s ease-in-out infinite; }
      `}</style>
      {projects.length === 0 ? (
        <div style={{ padding: 16, color: 'var(--pf-t--global--text--color--regular)', opacity: 0.6, textAlign: 'center' }}>
          No projects yet
        </div>
      ) : (
        projects.map((project) => {
          const projectAgents = agentsByProject.get(project.id) ?? []
          const isCollapsed = collapsed[project.id] ?? false
          const isExpanded = expanded[project.id] ?? false
          const visibleAgents = isExpanded ? projectAgents : projectAgents.slice(0, INITIAL_VISIBLE)
          const hasMore = projectAgents.length > INITIAL_VISIBLE

          return (
            <div key={project.id}>
              <div
                className="agent-sidebar-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 8px 6px 8px',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
                onClick={() => setCollapsed((prev) => ({ ...prev, [project.id]: !isCollapsed }))}
                onContextMenu={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setContextMenu({ projectId: project.id, x: e.clientX, y: e.clientY })
                }}
              >
                {isCollapsed ? (
                  <AngleRightIcon style={{ fontSize: 12, flexShrink: 0 }} />
                ) : (
                  <AngleDownIcon style={{ fontSize: 12, flexShrink: 0 }} />
                )}
                {renamingProjectId === project.id ? (
                  <input
                    ref={renameInputRef}
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => commitRename(project.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitRename(project.id)
                      if (e.key === 'Escape') setRenamingProjectId(null)
                    }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      flex: 1,
                      fontWeight: 600,
                      fontSize: SIDEBAR_FONT.projectName,
                      background: 'var(--pf-t--global--background--color--action--plain--hover)',
                      border: '1px solid var(--pf-t--global--border--color--clicked)',
                      borderRadius: 4,
                      padding: '1px 4px',
                      color: 'inherit',
                      outline: 'none',
                      minWidth: 0,
                    }}
                  />
                ) : (
                  <span
                    style={{
                      flex: 1,
                      fontWeight: 600,
                      fontSize: SIDEBAR_FONT.projectName,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {project.name}
                  </span>
                )}
                <PlusCircleIcon
                  style={{ fontSize: 12, flexShrink: 0, cursor: 'pointer', opacity: 0.7 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    onAddAgent(project.id)
                  }}
                  aria-label={`Add agent to ${project.name}`}
                />
              </div>

              {!isCollapsed && (
                <div>
                  {visibleAgents.map((agent) => (
                    <div
                      key={agent.id}
                      className="agent-sidebar-item"
                      onClick={() => onSelectAgent(agent.id)}
                      style={{
                        padding: '7px 8px 7px 12px',
                        cursor: 'pointer',
                        borderLeft: agent.status === 'running'
                          ? '3px solid #4caf50'
                          : agent.status === 'blocked'
                          ? '3px solid #d29922'
                          : '3px solid transparent',
                        marginBottom: 2,
                        background:
                          agent.id === selectedAgentId
                            ? 'var(--pf-t--global--background--color--action--plain--clicked)'
                            : undefined,
                      }}
                    >
                      {/* Row 1: harness icon + status + summary + time/archive */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flexShrink: 0 }}>
                          <BrandIcon id={agent.tool} size={16} />
                        </div>
                        {!(agent.status === 'complete' && viewedComplete?.has(agent.id)) && (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 3, flexShrink: 0,
                            fontSize: SIDEBAR_FONT.secondary,
                            color: agent.status === 'running' ? '#4caf50' : agent.status === 'blocked' ? '#d29922' : 'var(--pf-t--global--text--color--regular)',
                            opacity: agent.status === 'complete' ? 0.4 : 1,
                          }}>
                            <span
                              className={agent.status !== 'complete' ? 'agent-status-dot' : undefined}
                              style={{
                                width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                                background: agent.status === 'running' ? '#4caf50' : agent.status === 'blocked' ? '#d29922' : 'var(--pf-t--global--text--color--regular)',
                                opacity: agent.status === 'complete' ? 0.5 : 1,
                              }}
                            />
                            {agent.status === 'running' ? 'Running' : agent.status === 'blocked' ? 'Blocked' : 'Complete'}
                          </span>
                        )}
                        <span
                          style={{
                            flex: 1,
                            fontSize: 13,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color: 'var(--pf-t--global--text--color--regular)',
                          }}
                        >
                          {agent.summary}
                        </span>
                        <span style={{ position: 'relative', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', width: 50 }}>
                          <span
                            className="agent-sidebar-time"
                            style={{
                              fontSize: SIDEBAR_FONT.secondary,
                              color: 'var(--pf-t--global--text--color--regular)',
                              whiteSpace: 'nowrap',
                              opacity: 0.5,
                            }}
                          >
                            {timeAgo(agent.lastActivity)}
                          </span>
                          <ArchiveIcon
                            className="agent-sidebar-archive"
                            style={{ fontSize: 12, position: 'absolute', right: 0, cursor: 'pointer', opacity: 0.7 }}
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation()
                              onDeleteAgent(agent.id)
                            }}
                            aria-label={`Archive ${agent.name}`}
                          />
                        </span>
                      </div>
                      {/* Row 2: model + branch */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3, minWidth: 0 }}>
                        <span style={{ fontSize: SIDEBAR_FONT.secondary, color: 'var(--pf-t--global--text--color--regular)', opacity: 0.5 }}>
                          {agent.model || 'unknown'}
                        </span>
                        <span style={{ fontSize: SIDEBAR_FONT.secondary, color: 'var(--pf-t--global--text--color--regular)', opacity: 0.3 }}>·</span>
                        <CodeBranchIcon style={{ fontSize: SIDEBAR_FONT.icon, color: 'var(--pf-t--global--text--color--regular)', opacity: 0.4 }} />
                        <span style={{
                          fontSize: SIDEBAR_FONT.secondary,
                          fontFamily: 'var(--pf-t--global--font--family--mono)',
                          color: 'var(--pf-t--global--text--color--regular)',
                          opacity: 0.5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {branchShort(agent.branch)}
                        </span>
                      </div>
                      {/* Row 3: linked issue (prototype A) */}
                      {showIssues && agent.issue && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center',
                            color: ISSUE_STATUS_COLORS[agent.issue.status] ?? '#8b949e',
                            fontSize: SIDEBAR_FONT.icon, flexShrink: 0,
                          }}>
                            {agent.issue.source === 'github' ? <GithubIcon style={{ fontSize: SIDEBAR_FONT.icon }} /> : <JiraIcon size={SIDEBAR_FONT.icon} />}
                          </span>
                          <span style={{
                            fontSize: SIDEBAR_FONT.secondary,
                            fontFamily: 'var(--pf-t--global--font--family--mono)',
                            color: 'var(--pf-t--global--text--color--link--default)',
                            fontWeight: 500,
                            flexShrink: 0,
                          }}>
                            {agent.issue.source === 'github' ? `#${agent.issue.number}` : agent.issue.id}
                          </span>
                          <span style={{
                            fontSize: SIDEBAR_FONT.secondary,
                            color: 'var(--pf-t--global--text--color--regular)',
                            opacity: 0.45,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {agent.issue.title}
                          </span>
                          {agent.issue.pr && (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 2,
                              flexShrink: 0, opacity: 0.5,
                            }}>
                              <svg width="9" height="9" viewBox="0 0 16 16" fill={agent.issue.pr.status === 'merged' ? '#8957e5' : agent.issue.pr.status === 'draft' ? '#8b949e' : '#1a7f37'}>
                                <path d="M7.177 3.073L9.573.677A.25.25 0 0110 .854v4.792a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354zM3.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122v5.256a2.251 2.251 0 11-1.5 0V5.372A2.25 2.25 0 011.5 3.25zM11 2.5h-1V4h1a1 1 0 011 1v5.628a2.251 2.251 0 101.5 0V5A2.5 2.5 0 0011 2.5zm1 10.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM3.75 12a.75.75 0 100 1.5.75.75 0 000-1.5z"/>
                              </svg>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {hasMore && !isExpanded && (
                    <div
                      style={{
                        padding: '4px 8px 8px 12px',
                        fontSize: SIDEBAR_FONT.secondary,
                        color: 'var(--pf-t--global--text--color--regular)', opacity: 0.6,
                        cursor: 'pointer',
                      }}
                      onClick={() => setExpanded((prev) => ({ ...prev, [project.id]: true }))}
                    >
                      Show more
                    </div>
                  )}
                  {hasMore && isExpanded && (
                    <div
                      style={{
                        padding: '4px 8px 8px 12px',
                        fontSize: SIDEBAR_FONT.secondary,
                        color: 'var(--pf-t--global--text--color--regular)', opacity: 0.6,
                        cursor: 'pointer',
                      }}
                      onClick={() => setExpanded((prev) => ({ ...prev, [project.id]: false }))}
                    >
                      Show less
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })
      )}
      {contextMenu && (
        <div
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            zIndex: 9999,
            background: 'var(--pf-t--global--background--color--primary--default)',
            border: '1px solid var(--pf-t--global--border--color--default)',
            borderRadius: 6,
            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
            padding: '4px 0',
            minWidth: 160,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              padding: '6px 12px',
              fontSize: 13,
              cursor: 'pointer',
            }}
            className="agent-sidebar-item"
            onClick={() => {
              const proj = projects.find((p) => p.id === contextMenu.projectId)
              setRenameValue(proj?.name ?? '')
              setRenamingProjectId(contextMenu.projectId)
              setContextMenu(null)
            }}
          >
            Rename project
          </div>
          <div
            style={{
              padding: '6px 12px',
              fontSize: 13,
              cursor: 'pointer',
              color: 'var(--pf-t--global--color--status--danger--default)',
            }}
            className="agent-sidebar-item"
            onClick={() => {
              onDeleteProject(contextMenu.projectId)
              setContextMenu(null)
            }}
          >
            Remove project
          </div>
        </div>
      )}
    </div>
  )
}
