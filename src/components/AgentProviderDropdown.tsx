import { useRef, useState } from 'react'
import {
  Flex,
  FlexItem,
  Menu,
  MenuContainer,
  MenuContent,
  MenuItem,
  MenuList,
  MenuToggle,
  Switch,
} from '@patternfly/react-core'
import type { AccessMode, AgentMode, AgentSettings, AgentToolId, ContextWindowSize, ReasoningMode } from './agentSpaceTypes'
import { AGENT_TOOLS, CONTEXT_WINDOW_OPTIONS, PROVIDER_MODELS } from './agentSpaceMockData'
import { BrandIcon } from './BrandIcons'

interface AgentProviderDropdownProps {
  tool: AgentToolId
  settings: AgentSettings
  onToolChange: (tool: AgentToolId) => void
  onSettingsChange: (settings: AgentSettings) => void
}

const ACCESS_OPTIONS: { id: AccessMode; label: string }[] = [
  { id: 'full-access', label: 'Full access' },
  { id: 'auto-accept-edits', label: 'Auto accept edits' },
  { id: 'supervised', label: 'Supervised' },
]

export function AgentProviderDropdown({
  tool,
  settings,
  onToolChange,
  onSettingsChange,
}: AgentProviderDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const toolName = AGENT_TOOLS.find((t) => t.id === tool)?.name ?? tool
  const models = PROVIDER_MODELS[tool] ?? []
  const currentModelName = models.find((m) => m.id === settings.model)?.name ?? settings.model
  const currentCtxLabel = CONTEXT_WINDOW_OPTIONS.find((o) => o.id === settings.contextWindow)?.label ?? settings.contextWindow

  const update = (patch: Partial<AgentSettings>) => {
    onSettingsChange({ ...settings, ...patch })
  }

  const providerMenu = (
    <Menu onSelect={(_e, itemId) => {
      const newTool = itemId as AgentToolId
      onToolChange(newTool)
      const newModels = PROVIDER_MODELS[newTool]
      if (newModels?.length) {
        update({ model: newModels[0].id })
      }
      setIsOpen(false)
    }}>
      <MenuContent>
        <MenuList>
          {AGENT_TOOLS.map((t) => (
            <MenuItem key={t.id} itemId={t.id} icon={<BrandIcon id={t.id} size={16} />} isSelected={t.id === tool}>
              {t.name}
            </MenuItem>
          ))}
        </MenuList>
      </MenuContent>
    </Menu>
  )

  const modelMenu = (
    <Menu onSelect={(_e, itemId) => { update({ model: String(itemId) }); setIsOpen(false) }}>
      <MenuContent>
        <MenuList>
          {models.map((m) => (
            <MenuItem key={m.id} itemId={m.id} isSelected={m.id === settings.model}>
              {m.name}
            </MenuItem>
          ))}
        </MenuList>
      </MenuContent>
    </Menu>
  )

  const reasoningMenu = (
    <Menu onSelect={(_e, itemId) => { update({ reasoningMode: String(itemId) as ReasoningMode }); setIsOpen(false) }}>
      <MenuContent>
        <MenuList>
          <MenuItem itemId="standard" isSelected={settings.reasoningMode === 'standard'}>Standard</MenuItem>
          <MenuItem itemId="extended" isSelected={settings.reasoningMode === 'extended'}>Extended</MenuItem>
        </MenuList>
      </MenuContent>
    </Menu>
  )

  const contextMenu = (
    <Menu onSelect={(_e, itemId) => { update({ contextWindow: String(itemId) as ContextWindowSize }); setIsOpen(false) }}>
      <MenuContent>
        <MenuList>
          {CONTEXT_WINDOW_OPTIONS.map((opt) => (
            <MenuItem key={opt.id} itemId={opt.id} isSelected={opt.id === settings.contextWindow}>
              {opt.label}
            </MenuItem>
          ))}
        </MenuList>
      </MenuContent>
    </Menu>
  )

  const modeMenu = (
    <Menu onSelect={(_e, itemId) => { update({ agentMode: String(itemId) as AgentMode }); setIsOpen(false) }}>
      <MenuContent>
        <MenuList>
          <MenuItem itemId="build" isSelected={settings.agentMode === 'build'}>Build</MenuItem>
          <MenuItem itemId="plan" isSelected={settings.agentMode === 'plan'}>Plan</MenuItem>
        </MenuList>
      </MenuContent>
    </Menu>
  )

  const accessMenu = (
    <Menu onSelect={(_e, itemId) => { update({ accessMode: String(itemId) as AccessMode }); setIsOpen(false) }}>
      <MenuContent>
        <MenuList>
          {ACCESS_OPTIONS.map((opt) => (
            <MenuItem key={opt.id} itemId={opt.id} isSelected={opt.id === settings.accessMode}>
              {opt.label}
            </MenuItem>
          ))}
        </MenuList>
      </MenuContent>
    </Menu>
  )

  return (
    <>
    <style>{`
      .agent-provider-menu .pf-v6-c-menu__item-toggle-icon {
        font-size: 12px;
      }
    `}</style>
    <MenuContainer
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      toggle={
        <MenuToggle
          ref={toggleRef}
          onClick={() => setIsOpen((o) => !o)}
          isExpanded={isOpen}
          variant="plainText"
          style={{ fontWeight: 600, fontSize: 14, padding: '4px 8px' }}
        >
          <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
            <FlexItem>
              <BrandIcon id={tool} size={18} />
            </FlexItem>
            <FlexItem>{toolName}</FlexItem>
          </Flex>
        </MenuToggle>
      }
      toggleRef={toggleRef}
      menu={
        <Menu ref={menuRef} containsFlyout className="agent-provider-menu">
          <MenuContent>
            <MenuList>
              <MenuItem
                flyoutMenu={providerMenu}
                description={toolName}
                itemId="provider-group"
              >
                Provider
              </MenuItem>
              <MenuItem
                flyoutMenu={modelMenu}
                description={currentModelName}
                itemId="model-group"
              >
                Model
              </MenuItem>
              <MenuItem
                flyoutMenu={reasoningMenu}
                description={settings.reasoningMode === 'standard' ? 'Standard' : 'Extended'}
                itemId="reasoning-group"
              >
                Reasoning
              </MenuItem>
              <MenuItem
                flyoutMenu={contextMenu}
                description={currentCtxLabel}
                itemId="ctx-group"
              >
                Context window
              </MenuItem>
              <MenuItem
                itemId="fast-mode"
                onClick={(e) => {
                  e.stopPropagation()
                  update({ fastMode: !settings.fastMode })
                }}
              >
                <Flex
                  alignItems={{ default: 'alignItemsCenter' }}
                  justifyContent={{ default: 'justifyContentSpaceBetween' }}
                  style={{ width: '100%' }}
                >
                  <FlexItem>Fast mode</FlexItem>
                  <FlexItem>
                    <Switch
                      id="fast-mode-switch"
                      isChecked={settings.fastMode}
                      onChange={() => update({ fastMode: !settings.fastMode })}
                      aria-label="Fast mode"
                    />
                  </FlexItem>
                </Flex>
              </MenuItem>
              <MenuItem
                flyoutMenu={modeMenu}
                description={settings.agentMode === 'build' ? 'Build' : 'Plan'}
                itemId="mode-group"
              >
                Mode
              </MenuItem>
              <MenuItem
                flyoutMenu={accessMenu}
                description={ACCESS_OPTIONS.find((o) => o.id === settings.accessMode)?.label}
                itemId="access-group"
              >
                Access
              </MenuItem>
            </MenuList>
          </MenuContent>
        </Menu>
      }
      menuRef={menuRef}
    />
    </>
  )
}
