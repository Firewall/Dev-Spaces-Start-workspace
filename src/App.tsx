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
  MenuToggle,
  Nav,
  NavGroup,
  NavItem,
  NavList,
  Page,
  PageSection,
  PageSidebar,
  PageSidebarBody,
  ToggleGroup,
  ToggleGroupItem,
} from '@patternfly/react-core'
import {
  DesktopIcon,
  MoonIcon,
  OutlinedQuestionCircleIcon,
  RunningIcon,
  SunIcon,
  ThLargeIcon,
  UserIcon,
} from '@patternfly/react-icons'
import { CreateWorkspace } from './components/CreateWorkspace'
import { CreateWorkspacePhase1 } from './components/CreateWorkspacePhase1'
import { UserPreferences } from './components/UserPreferences'
import { WorkspaceList } from './components/WorkspaceList'

type Phase = 'phase1' | 'phase2'
type ThemeMode = 'light' | 'dark' | 'auto'
const PHASE_STORAGE_KEY = 'dev-spaces-phase'

const RECENT_WORKSPACES = [
  { id: '1', name: 'dev-spaces-start-workspace', status: 'running' as const },
  { id: '2', name: 'dev-spaces-start-workspace', status: 'stopped' as const },
]

const VALID_ROUTES = new Set(['workspaces', 'create-workspace', 'user-preferences'])

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
    document.title = activePage === 'workspaces'
      ? 'Workspaces - Dev Spaces'
      : activePage === 'create-workspace'
        ? 'Create Workspace - Dev Spaces'
        : activePage === 'user-preferences'
          ? 'User Preferences - Dev Spaces'
          : 'Dev Spaces'
  }, [activePage, signedIn])

  const masthead = (
    <Masthead>
      <MastheadMain>
        <MastheadBrand>
          <img
            src={`${import.meta.env.BASE_URL}icon.png`}
            alt="Dev Spaces"
            style={{ height: 36, borderRadius: 8 }}
          />
        </MastheadBrand>
      </MastheadMain>
      <MastheadContent>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
          <Button variant="plain" aria-label="Applications">
            <ThLargeIcon />
          </Button>
          <Button variant="plain" aria-label="Help">
            <OutlinedQuestionCircleIcon />
          </Button>
          <Dropdown
            isOpen={profileMenuOpen}
            onSelect={(_event, value) => {
              setProfileMenuOpen(false)
              if (value === 'user-prefs') setActivePage('user-preferences')
              if (value === 'logout') setSignedIn(false)
            }}
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
              <DropdownItem key="user-prefs" value="user-prefs">User Preferences</DropdownItem>
              <DropdownItem key="logout" value="logout">
                Logout
              </DropdownItem>
            </DropdownList>
          </Dropdown>
        </div>
      </MastheadContent>
    </Masthead>
  )

  const sidebar = (
    <PageSidebar>
      <PageSidebarBody>
        <Nav onSelect={(_event, result) => {
          setActivePage(result.itemId as string)
        }}>
          <NavList>
            <NavItem
              itemId="create-workspace"
              isActive={activePage === 'create-workspace'}
              style={{ fontWeight: activePage === 'create-workspace' ? undefined : 400 }}
            >
              Create Workspace
            </NavItem>
            <NavItem
              itemId="workspaces"
              isActive={activePage === 'workspaces'}
            >
              Workspaces ({RECENT_WORKSPACES.length})
            </NavItem>
          </NavList>
          <NavGroup title="RECENT WORKSPACES">
            {RECENT_WORKSPACES.map((ws) => (
              <NavItem key={ws.id} itemId="workspaces" icon={<RunningIcon style={{ color: ws.status === 'running' ? 'var(--pf-t--global--color--status--success--default)' : 'var(--pf-t--global--color--nonstatus--gray--default)' }} />}>
                {ws.name.length > 24 ? ws.name.substring(0, 24) + '...' : ws.name}
              </NavItem>
            ))}
          </NavGroup>
        </Nav>
      </PageSidebarBody>
    </PageSidebar>
  )

  return (
    <Page masthead={masthead} sidebar={sidebar}>
      {signedIn ? (
        activePage === 'user-preferences' ? (
          <UserPreferences />
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
