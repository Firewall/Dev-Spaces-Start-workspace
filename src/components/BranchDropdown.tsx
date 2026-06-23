import { useState } from 'react'
import {
  MenuToggle,
  Select,
  SelectList,
  SelectOption,
  Tooltip,
} from '@patternfly/react-core'
import { CodeBranchIcon } from '@patternfly/react-icons'

const MOCK_BRANCHES = ['main', 'develop', 'feature/auth', 'feature/ui-redesign', 'release/v2.0', 'hotfix/login-bug']

interface BranchDropdownProps {
  value: string
  onChange: (val: string) => void
  disabled?: boolean
}

export function BranchDropdown({ value, onChange, disabled }: BranchDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Select
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      onSelect={(_e, val) => {
        onChange(val as string)
        setIsOpen(false)
      }}
      selected={value}
      toggle={(toggleRef) => {
        const toggle = (
          <MenuToggle
            ref={toggleRef}
            onClick={() => setIsOpen((o) => !o)}
            isExpanded={isOpen}
            isDisabled={disabled}
            icon={<CodeBranchIcon />}
            style={{ minWidth: 180 }}
          >
            {value || 'Select branch'}
          </MenuToggle>
        )
        return disabled ? (
          <Tooltip content="Enter a Git repository URL to select a branch">
            <span style={{ cursor: 'not-allowed' }}>{toggle}</span>
          </Tooltip>
        ) : toggle
      }}
    >
      <SelectList>
        {MOCK_BRANCHES.map((b) => (
          <SelectOption key={b} value={b}>
            {b}
          </SelectOption>
        ))}
      </SelectList>
    </Select>
  )
}
