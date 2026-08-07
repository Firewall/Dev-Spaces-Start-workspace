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
  Tooltip,
} from '@patternfly/react-core'
import {
  CodeBranchIcon,
  CodeIcon,
  CogIcon,
  DesktopIcon,
  PencilAltIcon,
  PlusCircleIcon,
  PluggedIcon,
  TerminalIcon,
  GithubIcon,
  GitlabIcon,
} from '@patternfly/react-icons'
import type { Agent, AgentSettings, AgentToolId, Project } from './agentSpaceTypes'
import type { ChatMessage as ChatMessageType } from './agentSpaceV2Types'
import { AGENT_TOOLS, DEFAULT_AGENT_SETTINGS, INFERENCE_MODELS, MOCK_AGENTS, MOCK_PROJECTS, MOCK_TERMINAL_OUTPUT, resolveModelSettings } from './agentSpaceMockData'
import { MOCK_STREAMING_RESPONSES, MOCK_THINKING, MOCK_TOOL_CALLS } from './agentSpaceV2MockData'
import { AgentSidebar, JiraIcon } from './AgentSidebar'
import { AddProjectModal } from './AddProjectModal'
import { BrandIcon } from './BrandIcons'
import { hasBrandIcon } from './brandIconData'
import { EDITORS } from './EditorDropdown'
import type { ViewMode } from './AgentProviderDropdown'
import { OpenShellBadge } from './OpenShellBadge'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { DiffPanel } from './DiffPanel'
import { GitPanel } from './GitPanel'
import { EditorPanel } from './EditorPanel'
import { IssuesPanel } from './IssuesPanel'
import { ChatSettingsBar } from './ChatSettingsBar'
import { VSCodeView } from './VSCodeView'

let nextProjectId = 200
let nextAgentId = 200
let nextMsgId = 200
let responseIndex = 0

const AUTO_SUMMARIES = [
  'New coding session',
  'Working on changes',
  'Investigating issue',
  'Implementing feature',
  'Code review session',
  'Debugging session',
  'Refactoring code',
  'Writing tests',
]

export function AgentSpace({ username }: { username?: string }) {
  // --- View mode ---
  const [viewMode] = useState<ViewMode>('chat')

  // --- Agent/project state ---
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS)
  const [agents, setAgents] = useState<Agent[]>(MOCK_AGENTS)
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(
    () => MOCK_AGENTS[0]?.id ?? null,
  )
  const [addProjectModalOpen, setAddProjectModalOpen] = useState(false)
  const [agentSettingsMap, setAgentSettingsMap] = useState<Record<string, AgentSettings>>(() => {
    const map: Record<string, AgentSettings> = {}
    MOCK_AGENTS.forEach(a => {
      const resolved = resolveModelSettings(a.model)
      map[a.id] = { ...DEFAULT_AGENT_SETTINGS, ...resolved }
    })
    return map
  })

  // --- Chat state ---
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessageType[]>>(() => ({
    'agent-1': [
      { id: 'pre-1', role: 'user', content: 'Implement the OAuth2 login flow with PKCE support. We need Google, GitHub, and custom OIDC providers.', timestamp: Date.now() - 4 * 60 * 1000 },
      { id: 'pre-2', role: 'assistant', content: "I'll implement the OAuth2 PKCE login flow. Let me start by setting up the auth module structure.\n\n## Plan\n1. Create `src/auth/oauth2.ts` with PKCE challenge generation\n2. Add provider configs for Google, GitHub, and generic OIDC\n3. Implement the callback handler and token exchange\n4. Add session management with refresh token rotation", timestamp: Date.now() - 4 * 60 * 1000, toolCalls: [
        { id: 'tc-1', name: 'Write', input: 'src/auth/oauth2.ts', output: 'File created (142 lines)' },
        { id: 'tc-2', name: 'Write', input: 'src/auth/providers.ts', output: 'File created (87 lines)' },
      ] },
      { id: 'pre-3', role: 'user', content: 'Looks good. Can you add the callback route handler too?', timestamp: Date.now() - 3 * 60 * 1000 },
      { id: 'pre-4', role: 'assistant', content: "Added the callback handler at `/auth/callback`. It validates the state parameter, exchanges the code using PKCE, and sets up the session.\n\n```typescript\nexport async function handleCallback(req: Request) {\n  const { code, state } = parseCallbackParams(req.url)\n  const verifier = await getStoredVerifier(state)\n  const tokens = await exchangeCode(code, verifier)\n  return createSession(tokens)\n}\n```\n\nI'm now working on the refresh token rotation logic.", timestamp: Date.now() - 2 * 60 * 1000, toolCalls: [
        { id: 'tc-3', name: 'Write', input: 'src/auth/callback.ts', output: 'File created (63 lines)' },
        { id: 'tc-4', name: 'Edit', input: 'src/routes/index.ts — added /auth/callback route', output: 'Applied 1 edit' },
      ] },
    ],
    'agent-8': [
      { id: 'pre-5', role: 'user', content: 'Investigate the memory leak on the dashboard. Memory grows when switching between tabs.', timestamp: Date.now() - 20 * 60 * 1000 },
      { id: 'pre-6', role: 'assistant', content: "I've been profiling the dashboard component. The leak is caused by event listeners in `DashboardTabs` that aren't cleaned up on unmount.\n\n```typescript\n// Problem: addEventListener without cleanup\nuseEffect(() => {\n  window.addEventListener('resize', handleResize)\n  // Missing: return () => window.removeEventListener('resize', handleResize)\n}, [])\n```\n\nI found 3 components with this pattern. However, I need your input before proceeding:\n\n**The `ChartWidget` component subscribes to a WebSocket channel per tab.** Should I:\n1. Disconnect the WebSocket when the tab is hidden (saves memory but causes a brief reload)\n2. Keep the connection alive but cap the in-memory data buffer to 1000 points\n\nThis is a trade-off between memory usage and perceived responsiveness. Which approach do you prefer?", timestamp: Date.now() - 15 * 60 * 1000, thinking: 'The memory profiler shows 3 sources of leaks. Two are straightforward event listener cleanups. The third involves the WebSocket data buffer which is a design decision.', toolCalls: [
        { id: 'tc-5', name: 'Read', input: 'src/components/DashboardTabs.tsx', output: '(248 lines)' },
        { id: 'tc-6', name: 'Read', input: 'src/components/ChartWidget.tsx', output: '(186 lines)' },
      ] },
    ],
    'agent-10': [
      { id: 'pre-7', role: 'user', content: 'Fix the rate limiter — it drops valid requests under high concurrency instead of queuing them.', timestamp: Date.now() - 8 * 60 * 1000 },
      { id: 'pre-8', role: 'assistant', content: "Found the issue. The rate limiter uses a simple counter that races under concurrent access. Replacing it with a token bucket algorithm using atomic operations.\n\n```typescript\nclass TokenBucket {\n  private tokens: number\n  private lastRefill: number\n  \n  async consume(): Promise<boolean> {\n    await this.refill()\n    if (this.tokens > 0) {\n      this.tokens--\n      return true\n    }\n    return false\n  }\n}\n```\n\nRunning the load tests now to verify the fix holds under 500+ concurrent requests.", timestamp: Date.now() - 5 * 60 * 1000, toolCalls: [
        { id: 'tc-7', name: 'Edit', input: 'src/middleware/rateLimiter.ts — replaced counter with token bucket', output: 'Applied 3 edits' },
        { id: 'tc-8', name: 'Bash', input: 'npm run test:load -- --concurrency 500', output: 'All 500 requests handled correctly. 0 dropped.' },
      ] },
    ],
  }))
  const [isStreaming, setIsStreaming] = useState(false)
  const streamingRef = useRef<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // --- VSCode view state ---
  const [showVSCode, setShowVSCode] = useState(false)

  // --- Toolbar state ---
  const [openInOpen, setOpenInOpen] = useState(false)
  type RightPanelView = 'changes' | 'git' | 'editor' | 'terminal' | 'issues'
  const [rightPanelView, setRightPanelView] = useState<RightPanelView | null>(null)
  const toggleRightPanel = useCallback((view: RightPanelView) => {
    setRightPanelView(prev => prev === view ? null : view)
  }, [])


  // --- Resizable panels ---
  const [sidebarWidth, setSidebarWidth] = useState(260)
  const [rightPanelWidth, setRightPanelWidth] = useState(560)
  const sidebarDragging = useRef(false)
  const rightPanelDragging = useRef(false)

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

  const handleRightPanelMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    rightPanelDragging.current = true
    const startX = e.clientX
    const startWidth = rightPanelWidth
    const onMove = (ev: MouseEvent) => {
      if (!rightPanelDragging.current) return
      setRightPanelWidth(Math.max(300, Math.min(900, startWidth - (ev.clientX - startX))))
    }
    const onUp = () => {
      rightPanelDragging.current = false
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [rightPanelWidth])

  const [terminalLineCounts, setTerminalLineCounts] = useState<Record<string, number>>({})
  const terminalGenRef = useRef(0)

  useEffect(() => {
    return () => { if (streamingRef.current !== null) clearInterval(streamingRef.current) }
  }, [])

  // Auto-scroll chat
  const currentMessages = useMemo(
    () => selectedAgentId ? (chatMessages[selectedAgentId] ?? []) : [],
    [selectedAgentId, chatMessages],
  )
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return
    const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 80
    if (nearBottom) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentMessages])

  const [viewedComplete, setViewedComplete] = useState<Set<string>>(() => new Set([
    'agent-2', 'agent-7', 'agent-3', 'agent-9',
    'agent-11', 'agent-12', 'agent-4', 'agent-13',
  ]))

  const selectAgent = useCallback((id: string | null) => {
    setSelectedAgentId(id)
    setOpenInOpen(false)
    setRightPanelView(null)
    if (id) {
      setViewedComplete(prev => {
        const next = new Set(prev)
        next.add(id)
        return next
      })
    }
  }, [])

  // --- Derived values ---
  const selectedAgent = useMemo(() => agents.find(a => a.id === selectedAgentId), [agents, selectedAgentId])
  const selectedProject = useMemo(() => projects.find(p => p.id === selectedAgent?.projectId), [projects, selectedAgent])
  const selectedAgentSettings = useMemo(() => {
    if (!selectedAgentId) return DEFAULT_AGENT_SETTINGS
    return agentSettingsMap[selectedAgentId] ?? DEFAULT_AGENT_SETTINGS
  }, [selectedAgentId, agentSettingsMap])

  // --- Terminal mode: increment line count via interval, derive visible lines ---
  const terminalAllLines = useMemo(
    () => selectedAgent ? MOCK_TERMINAL_OUTPUT[selectedAgent.tool] : [],
    [selectedAgent],
  )
  const terminalLineCount = selectedAgentId ? (terminalLineCounts[selectedAgentId] ?? 0) : 0
  const terminalLines = useMemo(
    () => terminalAllLines.slice(0, terminalLineCount),
    [terminalAllLines, terminalLineCount],
  )

  useEffect(() => {
    const gen = ++terminalGenRef.current
    if (viewMode !== 'terminal' || !selectedAgent || !selectedAgentId) return
    const total = MOCK_TERMINAL_OUTPUT[selectedAgent.tool].length
    const existing = terminalLineCounts[selectedAgentId] ?? 0
    if (existing >= total) return
    let count = existing
    const interval = setInterval(() => {
      if (gen !== terminalGenRef.current) { clearInterval(interval); return }
      count++
      setTerminalLineCounts(prev => ({ ...prev, [selectedAgentId]: count }))
      if (count >= total) clearInterval(interval)
    }, 400)
    return () => clearInterval(interval)
  }, [viewMode, selectedAgent, selectedAgentId, terminalLineCounts])

  // --- Agent/project handlers ---
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

  const createAgent = useCallback((projectId: string, tool: AgentToolId) => {
    const id = `agent-${nextAgentId++}`
    const toolName = AGENT_TOOLS.find(t => t.id === tool)?.name ?? tool
    const summary = AUTO_SUMMARIES[nextAgentId % AUTO_SUMMARIES.length]
    const name = `${toolName} - ${summary}`
    const defaultModels = INFERENCE_MODELS[DEFAULT_AGENT_SETTINGS.inferenceProvider] ?? []
    const defaultModelName = defaultModels.find(m => m.id === DEFAULT_AGENT_SETTINGS.model)?.name ?? DEFAULT_AGENT_SETTINGS.model
    setAgentSettingsMap(prev => ({ ...prev, [id]: { ...DEFAULT_AGENT_SETTINGS } }))
    setAgents(prev => [...prev, { id, name, tool, status: 'running', projectId, summary, lastActivity: Date.now(), model: defaultModelName }])
    selectAgent(id)
  }, [selectAgent])

  const handleAddAgent = useCallback((projectId: string) => {
    const projectAgents = agents.filter(a => a.projectId === projectId)
    const tool = projectAgents.length > 0
      ? projectAgents.reduce((a, b) => (a.lastActivity > b.lastActivity ? a : b)).tool
      : 'opencode'
    createAgent(projectId, tool)
  }, [agents, createAgent])


  const handleRenameProject = useCallback((projectId: string, newName: string) => {
    setProjects(prev => prev.map(p => (p.id === projectId ? { ...p, name: newName } : p)))
  }, [])

  const handleDeleteAgent = useCallback((agentId: string) => {
    if (agentId === selectedAgentId) selectAgent(null)
    setAgents(prev => prev.filter(a => a.id !== agentId))
  }, [selectedAgentId, selectAgent])

  const handleToolChange = useCallback((newTool: AgentToolId) => {
    if (!selectedAgentId) return
    const toolName = AGENT_TOOLS.find(t => t.id === newTool)?.name ?? newTool
    setAgents(prev => prev.map(a => {
      if (a.id !== selectedAgentId) return a
      const parts = a.name.split(' - ')
      const threadName = parts.length > 1 ? parts.slice(1).join(' - ') : a.summary
      return { ...a, tool: newTool, name: `${toolName} - ${threadName}` }
    }))
  }, [selectedAgentId])

  const handleSettingsChange = useCallback((newSettings: AgentSettings) => {
    if (!selectedAgentId) return
    setAgentSettingsMap(prev => ({ ...prev, [selectedAgentId]: newSettings }))
    const models = INFERENCE_MODELS[newSettings.inferenceProvider] ?? []
    const displayName = models.find(m => m.id === newSettings.model)?.name ?? newSettings.model
    setAgents(prev => prev.map(a => a.id === selectedAgentId ? { ...a, model: displayName } : a))
  }, [selectedAgentId])

  const chatInputFooter = selectedAgent ? (
    <ChatSettingsBar
      tool={selectedAgent.tool}
      settings={selectedAgentSettings}
      onToolChange={handleToolChange}
      onSettingsChange={handleSettingsChange}
      messageCount={currentMessages.length}
      branch={selectedAgent.branch}
      onBranchChange={(b) => setAgents(prev => prev.map(a => a.id === selectedAgentId ? { ...a, branch: b } : a))}
    />
  ) : undefined

  // --- Chat handler ---
  const handleSendMessage = useCallback((content: string) => {
    if (isStreaming || !selectedAgentId) return

    const agentId = selectedAgentId
    const userMsg: ChatMessageType = { id: `msg-${nextMsgId++}`, role: 'user', content, timestamp: Date.now() }
    const assistantMsgId = `msg-${nextMsgId++}`
    const idx = responseIndex % MOCK_STREAMING_RESPONSES.length
    const thinking = MOCK_THINKING[idx % MOCK_THINKING.length]
    const toolCalls = MOCK_TOOL_CALLS[idx % MOCK_TOOL_CALLS.length]
    const assistantMsg: ChatMessageType = { id: assistantMsgId, role: 'assistant', content: '', timestamp: Date.now(), isStreaming: true, thinking, toolCalls }
    const fullResponse = MOCK_STREAMING_RESPONSES[idx]
    responseIndex++

    setChatMessages(prev => ({ ...prev, [agentId]: [...(prev[agentId] ?? []), userMsg, assistantMsg] }))
    setIsStreaming(true)

    let charIndex = 0
    const thinkingDelay = window.setTimeout(() => {
      streamingRef.current = window.setInterval(() => {
        const chunkSize = Math.floor(Math.random() * 8) + 6
        charIndex = Math.min(charIndex + chunkSize, fullResponse.length)
        const partial = fullResponse.slice(0, charIndex)
        const done = charIndex >= fullResponse.length

        setChatMessages(prev => ({
          ...prev,
          [agentId]: (prev[agentId] ?? []).map(m =>
            m.id === assistantMsgId ? { ...m, content: partial, isStreaming: !done } : m
          ),
        }))

        if (done) {
          if (streamingRef.current !== null) clearInterval(streamingRef.current)
          streamingRef.current = null
          setIsStreaming(false)
        }
      }, 20)
    }, 500)

    return () => { clearTimeout(thinkingDelay); if (streamingRef.current !== null) clearInterval(streamingRef.current) }
  }, [isStreaming, selectedAgentId])

  const handleStopStreaming = useCallback(() => {
    if (streamingRef.current !== null) {
      clearInterval(streamingRef.current)
      streamingRef.current = null
    }
    if (selectedAgentId) {
      setChatMessages(prev => ({
        ...prev,
        [selectedAgentId]: (prev[selectedAgentId] ?? []).map(m =>
          m.isStreaming ? { ...m, isStreaming: false } : m
        ),
      }))
    }
    setIsStreaming(false)
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
          {/* Resize handle */}
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
            <>
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
                showIssues
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
            </>
        </div>

        {/* Main content area */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--agent-content-bg)', minWidth: 0 }}>
          {showVSCode ? (
            <VSCodeView projectName={selectedProject?.name} onBack={() => setShowVSCode(false)} />
          ) : selectedAgent ? (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              {/* Toolbar styles — responsive via container queries */}
              <style>{`
                .agent-toolbar-v2 .pf-v6-c-menu-toggle,
                .agent-toolbar-v2 .pf-v6-c-button {
                  height: 28px !important; max-height: 28px !important; min-height: 28px !important;
                  font-size: 13px; display: inline-flex; align-items: center; box-sizing: border-box;
                  padding-inline: 8px !important; padding-block: 0 !important;
                }
                .agent-toolbar-v2 .pf-v6-c-menu-toggle.pf-m-split-button {
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
                .agent-toolbar-v2 .pf-v6-c-menu-toggle.pf-m-split-button > * {
                  align-self: stretch !important;
                  display: inline-flex !important; align-items: center !important;
                  padding-block: 0 !important;
                }
                .agent-toolbar-v2 .pf-v6-c-menu-toggle.pf-m-split-button .pf-v6-c-menu-toggle__controls {
                  display: inline-flex; align-items: center; justify-content: center;
                }
                .agent-toolbar-v2 .pf-v6-c-menu-toggle.pf-m-split-button .pf-v6-c-menu-toggle__controls .pf-v6-c-menu-toggle__toggle-icon {
                  display: inline-flex; align-items: center; min-width: 12px;
                }
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

                /* Responsive: hide OpenShell label text below 1000px */
                @container toolbar (max-width: 1000px) {
                  .openshell-label { display: none !important; }
                }
                /* Responsive: hide panel button labels below 900px */
                @container toolbar (max-width: 900px) {
                  .header-icon-btn .panel-label { display: none; }
                  .header-icon-btn { padding: 0; width: 28px; }
                }
                /* Responsive: hide provider model name below 700px */
                @container toolbar (max-width: 700px) {
                  .toolbar-provider-name { display: none !important; }
                }
                /* Responsive: collapse "Open in VS Code" text below 800px */
                @container toolbar (max-width: 800px) {
                  .open-editor-label { display: none !important; }
                }
              `}</style>

              {/* Toolbar — minimal when empty, full when active */}
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
                  {viewMode === 'chat' && ([
                        { key: 'changes' as const, label: 'Changes', icon: <CodeIcon /> },
                        { key: 'git' as const, label: 'Git', icon: <CodeBranchIcon /> },
                        { key: 'editor' as const, label: 'Editor', icon: <PencilAltIcon /> },
                        { key: 'terminal' as const, label: 'Terminal', icon: <TerminalIcon /> },
                        ...(selectedAgent?.issue ? [{ key: 'issues' as const, label: selectedAgent.issue.source === 'github' ? 'GitHub' : selectedAgent.issue.source === 'jira' ? 'Jira' : 'GitLab', icon: selectedAgent.issue.source === 'github' ? <GithubIcon /> : selectedAgent.issue.source === 'jira' ? <JiraIcon size={14} /> : <GitlabIcon /> }] : []),
                      ]).map(tab => (
                        <Tooltip key={tab.key} content={tab.label} position="bottom">
                          <button
                            className="header-icon-btn"
                            data-active={rightPanelView === tab.key}
                            onClick={() => toggleRightPanel(tab.key)}
                            aria-label={tab.label}
                          >
                            {tab.icon}
                            <span className="panel-label">{tab.label}</span>
                          </button>
                        </Tooltip>
                      ))}
                      <div style={{ width: 1, height: 16, background: 'var(--pf-t--global--border--color--default)', flexShrink: 0 }} />
                      <div className="agent-toolbar-v2">
                        <Dropdown isOpen={openInOpen} onSelect={() => setOpenInOpen(false)} onOpenChange={setOpenInOpen} popperProps={{ position: 'right' }}
                          toggle={(toggleRef) => (
                            <MenuToggle
                              ref={toggleRef}
                              isExpanded={openInOpen}
                              splitButtonItems={[
                                <MenuToggleAction key="open-vscode" onClick={() => setShowVSCode(true)}>
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                    <BrandIcon id="vscode" size={16} />
                                    <span className="open-editor-label">Open in VS Code</span>
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

              {/* Content area — terminal or chat */}
              {viewMode === 'terminal' ? (
                <div
                  style={{
                    flex: 1,
                    background: '#1e1e1e',
                    color: '#d4d4d4',
                    fontFamily: '"SF Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                    fontSize: 13,
                    lineHeight: '22px',
                    padding: '12px 16px',
                    overflowY: 'auto',
                  }}
                >
                  {terminalLines.map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                  {terminalLines.length >= terminalAllLines.length && (
                    <span style={{ animation: 'blink 1s step-end infinite', color: '#cccccc' }}>&#9612;</span>
                  )}
                  <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
                </div>
              ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'row', minHeight: 0, overflow: 'hidden' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  {currentMessages.length === 0 ? (
                    /* Centered welcome layout */
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
                      <div style={{ width: '100%', maxWidth: 680 }}>
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                          <span style={{ fontSize: 20, fontWeight: 600, color: 'var(--pf-t--global--text--color--regular)' }}>
                            What should we build in <span style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}>{selectedProject?.name ?? 'this project'}</span>?
                          </span>
                        </div>
                        <ChatInput
                          onSend={handleSendMessage}
                          isStreaming={isStreaming}
                          onStop={handleStopStreaming}
                          footer={chatInputFooter}
                        />
                      </div>
                    </div>
                  ) : (
                    /* Active chat layout */
                    <>
                      <div ref={messagesContainerRef} style={{ flex: 1, overflowY: 'auto' }}>
                        {currentMessages.map(msg => <ChatMessage key={msg.id} message={msg} tool={selectedAgent.tool} username={username} />)}
                        <div ref={messagesEndRef} />
                      </div>
                      <ChatInput
                        onSend={handleSendMessage}
                        isStreaming={isStreaming}
                        onStop={handleStopStreaming}
                        footer={chatInputFooter}
                      />
                    </>
                  )}
                </div>

                {/* Right panel with tab views */}
                {rightPanelView !== null && (
                  <div style={{ width: rightPanelWidth, minWidth: 300, maxWidth: 900, minHeight: 0, position: 'relative', flexShrink: 0 }}>
                    <div
                      onMouseDown={handleRightPanelMouseDown}
                      style={{
                        position: 'absolute', top: 0, left: 0, bottom: 0,
                        width: 4, cursor: 'col-resize', zIndex: 10,
                        borderLeft: '1px solid var(--pf-t--global--border--color--default)',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.borderLeft = '2px solid var(--pf-t--global--color--brand--default)')}
                      onMouseLeave={e => { if (!rightPanelDragging.current) e.currentTarget.style.borderLeft = '1px solid var(--pf-t--global--border--color--default)' }}
                    />
                      {rightPanelView === 'changes' && <DiffPanel />}
                      {rightPanelView === 'git' && <GitPanel />}
                      {rightPanelView === 'editor' && <EditorPanel />}
                      {rightPanelView === 'issues' && selectedAgent?.issue && <IssuesPanel issue={selectedAgent.issue} />}
                      {rightPanelView === 'terminal' && (
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#1e1e1e' }}>
                          <div style={{
                            flex: 1, overflowY: 'auto', padding: '12px 16px',
                            fontFamily: '"SF Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                            fontSize: 13, lineHeight: '22px',
                          }}>
                            <div>
                              <span style={{ color: '#b0b0b0' }}>~/{selectedProject?.name ?? 'workspace'}</span>
                              <span style={{ color: '#808080' }}> $ </span>
                              <span style={{ animation: 'blink 1s step-end infinite', color: '#cccccc' }}>&#9612;</span>
                            </div>
                            <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
                          </div>
                        </div>
                      )}
                  </div>
                )}


              </div>
              )}
            </div>
          ) : (
            <PageSection style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <EmptyState icon={PluggedIcon} titleText="Agent Space" headingLevel="h2">
                <EmptyStateBody>
                  Select an agent from the sidebar to view details and connect, or add a new project to get started.
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
