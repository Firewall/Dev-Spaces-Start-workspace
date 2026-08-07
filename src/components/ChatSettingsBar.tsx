import { useState } from 'react'
import { CodeBranchIcon } from '@patternfly/react-icons'
import type { AccessMode, AgentSettings, AgentToolId, ContextWindowSize, ReasoningMode } from './agentSpaceTypes'
import { AGENT_TOOLS, CONTEXT_WINDOW_OPTIONS, HARNESS_PROVIDERS, INFERENCE_MODELS, INFERENCE_PROVIDERS } from './agentSpaceMockData'
import { BrandIcon } from './BrandIcons'

const MOCK_BRANCHES = [
  'main',
  'feature/oauth2-login',
  'feature/user-profile',
  'feature/dark-mode',
  'feature/graphql-subs',
  'bugfix/dashboard-leak',
  'bugfix/rate-limiter',
  'bugfix/sidebar-nav',
  'refactor/db-migrations',
  'chore/react-router-v7',
  'chore/ci-cd-pipeline',
  'docs/api-types',
  'perf/db-queries',
  'test/api-integration',
]

interface ChatSettingsBarProps {
  tool: AgentToolId
  settings: AgentSettings
  onToolChange: (tool: AgentToolId) => void
  onSettingsChange: (settings: AgentSettings) => void
  messageCount?: number
  branch?: string
  onBranchChange?: (branch: string) => void
}

const ACCESS_OPTIONS: { id: AccessMode; label: string }[] = [
  { id: 'full-access', label: 'Full access' },
  { id: 'auto-accept-edits', label: 'Auto accept edits' },
  { id: 'supervised', label: 'Supervised' },
]

const REASONING_OPTIONS: { id: ReasoningMode; label: string; isDefault?: boolean }[] = [
  { id: 'standard', label: 'Standard' },
  { id: 'extended', label: 'Extended' },
]

function SettingsChip({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode
  onClick: (e: React.MouseEvent) => void
  active?: boolean
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        fontSize: 12, color: 'var(--pf-t--global--text--color--subtle)',
        padding: '3px 8px', borderRadius: 4, cursor: 'pointer',
        border: 'none', background: active ? 'var(--pf-t--global--background--color--action--plain--hover)' : 'transparent',
        fontFamily: 'inherit',
        transition: 'background 0.1s',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--pf-t--global--background--color--action--plain--hover)' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
    >
      {children}
      <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" style={{ opacity: 0.5 }}>
        <path d="M1 2.5L4 5.5L7 2.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
      </svg>
    </button>
  )
}

function DropdownMenu({
  anchorRect,
  onClose,
  children,
}: {
  anchorRect: DOMRect | null
  onClose: () => void
  children: React.ReactNode
}) {
  if (!anchorRect) return null

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }} onClick={onClose} />
      <div
        style={{
          position: 'fixed',
          bottom: window.innerHeight - anchorRect.top + 4,
          left: anchorRect.left,
          zIndex: 9999,
          background: 'var(--pf-t--global--background--color--primary--default)',
          border: '1px solid var(--pf-t--global--border--color--default)',
          borderRadius: 8,
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          padding: '4px 0',
          minWidth: 160,
          maxHeight: 320,
          overflowY: 'auto',
        }}
      >
        {children}
      </div>
    </>
  )
}

function MenuSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      padding: '6px 12px 3px',
      fontSize: 11, fontWeight: 600,
      color: 'var(--pf-t--global--text--color--subtle)',
      textTransform: 'uppercase',
      letterSpacing: '0.3px',
    }}>
      {children}
    </div>
  )
}

function MenuOption({
  children,
  selected,
  onClick,
  badge,
  icon,
}: {
  children: React.ReactNode
  selected?: boolean
  onClick: () => void
  badge?: string
  icon?: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        width: '100%',
        padding: '6px 12px',
        border: 'none',
        background: selected ? 'var(--pf-t--global--background--color--action--plain--clicked)' : 'transparent',
        cursor: 'pointer',
        fontSize: 13,
        fontFamily: 'inherit',
        color: 'var(--pf-t--global--text--color--regular)',
        textAlign: 'left',
      }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = 'var(--pf-t--global--background--color--action--plain--hover)' }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent' }}
    >
      {icon && <span style={{ display: 'inline-flex', flexShrink: 0 }}>{icon}</span>}
      <span style={{ flex: 1 }}>{children}</span>
      {badge && (
        <span style={{
          fontSize: 10, padding: '1px 6px', borderRadius: 8,
          background: 'var(--pf-t--global--background--color--secondary--default)',
          color: 'var(--pf-t--global--text--color--subtle)',
        }}>
          {badge}
        </span>
      )}
    </button>
  )
}

type OpenMenu = 'model' | 'reasoning' | 'access' | 'mode' | 'branch' | null

export function ChatSettingsBar({ tool, settings, onToolChange, onSettingsChange, messageCount = 0, branch, onBranchChange }: ChatSettingsBarProps) {
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null)
  const [menuRect, setMenuRect] = useState<DOMRect | null>(null)
  const [modelSearch, setModelSearch] = useState('')
  const [harnessFilter, setHarnessFilter] = useState<AgentToolId | null>(null)
  const [branchSearch, setBranchSearch] = useState('')

  const openDropdown = (menu: OpenMenu, e: React.MouseEvent) => {
    if (openMenu === menu) {
      setOpenMenu(null)
      setMenuRect(null)
    } else {
      setMenuRect((e.currentTarget as HTMLElement).getBoundingClientRect())
      setOpenMenu(menu)
    }
  }
  const closeDropdown = () => { setOpenMenu(null); setMenuRect(null) }

  const update = (patch: Partial<AgentSettings>) => onSettingsChange({ ...settings, ...patch })

  const models = INFERENCE_MODELS[settings.inferenceProvider] ?? []
  const currentModelName = models.find(m => m.id === settings.model)?.name ?? settings.model
  const ctxLabel = CONTEXT_WINDOW_OPTIONS.find(o => o.id === settings.contextWindow)?.label ?? settings.contextWindow
  const reasoningLabel = settings.reasoningMode === 'extended' ? 'Extended' : 'Standard'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
      {/* Model selector */}
      <SettingsChip onClick={(e) => openDropdown('model', e)} active={openMenu === 'model'}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <BrandIcon id={tool} size={14} />
          {currentModelName}
        </span>
      </SettingsChip>
      {openMenu === 'model' && (
        <DropdownMenu anchorRect={menuRect} onClose={() => { closeDropdown(); setModelSearch(''); setHarnessFilter(null) }}>
          <div style={{ display: 'flex', minHeight: 0 }}>
            {/* Left icon strip */}
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 2,
              padding: '6px 4px',
              borderRight: '1px solid var(--pf-t--global--border--color--default)',
            }}>
              {AGENT_TOOLS.map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    if (harnessFilter === t.id) {
                      setHarnessFilter(null)
                    } else {
                      setHarnessFilter(t.id)
                      onToolChange(t.id)
                      const newCompat = HARNESS_PROVIDERS[t.id] ?? []
                      if (!newCompat.includes(settings.inferenceProvider)) {
                        const fb = newCompat[0]
                        if (fb) {
                          const fbModels = INFERENCE_MODELS[fb]
                          update({ inferenceProvider: fb, model: fbModels?.[0]?.id ?? '' })
                        }
                      }
                    }
                    setModelSearch('')
                  }}
                  title={t.name}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 32, height: 32, border: 'none', borderRadius: 6, cursor: 'pointer',
                    background: (harnessFilter === t.id || (!harnessFilter && t.id === tool))
                      ? 'var(--pf-t--global--background--color--action--plain--clicked)'
                      : 'transparent',
                    opacity: (harnessFilter === t.id || (!harnessFilter && t.id === tool)) ? 1 : 0.5,
                    transition: 'background 0.1s, opacity 0.1s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'var(--pf-t--global--background--color--action--plain--hover)' }}
                  onMouseLeave={e => {
                    const isActive = harnessFilter === t.id || (!harnessFilter && t.id === tool)
                    e.currentTarget.style.opacity = isActive ? '1' : '0.5'
                    e.currentTarget.style.background = isActive ? 'var(--pf-t--global--background--color--action--plain--clicked)' : 'transparent'
                  }}
                >
                  <BrandIcon id={t.id} size={18} />
                </button>
              ))}
            </div>
            {/* Right content: search + models */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 200 }}>
              <div style={{ padding: '6px 8px' }}>
                <input
                  autoFocus
                  value={modelSearch}
                  onChange={e => setModelSearch(e.target.value)}
                  placeholder="Search models..."
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '5px 8px', fontSize: 12, fontFamily: 'inherit',
                    border: '1px solid var(--pf-t--global--border--color--default)',
                    borderRadius: 4,
                    background: 'var(--pf-t--global--background--color--secondary--default)',
                    color: 'var(--pf-t--global--text--color--regular)',
                    outline: 'none',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--pf-t--global--color--brand--default)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--pf-t--global--border--color--default)')}
                />
              </div>
              <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                {(() => {
                  const activeHarness = harnessFilter ?? tool
                  const harnessProviders = HARNESS_PROVIDERS[activeHarness] ?? []
                  const harnessModels = harnessProviders.flatMap(pid => {
                    const providerName = INFERENCE_PROVIDERS.find(p => p.id === pid)?.name ?? pid
                    return (INFERENCE_MODELS[pid] ?? []).map(m => ({ ...m, providerId: pid, providerName }))
                  })
                  const filtered = modelSearch
                    ? harnessModels.filter(m => m.name.toLowerCase().includes(modelSearch.toLowerCase()) || m.providerName.toLowerCase().includes(modelSearch.toLowerCase()))
                    : harnessModels
                  return filtered.length === 0 ? (
                    <div style={{ padding: '12px', fontSize: 12, color: 'var(--pf-t--global--text--color--subtle)', textAlign: 'center' }}>No models found</div>
                  ) : (
                    filtered.map(m => (
                      <MenuOption
                        key={`${m.providerId}-${m.id}`}
                        selected={m.id === settings.model && m.providerId === settings.inferenceProvider}
                        onClick={() => {
                          if (harnessFilter && harnessFilter !== tool) onToolChange(harnessFilter)
                          if (m.providerId !== settings.inferenceProvider) {
                            update({ inferenceProvider: m.providerId, model: m.id })
                          } else {
                            update({ model: m.id })
                          }
                          closeDropdown()
                          setModelSearch('')
                          setHarnessFilter(null)
                        }}
                        badge={m.providerName}
                      >
                        {m.name}
                      </MenuOption>
                    ))
                  )
                })()}
              </div>
            </div>
          </div>
        </DropdownMenu>
      )}

      <span style={{ color: 'var(--pf-t--global--border--color--default)' }}>|</span>

      {/* Reasoning + Context Window + Fast Mode */}
      {(() => {
        const ctxMax = settings.contextWindow === '1m' ? 1000 : settings.contextWindow === '200k' ? 200 : 128
        const ctxUsed = messageCount * 3.2
        const ctxPct = Math.min((ctxUsed / ctxMax) * 100, 100)
        const ctxColor = ctxPct > 80 ? '#cf222e' : ctxPct > 50 ? '#d29922' : 'var(--pf-t--global--color--brand--default)'
        return (
          <SettingsChip onClick={(e) => openDropdown('reasoning', e)} active={openMenu === 'reasoning'}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              {reasoningLabel} · {ctxLabel}
              <span style={{
                display: 'inline-flex', alignItems: 'center',
                width: 48, height: 4, borderRadius: 2,
                background: 'var(--pf-t--global--border--color--default)',
                overflow: 'hidden',
              }}>
                <span style={{
                  width: `${ctxPct}%`, height: '100%', borderRadius: 2,
                  background: ctxColor,
                  transition: 'width 0.3s',
                }} />
              </span>
            </span>
          </SettingsChip>
        )
      })()}
      {openMenu === 'reasoning' && (
        <DropdownMenu anchorRect={menuRect} onClose={closeDropdown}>
          <MenuSectionLabel>Reasoning</MenuSectionLabel>
          {REASONING_OPTIONS.map(opt => (
            <MenuOption
              key={opt.id}
              selected={settings.reasoningMode === opt.id}
              onClick={() => update({ reasoningMode: opt.id })}
              badge={opt.isDefault ? 'Default' : undefined}
            >
              {opt.label}
            </MenuOption>
          ))}
          <div style={{ height: 1, background: 'var(--pf-t--global--border--color--default)', margin: '4px 0' }} />
          <MenuSectionLabel>Context Window</MenuSectionLabel>
          {CONTEXT_WINDOW_OPTIONS.map(opt => (
            <MenuOption
              key={opt.id}
              selected={settings.contextWindow === opt.id}
              onClick={() => update({ contextWindow: opt.id as ContextWindowSize })}
              badge={opt.id === '1m' ? 'Default' : undefined}
            >
              {opt.label}
            </MenuOption>
          ))}
          <div style={{ height: 1, background: 'var(--pf-t--global--border--color--default)', margin: '4px 0' }} />
          <MenuSectionLabel>Fast Mode</MenuSectionLabel>
          <MenuOption selected={settings.fastMode} onClick={() => update({ fastMode: true })}>On</MenuOption>
          <MenuOption selected={!settings.fastMode} onClick={() => update({ fastMode: false })}>Off</MenuOption>
        </DropdownMenu>
      )}

      <span style={{ color: 'var(--pf-t--global--border--color--default)' }}>|</span>

      {/* Access mode */}
      <SettingsChip onClick={(e) => openDropdown('access', e)} active={openMenu === 'access'}>
        <span style={{ textTransform: 'capitalize' }}>
          {settings.accessMode.replace('-', ' ')}
        </span>
      </SettingsChip>
      {openMenu === 'access' && (
        <DropdownMenu anchorRect={menuRect} onClose={closeDropdown}>
          {ACCESS_OPTIONS.map(opt => (
            <MenuOption
              key={opt.id}
              selected={settings.accessMode === opt.id}
              onClick={() => { update({ accessMode: opt.id }); closeDropdown() }}
            >
              {opt.label}
            </MenuOption>
          ))}
        </DropdownMenu>
      )}

      <span style={{ color: 'var(--pf-t--global--border--color--default)' }}>|</span>

      {/* Agent mode */}
      <SettingsChip onClick={(e) => openDropdown('mode', e)} active={openMenu === 'mode'}>
        <span style={{ textTransform: 'capitalize' }}>
          {settings.agentMode}
        </span>
      </SettingsChip>
      {openMenu === 'mode' && (
        <DropdownMenu anchorRect={menuRect} onClose={closeDropdown}>
          <MenuOption selected={settings.agentMode === 'build'} onClick={() => { update({ agentMode: 'build' }); closeDropdown() }}>Build</MenuOption>
          <MenuOption selected={settings.agentMode === 'plan'} onClick={() => { update({ agentMode: 'plan' }); closeDropdown() }}>Plan</MenuOption>
        </DropdownMenu>
      )}

      <span style={{ color: 'var(--pf-t--global--border--color--default)' }}>|</span>

      {/* Branch */}
      <SettingsChip onClick={(e) => openDropdown('branch', e)} active={openMenu === 'branch'}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <CodeBranchIcon style={{ fontSize: 11 }} />
          {branch ?? 'main'}
        </span>
      </SettingsChip>
      {openMenu === 'branch' && (
        <DropdownMenu anchorRect={menuRect} onClose={() => { closeDropdown(); setBranchSearch('') }}>
          <div style={{ padding: '6px 8px' }}>
            <input
              autoFocus
              value={branchSearch}
              onChange={e => setBranchSearch(e.target.value)}
              placeholder="Search branches..."
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '5px 8px', fontSize: 12, fontFamily: 'inherit',
                border: '1px solid var(--pf-t--global--border--color--default)',
                borderRadius: 4,
                background: 'var(--pf-t--global--background--color--secondary--default)',
                color: 'var(--pf-t--global--text--color--regular)',
                outline: 'none',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--pf-t--global--color--brand--default)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--pf-t--global--border--color--default)')}
            />
          </div>
          <div style={{ maxHeight: 240, overflowY: 'auto' }}>
            {(() => {
              const filtered = branchSearch
                ? MOCK_BRANCHES.filter(b => b.toLowerCase().includes(branchSearch.toLowerCase()))
                : MOCK_BRANCHES
              return filtered.length === 0 ? (
                <div style={{ padding: '12px', fontSize: 12, color: 'var(--pf-t--global--text--color--subtle)', textAlign: 'center' }}>No branches found</div>
              ) : (
                filtered.map(b => (
                  <MenuOption
                    key={b}
                    selected={b === (branch ?? 'main')}
                    onClick={() => { onBranchChange?.(b); closeDropdown(); setBranchSearch('') }}
                  >
                    {b}
                  </MenuOption>
                ))
              )
            })()}
          </div>
        </DropdownMenu>
      )}
    </div>
  )
}
