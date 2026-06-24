import { useState } from 'react'
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  Label,
  MenuToggle,
} from '@patternfly/react-core'
import { BarsIcon, CheckIcon } from '@patternfly/react-icons'
import type { AgentToolId, ToolAuth } from './agentSpaceTypes'
import { AGENT_TOOLS } from './agentSpaceMockData'
import { BrandIcon } from './BrandIcons'

interface AgentAuthPanelProps {
  toolAuth: ToolAuth[]
  onAuthenticate: (toolId: AgentToolId) => void
}

export function AgentAuthPanel({ toolAuth, onAuthenticate }: AgentAuthPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  const authCount = AGENT_TOOLS.filter(
    (t) => toolAuth.find((a) => a.toolId === t.id)?.authenticated,
  ).length

  return (
    <Dropdown
      isOpen={isOpen}
      onSelect={() => {}}
      onOpenChange={setIsOpen}
      popperProps={{ position: 'right' }}
      toggle={(toggleRef) => (
        <MenuToggle
          ref={toggleRef}
          onClick={() => setIsOpen((o) => !o)}
          isExpanded={isOpen}
          variant="plain"
          aria-label="Settings menu"
          style={{ padding: 4 }}
        >
          <BarsIcon />
        </MenuToggle>
      )}
    >
      <DropdownList>
        {AGENT_TOOLS.map((tool) => {
          const auth = toolAuth.find((a) => a.toolId === tool.id)
          const isAuth = auth?.authenticated ?? false
          return (
            <DropdownItem
              key={tool.id}
              icon={<BrandIcon id={tool.id} size={18} />}
              description={
                isAuth ? (
                  <Label color="green" icon={<CheckIcon />} isCompact>
                    Authenticated
                  </Label>
                ) : (
                  <Button
                    variant="link"
                    size="sm"
                    isInline
                    onClick={(e) => {
                      e.stopPropagation()
                      onAuthenticate(tool.id)
                    }}
                  >
                    Authenticate
                  </Button>
                )
              }
              isDisabled={isAuth}
              onClick={() => {
                if (!isAuth) onAuthenticate(tool.id)
              }}
            >
              {tool.name}
            </DropdownItem>
          )
        })}
      </DropdownList>
    </Dropdown>
  )
}
