import { useState } from 'react'
import {
  Button,
  EmptyState,
  EmptyStateBody,
  Form,
  FormGroup,
  FormSection,
  Label,
  SearchInput,
  Switch,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core'
import {
  AngleRightIcon,
  PlusCircleIcon,
  PluggedIcon,
} from '@patternfly/react-icons'
import type { McpServer, Skill } from './globalSettingsMockData'
import {
  MOCK_MCP_CATALOG,
  MOCK_SKILLS_CATALOG,
} from './globalSettingsMockData'
import { AGENT_TOOLS, INFERENCE_PROVIDERS, INFERENCE_MODELS } from './agentSpaceMockData'
import { BrandIcon } from './BrandIcons'

export type SettingsView = 'providers' | 'mcps' | 'skills' | 'settings'

const STATUS_COLORS: Record<McpServer['status'], 'green' | 'grey' | 'red'> = {
  connected: 'green',
  disconnected: 'red',
  error: 'red',
}

const VIEW_TITLES: Record<SettingsView, string> = {
  providers: 'Agents & Models',
  mcps: 'MCP Servers',
  skills: 'Skills',
  settings: 'Settings',
}

const VIEW_DESCRIPTIONS: Record<SettingsView, string> = {
  providers: 'Configure coding agents and inference providers available in your workspaces.',
  mcps: 'Connect Model Context Protocol servers to extend agent capabilities.',
  skills: 'Enable or disable skills that agents can use during sessions.',
  settings: 'Global settings that affect all agent spaces and workspaces.',
}

interface GlobalSettingsPanelProps {
  view: SettingsView
}

const INITIAL_HARNESS_STATUS: Record<string, boolean> = {
  'claude-code': true,
  'codex': false,
  'opencode': true,
  'cursor-agent': false,
}

const INITIAL_INFERENCE_STATUS: Record<string, boolean> = {
  'redhat-ai': true,
  'claude': true,
  'cursor': false,
  'openai': false,
  'google-vertex': false,
  'aws-bedrock': false,
}

function AccordionRow({
  icon,
  name,
  description,
  status,
  statusColor,
  extra,
  checked,
  onToggle,
  id,
}: {
  icon?: React.ReactNode
  name: string
  description: string
  status?: string
  statusColor?: 'green' | 'grey' | 'red'
  extra?: React.ReactNode
  checked: boolean
  onToggle: () => void
  id: string
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className="settings-accordion-row"
      style={{
        borderRadius: 8,
        transition: 'background 0.1s',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 12px',
          cursor: 'pointer',
          borderRadius: 8,
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <AngleRightIcon style={{
          fontSize: 12,
          transition: 'transform 0.15s',
          transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
          color: 'var(--pf-t--global--text--color--subtle)',
          flexShrink: 0,
        }} />
        {icon && <div style={{ flexShrink: 0 }}>{icon}</div>}
        <span style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>{name}</span>
          {status && (
            <Label
              isCompact
              color={statusColor === 'green' ? 'green' : statusColor === 'red' ? 'red' : 'grey'}
              icon={<span style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                display: 'inline-block',
                background: statusColor === 'green' ? 'var(--pf-t--global--color--status--success--default)'
                  : statusColor === 'red' ? 'var(--pf-t--global--color--status--danger--default)'
                  : 'var(--pf-t--global--icon--color--disabled)',
              }} />}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Label>
          )}
        </span>
        <div onClick={e => e.stopPropagation()} style={{ flexShrink: 0 }}>
          <Switch
            isChecked={checked}
            onChange={onToggle}
            aria-label={`Toggle ${name}`}
          />
        </div>
      </div>
      {expanded && (
        <div style={{ padding: '0 12px 12px 46px' }}>
          <div id={id} style={{ fontSize: 13, color: 'var(--pf-t--global--text--color--subtle)', marginBottom: extra ? 8 : 0 }}>
            {description}
          </div>
          {extra}
        </div>
      )}
    </div>
  )
}

export function AgentProvidersSettings() {
  const [harnessConnected, setHarnessConnected] = useState<Record<string, boolean>>(INITIAL_HARNESS_STATUS)
  const [inferenceConnected, setInferenceConnected] = useState<Record<string, boolean>>(INITIAL_INFERENCE_STATUS)

  return (
    <>
      <style>{`
        .settings-accordion-row:hover {
          background: var(--pf-t--global--background--color--secondary--default);
        }
      `}</style>
      <Title headingLevel="h3" size="md" style={{ marginBottom: 8 }}>Harness</Title>
      <div style={{ marginBottom: 24 }}>
        {AGENT_TOOLS.map(tool => {
          const connected = harnessConnected[tool.id] ?? false
          return (
            <AccordionRow
              key={tool.id}
              id={`harness-${tool.id}`}
              icon={<BrandIcon id={tool.id} size={24} />}
              name={tool.name}
              description={tool.description}
              status={connected ? 'enabled' : 'disabled'}
              statusColor={connected ? 'green' : 'grey'}
              checked={connected}
              onToggle={() => setHarnessConnected(prev => ({ ...prev, [tool.id]: !prev[tool.id] }))}
            />
          )
        })}
      </div>

      <Title headingLevel="h3" size="md" style={{ marginBottom: 8 }}>Inference Providers</Title>
      <div>
        {INFERENCE_PROVIDERS.map(provider => {
          const models = INFERENCE_MODELS[provider.id] ?? []
          const connected = inferenceConnected[provider.id] ?? false
          return (
            <AccordionRow
              key={provider.id}
              id={`provider-${provider.id}`}
              icon={<BrandIcon id={provider.id} size={24} />}
              name={provider.name}
              description={provider.description}
              status={connected ? 'connected' : 'disconnected'}
              statusColor={connected ? 'green' : 'red'}
              extra={models.length > 0 ? (
                <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                  {models.map(m => <Label key={m.id} isCompact color="grey">{m.name}</Label>)}
                </div>
              ) : undefined}
              checked={connected}
              onToggle={() => setInferenceConnected(prev => ({ ...prev, [provider.id]: !prev[provider.id] }))}
            />
          )
        })}
      </div>
    </>
  )
}

export function GlobalSettingsPanel({ view }: GlobalSettingsPanelProps) {
  const [mcpServers, setMcpServers] = useState<McpServer[]>(MOCK_MCP_CATALOG)
  const [skills, setSkills] = useState<Skill[]>(MOCK_SKILLS_CATALOG)
  const [harnessConnected, setHarnessConnected] = useState<Record<string, boolean>>(INITIAL_HARNESS_STATUS)
  const [inferenceConnected, setInferenceConnected] = useState<Record<string, boolean>>(INITIAL_INFERENCE_STATUS)
  const [mcpFilter, setMcpFilter] = useState('')
  const [skillFilter, setSkillFilter] = useState('')

  const [autoSave, setAutoSave] = useState(true)
  const [showTokenUsage, setShowTokenUsage] = useState(true)
  const [streamResponses, setStreamResponses] = useState(true)
  const [confirmDestructive, setConfirmDestructive] = useState(true)
  const [enableSounds, setEnableSounds] = useState(false)
  const [autoApproveReads, setAutoApproveReads] = useState(true)

  const toggleMcp = (id: string) => {
    setMcpServers(prev =>
      prev.map(s => {
        if (s.id !== id) return s
        const enabled = !s.enabled
        return { ...s, enabled, status: enabled ? 'connected' as const : 'disconnected' as const }
      }),
    )
  }

  const toggleSkill = (id: string) => {
    setSkills(prev => prev.map(s => (s.id === id ? { ...s, enabled: !s.enabled } : s)))
  }

  const filteredMcps = mcpServers.filter(s =>
    s.name.toLowerCase().includes(mcpFilter.toLowerCase()) ||
    s.description.toLowerCase().includes(mcpFilter.toLowerCase()),
  )

  const filteredSkills = skills.filter(s =>
    s.name.toLowerCase().includes(skillFilter.toLowerCase()) ||
    s.description.toLowerCase().includes(skillFilter.toLowerCase()),
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <style>{`
        .settings-accordion-row:hover {
          background: var(--pf-t--global--background--color--secondary--default);
        }
      `}</style>
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid var(--pf-t--global--border--color--default)',
      }}>
        <Title headingLevel="h2" size="lg" style={{ marginBottom: 4 }}>{VIEW_TITLES[view]}</Title>
        <div style={{ fontSize: 14, color: 'var(--pf-t--global--text--color--subtle)' }}>
          {VIEW_DESCRIPTIONS[view]}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
        {view === 'providers' && (
          <div style={{ maxWidth: 720 }}>
            <Title headingLevel="h3" size="md" style={{ marginBottom: 8 }}>Harness</Title>
            <div style={{ marginBottom: 24 }}>
              {AGENT_TOOLS.map(tool => {
                const connected = harnessConnected[tool.id] ?? false
                return (
                  <AccordionRow
                    key={tool.id}
                    id={`harness-${tool.id}`}
                    icon={<BrandIcon id={tool.id} size={24} />}
                    name={tool.name}
                    description={tool.description}
                    status={connected ? 'enabled' : 'disabled'}
                    statusColor={connected ? 'green' : 'grey'}
                    checked={connected}
                    onToggle={() => setHarnessConnected(prev => ({ ...prev, [tool.id]: !prev[tool.id] }))}
                  />
                )
              })}
            </div>

            <Title headingLevel="h3" size="md" style={{ marginBottom: 8 }}>Inference Providers</Title>
            <div>
              {INFERENCE_PROVIDERS.map(provider => {
                const models = INFERENCE_MODELS[provider.id] ?? []
                const connected = inferenceConnected[provider.id] ?? false
                return (
                  <AccordionRow
                    key={provider.id}
                    id={`provider-${provider.id}`}
                    icon={<BrandIcon id={provider.id} size={24} />}
                    name={provider.name}
                    description={provider.description}
                    status={connected ? 'connected' : 'disconnected'}
                    statusColor={connected ? 'green' : 'red'}
                    extra={models.length > 0 ? (
                      <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                        {models.map(m => <Label key={m.id} isCompact color="grey">{m.name}</Label>)}
                      </div>
                    ) : undefined}
                    checked={connected}
                    onToggle={() => setInferenceConnected(prev => ({ ...prev, [provider.id]: !prev[provider.id] }))}
                  />
                )
              })}
            </div>
          </div>
        )}

        {view === 'mcps' && (
          <div style={{ maxWidth: 720 }}>
            <Toolbar clearAllFilters={() => setMcpFilter('')}>
              <ToolbarContent>
                <ToolbarItem style={{ flex: 1, maxWidth: 400 }}>
                  <SearchInput
                    placeholder="Filter MCP servers..."
                    value={mcpFilter}
                    onChange={(_e, val) => setMcpFilter(val)}
                    onClear={() => setMcpFilter('')}
                    aria-label="Filter MCPs"
                  />
                </ToolbarItem>
                <ToolbarItem>
                  <Button variant="secondary" icon={<PlusCircleIcon />}>
                    Add MCP server
                  </Button>
                </ToolbarItem>
              </ToolbarContent>
            </Toolbar>

            {filteredMcps.length === 0 ? (
              <EmptyState headingLevel="h3" icon={PluggedIcon} titleText="No MCP servers found">
                <EmptyStateBody>
                  {mcpFilter
                    ? 'No MCP servers match your filter. Try a different search term.'
                    : 'No MCP servers are configured. Add one to extend agent capabilities.'}
                </EmptyStateBody>
              </EmptyState>
            ) : (
              <div>
                {filteredMcps.map(server => (
                  <AccordionRow
                    key={server.id}
                    id={`mcp-${server.id}`}
                    name={server.name}
                    description={server.description}
                    status={server.status}
                    statusColor={STATUS_COLORS[server.status]}
                    extra={
                      <>
                        <Label isCompact variant="outline">{server.tools} tools</Label>
                        <div style={{ fontSize: 12, color: 'var(--pf-t--global--text--color--subtle)', marginTop: 4, fontFamily: 'var(--pf-t--global--font--family--mono)' }}>
                          {server.endpoint}
                        </div>
                      </>
                    }
                    checked={server.enabled}
                    onToggle={() => toggleMcp(server.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'skills' && (
          <div style={{ maxWidth: 720 }}>
            <Toolbar clearAllFilters={() => setSkillFilter('')}>
              <ToolbarContent>
                <ToolbarItem style={{ flex: 1, maxWidth: 400 }}>
                  <SearchInput
                    placeholder="Filter skills..."
                    value={skillFilter}
                    onChange={(_e, val) => setSkillFilter(val)}
                    onClear={() => setSkillFilter('')}
                    aria-label="Filter skills"
                  />
                </ToolbarItem>
              </ToolbarContent>
            </Toolbar>

            {filteredSkills.length === 0 ? (
              <EmptyState headingLevel="h3" titleText="No skills found">
                <EmptyStateBody>
                  {skillFilter
                    ? 'No skills match your filter. Try a different search term.'
                    : 'No skills are configured.'}
                </EmptyStateBody>
              </EmptyState>
            ) : (
              <div>
                {filteredSkills.map(skill => (
                  <AccordionRow
                    key={skill.id}
                    id={`skill-${skill.id}`}
                    name={skill.name}
                    description={skill.description}
                    checked={skill.enabled}
                    onToggle={() => toggleSkill(skill.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'settings' && (
          <div style={{ maxWidth: 720 }}>
            <Form>
              <FormSection title="General" titleElement="h3">
                <FormGroup label="Auto-save changes" fieldId="setting-auto-save">
                  <Switch
                    id="setting-auto-save"
                    isChecked={autoSave}
                    onChange={(_e, checked) => setAutoSave(checked)}
                    label="Automatically save file changes made by agents"
                  />
                </FormGroup>
                <FormGroup label="Show token usage" fieldId="setting-token-usage">
                  <Switch
                    id="setting-token-usage"
                    isChecked={showTokenUsage}
                    onChange={(_e, checked) => setShowTokenUsage(checked)}
                    label="Display token consumption in chat sessions"
                  />
                </FormGroup>
                <FormGroup label="Stream responses" fieldId="setting-stream">
                  <Switch
                    id="setting-stream"
                    isChecked={streamResponses}
                    onChange={(_e, checked) => setStreamResponses(checked)}
                    label="Show agent responses as they are generated"
                  />
                </FormGroup>
                <FormGroup label="Notification sounds" fieldId="setting-sounds">
                  <Switch
                    id="setting-sounds"
                    isChecked={enableSounds}
                    onChange={(_e, checked) => setEnableSounds(checked)}
                    label="Play sounds for agent completions and errors"
                  />
                </FormGroup>
              </FormSection>

              <FormSection title="Permissions" titleElement="h3">
                <FormGroup label="Confirm destructive actions" fieldId="setting-confirm-destructive">
                  <Switch
                    id="setting-confirm-destructive"
                    isChecked={confirmDestructive}
                    onChange={(_e, checked) => setConfirmDestructive(checked)}
                    label="Require confirmation before file deletions and force pushes"
                  />
                </FormGroup>
                <FormGroup label="Auto-approve read operations" fieldId="setting-auto-approve-reads">
                  <Switch
                    id="setting-auto-approve-reads"
                    isChecked={autoApproveReads}
                    onChange={(_e, checked) => setAutoApproveReads(checked)}
                    label="Allow agents to read files without explicit approval"
                  />
                </FormGroup>
              </FormSection>
            </Form>
          </div>
        )}
      </div>
    </div>
  )
}
