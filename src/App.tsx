import { useEffect, useState } from 'react'
import {
  Button,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownList,
  Masthead,
  MastheadBrand,
  MastheadContent,
  MastheadMain,
  MastheadToggle,
  MenuToggle,
  Nav,
  NavItem,
  NavList,
  Page,
  PageSection,
  PageSidebar,
  PageSidebarBody,
  PageToggleButton,
  ToggleGroup,
  ToggleGroupItem,
} from '@patternfly/react-core'
import {
  ArchiveIcon,
  BarsIcon,
  CodeIcon,
  CogIcon,
  CommentsIcon,
  DesktopIcon,
  InfoCircleIcon,
  MoonIcon,
  RobotIcon,
  SignOutAltIcon,
  SunIcon,
  ThLargeIcon,
  UserIcon,
} from '@patternfly/react-icons'
import type { ComponentType } from 'react'
import { AgentSpace } from './components/AgentSpace'
import { AgentSpaceV2 } from './components/AgentSpaceV2'
import { CreateWorkspace } from './components/CreateWorkspace'
import { CreateWorkspacePhase1 } from './components/CreateWorkspacePhase1'
import { WorkspaceList } from './components/WorkspaceList'

type Phase = 'phase1' | 'phase2'
type ThemeMode = 'light' | 'dark' | 'auto'
const PHASE_STORAGE_KEY = 'dev-spaces-phase'

const NAV_ITEMS: { label: string; id: string; icon: ComponentType }[] = [
  { label: 'Workspaces', id: 'workspaces', icon: ThLargeIcon },
  { label: 'Agent Space', id: 'agent-space', icon: RobotIcon },
  { label: 'Agent Space v2', id: 'agent-space-v2', icon: CommentsIcon },
  { label: 'Devfile Creator', id: 'devfile-creator', icon: CodeIcon },
  { label: 'Backups', id: 'backups', icon: ArchiveIcon },
]

const VALID_ROUTES = new Set([...NAV_ITEMS.map((item) => item.id), 'create-workspace'])

const THEME_STORAGE_KEY = 'dev-spaces-theme'
const DARK_THEME_CLASS = 'pf-v6-theme-dark'

function getRouteFromHash(): string {
  const route = window.location.hash.replace('#/', '').replace('#', '')
  return VALID_ROUTES.has(route) ? route : 'workspaces'
}

export default function App() {
  const [signedIn, setSignedIn] = useState(true)
  const [username] = useState('jane.doe')
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [activePage, setActivePage] = useState(getRouteFromHash)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [phase, setPhase] = useState<Phase>(() => {
    const saved = window.localStorage.getItem(PHASE_STORAGE_KEY)
    return saved === 'phase1' || saved === 'phase2' ? saved : 'phase1'
  })

  useEffect(() => {
    window.localStorage.setItem(PHASE_STORAGE_KEY, phase)
  }, [phase])

  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (saved === 'light' || saved === 'dark' || saved === 'auto') return saved
    return 'auto'
  })

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, themeMode)
    if (themeMode === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.classList.toggle(DARK_THEME_CLASS, prefersDark)
    } else {
      document.documentElement.classList.toggle(DARK_THEME_CLASS, themeMode === 'dark')
    }
  }, [themeMode])

  useEffect(() => {
    window.location.hash = `#/${activePage}`
  }, [activePage])

  useEffect(() => {
    const onHashChange = () => setActivePage(getRouteFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    if (!signedIn) {
      document.title = 'Sign In - Dev Spaces'
      return
    }
    const navItem = NAV_ITEMS.find((item) => item.id === activePage)
    document.title = navItem ? `${navItem.label} - Dev Spaces` : activePage === 'create-workspace' ? 'Create Workspace - Dev Spaces' : 'Dev Spaces'
  }, [activePage, signedIn])

  const masthead = (
    <Masthead style={{ alignItems: 'center' }}>
      <MastheadMain>
        <MastheadToggle>
          <PageToggleButton
            variant="plain"
            aria-label="Global navigation"
            isSidebarOpen={isSidebarOpen}
            onSidebarToggle={() => setIsSidebarOpen((o) => !o)}
          >
            <BarsIcon />
          </PageToggleButton>
        </MastheadToggle>
        <MastheadBrand style={{ alignItems: 'center' }}>
          <img
            src={`${import.meta.env.BASE_URL}icon.png`}
            alt="Dev Spaces"
            style={{ height: 36, borderRadius: 8 }}
          />
          <span style={{ marginLeft: 12, fontSize: 18, fontWeight: 600 }}>Dev Spaces</span>
        </MastheadBrand>
      </MastheadMain>
      <MastheadContent>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', width: '100%' }}>
          <Dropdown
            isOpen={profileMenuOpen}
            onSelect={() => setProfileMenuOpen(false)}
            onOpenChange={setProfileMenuOpen}
            popperProps={{ position: 'right' }}
            toggle={(toggleRef) => (
              <MenuToggle
                ref={toggleRef}
                onClick={() => setProfileMenuOpen((o) => !o)}
                isExpanded={profileMenuOpen}
                variant="plainText"
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {username}
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      backgroundColor: '#6b4226',
                      color: '#fff',
                      fontSize: 12,
                    }}
                  >
                    <UserIcon />
                  </span>
                </span>
              </MenuToggle>
            )}
          >
            <div
              style={{ padding: '12px 16px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Appearance</div>
              <ToggleGroup aria-label="Theme mode">
                <ToggleGroupItem
                  icon={<SunIcon />}
                  buttonId="theme-light"
                  isSelected={themeMode === 'light'}
                  onChange={() => setThemeMode('light')}
                  aria-label="Light theme"
                />
                <ToggleGroupItem
                  icon={<MoonIcon />}
                  buttonId="theme-dark"
                  isSelected={themeMode === 'dark'}
                  onChange={() => setThemeMode('dark')}
                  aria-label="Dark theme"
                />
                <ToggleGroupItem
                  icon={<DesktopIcon />}
                  buttonId="theme-auto"
                  isSelected={themeMode === 'auto'}
                  onChange={() => setThemeMode('auto')}
                  aria-label="System theme"
                />
              </ToggleGroup>
            </div>
            <Divider />
            <div style={{ padding: '8px 16px 4px', fontSize: 14, fontWeight: 600 }}>Actions</div>
            <DropdownList>
              <DropdownItem key="settings" icon={<CogIcon />}>
                Settings
              </DropdownItem>
              <DropdownItem key="about" icon={<InfoCircleIcon />}>
                About
              </DropdownItem>
              <DropdownItem
                key="logout"
                icon={<SignOutAltIcon />}
                onClick={() => setSignedIn(false)}
              >
                Log out
              </DropdownItem>
            </DropdownList>
          </Dropdown>
        </div>
      </MastheadContent>
    </Masthead>
  )

  const sidebar = (
    <PageSidebar isSidebarOpen={isSidebarOpen} style={{ '--pf-v6-c-page__sidebar--Width--base': '5rem' } as React.CSSProperties}>
      <PageSidebarBody>
        <Nav onSelect={(_event, result) => {
          setActivePage(result.itemId as string)
        }}>
          <NavList>
            {NAV_ITEMS.map((item) => {
              const NavIcon = item.icon
              return (
                <NavItem
                  key={item.id}
                  itemId={item.id}
                  isActive={activePage === item.id || (item.id === 'workspaces' && activePage === 'create-workspace')}
                  icon={<NavIcon />}
                >
                  {item.label}
                </NavItem>
              )
            })}
          </NavList>
        </Nav>
      </PageSidebarBody>
    </PageSidebar>
  )

  return (
    <Page masthead={masthead} sidebar={sidebar} isContentFilled>
      {signedIn ? (
        activePage === 'agent-space' ? (
          <AgentSpace />
        ) : activePage === 'agent-space-v2' ? (
          <AgentSpaceV2 />
        ) : activePage === 'create-workspace' ? (
          phase === 'phase1' ? (
            <CreateWorkspacePhase1 phase={phase} onPhaseChange={setPhase} />
          ) : (
            <CreateWorkspace phase={phase} onPhaseChange={setPhase} />
          )
        ) : (
          <WorkspaceList
            onCreateWorkspace={() => setActivePage('create-workspace')}
          />
        )
      ) : (
        <PageSection
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
          }}
        >
          <div style={{ maxWidth: 400, textAlign: 'center' }}>
            <p style={{ marginBottom: 16, fontSize: 17 }}>You are signed out.</p>
            <Button variant="primary" onClick={() => setSignedIn(true)}>
              Sign in again
            </Button>
          </div>
        </PageSection>
      )}
    </Page>
  )
}
