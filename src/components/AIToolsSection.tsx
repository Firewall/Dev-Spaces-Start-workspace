import { useState } from 'react'
import {
  MenuToggle,
  Select,
  SelectList,
  SelectOption,
  Label,
} from '@patternfly/react-core'
import {
  CheckIcon,
  PlusCircleIcon,
  StarIcon,
} from '@patternfly/react-icons'
import { BrandIcon } from './BrandIcons'
import { hasBrandIcon } from './brandIconData'

interface AITool {
  id: string
  name: string
  description: string
  authenticated: boolean
}

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
      {selectedTools.map((tool) => (
        <Label
          key={tool.id}
          onClose={() => remove(tool.id)}
          icon={hasBrandIcon(tool.id) ? <BrandIcon id={tool.id} size={14} /> : <StarIcon />}
          style={{ height: 36, display: 'inline-flex', alignItems: 'center', padding: '0 12px', fontSize: '14px' }}
        >
          {tool.name}
        </Label>
      ))}

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
