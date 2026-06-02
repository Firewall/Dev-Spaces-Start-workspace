import { useState } from 'react'
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  Masthead,
  MastheadBrand,
  MastheadContent,
  MastheadMain,
  MenuToggle,
  Nav,
  NavItem,
  NavList,
  Page,
  PageSection,
  PageSidebar,
  PageSidebarBody,
} from '@patternfly/react-core'
import {
  ArchiveIcon,
  CodeIcon,
  CogIcon,
  InfoCircleIcon,
  SignOutAltIcon,
  ThLargeIcon,
  UserIcon,
} from '@patternfly/react-icons'
import type { ComponentType } from 'react'
import { CreateWorkspace } from './components/CreateWorkspace'

const NAV_ITEMS: { label: string; id: string; icon: ComponentType }[] = [
  { label: 'Workspaces', id: 'workspaces', icon: ThLargeIcon },
  { label: 'Agent Space', id: 'agent-space', icon: CodeIcon },
  { label: 'Devfile Creator', id: 'devfile-creator', icon: CodeIcon },
  { label: 'Backups', id: 'backups', icon: ArchiveIcon },
]

export default function App() {
  const [signedIn, setSignedIn] = useState(true)
  const [username] = useState('jane.doe')
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [activeNavItem, setActiveNavItem] = useState('workspaces')
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
              icon={<UserIcon />}
            >
              {username}
            </MenuToggle>
          )}
        >
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
      </MastheadContent>
    </Masthead>
  )

  const sidebar = (
    <PageSidebar>
      <PageSidebarBody>
        <Nav onSelect={(_event, result) => setActiveNavItem(result.itemId as string)}>
          <NavList>
            {NAV_ITEMS.map((item) => {
              const NavIcon = item.icon
              return (
                <NavItem
                  key={item.id}
                  itemId={item.id}
                  isActive={activeNavItem === item.id}
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
    <Page masthead={masthead} sidebar={sidebar}>
      {signedIn ? (
        <PageSection>
          <CreateWorkspace />
        </PageSection>
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
