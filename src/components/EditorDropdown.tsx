import { useRef, useState, useSyncExternalStore } from 'react'
import {
  Divider,
  DrilldownMenu,
  Label,
  Menu,
  MenuContainer,
  MenuContent,
  MenuItem,
  MenuItemAction,
  MenuList,
  MenuToggle,
  Popper,
  Select,
  SelectList,
  SelectOption,
  ToggleGroup,
  ToggleGroupItem,
} from '@patternfly/react-core'
import { CogIcon, DesktopIcon, EllipsisVIcon } from '@patternfly/react-icons'
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

// ---------------------------------------------------------------------------
// Prototype: version-picker variants, switchable via a toggle above the field.
// ---------------------------------------------------------------------------

type PickerVariant = 'side' | 'inline' | 'flyout' | 'kebab' | 'drilldown'

const VARIANTS: { id: PickerVariant; label: string }[] = [
  { id: 'side', label: 'Side select' },
  { id: 'inline', label: 'Inline text' },
  { id: 'flyout', label: 'Flyout' },
  { id: 'kebab', label: 'Kebab' },
  { id: 'drilldown', label: 'Drilldown' },
]

const VARIANT_KEY = 'editor-version-picker-variant'
const variantListeners = new Set<() => void>()
let currentVariant: PickerVariant = (() => {
  try {
    const v = localStorage.getItem(VARIANT_KEY)
    if (VARIANTS.some((x) => x.id === v)) return v as PickerVariant
  } catch {
    /* ignore */
  }
  return 'side'
})()

function setVariant(v: PickerVariant) {
  currentVariant = v
  try {
    localStorage.setItem(VARIANT_KEY, v)
  } catch {
    /* ignore */
  }
  variantListeners.forEach((l) => l())
}

function usePickerVariant() {
  return useSyncExternalStore(
    (l) => {
      variantListeners.add(l)
      return () => variantListeners.delete(l)
    },
    () => currentVariant,
  )
}

type Editor = (typeof EDITORS)[number]

function hasMultipleVersions(e: Editor) {
  return (e.versions?.length ?? 0) > 1
}

/** Toggle content shared by all variants. Shows the chosen version only when it isn't the default. */
function EditorToggleContent({ selected, version, showVersion }: { selected?: Editor; version: string; showVersion?: boolean }) {
  return (
    <>
      {selected?.label ?? 'Select editor'}
      {selected && <EditorBadges editor={selected} />}
      {showVersion && selected && version && version !== getDefaultEditorVersion(selected.id) && (
        <Label isCompact color="blue" style={{ marginLeft: 8 }}>
          {version}
        </Label>
      )}
    </>
  )
}

interface EditorDropdownProps {
  value: string
  version: string
  onChange: (id: string, version: string) => void
}

export function EditorDropdown(props: EditorDropdownProps) {
  const variant = usePickerVariant()
  const [showCustomModal, setShowCustomModal] = useState(false)

  const picker = (() => {
    const common = { ...props, onCustom: () => setShowCustomModal(true) }
    switch (variant) {
      case 'inline':
        return <SideVariant {...common} inline />
      case 'flyout':
        return <FlyoutVariant {...common} />
      case 'kebab':
        return <KebabVariant {...common} />
      case 'drilldown':
        return <DrilldownVariant {...common} />
      default:
        return <SideVariant {...common} />
    }
  })()

  return (
    <>
      <div
        style={{
          marginBottom: 'var(--pf-t--global--spacer--sm)',
          padding: 'var(--pf-t--global--spacer--xs) var(--pf-t--global--spacer--sm)',
          border: '1px dashed var(--pf-t--global--border--color--default)',
          borderRadius: 'var(--pf-t--global--border--radius--small)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--pf-t--global--spacer--sm)',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: 'var(--pf-t--global--font--size--body--sm)', color: 'var(--pf-t--global--text--color--subtle)' }}>
          Mockup:
        </span>
        <ToggleGroup isCompact aria-label="Version picker mockup">
          {VARIANTS.map((v) => (
            <ToggleGroupItem
              key={v.id}
              text={v.label}
              buttonId={`picker-${v.id}`}
              isSelected={variant === v.id}
              onChange={() => setVariant(v.id)}
            />
          ))}
        </ToggleGroup>
      </div>

      {picker}

      {showCustomModal && (
        <CustomEditorModal
          onClose={() => setShowCustomModal(false)}
          onSave={(cfg) => {
            props.onChange('custom', '')
            setShowCustomModal(false)
            console.log('Custom editor config:', cfg)
          }}
        />
      )}
    </>
  )
}

interface VariantProps extends EditorDropdownProps {
  onCustom: () => void
}

function useEditorSelect({ value, version, onChange, onCustom }: VariantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selected = EDITORS.find((e) => e.id === value)
  function selectEditor(id: string, v?: string) {
    if (id === 'custom') onCustom()
    else onChange(id, v ?? (id === value ? version : getDefaultEditorVersion(id)))
    setIsOpen(false)
  }
  return { isOpen, setIsOpen, selected, selectEditor }
}

/** Variant A (current) and B: version picker sits next to the editor select. */
function SideVariant(props: VariantProps & { inline?: boolean }) {
  const { value, version, onChange, inline } = props
  const { isOpen, setIsOpen, selected, selectEditor } = useEditorSelect(props)
  const versions = selected?.versions ?? []

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--pf-t--global--spacer--md)' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Select
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          onSelect={(_e, v) => selectEditor(String(v))}
          selected={value}
          toggle={(toggleRef) => (
            <MenuToggle
              ref={toggleRef}
              onClick={() => setIsOpen((o) => !o)}
              isExpanded={isOpen}
              isFullWidth
              icon={selected ? <EditorIcon id={selected.id} isCustom={selected.isCustom} /> : <DesktopIcon />}
            >
              <EditorToggleContent selected={selected} version={version} />
            </MenuToggle>
          )}
        >
          <SelectList>
            {EDITORS.map((e) => (
              <SelectOption
                key={e.id}
                value={e.id}
                isSelected={e.id === value}
                icon={<EditorIcon id={e.id} isCustom={e.isCustom} />}
                description={getLicenseText(e.id)}
              >
                {e.label}
                <EditorBadges editor={e} />
              </SelectOption>
            ))}
          </SelectList>
        </Select>
      </div>
      {inline ? (
        versions.length > 1 && (
          <div style={{ flexShrink: 0 }}>
            <InlineVersionToggle versions={versions} value={version} onChange={(v) => onChange(value, v)} />
          </div>
        )
      ) : (
        <div style={{ width: 140, flexShrink: 0 }}>
          <VersionSelect versions={versions} value={version} onChange={(v) => onChange(value, v)} />
        </div>
      )}
    </div>
  )
}

/** Variant B: lightweight plain-text toggle ("latest ▾") instead of a full bordered select. */
function InlineVersionToggle({ versions, value, onChange }: { versions: string[]; value: string; onChange: (v: string) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <Select
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      selected={value}
      onSelect={(_e, v) => {
        onChange(String(v))
        setIsOpen(false)
      }}
      popperProps={{ position: 'end' }}
      toggle={(toggleRef) => (
        <MenuToggle ref={toggleRef} variant="plainText" onClick={() => setIsOpen((o) => !o)} isExpanded={isOpen} aria-label="Editor version">
          <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>Version: </span>
          {value}
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

function VersionMenuItems({ editor, version, isCurrent }: { editor: Editor; version: string; isCurrent: boolean }) {
  return (
    <>
      {(editor.versions ?? []).map((v, i) => (
        <MenuItem key={v} itemId={`${editor.id}::${v}`} isSelected={isCurrent && v === version}>
          {v}
          {i === 0 && (
            <Label isCompact style={{ marginLeft: 8 }}>
              default
            </Label>
          )}
        </MenuItem>
      ))}
    </>
  )
}

/** Variant C: hover/arrow-right on an editor opens a flyout with its versions. Clicking the row picks the default. */
function FlyoutVariant(props: VariantProps) {
  const { value, version } = props
  const { isOpen, setIsOpen, selected, selectEditor } = useEditorSelect(props)

  function handleSelect(_e: unknown, itemId: string | number | undefined) {
    const [id, v] = String(itemId).split('::')
    selectEditor(id, v)
  }

  return (
    <Select
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      onSelect={handleSelect}
      selected={value}
      containsFlyout
      toggle={(toggleRef) => (
        <MenuToggle
          ref={toggleRef}
          onClick={() => setIsOpen((o) => !o)}
          isExpanded={isOpen}
          isFullWidth
          icon={selected ? <EditorIcon id={selected.id} isCustom={selected.isCustom} /> : <DesktopIcon />}
        >
          <EditorToggleContent selected={selected} version={version} showVersion />
        </MenuToggle>
      )}
    >
      <SelectList>
        {EDITORS.map((e) => (
          <SelectOption
            key={e.id}
            value={e.id}
            isSelected={e.id === value}
            icon={<EditorIcon id={e.id} isCustom={e.isCustom} />}
            description={getLicenseText(e.id)}
            flyoutMenu={
              hasMultipleVersions(e) ? (
                <Menu onSelect={handleSelect} id={`flyout-${e.id}`}>
                  <MenuContent>
                    <MenuList>
                      <VersionMenuItems editor={e} version={version} isCurrent={e.id === value} />
                    </MenuList>
                  </MenuContent>
                </Menu>
              ) : undefined
            }
          >
            {e.label}
            <EditorBadges editor={e} />
          </SelectOption>
        ))}
      </SelectList>
    </Select>
  )
}

/** Variant D: each editor row gets a ⋮ action; clicking it pops a small version menu. Clicking the row picks the default. */
function KebabVariant(props: VariantProps) {
  const { value, version } = props
  const { isOpen, setIsOpen, selected, selectEditor } = useEditorSelect(props)
  const [kebab, setKebab] = useState<{ editorId: string; anchor: HTMLElement } | null>(null)
  const versionMenuRef = useRef<HTMLDivElement>(null)

  const kebabEditor = kebab ? EDITORS.find((e) => e.id === kebab.editorId) : undefined

  return (
    <>
      <Select
        isOpen={isOpen}
        onOpenChange={(o) => {
          // Clicks inside the nested version popper count as "outside" for the Select; ignore those.
          if (!o && kebab) return
          setIsOpen(o)
        }}
        onSelect={(_e, v) => {
          setKebab(null)
          selectEditor(String(v))
        }}
        selected={value}
        toggle={(toggleRef) => (
          <MenuToggle
            ref={toggleRef}
            onClick={() => setIsOpen((o) => !o)}
            isExpanded={isOpen}
            isFullWidth
            icon={selected ? <EditorIcon id={selected.id} isCustom={selected.isCustom} /> : <DesktopIcon />}
          >
            <EditorToggleContent selected={selected} version={version} showVersion />
          </MenuToggle>
        )}
      >
        <SelectList>
          {EDITORS.map((e) => (
            <SelectOption
              key={e.id}
              value={e.id}
              isSelected={e.id === value}
              icon={<EditorIcon id={e.id} isCustom={e.isCustom} />}
              description={getLicenseText(e.id)}
              actions={
                hasMultipleVersions(e) ? (
                  <MenuItemAction
                    icon={<EllipsisVIcon />}
                    actionId="versions"
                    aria-label={`Choose ${e.label} version`}
                    onClick={(ev) => {
                      ev.stopPropagation()
                      const anchor = ev.currentTarget as HTMLElement
                      setKebab((k) => (k?.editorId === e.id ? null : { editorId: e.id, anchor }))
                    }}
                  />
                ) : undefined
              }
            >
              {e.label}
              <EditorBadges editor={e} />
            </SelectOption>
          ))}
        </SelectList>
      </Select>

      {kebab && kebabEditor && (
        <Popper
          isVisible
          triggerRef={() => kebab.anchor}
          popperRef={versionMenuRef}
          placement="right-start"
          appendTo={() => document.body}
          zIndex={10000}
          onDocumentClick={(ev, trigger, popperEl) => {
            const t = ev?.target as Node | null
            if (t && (trigger?.contains(t) || popperEl?.contains(t))) return
            setKebab(null)
          }}
          onDocumentKeyDown={(ev) => {
            if (ev?.key === 'Escape') setKebab(null)
          }}
          popper={
            <Menu
              ref={versionMenuRef}
              onSelect={(_e, itemId) => {
                const [id, v] = String(itemId).split('::')
                setKebab(null)
                selectEditor(id, v)
              }}
            >
              <MenuContent>
                <MenuList>
                  <VersionMenuItems editor={kebabEditor} version={version} isCurrent={kebabEditor.id === value} />
                </MenuList>
              </MenuContent>
            </Menu>
          }
        />
      )}
    </>
  )
}

/** Variant E: clicking an editor with versions slides the menu over to a version list (with a back item). */
function DrilldownVariant(props: VariantProps) {
  const { value, version } = props
  const { isOpen, setIsOpen, selected, selectEditor } = useEditorSelect(props)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [drilledIn, setDrilledIn] = useState<string[]>([])
  const [path, setPath] = useState<string[]>([])
  const [heights, setHeights] = useState<Record<string, number>>({})
  const [activeMenu, setActiveMenu] = useState('editor-root')

  function reset() {
    setDrilledIn([])
    setPath([])
    setActiveMenu('editor-root')
  }

  function setOpen(o: boolean) {
    setIsOpen(o)
    if (!o) reset()
  }

  const menu = (
    <Menu
      id="editor-root"
      ref={menuRef}
      containsDrilldown
      drilldownItemPath={path}
      drilledInMenus={drilledIn}
      activeMenu={activeMenu}
      selected={value}
      onDrillIn={(_e, fromMenuId, toMenuId, pathId) => {
        setDrilledIn((d) => [...d, fromMenuId])
        setPath((p) => [...p, pathId])
        setActiveMenu(toMenuId)
      }}
      onDrillOut={(_e, toMenuId) => {
        setDrilledIn((d) => d.slice(0, -1))
        setPath((p) => p.slice(0, -1))
        setActiveMenu(toMenuId)
      }}
      onGetMenuHeight={(menuId, height) => {
        setHeights((h) => (h[menuId] === undefined || (menuId !== 'editor-root' && h[menuId] !== height) ? { ...h, [menuId]: height } : h))
      }}
      onSelect={(_e, itemId) => {
        const s = String(itemId)
        if (s.startsWith('back:')) return
        const [id, v] = s.split('::')
        const ed = EDITORS.find((x) => x.id === id)
        // Drilling into a multi-version editor shouldn't select it yet.
        if (!v && ed && hasMultipleVersions(ed)) return
        selectEditor(id, v)
        reset()
      }}
    >
      <MenuContent menuHeight={heights[activeMenu] ? `${heights[activeMenu]}px` : undefined}>
        <MenuList>
          {EDITORS.map((e) =>
            hasMultipleVersions(e) ? (
              <MenuItem
                key={e.id}
                itemId={e.id}
                isSelected={e.id === value}
                icon={<EditorIcon id={e.id} isCustom={e.isCustom} />}
                description={getLicenseText(e.id)}
                direction="down"
                drilldownMenu={
                  <DrilldownMenu id={`drill-${e.id}`}>
                    <MenuItem itemId={`back:${e.id}`} direction="up">
                      {e.label}
                    </MenuItem>
                    <Divider component="li" />
                    <VersionMenuItems editor={e} version={version} isCurrent={e.id === value} />
                  </DrilldownMenu>
                }
              >
                {e.label}
                <EditorBadges editor={e} />
              </MenuItem>
            ) : (
              <MenuItem
                key={e.id}
                itemId={e.id}
                isSelected={e.id === value}
                icon={<EditorIcon id={e.id} isCustom={e.isCustom} />}
                description={getLicenseText(e.id)}
              >
                {e.label}
                <EditorBadges editor={e} />
              </MenuItem>
            ),
          )}
        </MenuList>
      </MenuContent>
    </Menu>
  )

  return (
    <MenuContainer
      isOpen={isOpen}
      onOpenChange={setOpen}
      menu={menu}
      menuRef={menuRef}
      toggleRef={toggleRef}
      popperProps={{ width: 'trigger' }}
      toggle={
        <MenuToggle
          ref={toggleRef}
          onClick={() => setOpen(!isOpen)}
          isExpanded={isOpen}
          isFullWidth
          icon={selected ? <EditorIcon id={selected.id} isCustom={selected.isCustom} /> : <DesktopIcon />}
        >
          <EditorToggleContent selected={selected} version={version} showVersion />
        </MenuToggle>
      }
    />
  )
}
