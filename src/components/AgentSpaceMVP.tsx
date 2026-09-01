import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  MenuToggle,
  MenuToggleAction,
  PageSection,
} from '@patternfly/react-core'
import {
  CogIcon,
  DesktopIcon,
  PluggedIcon,
  PlusCircleIcon,
} from '@patternfly/react-icons'
import type { Agent, AgentToolId, Project } from './agentSpaceTypes'
import { AGENT_TOOLS, MOCK_AGENTS, MOCK_PROJECTS } from './agentSpaceMockData'
import { PanelToggleButtons, RightPanelContent, RightPanelWrapper } from './AgentRightPanel'
import { useRightPanel } from './useRightPanel'
import { AgentSidebar } from './AgentSidebar'
import { AddProjectModal } from './AddProjectModal'
import { BrandIcon } from './BrandIcons'
import { hasBrandIcon } from './brandIconData'
import { EDITORS } from './EditorDropdown'
import { OpenShellBadge } from './OpenShellBadge'
import { VSCodeView } from './VSCodeView'

let nextProjectId = 500
let nextAgentId = 500

function branchShort(branch?: string): string {
  if (!branch) return 'main'
  const parts = branch.split('/')
  return parts.length > 1 ? parts.slice(1).join('/') : branch
}

const TERMINAL_FONT: React.CSSProperties = {
  fontFamily: '"SF Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  fontSize: 13,
  lineHeight: '22px',
}

const OC_BG = '#181818'
const OC_BORDER = '#3b82f6'
const OC_USER_BG = '#1f1f1f'
const OC_META = '#666'
const OC_STATUS_BG = '#0f0f0f'

function TerminalCursor() {
  return (
    <>
      <span style={{ animation: 'blink 1s step-end infinite', color: '#cccccc' }}>&#9612;</span>
      <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
    </>
  )
}

interface OcMessage {
  role: 'user' | 'assistant' | 'error'
  content: string
  meta?: string
}

const MOCK_OC_MESSAGES: Record<string, OcMessage[]> = {
  'agent-1': [
    { role: 'user', content: 'Implement the OAuth2 login flow with PKCE support. We need Google, GitHub, and custom OIDC providers.' },
    { role: 'assistant', content: "I'll set up the auth module with PKCE challenge generation, provider configs, and the callback handler.\n\n✓ Read src/auth/config.ts\n✓ Write src/auth/oauth2.ts (142 lines)\n✓ Write src/auth/providers.ts (87 lines)\n✓ Write src/auth/callback.ts (63 lines)\n✓ Edit src/routes/index.ts — added /auth/callback route\n● Writing src/auth/session.ts...", meta: 'Build · Kimi K3 · 36.4s' },
    { role: 'user', content: 'Add refresh token rotation with Redis session store for horizontal scaling.' },
    { role: 'assistant', content: "Setting up refresh token rotation with secure httpOnly cookies. The session store will use Redis for horizontal scaling across pods...\n\n✓ Write src/auth/tokenRotation.ts (94 lines)\n● Writing src/auth/session.ts...", meta: 'Build · Kimi K3 · 12.1s' },
  ],
  'agent-8': [
    { role: 'user', content: 'Investigate the memory leak on the dashboard. Memory grows when switching between tabs.' },
    { role: 'assistant', content: "Found 3 components with leaked event listeners.\n\n✓ Read src/components/DashboardTabs.tsx (248 lines)\n✓ Read src/components/ChartWidget.tsx (186 lines)\n✓ Read src/components/MetricsPanel.tsx (94 lines)\n\nTwo are straightforward cleanup fixes. The ChartWidget subscribes to a WebSocket channel per tab. Should I:\n\n1. Disconnect WebSocket when tab is hidden (saves memory, brief reload on return)\n2. Keep connection alive but cap the in-memory buffer to 1000 data points", meta: 'Build · Granite 4.0 H · 54.9s' },
  ],
}

interface TerminalInputProps {
  inputValue: string
  onInputChange: (value: string) => void
  onSubmit: () => void
  inputRef: React.RefObject<HTMLInputElement | null>
  history: string[]
  terminalEndRef: React.RefObject<HTMLDivElement | null>
}

function TerminalInput({ inputRef, value, onChange, onKeyDown, placeholder, style }: {
  inputRef: React.RefObject<HTMLInputElement | null>
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  placeholder?: string
  style?: React.CSSProperties
}) {
  return <input ref={inputRef} value={value} onChange={onChange} onKeyDown={onKeyDown} placeholder={placeholder} style={style} />
}

function ScrollAnchor({ scrollRef }: { scrollRef: React.RefObject<HTMLDivElement | null> }) {
  return <div ref={scrollRef} />
}

function OpenCodeUI({ agent, projectName, input }: { agent: Agent; projectName?: string; input: TerminalInputProps }) {
  const model = agent.model ?? 'Kimi K3'
  const messages = MOCK_OC_MESSAGES[agent.id] ?? []
  const isComplete = agent.status === 'complete'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: OC_BG, ...TERMINAL_FONT, color: '#d4d4d4' }}>
      {/* Messages area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }} onClick={() => input.inputRef.current?.focus()}>
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: 4 }}>
            {msg.role === 'user' && (
              <div style={{
                borderLeft: `3px solid ${OC_BORDER}`,
                background: OC_USER_BG,
                padding: '12px 20px',
              }}>
                {msg.content}
              </div>
            )}
            {msg.role === 'assistant' && (
              <div style={{ padding: '12px 24px' }}>
                {msg.content.split('\n').map((line, j) => {
                  if (line.startsWith('✓ ')) return <div key={j} style={{ color: '#d4d4d4' }}>{line}</div>
                  if (line.startsWith('● ')) return <div key={j} style={{ color: '#dcdcaa' }}>{line}</div>
                  if (line.startsWith('1. ') || line.startsWith('2. ')) return <div key={j} style={{ color: '#d4d4d4', paddingLeft: 8 }}>{line}</div>
                  return <div key={j} style={{ color: '#d4d4d4' }}>{line || '\u00A0'}</div>
                })}
                {msg.meta && (
                  <div style={{ color: OC_META, marginTop: 8, fontSize: 12 }}>{msg.meta}</div>
                )}
              </div>
            )}
            {msg.role === 'error' && (
              <div style={{ padding: '12px 24px' }}>
                <div style={{ color: '#f87171' }}>{msg.content}</div>
                {msg.meta && <div style={{ color: OC_META, marginTop: 4, fontSize: 12 }}>{msg.meta}</div>}
              </div>
            )}
          </div>
        ))}

        {isComplete && (
          <div style={{ padding: '12px 24px', color: '#4ade80' }}>
            ✓ Task completed — {agent.summary}
          </div>
        )}

        {/* User-submitted prompts */}
        {input.history.map((prompt, i) => (
          <div key={`h-${i}`} style={{ marginBottom: 4 }}>
            <div style={{
              borderLeft: `3px solid ${OC_BORDER}`,
              background: OC_USER_BG,
              padding: '12px 20px',
            }}>
              {prompt}
            </div>
            <div style={{ padding: '12px 24px' }}>
              <div style={{ color: '#dcdcaa' }}>● Working on it...</div>
              <div style={{ color: OC_META, marginTop: 8, fontSize: 12 }}>Build · {model} · 0.0s</div>
            </div>
          </div>
        ))}
        <ScrollAnchor scrollRef={input.terminalEndRef} />
      </div>

      {/* Input area */}
      <div style={{
        borderLeft: `3px solid ${OC_BORDER}`,
        background: OC_USER_BG,
        margin: '0 0 0 0',
        padding: '10px 20px',
        flexShrink: 0,
      }}>
        <TerminalInput
          inputRef={input.inputRef}
          value={input.inputValue}
          onChange={e => input.onInputChange(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') input.onSubmit() }}
          placeholder=""
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#d4d4d4',
            ...TERMINAL_FONT,
            caretColor: '#cccccc',
            padding: 0,
          }}
        />
        <div style={{ color: OC_META, fontSize: 12, marginTop: 6 }}>
          <span style={{ color: '#4ade80' }}>Build</span>
          <span style={{ color: '#666' }}> · </span>
          <span style={{ color: '#e0e0e0', fontWeight: 600 }}>{model}</span>
          <span style={{ color: '#666' }}> Red Hat AI</span>
          <span style={{ color: '#666' }}> · </span>
          <span style={{ color: '#facc15' }}>high</span>
        </div>
      </div>

      {/* Status bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: OC_STATUS_BG, padding: '4px 16px',
        fontSize: 12, color: '#666', flexShrink: 0,
        borderTop: '1px solid #333',
      }}>
        <span>~/{projectName ?? 'workspace'}</span>
        <div style={{ display: 'flex', gap: 16 }}>
          <span>$0.00</span>
          <span>ctrl+p <span style={{ color: '#888' }}>commands</span></span>
        </div>
      </div>
    </div>
  )
}

function ClaudeCodeUI({ agent, input }: { agent: Agent; projectName?: string; input: TerminalInputProps }) {
  const model = agent.model ?? 'Sonnet 5'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#1e1e1e', ...TERMINAL_FONT, color: '#d4d4d4' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }} onClick={() => input.inputRef.current?.focus()}>
        {agent.status === 'running' && (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
              <span style={{ color: '#c586c0', fontWeight: 700 }}>Claude Code</span>
              <span style={{ color: '#808080' }}>v1.0.6</span>
            </div>
            <div style={{ color: '#808080', marginBottom: 16 }}>
              Model: {model} · Context: <span style={{ color: '#569cd6' }}>45.2k</span> / 200k tokens
            </div>

            <div style={{ color: '#569cd6', marginBottom: 12 }}>
              {'>'} Fix the rate limiter — it drops valid requests under high concurrency instead of queuing them.
            </div>

            <div style={{ color: '#d4d4d4', marginBottom: 12 }}>
              <span style={{ color: '#c586c0' }}>⏺</span> Found the issue. The rate limiter uses a simple counter that races under concurrent access. Replacing it with a token bucket algorithm.
            </div>

            <div style={{ paddingLeft: 16, marginBottom: 12, borderLeft: '2px solid #333' }}>
              <div style={{ marginBottom: 4 }}><span style={{ color: '#808080' }}>⎿</span> <span style={{ color: '#569cd6' }}>Read</span> src/middleware/rateLimiter.ts <span style={{ color: '#808080' }}>(82 lines)</span></div>
              <div style={{ marginBottom: 4 }}><span style={{ color: '#808080' }}>⎿</span> <span style={{ color: '#569cd6' }}>Read</span> src/middleware/index.ts <span style={{ color: '#808080' }}>(24 lines)</span></div>
              <div style={{ marginBottom: 4 }}><span style={{ color: '#808080' }}>⎿</span> <span style={{ color: '#569cd6' }}>Edit</span> src/middleware/rateLimiter.ts <span style={{ color: '#808080' }}>— replaced counter with token bucket</span></div>
              <div style={{ marginBottom: 4 }}><span style={{ color: '#808080' }}>⎿</span> <span style={{ color: '#569cd6' }}>Write</span> src/middleware/tokenBucket.ts <span style={{ color: '#808080' }}>(48 lines)</span></div>
            </div>

            <div style={{ color: '#d4d4d4', marginBottom: 4 }}>
              <span style={{ color: '#c586c0' }}>⏺</span> Now running the load tests to verify the fix holds under 500+ concurrent requests...
            </div>
            <div style={{ paddingLeft: 16, borderLeft: '2px solid #333', marginBottom: 16 }}>
              <div>
                <span style={{ color: '#808080' }}>⎿</span>{' '}
                <span style={{ color: '#569cd6' }}>Bash</span>{' '}
                <span style={{ color: '#ce9178' }}>npm run test:load -- --concurrency 500</span>
                <span style={{ color: '#808080' }}>...</span>
              </div>
            </div>
          </>
        )}

        {agent.status === 'complete' && (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
              <span style={{ color: '#c586c0', fontWeight: 700 }}>Claude Code</span>
              <span style={{ color: '#808080' }}>v1.0.6</span>
            </div>
            <div style={{ color: '#808080', marginBottom: 16 }}>Model: {model}</div>
            <div style={{ color: '#6a9955', marginBottom: 16 }}>✓ Task completed — {agent.summary}</div>
          </>
        )}

        {/* User-submitted prompts */}
        {input.history.map((prompt, i) => (
          <div key={i} style={{ marginBottom: 16 }}>
            <div style={{ color: '#569cd6', marginBottom: 8 }}>{'>'} {prompt}</div>
            <div style={{ color: '#d4d4d4' }}>
              <span style={{ color: '#c586c0' }}>⏺</span> Working on it...
            </div>
          </div>
        ))}
        <ScrollAnchor scrollRef={input.terminalEndRef} />
      </div>

      {/* Input bar */}
      <div style={{
        borderTop: '1px solid #333',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexShrink: 0,
      }}>
        <span style={{ color: '#569cd6', flexShrink: 0 }}>{'>'}</span>
        <TerminalInput
          inputRef={input.inputRef}
          value={input.inputValue}
          onChange={e => input.onInputChange(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') input.onSubmit() }}
          placeholder="Type a prompt..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#d4d4d4',
            ...TERMINAL_FONT,
            caretColor: '#cccccc',
          }}
        />
      </div>
    </div>
  )
}

function FallbackTerminalUI({ agent, projectName, username, input }: { agent: Agent; projectName?: string; username?: string; input: TerminalInputProps }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#1e1e1e', ...TERMINAL_FONT, color: '#d4d4d4' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }} onClick={() => input.inputRef.current?.focus()}>
        <div style={{ color: '#808080', marginBottom: 16 }}>
          {agent.tool === 'codex' ? 'Codex Agent v0.1' : 'Cursor Agent v0.1'}
        </div>
        {agent.status === 'complete' && (
          <div style={{ color: '#6a9955', marginBottom: 16 }}>✓ Task completed — {agent.summary}</div>
        )}
        <div>
          <span style={{ color: '#6a9955' }}>{username ?? 'user'}</span>
          <span style={{ color: '#808080' }}>@</span>
          <span style={{ color: '#569cd6' }}>{projectName ?? 'workspace'}</span>
          <span style={{ color: '#808080' }}> </span>
          <span style={{ color: '#c586c0' }}>({branchShort(agent.branch)})</span>
          <span style={{ color: '#808080' }}> $ </span>
          <TerminalCursor />
        </div>
        {input.history.map((prompt, i) => (
          <div key={i} style={{ marginTop: 12 }}>
            <div><span style={{ color: '#569cd6' }}>{'>'}</span> {prompt}</div>
            <div style={{ color: '#808080', fontStyle: 'italic' }}>Working on it...</div>
          </div>
        ))}
        <ScrollAnchor scrollRef={input.terminalEndRef} />
      </div>
      <div style={{
        borderTop: '1px solid #333', padding: '8px 16px',
        display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
      }}>
        <span style={{ color: '#569cd6', flexShrink: 0 }}>{'>'}</span>
        <TerminalInput
          inputRef={input.inputRef}
          value={input.inputValue}
          onChange={e => input.onInputChange(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') input.onSubmit() }}
          placeholder="Type a prompt..."
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#d4d4d4', ...TERMINAL_FONT, caretColor: '#cccccc' }}
        />
      </div>
    </div>
  )
}

export function AgentSpaceMVP({ username }: { username?: string }) {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS)
  const [agents, setAgents] = useState<Agent[]>(
    MOCK_AGENTS.map(a => {
      if (a.id === 'agent-10') return { ...a, issue: undefined, tool: 'claude-code' as AgentToolId, name: 'Claude Code - Rate limiter', model: 'Sonnet 5' }
      return { ...a, issue: undefined }
    }),
  )
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(
    () => MOCK_AGENTS[0]?.id ?? null,
  )
  const [addProjectModalOpen, setAddProjectModalOpen] = useState(false)
  const [showVSCode, setShowVSCode] = useState(false)
  const [openInOpen, setOpenInOpen] = useState(false)
  const rightPanel = useRightPanel()

  const [promptHistory, setPromptHistory] = useState<Record<string, string[]>>({})
  const [inputValue, setInputValue] = useState('')
  const terminalEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [sidebarWidth, setSidebarWidth] = useState(260)
  const sidebarDragging = useRef(false)

  const [viewedComplete, setViewedComplete] = useState<Set<string>>(() => new Set([
    'agent-2', 'agent-7', 'agent-3', 'agent-9',
    'agent-11', 'agent-12', 'agent-4', 'agent-13',
  ]))

  const selectAgent = useCallback((id: string | null) => {
    setSelectedAgentId(id)
    setOpenInOpen(false)
    if (id) {
      setViewedComplete(prev => {
        const next = new Set(prev)
        next.add(id)
        return next
      })
    }
  }, [])

  const selectedAgent = useMemo(() => agents.find(a => a.id === selectedAgentId), [agents, selectedAgentId])
  const selectedProject = useMemo(() => projects.find(p => p.id === selectedAgent?.projectId), [projects, selectedAgent])

  const handleSidebarMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    sidebarDragging.current = true
    const startX = e.clientX
    const startWidth = sidebarWidth
    const onMove = (ev: MouseEvent) => {
      if (!sidebarDragging.current) return
      setSidebarWidth(Math.max(180, Math.min(500, startWidth + ev.clientX - startX)))
    }
    const onUp = () => {
      sidebarDragging.current = false
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [sidebarWidth])

  const handleAddProject = useCallback((name: string, repoUrl: string) => {
    setProjects(prev => [...prev, { id: `proj-${nextProjectId++}`, name, repoUrl }])
  }, [])

  const handleDeleteProject = useCallback((projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId))
    setAgents(prev => {
      const removed = prev.filter(a => a.projectId === projectId)
      if (removed.some(a => a.id === selectedAgentId)) selectAgent(null)
      return prev.filter(a => a.projectId !== projectId)
    })
  }, [selectedAgentId, selectAgent])

  const handleAddAgent = useCallback((projectId: string, tool?: AgentToolId) => {
    const selectedTool = tool ?? 'opencode'
    const id = `agent-${nextAgentId++}`
    const toolName = AGENT_TOOLS.find(t => t.id === selectedTool)?.name ?? selectedTool
    setAgents(prev => [...prev, { id, name: toolName, tool: selectedTool, status: 'running', projectId, summary: toolName, lastActivity: Date.now(), model: 'Kimi K3', branch: 'main' }])
    selectAgent(id)
  }, [selectAgent])

  const handleDeleteAgent = useCallback((agentId: string) => {
    if (agentId === selectedAgentId) selectAgent(null)
    setAgents(prev => prev.filter(a => a.id !== agentId))
  }, [selectedAgentId, selectAgent])

  const handleRenameProject = useCallback((projectId: string, newName: string) => {
    setProjects(prev => prev.map(p => (p.id === projectId ? { ...p, name: newName } : p)))
  }, [])

  const handleSendPrompt = useCallback(() => {
    const trimmed = inputValue.trim()
    if (!trimmed || !selectedAgentId) return
    const isFirstPrompt = !(promptHistory[selectedAgentId]?.length)
    setPromptHistory(prev => ({
      ...prev,
      [selectedAgentId]: [...(prev[selectedAgentId] ?? []), trimmed],
    }))
    setAgents(prev => prev.map(a => {
      if (a.id !== selectedAgentId) return a
      const updates: Partial<Agent> = {}
      if (a.status === 'blocked') updates.status = 'running'
      if (isFirstPrompt) {
        const title = trimmed.length > 40 ? trimmed.slice(0, 40) + '...' : trimmed
        updates.summary = title
        updates.name = `${AGENT_TOOLS.find(t => t.id === a.tool)?.name ?? a.tool} - ${title}`
      }
      return { ...a, ...updates }
    }))
    setInputValue('')
  }, [inputValue, selectedAgentId, promptHistory])

  const currentHistory = useMemo(() => selectedAgentId ? (promptHistory[selectedAgentId] ?? []) : [], [selectedAgentId, promptHistory])

  const terminalInput: TerminalInputProps = useMemo(() => ({
    inputValue,
    onInputChange: setInputValue,
    onSubmit: handleSendPrompt,
    inputRef,
    history: currentHistory,
    terminalEndRef,
  }), [inputValue, handleSendPrompt, currentHistory])

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentHistory.length])

  useEffect(() => {
    inputRef.current?.focus()
  }, [selectedAgentId])

  return (
    <>
      <style>{`
        :root {
          --agent-sidebar-bg: #ffffff;
          --agent-content-bg: #ffffff;
          --agent-header-bg: #f0f0f0;
        }
        .pf-v6-theme-dark {
          --agent-sidebar-bg: #1a1a1a;
          --agent-content-bg: #1a1a1a;
          --agent-header-bg: #0f0f0f;
        }
      `}</style>
      <div style={{ display: 'flex', flex: 1, minHeight: 0, height: '100%' }}>
        {/* Left sidebar */}
        <div style={{
          width: sidebarWidth,
          minWidth: 180,
          maxWidth: 500,
          background: 'var(--agent-sidebar-bg)',
          display: 'flex', flexDirection: 'column', outline: 'none',
          paddingLeft: 4,
          position: 'relative',
          flexShrink: 0,
        }}>
          <div
            onMouseDown={handleSidebarMouseDown}
            style={{
              position: 'absolute', top: 0, right: 0, bottom: 0,
              width: 4, cursor: 'col-resize', zIndex: 10,
              borderRight: '1px solid var(--pf-t--global--border--color--default)',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderRight = '2px solid var(--pf-t--global--color--brand--default)')}
            onMouseLeave={e => { if (!sidebarDragging.current) e.currentTarget.style.borderRight = '1px solid var(--pf-t--global--border--color--default)' }}
          />
          <div style={{
            height: 36,
            boxSizing: 'border-box',
            padding: '0 8px',
            borderBottom: '1px solid var(--pf-t--global--border--color--default)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{
              fontSize: 14, fontWeight: 600,
              color: 'var(--pf-t--global--text--color--regular)',
            }}>
              Projects
            </span>
            <PlusCircleIcon
              style={{ fontSize: 12, flexShrink: 0, cursor: 'pointer', opacity: 0.7 }}
              onClick={() => setAddProjectModalOpen(true)}
              aria-label="Add project"
            />
          </div>
          <AgentSidebar
            projects={projects}
            agents={agents}
            selectedAgentId={selectedAgentId}
            showIssues={false}
            showToolPicker
            viewedComplete={viewedComplete}
            onSelectAgent={selectAgent}
            onAddAgent={handleAddAgent}
            onDeleteAgent={handleDeleteAgent}
            onDeleteProject={handleDeleteProject}
            onRenameProject={handleRenameProject}
          />
          <div
            style={{
              borderTop: '1px solid rgba(255,255,255,0.04)',
              padding: '4px 0',
            }}
          >
            <button
              onClick={() => { window.location.hash = '#/user-preferences/agent-configurations' }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 13,
                fontFamily: 'inherit',
                width: '100%',
                padding: '6px 8px',
                border: 'none',
                borderRadius: 0,
                cursor: 'pointer',
                color: 'var(--pf-t--global--text--color--regular)',
                background: 'transparent',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 14, opacity: 0.7, flexShrink: 0 }}><CogIcon /></span>
              <span style={{ flex: 1, textAlign: 'left' }}>Settings</span>
            </button>
          </div>
        </div>

        {/* Main content area */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--agent-content-bg)', minWidth: 0 }}>
          {showVSCode ? (
            <VSCodeView projectName={selectedProject?.name} onBack={() => setShowVSCode(false)} />
          ) : selectedAgent ? (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              {/* Toolbar */}
              <style>{`
                .header-icon-btn {
                  display: inline-flex; align-items: center; justify-content: center;
                  height: 28px; border: none; cursor: pointer; border-radius: 4px;
                  background: transparent; color: var(--pf-t--global--text--color--subtle);
                  font-size: 13px; padding: 0 8px; font-family: inherit; gap: 5px;
                  transition: background 0.1s, color 0.1s; white-space: nowrap;
                }
                .header-icon-btn:hover { background: var(--pf-t--global--background--color--action--plain--hover); color: var(--pf-t--global--text--color--regular); }
                .header-icon-btn[data-active="true"] { background: var(--pf-t--global--background--color--action--plain--clicked); color: var(--pf-t--global--text--color--regular); }
                .header-icon-btn .panel-label { display: inline; }
                .mvp-toolbar .pf-v6-c-menu-toggle,
                .mvp-toolbar .pf-v6-c-button {
                  height: 28px !important; max-height: 28px !important; min-height: 28px !important;
                  font-size: 13px; display: inline-flex; align-items: center; box-sizing: border-box;
                  padding-inline: 8px !important; padding-block: 0 !important;
                }
                .mvp-toolbar .pf-v6-c-menu-toggle.pf-m-split-button {
                  padding: 0 !important;
                  --pf-v6-c-menu-toggle--PaddingBlockStart: 0;
                  --pf-v6-c-menu-toggle--PaddingBlockEnd: 0;
                  --pf-v6-c-menu-toggle--PaddingInlineStart: 6px;
                  --pf-v6-c-menu-toggle--PaddingInlineEnd: 6px;
                  --pf-v6-c-menu-toggle--m-split-button--pill--child--PaddingInlineEnd--offset: 6px;
                  --pf-v6-c-menu-toggle--m-split-button--pill--child--PaddingInlineStart--offset: 4px;
                  --pf-v6-c-menu-toggle__button--toggle-icon--PaddingInlineStart: 4px;
                  --pf-v6-c-menu-toggle__button--toggle-icon--PaddingInlineEnd: 4px;
                }
                .mvp-toolbar .pf-v6-c-menu-toggle.pf-m-split-button > * {
                  align-self: stretch !important;
                  display: inline-flex !important; align-items: center !important;
                  padding-block: 0 !important;
                }
                .mvp-toolbar .pf-v6-c-menu-toggle.pf-m-split-button .pf-v6-c-menu-toggle__controls {
                  display: inline-flex; align-items: center; justify-content: center;
                }
                .mvp-toolbar .pf-v6-c-menu-toggle.pf-m-split-button .pf-v6-c-menu-toggle__controls .pf-v6-c-menu-toggle__toggle-icon {
                  display: inline-flex; align-items: center; min-width: 12px;
                }
              `}</style>

              <div style={{ containerType: 'inline-size', containerName: 'toolbar', height: 36, boxSizing: 'border-box', borderBottom: '1px solid var(--pf-t--global--border--color--default)' }}>
                <div style={{ display: 'flex', alignItems: 'center', height: '100%', padding: '0 12px', gap: 6 }}>
                  <BrandIcon id={selectedAgent.tool} size={18} />
                  <span style={{
                    fontSize: 13, fontWeight: 500, flex: 1,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    color: 'var(--pf-t--global--text--color--regular)',
                    padding: '0 4px',
                  }}>
                    {selectedAgent.summary}
                  </span>
                  <OpenShellBadge />
                  <div style={{ width: 1, height: 16, background: 'var(--pf-t--global--border--color--default)', flexShrink: 0 }} />
                  <PanelToggleButtons panels={['context', 'changes', 'terminal']} activePanel={rightPanel.activePanel} onToggle={rightPanel.toggle} />
                  <div style={{ width: 1, height: 16, background: 'var(--pf-t--global--border--color--default)', flexShrink: 0 }} />
                  <div className="mvp-toolbar">
                    <Dropdown isOpen={openInOpen} onSelect={() => setOpenInOpen(false)} onOpenChange={setOpenInOpen} popperProps={{ position: 'right' }}
                      toggle={(toggleRef) => (
                        <MenuToggle
                          ref={toggleRef}
                          isExpanded={openInOpen}
                          splitButtonItems={[
                            <MenuToggleAction key="open-vscode" onClick={() => setShowVSCode(true)}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                <BrandIcon id="vscode" size={16} />
                                <span>Open in VS Code</span>
                              </span>
                            </MenuToggleAction>,
                          ]}
                          onClick={() => setOpenInOpen(o => !o)}
                        />
                      )}
                    >
                      <DropdownList>
                        {EDITORS.filter(e => !('isCustom' in e) && e.id !== 'vscode').map(editor => (
                          <DropdownItem key={editor.id} icon={hasBrandIcon(editor.id) ? <BrandIcon id={editor.id} size={18} /> : <DesktopIcon />}>
                            {editor.label}
                          </DropdownItem>
                        ))}
                      </DropdownList>
                    </Dropdown>
                  </div>
                </div>
              </div>

              {/* Terminal + context */}
              <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {selectedAgent.tool === 'opencode' ? (
                    <OpenCodeUI agent={selectedAgent} projectName={selectedProject?.name} input={terminalInput} />
                  ) : selectedAgent.tool === 'claude-code' ? (
                    <ClaudeCodeUI agent={selectedAgent} projectName={selectedProject?.name} input={terminalInput} />
                  ) : (
                    <FallbackTerminalUI agent={selectedAgent} projectName={selectedProject?.name} username={username} input={terminalInput} />
                  )}
                </div>
                <RightPanelWrapper panel={rightPanel}>
                  <RightPanelContent view={rightPanel.activePanel!} agent={selectedAgent} project={selectedProject} />
                </RightPanelWrapper>
              </div>
            </div>
          ) : (
            <PageSection style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <EmptyState icon={PluggedIcon} titleText="Agent Space" headingLevel="h2">
                <EmptyStateBody>
                  Select an agent from the sidebar, or add a new project to get started.
                </EmptyStateBody>
                <EmptyStateFooter>
                  <EmptyStateActions>
                    <Button variant="primary" icon={<PlusCircleIcon />} onClick={() => setAddProjectModalOpen(true)}>Add Project</Button>
                  </EmptyStateActions>
                </EmptyStateFooter>
              </EmptyState>
            </PageSection>
          )}
        </div>
      </div>

      <AddProjectModal isOpen={addProjectModalOpen} onClose={() => setAddProjectModalOpen(false)} onSave={handleAddProject} />
    </>
  )
}
