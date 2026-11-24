import { Fragment, useRef, useState } from 'react'
import {
  Divider,
  Label,
  MenuToggle,
  Select,
  SelectList,
  SelectOption,
  MenuSearch,
  MenuSearchInput,
  SearchInput,
} from '@patternfly/react-core'
import { CogIcon, DesktopIcon } from '@patternfly/react-icons'
import { CustomEditorModal } from './CustomEditorModal'
import { BrandIcon } from './BrandIcons'
import { hasBrandIcon } from './brandIconData'
import { EDITORS, getDefaultEditorVersion } from './editorData'

const JETBRAINS_IDS = new Set(['intellij', 'goland', 'pycharm', 'webstorm', 'clion', 'phpstorm', 'rider', 'rubymine', 'toolbox'])

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

function EditorBadges({ editor }: { editor: (typeof EDITORS)[number] }) {
  return (
    <>
      {editor.isDefault && (
        <Label isCompact style={{ marginLeft: 8 }}>
          default
        </Label>
      )}
      {editor.isTechPreview && (
        <Label isCompact color="orange" style={{ marginLeft: 8 }}>
          Tech Preview
        </Label>
      )}
    </>
  )
}

function VersionSelect({
  versions,
  value,
  onChange,
}: {
  versions: string[]
  value: string
  onChange: (v: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const disabled = versions.length < 2
  return (
    <Select
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      selected={value}
      onSelect={(_e, v) => {
        onChange(String(v))
        setIsOpen(false)
      }}
      toggle={(toggleRef) => (
        <MenuToggle
          ref={toggleRef}
          onClick={() => setIsOpen((o) => !o)}
          isExpanded={isOpen}
          isDisabled={disabled}
          isFullWidth
          aria-label="Editor version"
        >
          {value || '—'}
        </MenuToggle>
      )}
    >
      <SelectList>
        {versions.map((v, i) => (
          <SelectOption key={v} value={v} isSelected={v === value}>
            {v}
            {i === 0 && (
              <Label isCompact style={{ marginLeft: 8 }}>
                default
              </Label>
            )}
          </SelectOption>
        ))}
      </SelectList>
    </Select>
  )
}

interface EditorDropdownProps {
  value: string
  version: string
  onChange: (id: string, version: string) => void
}

export function EditorDropdown({ value, version, onChange }: EditorDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [filter, setFilter] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  const selected = EDITORS.find((e) => e.id === value)
  const versions = selected?.versions ?? []

  const query = filter.trim().toLowerCase()
  const builtIn = EDITORS.filter((e) => !e.isCustom)
  const custom = EDITORS.find((e) => e.isCustom)!
  const matches = query
    ? builtIn.filter((e) => e.label.toLowerCase().includes(query) || e.id.toLowerCase().includes(query))
    : builtIn

  function setOpen(open: boolean) {
    setIsOpen(open)
    if (open) {
      // Wait for the menu to mount before focusing the search field.
      requestAnimationFrame(() => searchRef.current?.focus())
    } else {
      setFilter('')
    }
  }

  function choose(id: string) {
    if (id === 'custom') {
      setShowCustomModal(true)
    } else {
      onChange(id, id === value ? version : getDefaultEditorVersion(id))
    }
    setOpen(false)
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--pf-t--global--spacer--md)' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Select
            isOpen={isOpen}
            onOpenChange={setOpen}
            onSelect={(_e, v) => choose(String(v))}
            selected={value}
            toggle={(toggleRef) => (
              <MenuToggle
                ref={toggleRef}
                onClick={() => setOpen(!isOpen)}
                isExpanded={isOpen}
                isFullWidth
                icon={selected ? <EditorIcon id={selected.id} isCustom={selected.isCustom} /> : <DesktopIcon />}
              >
                {selected?.label ?? 'Select editor'}
                {selected && <EditorBadges editor={selected} />}
              </MenuToggle>
            )}
          >
            <MenuSearch>
              <MenuSearchInput>
                <SearchInput
                  ref={searchRef}
                  value={filter}
                  onChange={(_e, v) => setFilter(v)}
                  onClear={() => setFilter('')}
                  placeholder="Search editors"
                  aria-label="Search editors"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && matches.length > 0) {
                      e.preventDefault()
                      choose(matches[0].id)
                    }
                  }}
                />
              </MenuSearchInput>
            </MenuSearch>
            <Divider />
            <SelectList style={{ maxHeight: 400, overflowY: 'auto' }}>
              {matches.length === 0 && (
                <SelectOption isAriaDisabled value="__none">
                  No editors match "{filter.trim()}"
                </SelectOption>
              )}
              {[...matches, custom].map((e) => (
                <Fragment key={e.id}>
                  {e.isCustom && <Divider component="li" />}
                  <SelectOption
                    value={e.id}
                    isSelected={e.id === value}
                    icon={<EditorIcon id={e.id} isCustom={e.isCustom} />}
                    description={e.isCustom ? 'Point to your own editor definition' : getLicenseText(e.id)}
                  >
                    {e.label}
                    <EditorBadges editor={e} />
                  </SelectOption>
                </Fragment>
              ))}
            </SelectList>
          </Select>
        </div>
        <div style={{ width: 140, flexShrink: 0 }}>
          <VersionSelect versions={versions} value={version} onChange={(v) => onChange(value, v)} />
        </div>
      </div>

      {showCustomModal && (
        <CustomEditorModal
          onClose={() => setShowCustomModal(false)}
          onSave={(cfg) => {
            onChange('custom', '')
            setShowCustomModal(false)
            console.log('Custom editor config:', cfg)
          }}
        />
      )}
    </>
  )
}
