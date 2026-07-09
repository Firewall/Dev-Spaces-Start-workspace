import { useState } from 'react'
import {
  MenuToggle,
  Popover,
  Select,
  SelectList,
  SelectOption,
  Switch,
  Label,
  TextInput,
} from '@patternfly/react-core'
import {
  CheckIcon,
  CogIcon,
  ExternalLinkAltIcon,
  PlusCircleIcon,
  StarIcon,
  TimesCircleIcon,
} from '@patternfly/react-icons'
import { BrandIcon } from './BrandIcons'
import { hasBrandIcon } from './brandIconData'

interface AITool {
  id: string
  name: string
  description: string
  authenticated: boolean
}

export interface AIToolConfig {
  autoStart: boolean
  args: string
}

const DEFAULT_CONFIG: AIToolConfig = { autoStart: true, args: '' }

const AVAILABLE_TOOLS: AITool[] = [
  { id: 'claude-code', name: 'Claude Code', description: 'Anthropic AI coding agent', authenticated: true },
  { id: 'cursor-ai', name: 'Cursor Agent', description: 'AI-first code editor agent', authenticated: false },
  { id: 'codex', name: 'Codex Agent', description: 'OpenAI autonomous coding agent', authenticated: true },
  { id: 'opencode', name: 'OpenCode', description: 'Open-source AI coding CLI', authenticated: false },
  { id: 'kiro', name: 'Kiro CLI', description: 'AWS AI-powered development CLI', authenticated: true },
]

interface AIToolsSectionProps {
  selected: string[]
  onChange: (ids: string[]) => void
}

export function AIToolsSection({ selected, onChange }: AIToolsSectionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [configs, setConfigs] = useState<Record<string, AIToolConfig>>({})

  function getConfig(id: string): AIToolConfig {
    return configs[id] ?? DEFAULT_CONFIG
  }

  function updateConfig(id: string, patch: Partial<AIToolConfig>) {
    setConfigs((prev) => ({ ...prev, [id]: { ...getConfig(id), ...patch } }))
  }

  function toggle(id: string) {
    onChange(
      selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id],
    )
  }

  function remove(id: string) {
    onChange(selected.filter((s) => s !== id))
  }

  const selectedTools = AVAILABLE_TOOLS.filter((t) => selected.includes(t.id))

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      {selectedTools.map((tool) => {
        const cfg = getConfig(tool.id)
        return (
          <Label
            key={tool.id}
            onClose={() => remove(tool.id)}
            icon={hasBrandIcon(tool.id) ? <BrandIcon id={tool.id} size={14} /> : <StarIcon />}
            style={{ height: 36, display: 'inline-flex', alignItems: 'center', padding: '0 12px', fontSize: '14px' }}
          >
            {tool.name}
            <Popover
              headerContent={`Configure ${tool.name}`}
              bodyContent={
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 240 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                      {tool.authenticated ? (
                        <>
                          <CheckIcon color="var(--pf-v6-global--success-color--100, green)" />
                          Authenticated
                        </>
                      ) : (
                        <>
                          <TimesCircleIcon color="var(--pf-v6-global--danger-color--100, #c9190b)" />
                          Not authenticated
                        </>
                      )}
                    </span>
                    <a
                      href="#/user-preferences/agent-configurations"
                      style={{ fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    >
                      Manage <ExternalLinkAltIcon style={{ fontSize: 11 }} />
                    </a>
                  </div>
                  <Switch
                    id={`${tool.id}-autostart`}
                    label="Auto-start with workspace"
                    isChecked={cfg.autoStart}
                    onChange={(_e, checked) => updateConfig(tool.id, { autoStart: checked })}
                  />
                  <div>
                    <label htmlFor={`${tool.id}-args`} style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>
                      Custom arguments
                    </label>
                    <TextInput
                      id={`${tool.id}-args`}
                      value={cfg.args}
                      onChange={(_e, val) => updateConfig(tool.id, { args: val })}
                      placeholder="e.g. --flag=value"
                    />
                  </div>
                </div>
              }
            >
              <button
                type="button"
                aria-label={`Configure ${tool.name}`}
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0 0 0 6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  color: 'var(--pf-v6-global--Color--200, #6a6e73)',
                }}
              >
                <CogIcon style={{ fontSize: 12 }} />
              </button>
            </Popover>
          </Label>
        )
      })}

      <Select
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onSelect={(_e, val) => toggle(val as string)}
        toggle={(toggleRef) => (
          <MenuToggle
            ref={toggleRef}
            onClick={() => setIsOpen((o) => !o)}
            isExpanded={isOpen}
            variant="secondary"
            icon={<PlusCircleIcon />}
          >
            Add Tools
          </MenuToggle>
        )}
      >
        <SelectList>
          {AVAILABLE_TOOLS.map((tool) => {
            const isSelected = selected.includes(tool.id)
            return (
              <SelectOption
                key={tool.id}
                value={tool.id}
                isSelected={isSelected}
                hasCheckbox
                description={
                  <>
                    {tool.description}
                    {tool.authenticated && (
                      <span style={{ marginLeft: 8, color: 'var(--pf-v6-global--success-color--100, green)' }}>
                        <CheckIcon /> Authenticated
                      </span>
                    )}
                  </>
                }
                icon={hasBrandIcon(tool.id) ? <BrandIcon id={tool.id} size={20} /> : <StarIcon />}
              >
                {tool.name}
              </SelectOption>
            )
          })}
        </SelectList>
      </Select>
    </div>
  )
}
