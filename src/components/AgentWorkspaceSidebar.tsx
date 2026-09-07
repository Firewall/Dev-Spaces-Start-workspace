import { useEffect, useMemo, useRef, useState } from 'react'
import type React from 'react'
import {
  AngleDownIcon,
  AngleRightIcon,
  ArchiveIcon,
  CodeBranchIcon,
  PlusCircleIcon,
} from '@patternfly/react-icons'
import type { AgentToolId } from './agentSpaceTypes'
import { AGENT_TOOLS } from './agentSpaceMockData'
import type { MvpAgent, Workspace } from './agentSpaceMvpTypes'
import { BrandIcon } from './BrandIcons'

interface ContextMenuState {
  workspaceId: string
  x: number
  y: number
}

interface AgentWorkspaceSidebarProps {
  workspaces: Workspace[]
  agents: MvpAgent[]
  selectedAgentId: string | null
  viewedComplete?: Set<string>
  onSelectAgent: (agentId: string) => void
  onAddAgent: (workspaceId: string, tool?: AgentToolId) => void
  onDeleteAgent: (agentId: string) => void
  onDeleteWorkspace: (workspaceId: string) => void
  onRenameWorkspace: (workspaceId: string, newName: string) => void
}

const SIDEBAR_FONT = {
  secondary: 11,
  icon: 10,
  workspaceName: 14,
} as const

const INITIAL_VISIBLE = 4

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

export function AgentWorkspaceSidebar({
  workspaces,
  agents,
  selectedAgentId,
  viewedComplete,
  onSelectAgent,
  onAddAgent,
  onDeleteAgent,
  onDeleteWorkspace,
  onRenameWorkspace,
}: AgentWorkspaceSidebarProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)
  const [toolPickerWorkspaceId, setToolPickerWorkspaceId] = useState<string | null>(null)
  const [toolPickerPos, setToolPickerPos] = useState({ x: 0, y: 0 })
  const [renamingWorkspaceId, setRenamingWorkspaceId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const renameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!contextMenu && !toolPickerWorkspaceId) return
    const close = () => {
      setContextMenu(null)
      setToolPickerWorkspaceId(null)
    }
    document.addEventListener('click', close)
    document.addEventListener('contextmenu', close)
    return () => {
      document.removeEventListener('click', close)
      document.removeEventListener('contextmenu', close)
    }
  }, [contextMenu, toolPickerWorkspaceId])

  useEffect(() => {
    if (renamingWorkspaceId) renameInputRef.current?.focus()
  }, [renamingWorkspaceId])

  const commitRename = (workspaceId: string) => {
    const trimmed = renameValue.trim()
    if (trimmed) onRenameWorkspace(workspaceId, trimmed)
    setRenamingWorkspaceId(null)
  }

  const agentsByWorkspace = useMemo(() => {
    const map = new Map<string, MvpAgent[]>()
    for (const agent of agents) {
      const list = map.get(agent.workspaceId) ?? []
      list.push(agent)
      map.set(agent.workspaceId, list)
    }
    for (const [key, list] of map) {
      map.set(key, list.sort((a, b) => b.lastActivity - a.lastActivity))
    }
    return map
  }, [agents])

  return (
    <div style={{ flex: 1, overflowY: 'auto', outline: 'none' }}>
      <style>{`
        .agent-workspace-sidebar-item { position: relative; }
        .agent-workspace-sidebar-archive { visibility: hidden; }
        .agent-workspace-sidebar-time { visibility: visible; }
        .agent-workspace-sidebar-item:hover .agent-workspace-sidebar-archive { visibility: visible; }
        .agent-workspace-sidebar-item:hover .agent-workspace-sidebar-time { visibility: hidden; }
        .agent-workspace-sidebar-item:hover { background: var(--pf-t--global--background--color--action--plain--hover); }
        @keyframes pulse-workspace-status { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .agent-workspace-status-dot { animation: pulse-workspace-status 2s ease-in-out infinite; }
      `}</style>
      {workspaces.length === 0 ? (
        <div style={{ padding: 16, color: 'var(--pf-t--global--text--color--regular)', opacity: 0.6, textAlign: 'center' }}>
          No workspaces yet
        </div>
      ) : (
        workspaces.map((workspace) => {
          const workspaceAgents = agentsByWorkspace.get(workspace.id) ?? []
          const isCollapsed = collapsed[workspace.id] ?? false
          const isExpanded = expanded[workspace.id] ?? false
          const visibleAgents = isExpanded ? workspaceAgents : workspaceAgents.slice(0, INITIAL_VISIBLE)
          const hasMore = workspaceAgents.length > INITIAL_VISIBLE

          return (
            <div key={workspace.id}>
              <div
                className="agent-workspace-sidebar-item"
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => setCollapsed(prev => ({ ...prev, [workspace.id]: !isCollapsed }))}
                onContextMenu={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setContextMenu({ workspaceId: workspace.id, x: e.clientX, y: e.clientY })
                }}
              >
                {isCollapsed ? <AngleRightIcon style={{ fontSize: 12, flexShrink: 0 }} /> : <AngleDownIcon style={{ fontSize: 12, flexShrink: 0 }} />}
                {renamingWorkspaceId === workspace.id ? (
                  <input
                    ref={renameInputRef}
                    value={renameValue}
                    onChange={e => setRenameValue(e.target.value)}
                    onBlur={() => commitRename(workspace.id)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') commitRename(workspace.id)
                      if (e.key === 'Escape') setRenamingWorkspaceId(null)
                    }}
                    onClick={e => e.stopPropagation()}
                    style={{
                      flex: 1, fontWeight: 600, fontSize: SIDEBAR_FONT.workspaceName,
                      background: 'var(--pf-t--global--background--color--action--plain--hover)',
                      border: '1px solid var(--pf-t--global--border--color--clicked)', borderRadius: 4,
                      padding: '1px 4px', color: 'inherit', outline: 'none', minWidth: 0,
                    }}
                  />
                ) : (
                  <span style={{ flex: 1, fontWeight: 600, fontSize: SIDEBAR_FONT.workspaceName, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {workspace.name}
                  </span>
                )}
                <PlusCircleIcon
                  style={{ fontSize: 12, flexShrink: 0, cursor: 'pointer', opacity: 0.7 }}
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation()
                    const rect = (e.target as HTMLElement).getBoundingClientRect()
                    setToolPickerPos({ x: rect.left, y: rect.bottom + 4 })
                    setToolPickerWorkspaceId(workspace.id)
                  }}
                  aria-label={`Add agent to ${workspace.name}`}
                />
              </div>

              {!isCollapsed && (
                <div>
                  {visibleAgents.map(agent => (
                    <div
                      key={agent.id}
                      className="agent-workspace-sidebar-item"
                      onClick={() => onSelectAgent(agent.id)}
                      style={{
                        padding: '7px 8px 7px 12px', cursor: 'pointer', marginBottom: 2,
                        borderLeft: agent.status === 'blocked'
                          ? '3px solid #d29922'
                          : (agent.status === 'complete' && !viewedComplete?.has(agent.id))
                          ? '3px solid #4caf50'
                          : '3px solid transparent',
                        background: agent.id === selectedAgentId
                          ? 'var(--pf-t--global--background--color--action--plain--clicked)'
                          : undefined,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flexShrink: 0 }}><BrandIcon id={agent.tool} size={16} /></div>
                        {!(agent.status === 'complete' && viewedComplete?.has(agent.id)) && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, flexShrink: 0, fontSize: SIDEBAR_FONT.secondary, color: agent.status === 'blocked' ? '#d29922' : agent.status === 'complete' ? '#4caf50' : '#1f6feb' }}>
                            <span
                              className={agent.status === 'blocked' ? 'agent-workspace-status-dot' : undefined}
                              style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: agent.status === 'blocked' ? '#d29922' : agent.status === 'complete' ? '#4caf50' : '#1f6feb' }}
                            />
                            {agent.status === 'running' ? 'Running' : agent.status === 'blocked' ? 'Needs input' : 'Complete'}
                          </span>
                        )}
                        <span style={{ flex: 1, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--pf-t--global--text--color--regular)' }}>
                          {agent.summary}
                        </span>
                        <span style={{ position: 'relative', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', width: 50 }}>
                          <span className="agent-workspace-sidebar-time" style={{ fontSize: SIDEBAR_FONT.secondary, color: 'var(--pf-t--global--text--color--regular)', whiteSpace: 'nowrap', opacity: 0.5 }}>
                            {timeAgo(agent.lastActivity)}
                          </span>
                          <ArchiveIcon
                            className="agent-workspace-sidebar-archive"
                            style={{ fontSize: 12, position: 'absolute', right: 0, cursor: 'pointer', opacity: 0.7 }}
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation()
                              onDeleteAgent(agent.id)
                            }}
                            aria-label={`Archive ${agent.name}`}
                          />
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3, minWidth: 0 }}>
                        <span style={{ fontSize: SIDEBAR_FONT.secondary, color: 'var(--pf-t--global--text--color--subtle)' }}>{agent.model || 'unknown'}</span>
                        <span style={{ fontSize: SIDEBAR_FONT.secondary, color: 'var(--pf-t--global--text--color--subtle)' }}>·</span>
                        <CodeBranchIcon style={{ fontSize: SIDEBAR_FONT.icon, color: 'var(--pf-t--global--text--color--subtle)' }} />
                        <span style={{ fontSize: SIDEBAR_FONT.secondary, fontFamily: 'var(--pf-t--global--font--family--mono)', color: 'var(--pf-t--global--text--color--subtle)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {branchShort(agent.branch)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {hasMore && !isExpanded && (
                    <div style={{ padding: '4px 8px 8px 12px', fontSize: SIDEBAR_FONT.secondary, color: 'var(--pf-t--global--text--color--regular)', opacity: 0.6, cursor: 'pointer' }} onClick={() => setExpanded(prev => ({ ...prev, [workspace.id]: true }))}>
                      Show more
                    </div>
                  )}
                  {hasMore && isExpanded && (
                    <div style={{ padding: '4px 8px 8px 12px', fontSize: SIDEBAR_FONT.secondary, color: 'var(--pf-t--global--text--color--regular)', opacity: 0.6, cursor: 'pointer' }} onClick={() => setExpanded(prev => ({ ...prev, [workspace.id]: false }))}>
                      Show less
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })
      )}

      {toolPickerWorkspaceId && (
        <div
          style={{ position: 'fixed', top: toolPickerPos.y, left: toolPickerPos.x, zIndex: 9999, background: 'var(--pf-t--global--background--color--primary--default)', border: '1px solid var(--pf-t--global--border--color--default)', borderRadius: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.25)', padding: '4px 0', minWidth: 180 }}
          onClick={e => e.stopPropagation()}
        >
          {AGENT_TOOLS.map(tool => (
            <div
              key={tool.id}
              className="agent-workspace-sidebar-item"
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px', fontSize: 13, cursor: 'pointer' }}
              onClick={() => {
                onAddAgent(toolPickerWorkspaceId, tool.id)
                setToolPickerWorkspaceId(null)
              }}
            >
              <BrandIcon id={tool.id} size={16} />
              <span style={{ fontWeight: 500, color: 'var(--pf-t--global--text--color--regular)' }}>{tool.name}</span>
            </div>
          ))}
        </div>
      )}

      {contextMenu && (
        <div
          style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x, zIndex: 9999, background: 'var(--pf-t--global--background--color--primary--default)', border: '1px solid var(--pf-t--global--border--color--default)', borderRadius: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.25)', padding: '4px 0', minWidth: 170 }}
          onClick={e => e.stopPropagation()}
        >
          <div
            className="agent-workspace-sidebar-item"
            style={{ padding: '6px 12px', fontSize: 13, cursor: 'pointer' }}
            onClick={() => {
              const workspace = workspaces.find(item => item.id === contextMenu.workspaceId)
              setRenameValue(workspace?.name ?? '')
              setRenamingWorkspaceId(contextMenu.workspaceId)
              setContextMenu(null)
            }}
          >
            Rename workspace
          </div>
          <div
            className="agent-workspace-sidebar-item"
            style={{ padding: '6px 12px', fontSize: 13, cursor: 'pointer', color: 'var(--pf-t--global--color--status--danger--default)' }}
            onClick={() => {
              onDeleteWorkspace(contextMenu.workspaceId)
              setContextMenu(null)
            }}
          >
            Remove workspace
          </div>
        </div>
      )}
    </div>
  )
}
