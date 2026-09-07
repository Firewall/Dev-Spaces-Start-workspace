import type { Workspace } from './agentSpaceMvpTypes'
import { ChangesPanel } from './ChangesPanel'
import { EditorPanel } from './EditorPanel'
import type { RightPanelView } from './useRightPanel'

export function RightPanelContentMVP({ view, workspace }: {
  view: RightPanelView
  workspace?: Workspace
}) {
  if (view === 'changes') return <ChangesPanel />
  if (view === 'editor') return <EditorPanel />
  if (view === 'terminal') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#1e1e1e' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', fontFamily: '"SF Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', fontSize: 13, lineHeight: '22px' }}>
          <div>
            <span style={{ color: '#b0b0b0' }}>~/{workspace?.name ?? 'workspace'}</span>
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
