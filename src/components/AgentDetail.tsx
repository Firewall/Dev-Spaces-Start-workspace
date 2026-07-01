import {
  Alert,
  Button,
  Label,
} from '@patternfly/react-core'
import { PluggedIcon } from '@patternfly/react-icons'
import type { Agent, AgentToolId, Project } from './agentSpaceTypes'
import { AGENT_TOOLS } from './agentSpaceMockData'

interface AgentDetailProps {
  agent: Agent
  project: Project | undefined
  isAuthenticated: boolean
  onConnect: () => void
  onAuthenticate: (toolId: AgentToolId) => void
}

const STATUS_COLOR: Record<string, 'green' | 'grey' | 'blue'> = {
  running: 'green',
  stopped: 'grey',
  connecting: 'blue',
}

export function AgentDetail({
  agent,
  project,
  isAuthenticated,
  onConnect,
  onAuthenticate,
}: AgentDetailProps) {
  const toolName = AGENT_TOOLS.find((t) => t.id === agent.tool)?.name ?? agent.tool
  const isConnecting = agent.status === 'connecting'

  return (
    <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 600, fontSize: 15 }}>{agent.summary}</span>
        <Label color={STATUS_COLOR[agent.status] ?? 'grey'} isCompact>{agent.status}</Label>
        <span style={{ fontSize: 13, opacity: 0.6 }}>
          {toolName} &middot; {project?.name ?? 'Unknown'}
        </span>
        <div style={{ marginLeft: 'auto' }}>
          <Button
            variant="primary"
            size="sm"
            icon={<PluggedIcon />}
            isLoading={isConnecting}
            isDisabled={!isAuthenticated || isConnecting}
            onClick={onConnect}
          >
            {isConnecting ? 'Connecting...' : 'Connect'}
          </Button>
        </div>
      </div>

      {!isAuthenticated && (
        <Alert
          variant="warning"
          isInline
          isPlain
          title={`Authenticate with ${toolName} to connect.`}
          actionLinks={
            <Button variant="link" isInline onClick={() => onAuthenticate(agent.tool)}>
              Authenticate now
            </Button>
          }
        />
      )}
    </div>
  )
}
