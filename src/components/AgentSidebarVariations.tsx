import { useMemo, useState } from 'react'
import { AngleDownIcon, AngleRightIcon, PlusCircleIcon, CodeBranchIcon } from '@patternfly/react-icons'
import { Button } from '@patternfly/react-core'
import type { Agent, Project } from './agentSpaceTypes'
import { BrandIcon } from './BrandIcons'

interface VariationProps {
  projects: Project[]
  agents: Agent[]
  selectedAgentId: string | null
  onSelectAgent: (agentId: string) => void
  onAddAgent: (projectId: string) => void
  onDeleteAgent: (agentId: string) => void
}

interface ExtendedAgent extends Agent {
  model?: string
  branch?: string
}

const MOCK_PROJECTS: Project[] = [
  { id: 'proj-1', name: 'web-app', repoUrl: 'https://github.com/acme/web-app' },
  { id: 'proj-2', name: 'api-service', repoUrl: 'https://github.com/acme/api-service' },
]

const MOCK_AGENTS: ExtendedAgent[] = [
  { id: '1', name: 'Auth flow', tool: 'claude-code', status: 'running', projectId: 'proj-1', summary: 'Implementing OAuth2 login flow', lastActivity: Date.now() - 2 * 60 * 1000, model: 'Opus 4.8', branch: 'feature/oauth2-login' },
  { id: '2', name: 'Profile page', tool: 'opencode', status: 'running', projectId: 'proj-1', summary: 'Add user profile settings page', lastActivity: Date.now() - 8 * 60 * 1000, model: 'Granite 4.0 H', branch: 'feature/user-profile' },
  { id: '3', name: 'DB migration', tool: 'codex', status: 'stopped', projectId: 'proj-1', summary: 'Refactor database migration scripts', lastActivity: Date.now() - 14 * 60 * 60 * 1000, model: 'GPT-5.6 Sol', branch: 'refactor/db-migrations' },
  { id: '4', name: 'Router upgrade', tool: 'cursor-agent', status: 'running', projectId: 'proj-1', summary: 'Upgrade React Router to v7', lastActivity: Date.now() - 2 * 24 * 60 * 60 * 1000, model: 'Cursor Smart', branch: 'chore/react-router-v7' },
  { id: '5', name: 'Rate limiter', tool: 'claude-code', status: 'running', projectId: 'proj-2', summary: 'Fix rate limiting middleware', lastActivity: Date.now() - 3 * 60 * 1000, model: 'Sonnet 5', branch: 'bugfix/rate-limiter' },
  { id: '6', name: 'API docs', tool: 'opencode', status: 'running', projectId: 'proj-2', summary: 'Generate API documentation from types', lastActivity: Date.now() - 10 * 60 * 1000, model: 'Llama 3.3 70B', branch: 'docs/api-types' },
  { id: '7', name: 'GraphQL subs', tool: 'claude-code', status: 'stopped', projectId: 'proj-2', summary: 'Add GraphQL subscriptions for real-time', lastActivity: Date.now() - 1 * 24 * 60 * 60 * 1000, model: 'Haiku 4.5', branch: 'feature/graphql-subs' },
]

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

const STATUS_DOT: Record<string, string> = {
  running: '#4caf50',
  stopped: 'var(--pf-t--global--text--color--regular)',
}

/* ───────────────────────────────────────────────────────
   V1: Harness Icon Inline
   Single row: [icon 14px] [summary ...] [model · time]
   Branch visible on hover/tooltip. Minimal footprint.
   ─────────────────────────────────────────────────────── */
export function V1_HarnessInline({ agents = MOCK_AGENTS, projects = MOCK_PROJECTS, selectedAgentId, onSelectAgent }: Partial<VariationProps>) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const agentsByProject = useMemo(() => {
    const map = new Map<string, ExtendedAgent[]>()
    for (const a of agents as ExtendedAgent[]) {
      const list = map.get(a.projectId) ?? []
      list.push(a)
      map.set(a.projectId, list)
    }
    return map
  }, [agents])

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <style>{`
        .v1-item:hover { background: var(--pf-t--global--background--color--action--plain--hover); }
      `}</style>
      {projects.map((project) => {
        const projectAgents = agentsByProject.get(project.id) ?? []
        const isCollapsed = collapsed[project.id] ?? false
        return (
          <div key={project.id}>
            <div
              className="v1-item"
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', cursor: 'pointer', userSelect: 'none' }}
              onClick={() => setCollapsed((p) => ({ ...p, [project.id]: !isCollapsed }))}
            >
              {isCollapsed ? <AngleRightIcon style={{ fontSize: 12 }} /> : <AngleDownIcon style={{ fontSize: 12 }} />}
              <span style={{ flex: 1, fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.name}</span>
              <Button variant="plain" size="sm" icon={<PlusCircleIcon style={{ fontSize: 12 }} />} onClick={(e) => { e.stopPropagation() }} style={{ padding: 0 }} />
            </div>
            {!isCollapsed && projectAgents.map((agent) => (
              <div
                key={agent.id}
                className="v1-item"
                onClick={() => onSelectAgent?.(agent.id)}
                title={`Branch: ${agent.branch || 'main'}\nModel: ${agent.model || 'unknown'}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 8px 6px 24px', cursor: 'pointer',
                  background: agent.id === selectedAgentId ? 'var(--pf-t--global--background--color--action--plain--clicked)' : undefined,
                }}
              >
                <BrandIcon id={agent.tool} size={14} />
                <span style={{ flex: 1, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--pf-t--global--text--color--regular)' }}>
                  {agent.summary}
                </span>
                <span style={{ fontSize: 10, color: 'var(--pf-t--global--text--color--regular)', opacity: 0.5, flexShrink: 0, whiteSpace: 'nowrap' }}>
                  {agent.model} · {timeAgo(agent.lastActivity)}
                </span>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

/* ───────────────────────────────────────────────────────
   V2: Branch Pill
   Single row: [icon] [summary] [branch-pill] [time]
   Model in tooltip. Branch is a monospace pill.
   ─────────────────────────────────────────────────────── */
export function V2_BranchPill({ agents = MOCK_AGENTS, projects = MOCK_PROJECTS, selectedAgentId, onSelectAgent }: Partial<VariationProps>) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const agentsByProject = useMemo(() => {
    const map = new Map<string, ExtendedAgent[]>()
    for (const a of agents as ExtendedAgent[]) {
      const list = map.get(a.projectId) ?? []
      list.push(a)
      map.set(a.projectId, list)
    }
    return map
  }, [agents])

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <style>{`
        .v2-item:hover { background: var(--pf-t--global--background--color--action--plain--hover); }
      `}</style>
      {projects.map((project) => {
        const projectAgents = agentsByProject.get(project.id) ?? []
        const isCollapsed = collapsed[project.id] ?? false
        return (
          <div key={project.id}>
            <div
              className="v2-item"
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', cursor: 'pointer', userSelect: 'none' }}
              onClick={() => setCollapsed((p) => ({ ...p, [project.id]: !isCollapsed }))}
            >
              {isCollapsed ? <AngleRightIcon style={{ fontSize: 12 }} /> : <AngleDownIcon style={{ fontSize: 12 }} />}
              <span style={{ flex: 1, fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.name}</span>
              <Button variant="plain" size="sm" icon={<PlusCircleIcon style={{ fontSize: 12 }} />} onClick={(e) => { e.stopPropagation() }} style={{ padding: 0 }} />
            </div>
            {!isCollapsed && projectAgents.map((agent) => (
              <div
                key={agent.id}
                className="v2-item"
                onClick={() => onSelectAgent?.(agent.id)}
                title={`Model: ${agent.model || 'unknown'}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 8px 6px 24px', cursor: 'pointer',
                  background: agent.id === selectedAgentId ? 'var(--pf-t--global--background--color--action--plain--clicked)' : undefined,
                }}
              >
                <BrandIcon id={agent.tool} size={14} />
                <span style={{ flex: 1, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--pf-t--global--text--color--regular)' }}>
                  {agent.summary}
                </span>
                <span style={{
                  fontSize: 10, fontFamily: 'var(--pf-t--global--font--family--mono)',
                  background: 'var(--pf-t--global--background--color--action--plain--hover)',
                  padding: '1px 6px', borderRadius: 8,
                  color: 'var(--pf-t--global--text--color--regular)', opacity: 0.7,
                  flexShrink: 0, whiteSpace: 'nowrap', maxWidth: 100,
                  overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {branchShort(agent.branch)}
                </span>
                <span style={{ fontSize: 10, color: 'var(--pf-t--global--text--color--regular)', opacity: 0.5, flexShrink: 0, whiteSpace: 'nowrap' }}>
                  {timeAgo(agent.lastActivity)}
                </span>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

/* ───────────────────────────────────────────────────────
   V3: Two-Row Detail
   Row 1: [icon] [summary] [time]
   Row 2:        [model name] · [branch-icon branch]
   The richest single-item view at manageable height.
   ─────────────────────────────────────────────────────── */
export function V3_TwoRow({ agents = MOCK_AGENTS, projects = MOCK_PROJECTS, selectedAgentId, onSelectAgent }: Partial<VariationProps>) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const agentsByProject = useMemo(() => {
    const map = new Map<string, ExtendedAgent[]>()
    for (const a of agents as ExtendedAgent[]) {
      const list = map.get(a.projectId) ?? []
      list.push(a)
      map.set(a.projectId, list)
    }
    return map
  }, [agents])

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <style>{`
        .v3-item:hover { background: var(--pf-t--global--background--color--action--plain--hover); }
      `}</style>
      {projects.map((project) => {
        const projectAgents = agentsByProject.get(project.id) ?? []
        const isCollapsed = collapsed[project.id] ?? false
        return (
          <div key={project.id}>
            <div
              className="v3-item"
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', cursor: 'pointer', userSelect: 'none' }}
              onClick={() => setCollapsed((p) => ({ ...p, [project.id]: !isCollapsed }))}
            >
              {isCollapsed ? <AngleRightIcon style={{ fontSize: 12 }} /> : <AngleDownIcon style={{ fontSize: 12 }} />}
              <span style={{ flex: 1, fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.name}</span>
              <Button variant="plain" size="sm" icon={<PlusCircleIcon style={{ fontSize: 12 }} />} onClick={(e) => { e.stopPropagation() }} style={{ padding: 0 }} />
            </div>
            {!isCollapsed && projectAgents.map((agent) => (
              <div
                key={agent.id}
                className="v3-item"
                onClick={() => onSelectAgent?.(agent.id)}
                style={{
                  padding: '7px 8px 7px 24px', cursor: 'pointer',
                  background: agent.id === selectedAgentId ? 'var(--pf-t--global--background--color--action--plain--clicked)' : undefined,
                }}
              >
                {/* Row 1: icon + summary + time */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <BrandIcon id={agent.tool} size={16} />
                    <div style={{
                      position: 'absolute', bottom: -1, right: -1,
                      width: 6, height: 6, borderRadius: '50%',
                      background: STATUS_DOT[agent.status] ?? STATUS_DOT.stopped,
                      border: '1px solid var(--pf-t--global--background--color--primary--default)',
                    }} />
                  </div>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--pf-t--global--text--color--regular)' }}>
                    {agent.summary}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--pf-t--global--text--color--regular)', opacity: 0.5, flexShrink: 0, whiteSpace: 'nowrap' }}>
                    {timeAgo(agent.lastActivity)}
                  </span>
                </div>
                {/* Row 2: model + branch */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3, paddingLeft: 24 }}>
                  <span style={{ fontSize: 10, color: 'var(--pf-t--global--text--color--regular)', opacity: 0.5 }}>
                    {agent.model}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--pf-t--global--text--color--regular)', opacity: 0.3 }}>·</span>
                  <CodeBranchIcon style={{ fontSize: 9, color: 'var(--pf-t--global--text--color--regular)', opacity: 0.4 }} />
                  <span style={{ fontSize: 10, fontFamily: 'var(--pf-t--global--font--family--mono)', color: 'var(--pf-t--global--text--color--regular)', opacity: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {branchShort(agent.branch)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

/* ───────────────────────────────────────────────────────
   V4: Left-Aligned Icon Column
   Harness icon pinned in a fixed left column (acts as a
   visual "lane"). Summary + model tag on right column.
   Branch shown below summary in monospace.
   Two logical rows but aligned to a left icon strip.
   ─────────────────────────────────────────────────────── */
export function V4_IconColumn({ agents = MOCK_AGENTS, projects = MOCK_PROJECTS, selectedAgentId, onSelectAgent }: Partial<VariationProps>) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const agentsByProject = useMemo(() => {
    const map = new Map<string, ExtendedAgent[]>()
    for (const a of agents as ExtendedAgent[]) {
      const list = map.get(a.projectId) ?? []
      list.push(a)
      map.set(a.projectId, list)
    }
    return map
  }, [agents])

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <style>{`
        .v4-item:hover { background: var(--pf-t--global--background--color--action--plain--hover); }
      `}</style>
      {projects.map((project) => {
        const projectAgents = agentsByProject.get(project.id) ?? []
        const isCollapsed = collapsed[project.id] ?? false
        return (
          <div key={project.id}>
            <div
              className="v4-item"
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', cursor: 'pointer', userSelect: 'none' }}
              onClick={() => setCollapsed((p) => ({ ...p, [project.id]: !isCollapsed }))}
            >
              {isCollapsed ? <AngleRightIcon style={{ fontSize: 12 }} /> : <AngleDownIcon style={{ fontSize: 12 }} />}
              <span style={{ flex: 1, fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.name}</span>
              <Button variant="plain" size="sm" icon={<PlusCircleIcon style={{ fontSize: 12 }} />} onClick={(e) => { e.stopPropagation() }} style={{ padding: 0 }} />
            </div>
            {!isCollapsed && projectAgents.map((agent) => (
              <div
                key={agent.id}
                className="v4-item"
                onClick={() => onSelectAgent?.(agent.id)}
                style={{
                  display: 'flex', gap: 10,
                  padding: '8px 8px 8px 20px', cursor: 'pointer',
                  background: agent.id === selectedAgentId ? 'var(--pf-t--global--background--color--action--plain--clicked)' : undefined,
                  borderLeft: agent.id === selectedAgentId ? '3px solid var(--pf-t--global--color--status--info--default)' : '3px solid transparent',
                }}
              >
                {/* Icon column */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, paddingTop: 1, width: 20, flexShrink: 0 }}>
                  <BrandIcon id={agent.tool} size={18} />
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: STATUS_DOT[agent.status] ?? STATUS_DOT.stopped,
                    opacity: agent.status === 'stopped' ? 0.4 : 1,
                  }} />
                </div>
                {/* Content column */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ flex: 1, fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--pf-t--global--text--color--regular)' }}>
                      {agent.summary}
                    </span>
                    <span style={{
                      fontSize: 9, padding: '1px 5px', borderRadius: 6,
                      background: 'var(--pf-t--global--background--color--action--plain--hover)',
                      color: 'var(--pf-t--global--text--color--regular)', opacity: 0.6,
                      flexShrink: 0, whiteSpace: 'nowrap',
                    }}>
                      {agent.model}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                    <CodeBranchIcon style={{ fontSize: 9, color: 'var(--pf-t--global--text--color--regular)', opacity: 0.4 }} />
                    <span style={{
                      fontSize: 10, fontFamily: 'var(--pf-t--global--font--family--mono)',
                      color: 'var(--pf-t--global--text--color--regular)', opacity: 0.45,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
                    }}>
                      {branchShort(agent.branch)}
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--pf-t--global--text--color--regular)', opacity: 0.4, flexShrink: 0, whiteSpace: 'nowrap' }}>
                      {timeAgo(agent.lastActivity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

/* ───────────────────────────────────────────────────────
   V5: Dense Single-Row with Harness + Model Tag
   [icon 14px] [model-label] [summary ...] [branch] [time]
   Harness icon and model name are grouped as a leading
   "badge", then summary, then branch and time trailing.
   Everything fits one line — maximizes thread count.
   ─────────────────────────────────────────────────────── */
export function V5_DenseTagged({ agents = MOCK_AGENTS, projects = MOCK_PROJECTS, selectedAgentId, onSelectAgent }: Partial<VariationProps>) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const agentsByProject = useMemo(() => {
    const map = new Map<string, ExtendedAgent[]>()
    for (const a of agents as ExtendedAgent[]) {
      const list = map.get(a.projectId) ?? []
      list.push(a)
      map.set(a.projectId, list)
    }
    return map
  }, [agents])

  function modelShort(model?: string): string {
    if (!model) return '?'
    const words = model.split(' ')
    if (words.length >= 2) return `${words[0][0]}${words[1][0]}${words[1].match(/[\d.]+/)?.[0] ?? ''}`
    return model.slice(0, 4)
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <style>{`
        .v5-item:hover { background: var(--pf-t--global--background--color--action--plain--hover); }
      `}</style>
      {projects.map((project) => {
        const projectAgents = agentsByProject.get(project.id) ?? []
        const isCollapsed = collapsed[project.id] ?? false
        return (
          <div key={project.id}>
            <div
              className="v5-item"
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', cursor: 'pointer', userSelect: 'none' }}
              onClick={() => setCollapsed((p) => ({ ...p, [project.id]: !isCollapsed }))}
            >
              {isCollapsed ? <AngleRightIcon style={{ fontSize: 12 }} /> : <AngleDownIcon style={{ fontSize: 12 }} />}
              <span style={{ flex: 1, fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.name}</span>
              <Button variant="plain" size="sm" icon={<PlusCircleIcon style={{ fontSize: 12 }} />} onClick={(e) => { e.stopPropagation() }} style={{ padding: 0 }} />
            </div>
            {!isCollapsed && projectAgents.map((agent) => (
              <div
                key={agent.id}
                className="v5-item"
                onClick={() => onSelectAgent?.(agent.id)}
                title={`${agent.model}\n${agent.branch || 'main'}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '5px 8px 5px 20px', cursor: 'pointer',
                  background: agent.id === selectedAgentId ? 'var(--pf-t--global--background--color--action--plain--clicked)' : undefined,
                }}
              >
                {/* Harness icon + model abbreviation as leading badge */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: 'var(--pf-t--global--background--color--action--plain--hover)',
                  padding: '2px 6px 2px 4px', borderRadius: 6, flexShrink: 0,
                }}>
                  <BrandIcon id={agent.tool} size={12} />
                  <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--pf-t--global--text--color--regular)', opacity: 0.7, whiteSpace: 'nowrap' }}>
                    {modelShort(agent.model)}
                  </span>
                </div>
                {/* Summary */}
                <span style={{ flex: 1, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--pf-t--global--text--color--regular)' }}>
                  {agent.summary}
                </span>
                {/* Branch + time */}
                <span style={{
                  fontSize: 9, fontFamily: 'var(--pf-t--global--font--family--mono)',
                  color: 'var(--pf-t--global--text--color--regular)', opacity: 0.4,
                  flexShrink: 0, whiteSpace: 'nowrap',
                }}>
                  {branchShort(agent.branch)}
                </span>
                <span style={{ fontSize: 10, color: 'var(--pf-t--global--text--color--regular)', opacity: 0.4, flexShrink: 0, whiteSpace: 'nowrap' }}>
                  {timeAgo(agent.lastActivity)}
                </span>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

/* ───────────────────────────────────────────────────────
   Showcase: renders all 5 side-by-side
   ─────────────────────────────────────────────────────── */
export function VariationShowcase() {
  const variations = [
    { name: 'V1: Harness Inline', desc: 'Icon + model·time on right', Component: V1_HarnessInline },
    { name: 'V2: Branch Pill', desc: 'Icon + branch pill + time', Component: V2_BranchPill },
    { name: 'V3: Two-Row Detail', desc: 'Icon+summary row, model+branch row', Component: V3_TwoRow },
    { name: 'V4: Icon Column', desc: 'Left icon strip, model tag, branch', Component: V4_IconColumn },
    { name: 'V5: Dense Tagged', desc: 'Badge [icon model] + summary + branch', Component: V5_DenseTagged },
  ]

  return (
    <div style={{ display: 'flex', gap: 16, padding: 24, background: 'var(--pf-t--global--background--color--secondary--default)', minHeight: '100vh', overflowX: 'auto' }}>
      {variations.map(({ name, desc, Component }) => (
        <div key={name} style={{ flex: '0 0 300px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: 8 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{name}</h3>
            <p style={{ fontSize: 11, margin: '2px 0 0', opacity: 0.6 }}>{desc}</p>
          </div>
          <div
            style={{
              border: '1px solid var(--pf-t--global--border--color--default)',
              borderRadius: 6,
              background: 'var(--pf-t--global--background--color--primary--default)',
              flex: 1, minHeight: 450,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Component
              agents={MOCK_AGENTS}
              projects={MOCK_PROJECTS}
              selectedAgentId="1"
              onSelectAgent={() => {}}
              onAddAgent={() => {}}
              onDeleteAgent={() => {}}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
