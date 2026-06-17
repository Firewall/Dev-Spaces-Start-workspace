import { useState } from 'react'
import {
  MenuToggle,
  Select,
  SelectList,
  SelectOption,
  Label,
  LabelGroup,
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
  { id: 'copilot', name: 'GitHub Copilot', description: 'AI-powered code completion', authenticated: true },
  { id: 'codewhisperer', name: 'Amazon CodeWhisperer', description: 'ML-powered code suggestions', authenticated: false },
  { id: 'tabnine', name: 'Tabnine', description: 'AI code assistant', authenticated: true },
  { id: 'cody', name: 'Sourcegraph Cody', description: 'AI coding assistant with context', authenticated: false },
  { id: 'cursor-ai', name: 'Cursor AI', description: 'AI-first code editor features', authenticated: false },
  { id: 'continue', name: 'Continue', description: 'Open-source AI assistant', authenticated: true },
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
    <div>
      {selectedTools.length > 0 && (
        <LabelGroup style={{ marginBottom: 8 }}>
          {selectedTools.map((tool) => (
            <Label
              key={tool.id}
              onClose={() => remove(tool.id)}
              icon={hasBrandIcon(tool.id) ? <BrandIcon id={tool.id} size={14} /> : <StarIcon />}
            >
              {tool.name}
            </Label>
          ))}
        </LabelGroup>
      )}

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
