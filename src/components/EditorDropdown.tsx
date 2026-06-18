import { useState } from 'react'
import {
  Label,
  MenuToggle,
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core'
import { CogIcon, DesktopIcon } from '@patternfly/react-icons'
import { CustomEditorModal } from './CustomEditorModal'
import { BrandIcon } from './BrandIcons'
import { hasBrandIcon } from './brandIconData'

const JETBRAINS_IDS = new Set(['intellij', 'goland', 'pycharm', 'webstorm', 'clion', 'phpstorm', 'rider', 'rubymine', 'toolbox'])

const EDITORS = [
  { id: 'vscode-oss', label: 'Visual Studio Code - Open Source (Web)', isDefault: true },
  { id: 'vscode', label: 'Visual Studio Code - Desktop (SSH)' },
  { id: 'kiro', label: 'Kiro (SSH)', isTechPreview: true },
  { id: 'clion', label: 'CLion' },
  { id: 'goland', label: 'GoLand' },
  { id: 'intellij', label: 'IntelliJ IDEA Ultimate' },
  { id: 'phpstorm', label: 'PhpStorm' },
  { id: 'pycharm', label: 'PyCharm Professional' },
  { id: 'rider', label: 'Rider' },
  { id: 'rubymine', label: 'RubyMine' },
  { id: 'terminal', label: 'Web Terminal' },
  { id: 'webstorm', label: 'WebStorm' },
  { id: 'toolbox', label: 'JetBrains Toolbox App', isTechPreview: true },
  { id: 'custom', label: 'Custom Editor', isCustom: true as const },
]

interface EditorDropdownProps {
  value: string
  onChange: (val: string) => void
}

function EditorIcon({ id, isCustom }: { id: string; isCustom?: boolean }) {
  if (isCustom) return <CogIcon />
  if (hasBrandIcon(id)) return <BrandIcon id={id} size={18} />
  return <DesktopIcon />
}

function getLicenseText(id: string) {
  if (JETBRAINS_IDS.has(id)) {
    return (
      <>
        Provided by JetBrains under{' '}
        <a
          href="https://www.jetbrains.com/legal/docs/toolbox/user/"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(ev) => ev.stopPropagation()}
        >
          License
        </a>
      </>
    )
  }
  if (id === 'vscode') {
    return (
      <>
        Provided by Microsoft under{' '}
        <a
          href="https://code.visualstudio.com/License"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(ev) => ev.stopPropagation()}
        >
          License
        </a>
      </>
    )
  }
  if (id === 'kiro') {
    return (
      <>
        Provided by Amazon under{' '}
        <a
          href="https://kiro.dev/terms"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(ev) => ev.stopPropagation()}
        >
          License
        </a>
      </>
    )
  }
  return null
}

export function EditorDropdown({ value, onChange }: EditorDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showCustomModal, setShowCustomModal] = useState(false)

  const selected = EDITORS.find((e) => e.id === value)

  function handleSelect(_e: React.MouseEvent | undefined, val: string | number | undefined) {
    const id = val as string
    if (id === 'custom') {
      setShowCustomModal(true)
    } else {
      onChange(id)
    }
    setIsOpen(false)
  }

  return (
    <>
      <Select
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onSelect={handleSelect}
        selected={value}
        toggle={(toggleRef) => (
          <MenuToggle
            ref={toggleRef}
            onClick={() => setIsOpen((o) => !o)}
            isExpanded={isOpen}
            isFullWidth
            icon={selected ? <EditorIcon id={selected.id} isCustom={selected.isCustom} /> : <DesktopIcon />}
          >
            {selected?.label ?? 'Select editor'}
            {selected?.isDefault && (
              <Label isCompact style={{ marginLeft: 8 }}>
                default
              </Label>
            )}
            {selected?.isTechPreview && (
              <Label isCompact color="orange" style={{ marginLeft: 8 }}>
                Tech Preview
              </Label>
            )}
          </MenuToggle>
        )}
      >
        <SelectList>
          {EDITORS.map((e) => {
            const license = getLicenseText(e.id)
            return (
              <SelectOption
                key={e.id}
                value={e.id}
                isSelected={e.id === value}
                icon={<EditorIcon id={e.id} isCustom={e.isCustom} />}
                description={license}
              >
                {e.label}
                {e.isDefault && (
                  <Label isCompact style={{ marginLeft: 8 }}>
                    default
                  </Label>
                )}
                {e.isTechPreview && (
                  <Label isCompact color="orange" style={{ marginLeft: 8 }}>
                    Tech Preview
                  </Label>
                )}
              </SelectOption>
            )
          })}
        </SelectList>
      </Select>

      {showCustomModal && (
        <CustomEditorModal
          onClose={() => setShowCustomModal(false)}
          onSave={(cfg) => {
            onChange('custom')
            setShowCustomModal(false)
            console.log('Custom editor config:', cfg)
          }}
        />
      )}
    </>
  )
}
