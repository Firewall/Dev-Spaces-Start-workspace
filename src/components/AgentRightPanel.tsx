import { Tooltip } from '@patternfly/react-core'
import {
  CodeIcon,
  InfoCircleIcon,
  PencilAltIcon,
  TerminalIcon,
} from '@patternfly/react-icons'
import type { Agent, Project } from './agentSpaceTypes'
import type { ThreadContext } from './agentSpaceMockData'
import { MOCK_THREAD_CONTEXT } from './agentSpaceMockData'
import { ChangesPanel } from './ChangesPanel'
import { EditorPanel } from './EditorPanel'
import { ThreadContextCard } from './ThreadContextCard'
import type { RightPanelView } from './useRightPanel'
import type { useRightPanel } from './useRightPanel'

interface PanelDef {
  key: RightPanelView
  label: string
  icon: React.ReactNode
}

const ALL_PANELS: PanelDef[] = [
  { key: 'context', label: 'Context', icon: <InfoCircleIcon /> },
  { key: 'changes', label: 'Changes', icon: <CodeIcon /> },
  { key: 'editor', label: 'Editor', icon: <PencilAltIcon /> },
  { key: 'terminal', label: 'Terminal', icon: <TerminalIcon /> },
]

export function PanelToggleButtons({ panels, activePanel, onToggle }: {
  panels: RightPanelView[]
  activePanel: RightPanelView | null
  onToggle: (view: RightPanelView) => void
}) {
  const defs = ALL_PANELS.filter(p => panels.includes(p.key))

  return (
    <>
      {defs.map(tab => (
        <Tooltip key={tab.key} content={tab.label} position="bottom">
          <button
            className="header-icon-btn"
            data-active={activePanel === tab.key}
            onClick={() => onToggle(tab.key)}
            aria-label={tab.label}
          >
            {tab.icon}
            <span className="panel-label">{tab.label}</span>
          </button>
        </Tooltip>
      ))}
    </>
  )
}

function buildContext(agent: Agent, project?: Project): ThreadContext {
  return MOCK_THREAD_CONTEXT[agent.id] ?? {
    repo: project?.repoUrl?.replace('https://github.com/', '') ?? project?.name ?? 'unknown',
    branch: agent.branch ?? 'main',
    policies: [{ label: 'Requires 2 approvals' }, { label: 'No direct push to main' }],
  }
}

export function RightPanelContent({ view, agent, project }: {
  view: RightPanelView
  agent: Agent
  project?: Project
}) {
  if (view === 'context') {
    return (
      <div style={{ height: '100%', overflowY: 'auto' }}>
        <ThreadContextCard context={buildContext(agent, project)} agentBranch={agent.branch} issue={agent.issue} />
      </div>
    )
  }
  if (view === 'changes') return <ChangesPanel />
  if (view === 'editor') return <EditorPanel />
  if (view === 'terminal') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#1e1e1e' }}>
        <div style={{
          flex: 1, overflowY: 'auto', padding: '12px 16px',
          fontFamily: '"SF Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
          fontSize: 13, lineHeight: '22px',
        }}>
          <div>
            <span style={{ color: '#b0b0b0' }}>~/{project?.name ?? 'workspace'}</span>
            <span style={{ color: '#808080' }}> $ </span>
            <span style={{ animation: 'blink 1s step-end infinite', color: '#cccccc' }}>&#9612;</span>
          </div>
          <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
        </div>
      </div>
    )
  }
  return null
}

export function RightPanelWrapper({ panel, children }: {
  panel: ReturnType<typeof useRightPanel>
  children: React.ReactNode
}) {
  if (panel.activePanel === null) return null

  return (
    <div style={{ width: panel.panelWidth, minWidth: 300, maxWidth: 900, minHeight: 0, position: 'relative', flexShrink: 0 }}>
      <div
        onMouseDown={panel.handleMouseDown}
        style={{
          position: 'absolute', top: 0, left: 0, bottom: 0,
          width: 4, cursor: 'col-resize', zIndex: 10,
          borderLeft: '1px solid var(--pf-t--global--border--color--default)',
        }}
        onMouseEnter={e => (e.currentTarget.style.borderLeft = '2px solid var(--pf-t--global--color--brand--default)')}
        onMouseLeave={e => { if (!panel.dragging.current) e.currentTarget.style.borderLeft = '1px solid var(--pf-t--global--border--color--default)' }}
      />
      {children}
    </div>
  )
}
