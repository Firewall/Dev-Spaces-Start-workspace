import { useState } from 'react'
import {
  Button,
  Checkbox,
  Dropdown,
  DropdownItem,
  DropdownList,
  EmptyState,
  EmptyStateActions,
  EmptyStateFooter,
  FormGroup,
  Label,
  MenuToggle,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Nav,
  NavGroup,
  NavItem,
  PageSection,
  Switch,
  Tab,
  Tabs,
  TabTitleText,
  TextInput,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core'
import {
  AutomationIcon,
  CogIcon,
  CubesIcon,
  EllipsisVIcon,
  ExternalLinkAltIcon,
  EyeIcon,
  EyeSlashIcon,
  GitAltIcon,
  KeyIcon,
  LockIcon,
  PluggedIcon,
  PlusCircleIcon,
  RegistryIcon,
  RobotIcon,
} from '@patternfly/react-icons'
import {
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
} from '@patternfly/react-table'

export type PreferencesTab = 'container-registries' | 'git-services' | 'personal-access-tokens' | 'gitconfig' | 'ssh-keys' | 'skills' | 'mcps' | 'agent-configurations'

interface ContainerRegistry {
  id: string
  registry: string
  username: string
  password: string
}

interface PersonalAccessToken {
  id: string
  name: string
  provider: string
  endpoint: string
}

interface SSHKey {
  id: string
  name: string
  key: string
}

interface Skill {
  id: string
  name: string
  description: string
  source: 'manual' | 'rhdh' | 'catalog'
  rhdhInstance?: string
  registry?: string
}

interface InstalledMcp {
  id: string
  name: string
  description: string
  status: 'connected' | 'disconnected' | 'error'
  registry?: string
}

interface CatalogItem {
  id: string
  name: string
  description: string
  registry: string
  installed: boolean
}

interface Registry {
  id: string
  name: string
  url: string
  itemCount: number
  enabled: boolean
}

const INITIAL_TOKENS: PersonalAccessToken[] = [
  { id: '1', name: 'qnxmh', provider: 'github', endpoint: 'https://github.com' },
]

const MOCK_RHDH_SKILLS: Omit<Skill, 'id' | 'rhdhInstance'>[] = [
  { name: 'Kubernetes Deployment', description: 'Automates Kubernetes manifest generation and deployment', source: 'rhdh' },
  { name: 'CI/CD Pipeline Setup', description: 'Creates and configures CI/CD pipelines using Tekton', source: 'rhdh' },
  { name: 'API Scaffolding', description: 'Generates REST API boilerplate with OpenAPI spec', source: 'rhdh' },
  { name: 'Database Migration', description: 'Manages database schema migrations with Flyway or Liquibase', source: 'rhdh' },
  { name: 'Security Scanning', description: 'Integrates SAST and DAST security scans into workflows', source: 'rhdh' },
]

const DEFAULT_INSTALLED_SKILLS: Skill[] = [
  { id: 'sk-1', name: 'Code Review', description: 'Analyzes code changes and provides review feedback with suggestions', source: 'manual' },
  { id: 'sk-2', name: 'Unit Test Generator', description: 'Generates unit tests for functions and classes using project conventions', source: 'rhdh', rhdhInstance: 'https://developer-hub.example.com' },
  { id: 'sk-3', name: 'Documentation Writer', description: 'Generates API documentation and README files from source code', source: 'catalog', registry: 'Red Hat Developer Hub' },
]

const DEFAULT_SKILLS_CATALOG: CatalogItem[] = [
  { id: 'sc-1', name: 'Kubernetes Deployment', description: 'Automates Kubernetes manifest generation and deployment', registry: 'Red Hat Developer Hub', installed: false },
  { id: 'sc-2', name: 'CI/CD Pipeline Setup', description: 'Creates and configures CI/CD pipelines using Tekton', registry: 'Red Hat Developer Hub', installed: false },
  { id: 'sc-3', name: 'API Scaffolding', description: 'Generates REST API boilerplate with OpenAPI spec', registry: 'Red Hat Developer Hub', installed: false },
  { id: 'sc-4', name: 'Database Migration', description: 'Manages database schema migrations with Flyway or Liquibase', registry: 'Community Skills', installed: false },
  { id: 'sc-5', name: 'Security Scanning', description: 'Integrates SAST and DAST security scans into workflows', registry: 'Community Skills', installed: false },
  { id: 'sc-6', name: 'Log Analyzer', description: 'Parses and summarizes application logs to identify issues', registry: 'Community Skills', installed: false },
]

const DEFAULT_SKILL_REGISTRIES: Registry[] = [
  { id: 'sr-1', name: 'Red Hat Developer Hub', url: 'https://developer-hub.example.com/skills', itemCount: 24, enabled: true },
  { id: 'sr-2', name: 'Community Skills Registry', url: 'https://skills.community.example.com', itemCount: 156, enabled: true },
]

const DEFAULT_INSTALLED_MCPS: InstalledMcp[] = [
  { id: 'mcp-1', name: 'Filesystem', description: 'Read, write, and manage files in the workspace', status: 'connected' },
  { id: 'mcp-2', name: 'GitHub', description: 'Interact with GitHub repositories, issues, and pull requests', status: 'connected' },
  { id: 'mcp-3', name: 'PostgreSQL', description: 'Query and manage PostgreSQL databases', status: 'disconnected' },
]

const DEFAULT_MCPS_CATALOG: CatalogItem[] = [
  { id: 'mc-1', name: 'Slack', description: 'Send messages and interact with Slack workspaces', registry: 'Official MCP Registry', installed: false },
  { id: 'mc-2', name: 'Jira', description: 'Create and manage Jira issues and sprints', registry: 'Official MCP Registry', installed: false },
  { id: 'mc-3', name: 'Kubernetes', description: 'Manage Kubernetes clusters, pods, and deployments', registry: 'Official MCP Registry', installed: false },
  { id: 'mc-4', name: 'Redis', description: 'Interact with Redis caches and data stores', registry: 'Community MCP Registry', installed: false },
  { id: 'mc-5', name: 'Elasticsearch', description: 'Search and manage Elasticsearch indices', registry: 'Community MCP Registry', installed: false },
]

const DEFAULT_MCP_REGISTRIES: Registry[] = [
  { id: 'mr-1', name: 'Official MCP Registry', url: 'https://registry.modelcontextprotocol.io', itemCount: 42, enabled: true },
  { id: 'mr-2', name: 'Community MCP Registry', url: 'https://mcp-community.example.com', itemCount: 89, enabled: true },
]

const MCP_STATUS_COLORS: Record<InstalledMcp['status'], 'green' | 'grey' | 'red'> = {
  connected: 'green',
  disconnected: 'grey',
  error: 'red',
}

function TabHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <Title headingLevel="h2" size="lg">{title}</Title>
      <div style={{ marginTop: 4, fontSize: 14, color: 'var(--pf-t--global--text--color--subtle)' }}>{subtitle}</div>
    </div>
  )
}

export function UserPreferences({ activeTab, onTabChange }: { activeTab: PreferencesTab; onTabChange: (tab: PreferencesTab) => void }) {

  const [registries, setRegistries] = useState<ContainerRegistry[]>([])
  const [showAddRegistry, setShowAddRegistry] = useState(false)
  const [regRegistry, setRegRegistry] = useState('')
  const [regUsername, setRegUsername] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [tokens, setTokens] = useState<PersonalAccessToken[]>(INITIAL_TOKENS)
  const [selectedTokenIds, setSelectedTokenIds] = useState<Set<string>>(new Set())
  const [showAddToken, setShowAddToken] = useState(false)
  const [tokenName, setTokenName] = useState('')
  const [tokenProvider, setTokenProvider] = useState('')
  const [tokenValue, setTokenValue] = useState('')
  const [tokenEndpoint, setTokenEndpoint] = useState('')
  const [tokenMenuOpenId, setTokenMenuOpenId] = useState<string | null>(null)

  const [sshKeys, setSSHKeys] = useState<SSHKey[]>([])
  const [showAddSSHKey, setShowAddSSHKey] = useState(false)
  const [sshKeyName, setSSHKeyName] = useState('')
  const [sshKeyValue, setSSHKeyValue] = useState('')

  const [skills, setSkills] = useState<Skill[]>(DEFAULT_INSTALLED_SKILLS)
  const [showAddSkill, setShowAddSkill] = useState(false)
  const [showImportSkills, setShowImportSkills] = useState(false)
  const [skillName, setSkillName] = useState('')
  const [skillDescription, setSkillDescription] = useState('')
  const [skillMenuOpenId, setSkillMenuOpenId] = useState<string | null>(null)
  const [rhdhInstanceUrl, setRhdhInstanceUrl] = useState('')
  const [rhdhConnected, setRhdhConnected] = useState(false)
  const [rhdhSelectedSkills, setRhdhSelectedSkills] = useState<Set<number>>(new Set())
  const [skillsSubTab, setSkillsSubTab] = useState<'installed' | 'catalog' | 'registries'>('installed')
  const [skillsCatalog, setSkillsCatalog] = useState<CatalogItem[]>(DEFAULT_SKILLS_CATALOG)
  const [skillRegistries, setSkillRegistries] = useState<Registry[]>(DEFAULT_SKILL_REGISTRIES)

  const [installedMcps, setInstalledMcps] = useState<InstalledMcp[]>(DEFAULT_INSTALLED_MCPS)
  const [mcpsSubTab, setMcpsSubTab] = useState<'installed' | 'catalog' | 'registries'>('installed')
  const [mcpsCatalog, setMcpsCatalog] = useState<CatalogItem[]>(DEFAULT_MCPS_CATALOG)
  const [mcpRegistries, setMcpRegistries] = useState<Registry[]>(DEFAULT_MCP_REGISTRIES)
  const [mcpMenuOpenId, setMcpMenuOpenId] = useState<string | null>(null)

  const resetRegistryForm = () => {
    setRegRegistry('')
    setRegUsername('')
    setRegPassword('')
    setShowPassword(false)
  }

  const handleAddRegistry = () => {
    setRegistries(prev => [...prev, {
      id: String(Date.now()),
      registry: regRegistry,
      username: regUsername,
      password: regPassword,
    }])
    setShowAddRegistry(false)
    resetRegistryForm()
  }

  const handleDeleteRegistry = (id: string) => {
    setRegistries(prev => prev.filter(r => r.id !== id))
  }

  const handleSelectAllTokens = (_event: React.FormEvent<HTMLInputElement>, isSelected: boolean) => {
    setSelectedTokenIds(isSelected ? new Set(tokens.map(t => t.id)) : new Set())
  }

  const handleSelectToken = (id: string) => {
    setSelectedTokenIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleDeleteSelectedTokens = () => {
    setTokens(prev => prev.filter(t => !selectedTokenIds.has(t.id)))
    setSelectedTokenIds(new Set())
  }

  const handleDeleteToken = (id: string) => {
    setTokens(prev => prev.filter(t => t.id !== id))
    selectedTokenIds.delete(id)
    setSelectedTokenIds(new Set(selectedTokenIds))
  }

  const resetTokenForm = () => {
    setTokenName('')
    setTokenProvider('')
    setTokenValue('')
    setTokenEndpoint('')
  }

  const handleAddToken = () => {
    setTokens(prev => [...prev, {
      id: String(Date.now()),
      name: tokenName,
      provider: tokenProvider,
      endpoint: tokenEndpoint,
    }])
    setShowAddToken(false)
    resetTokenForm()
  }

  const resetSSHKeyForm = () => {
    setSSHKeyName('')
    setSSHKeyValue('')
  }

  const handleAddSSHKey = () => {
    setSSHKeys(prev => [...prev, {
      id: String(Date.now()),
      name: sshKeyName,
      key: sshKeyValue,
    }])
    setShowAddSSHKey(false)
    resetSSHKeyForm()
  }

  const handleDeleteSSHKey = (id: string) => {
    setSSHKeys(prev => prev.filter(k => k.id !== id))
  }

  const resetSkillForm = () => {
    setSkillName('')
    setSkillDescription('')
  }

  const handleAddSkill = () => {
    setSkills(prev => [...prev, {
      id: String(Date.now()),
      name: skillName,
      description: skillDescription,
      source: 'manual',
    }])
    setShowAddSkill(false)
    resetSkillForm()
  }

  const handleDeleteSkill = (id: string) => {
    setSkills(prev => prev.filter(s => s.id !== id))
  }

  const handleInstallSkillFromCatalog = (item: CatalogItem) => {
    setSkills(prev => [...prev, {
      id: String(Date.now()),
      name: item.name,
      description: item.description,
      source: 'catalog',
      registry: item.registry,
    }])
    setSkillsCatalog(prev => prev.map(c => c.id === item.id ? { ...c, installed: true } : c))
  }

  const handleToggleSkillRegistry = (id: string, enabled: boolean) => {
    setSkillRegistries(prev => prev.map(r => r.id === id ? { ...r, enabled } : r))
  }

  const handleInstallMcpFromCatalog = (item: CatalogItem) => {
    setInstalledMcps(prev => [...prev, {
      id: String(Date.now()),
      name: item.name,
      description: item.description,
      status: 'connected',
      registry: item.registry,
    }])
    setMcpsCatalog(prev => prev.map(c => c.id === item.id ? { ...c, installed: true } : c))
  }

  const handleDeleteMcp = (id: string) => {
    setInstalledMcps(prev => prev.filter(m => m.id !== id))
  }

  const handleToggleMcpRegistry = (id: string, enabled: boolean) => {
    setMcpRegistries(prev => prev.map(r => r.id === id ? { ...r, enabled } : r))
  }

  const resetRhdhForm = () => {
    setRhdhInstanceUrl('')
    setRhdhConnected(false)
    setRhdhSelectedSkills(new Set())
  }

  const handleRhdhConnect = () => {
    setRhdhConnected(true)
  }

  const handleToggleRhdhSkill = (index: number) => {
    setRhdhSelectedSkills(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const handleImportRhdhSkills = () => {
    const imported = Array.from(rhdhSelectedSkills).map(idx => ({
      ...MOCK_RHDH_SKILLS[idx],
      id: String(Date.now() + idx),
      rhdhInstance: rhdhInstanceUrl,
    }))
    setSkills(prev => [...prev, ...imported])
    setShowImportSkills(false)
    resetRhdhForm()
  }

  const allTokensSelected = tokens.length > 0 && selectedTokenIds.size === tokens.length

  const renderCatalogTable = (
    catalog: CatalogItem[],
    onInstall: (item: CatalogItem) => void,
    label: string,
  ) => (
    <Table aria-label={`${label} catalog`} variant="compact">
      <Thead>
        <Tr>
          <Th width={25}>Name</Th>
          <Th width={35}>Description</Th>
          <Th width={20}>Registry</Th>
          <Th width={20} screenReaderText="Actions" />
        </Tr>
      </Thead>
      <Tbody>
        {catalog.map(item => (
          <Tr key={item.id}>
            <Td dataLabel="Name">{item.name}</Td>
            <Td dataLabel="Description">{item.description}</Td>
            <Td dataLabel="Registry">
              <Label isCompact color="blue">{item.registry}</Label>
            </Td>
            <Td isActionCell>
              <Button
                variant={item.installed ? 'secondary' : 'primary'}
                size="sm"
                isDisabled={item.installed}
                onClick={() => onInstall(item)}
              >
                {item.installed ? 'Installed' : 'Install'}
              </Button>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  )

  const renderRegistriesTable = (
    regs: Registry[],
    onToggle: (id: string, enabled: boolean) => void,
    label: string,
  ) => (
    <Table aria-label={`${label} registries`} variant="compact">
      <Thead>
        <Tr>
          <Th width={25}>Name</Th>
          <Th width={35}>URL</Th>
          <Th width={20}>Items</Th>
          <Th width={20}>Enabled</Th>
        </Tr>
      </Thead>
      <Tbody>
        {regs.map(reg => (
          <Tr key={reg.id}>
            <Td dataLabel="Name">{reg.name}</Td>
            <Td dataLabel="URL" style={{ fontFamily: 'monospace', fontSize: 13 }}>{reg.url}</Td>
            <Td dataLabel="Items">{reg.itemCount}</Td>
            <Td dataLabel="Enabled">
              <Switch
                id={`registry-switch-${reg.id}`}
                isChecked={reg.enabled}
                onChange={(_e, checked) => onToggle(reg.id, checked)}
                aria-label={`Toggle ${reg.name}`}
              />
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  )

  return (
    <>
      <PageSection hasBodyWrapper={false} style={{ paddingBottom: 0 }}>
        <Title headingLevel="h1" size="xl">User Preferences</Title>
      </PageSection>

      <PageSection hasBodyWrapper={false} style={{ paddingTop: 16 }}>
        <div style={{ display: 'flex', gap: 24 }}>
          <Nav
            onSelect={(_event, result) => onTabChange(result.itemId as PreferencesTab)}
            aria-label="User preferences navigation"
            style={{ minWidth: 240, flexShrink: 0 }}
          >
            <NavGroup title="General">
              <NavItem itemId="container-registries" isActive={activeTab === 'container-registries'} icon={<RegistryIcon />}>Container Registries</NavItem>
              <NavItem itemId="git-services" isActive={activeTab === 'git-services'} icon={<GitAltIcon />}>Git Services</NavItem>
              <NavItem itemId="personal-access-tokens" isActive={activeTab === 'personal-access-tokens'} icon={<LockIcon />}>Personal Access Tokens</NavItem>
              <NavItem itemId="gitconfig" isActive={activeTab === 'gitconfig'} icon={<CogIcon />}>Gitconfig</NavItem>
              <NavItem itemId="ssh-keys" isActive={activeTab === 'ssh-keys'} icon={<KeyIcon />}>SSH Keys</NavItem>
            </NavGroup>
            <NavGroup title="AI">
              <NavItem itemId="skills" isActive={activeTab === 'skills'} icon={<AutomationIcon />}>Skills</NavItem>
              <NavItem itemId="mcps" isActive={activeTab === 'mcps'} icon={<PluggedIcon />}>MCPs</NavItem>
              <NavItem itemId="agent-configurations" isActive={activeTab === 'agent-configurations'} icon={<RobotIcon />}>Agent Configurations</NavItem>
            </NavGroup>
          </Nav>

          <div style={{ flex: 1, minWidth: 0 }}>
        {activeTab === 'container-registries' && (
          <>
          <TabHeader title="Container Registries" subtitle="Manage container image registries for pulling and pushing images in your workspaces." />
            {registries.length === 0 ? (
              <EmptyState headingLevel="h3" icon={CubesIcon} titleText="No Container Registries">
                <EmptyStateFooter>
                  <EmptyStateActions>
                    <Button variant="link" icon={<PlusCircleIcon />} onClick={() => setShowAddRegistry(true)}>
                      Add Container Registry
                    </Button>
                  </EmptyStateActions>
                </EmptyStateFooter>
              </EmptyState>
            ) : (
              <>
                <Toolbar>
                  <ToolbarContent>
                    <ToolbarItem style={{ marginLeft: 'auto' }}>
                      <Button variant="link" icon={<PlusCircleIcon />} onClick={() => setShowAddRegistry(true)}>
                        Add Container Registry
                      </Button>
                    </ToolbarItem>
                  </ToolbarContent>
                </Toolbar>
                <Table aria-label="Container registries table" variant="compact">
                  <Thead>
                    <Tr>
                      <Th width={40}>Registry</Th>
                      <Th width={40}>Username</Th>
                      <Th width={20} screenReaderText="Actions" />
                    </Tr>
                  </Thead>
                  <Tbody>
                    {registries.map(reg => (
                      <Tr key={reg.id}>
                        <Td dataLabel="Registry">{reg.registry}</Td>
                        <Td dataLabel="Username">{reg.username}</Td>
                        <Td isActionCell>
                          <Button variant="plain" aria-label="Delete registry" onClick={() => handleDeleteRegistry(reg.id)}>
                            <EllipsisVIcon />
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </>
            )}
          </>
        )}

        {activeTab === 'git-services' && (
          <>
          <TabHeader title="Git Services" subtitle="Connect to Git providers to clone repositories and manage source code." />
          <EmptyState headingLevel="h3" icon={CubesIcon} titleText="No Git Services" />
          </>
        )}

        {activeTab === 'personal-access-tokens' && (
          <>
            <TabHeader title="Personal Access Tokens" subtitle="Manage tokens for authenticating with Git providers and APIs." />
            <Toolbar>
              <ToolbarContent>
                <ToolbarItem>
                  <Button
                    variant="secondary"
                    isDisabled={selectedTokenIds.size === 0}
                    onClick={handleDeleteSelectedTokens}
                  >
                    Delete
                  </Button>
                </ToolbarItem>
                <ToolbarItem style={{ marginLeft: 'auto' }}>
                  <Button variant="link" icon={<PlusCircleIcon />} onClick={() => setShowAddToken(true)}>
                    Add Token
                  </Button>
                </ToolbarItem>
              </ToolbarContent>
            </Toolbar>
              {tokens.length === 0 ? (
                <EmptyState headingLevel="h3" icon={LockIcon} titleText="No Personal Access Tokens" />
              ) : (
                <Table aria-label="Personal access tokens table" variant="compact">
                  <Thead>
                    <Tr>
                      <Th select={{ onSelect: handleSelectAllTokens, isSelected: allTokensSelected }} />
                      <Th width={30}>Name</Th>
                      <Th width={30}>Provider</Th>
                      <Th width={30}>Endpoint</Th>
                      <Th width={10} screenReaderText="Actions" />
                    </Tr>
                  </Thead>
                  <Tbody>
                    {tokens.map((token, idx) => (
                      <Tr key={token.id}>
                        <Td select={{ rowIndex: idx, onSelect: () => handleSelectToken(token.id), isSelected: selectedTokenIds.has(token.id) }} />
                        <Td dataLabel="Name">{token.name}</Td>
                        <Td dataLabel="Provider">{token.provider}</Td>
                        <Td dataLabel="Endpoint">{token.endpoint}</Td>
                        <Td isActionCell>
                          <Dropdown
                            isOpen={tokenMenuOpenId === token.id}
                            onSelect={() => setTokenMenuOpenId(null)}
                            onOpenChange={open => { if (!open) setTokenMenuOpenId(null) }}
                            toggle={(toggleRef) => (
                              <MenuToggle
                                ref={toggleRef}
                                variant="plain"
                                onClick={() => setTokenMenuOpenId(tokenMenuOpenId === token.id ? null : token.id)}
                                isExpanded={tokenMenuOpenId === token.id}
                                aria-label="Token actions"
                              >
                                <EllipsisVIcon />
                              </MenuToggle>
                            )}
                            popperProps={{ position: 'right' }}
                          >
                            <DropdownList>
                              <DropdownItem key="delete" onClick={() => handleDeleteToken(token.id)}>
                                Delete
                              </DropdownItem>
                            </DropdownList>
                          </Dropdown>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
          </>
        )}

        {activeTab === 'gitconfig' && (
          <>
          <TabHeader title="Gitconfig" subtitle="Configure your Git identity and preferences for workspace environments." />
          <EmptyState headingLevel="h3" icon={CogIcon} titleText="No gitconfig found" />
          </>
        )}

        {activeTab === 'ssh-keys' && (
          <>
          <TabHeader title="SSH Keys" subtitle="Add SSH keys for secure authentication with Git repositories." />
            {sshKeys.length === 0 ? (
              <EmptyState headingLevel="h3" icon={KeyIcon} titleText="No SSH Keys">
                <EmptyStateFooter>
                  <EmptyStateActions>
                    <Button variant="link" icon={<PlusCircleIcon />} onClick={() => setShowAddSSHKey(true)}>
                      Add SSH Key
                    </Button>
                  </EmptyStateActions>
                </EmptyStateFooter>
              </EmptyState>
            ) : (
              <>
                <Toolbar>
                  <ToolbarContent>
                    <ToolbarItem style={{ marginLeft: 'auto' }}>
                      <Button variant="link" icon={<PlusCircleIcon />} onClick={() => setShowAddSSHKey(true)}>
                        Add SSH Key
                      </Button>
                    </ToolbarItem>
                  </ToolbarContent>
                </Toolbar>
                <Table aria-label="SSH keys table" variant="compact">
                  <Thead>
                    <Tr>
                      <Th width={50}>Name</Th>
                      <Th width={40}>Key</Th>
                      <Th width={10} screenReaderText="Actions" />
                    </Tr>
                  </Thead>
                  <Tbody>
                    {sshKeys.map(key => (
                      <Tr key={key.id}>
                        <Td dataLabel="Name">{key.name}</Td>
                        <Td dataLabel="Key" style={{ fontFamily: 'monospace', fontSize: 13 }}>{key.key.substring(0, 40)}...</Td>
                        <Td isActionCell>
                          <Button variant="plain" aria-label="Delete SSH key" onClick={() => handleDeleteSSHKey(key.id)}>
                            <EllipsisVIcon />
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </>
            )}
          </>
        )}

        {activeTab === 'skills' && (
          <>
            <TabHeader title="Skills" subtitle="Skills configured here will be available in every AI agent across all your workspaces." />
            <Tabs activeKey={skillsSubTab} onSelect={(_e, key) => setSkillsSubTab(key as typeof skillsSubTab)} style={{ marginBottom: 16 }}>
              <Tab eventKey="installed" title={<TabTitleText>Installed ({skills.length})</TabTitleText>}>
                <div style={{ paddingTop: 16 }}>
                  {skills.length === 0 ? (
                    <EmptyState headingLevel="h3" icon={AutomationIcon} titleText="No Skills installed">
                      <EmptyStateFooter>
                        <EmptyStateActions>
                          <Button variant="link" icon={<PlusCircleIcon />} onClick={() => setShowAddSkill(true)}>
                            Add Skill
                          </Button>
                          <Button variant="link" onClick={() => setShowImportSkills(true)}>
                            Import from Red Hat Developer Hub
                          </Button>
                        </EmptyStateActions>
                      </EmptyStateFooter>
                    </EmptyState>
                  ) : (
                    <>
                      <Toolbar>
                        <ToolbarContent>
                          <ToolbarItem style={{ marginLeft: 'auto' }}>
                            <Button variant="link" icon={<PlusCircleIcon />} onClick={() => setShowAddSkill(true)}>
                              Add Skill
                            </Button>
                          </ToolbarItem>
                          <ToolbarItem>
                            <Button variant="link" onClick={() => setShowImportSkills(true)}>
                              Import from RHDH
                            </Button>
                          </ToolbarItem>
                        </ToolbarContent>
                      </Toolbar>
                      <Table aria-label="Installed skills" variant="compact">
                        <Thead>
                          <Tr>
                            <Th width={25}>Name</Th>
                            <Th width={35}>Description</Th>
                            <Th width={15}>Source</Th>
                            <Th width={15}>Instance</Th>
                            <Th width={10} screenReaderText="Actions" />
                          </Tr>
                        </Thead>
                        <Tbody>
                          {skills.map(skill => (
                            <Tr key={skill.id}>
                              <Td dataLabel="Name">{skill.name}</Td>
                              <Td dataLabel="Description">{skill.description}</Td>
                              <Td dataLabel="Source">
                                <Label isCompact color={skill.source === 'rhdh' ? 'blue' : skill.source === 'catalog' ? 'purple' : 'grey'}>
                                  {skill.source === 'rhdh' ? 'RHDH' : skill.source === 'catalog' ? 'Catalog' : 'Manual'}
                                </Label>
                              </Td>
                              <Td dataLabel="Instance">{skill.rhdhInstance || skill.registry || '—'}</Td>
                              <Td isActionCell>
                                <Dropdown
                                  isOpen={skillMenuOpenId === skill.id}
                                  onSelect={() => setSkillMenuOpenId(null)}
                                  onOpenChange={open => { if (!open) setSkillMenuOpenId(null) }}
                                  toggle={(toggleRef) => (
                                    <MenuToggle
                                      ref={toggleRef}
                                      variant="plain"
                                      onClick={() => setSkillMenuOpenId(skillMenuOpenId === skill.id ? null : skill.id)}
                                      isExpanded={skillMenuOpenId === skill.id}
                                      aria-label="Skill actions"
                                    >
                                      <EllipsisVIcon />
                                    </MenuToggle>
                                  )}
                                  popperProps={{ position: 'right' }}
                                >
                                  <DropdownList>
                                    <DropdownItem key="delete" onClick={() => handleDeleteSkill(skill.id)}>
                                      Delete
                                    </DropdownItem>
                                  </DropdownList>
                                </Dropdown>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </>
                  )}
                </div>
              </Tab>
              <Tab eventKey="catalog" title={<TabTitleText>Catalog</TabTitleText>}>
                <div style={{ paddingTop: 16 }}>
                  {renderCatalogTable(skillsCatalog, handleInstallSkillFromCatalog, 'Skills')}
                </div>
              </Tab>
              <Tab eventKey="registries" title={<TabTitleText>Registries</TabTitleText>}>
                <div style={{ paddingTop: 16 }}>
                  {renderRegistriesTable(skillRegistries, handleToggleSkillRegistry, 'Skills')}
                </div>
              </Tab>
            </Tabs>
          </>
        )}

        {activeTab === 'mcps' && (
          <>
            <TabHeader title="MCPs" subtitle="Connect Model Context Protocol servers to extend AI agent capabilities." />
            <Tabs activeKey={mcpsSubTab} onSelect={(_e, key) => setMcpsSubTab(key as typeof mcpsSubTab)} style={{ marginBottom: 16 }}>
              <Tab eventKey="installed" title={<TabTitleText>Installed ({installedMcps.length})</TabTitleText>}>
                <div style={{ paddingTop: 16 }}>
                  {installedMcps.length === 0 ? (
                    <EmptyState headingLevel="h3" icon={PluggedIcon} titleText="No MCPs installed" />
                  ) : (
                    <Table aria-label="Installed MCPs" variant="compact">
                      <Thead>
                        <Tr>
                          <Th width={20}>Name</Th>
                          <Th width={40}>Description</Th>
                          <Th width={15}>Status</Th>
                          <Th width={15}>Registry</Th>
                          <Th width={10} screenReaderText="Actions" />
                        </Tr>
                      </Thead>
                      <Tbody>
                        {installedMcps.map(mcp => (
                          <Tr key={mcp.id}>
                            <Td dataLabel="Name">{mcp.name}</Td>
                            <Td dataLabel="Description">{mcp.description}</Td>
                            <Td dataLabel="Status">
                              <Label isCompact color={MCP_STATUS_COLORS[mcp.status]}>
                                {mcp.status.charAt(0).toUpperCase() + mcp.status.slice(1)}
                              </Label>
                            </Td>
                            <Td dataLabel="Registry">{mcp.registry || '—'}</Td>
                            <Td isActionCell>
                              <Dropdown
                                isOpen={mcpMenuOpenId === mcp.id}
                                onSelect={() => setMcpMenuOpenId(null)}
                                onOpenChange={open => { if (!open) setMcpMenuOpenId(null) }}
                                toggle={(toggleRef) => (
                                  <MenuToggle
                                    ref={toggleRef}
                                    variant="plain"
                                    onClick={() => setMcpMenuOpenId(mcpMenuOpenId === mcp.id ? null : mcp.id)}
                                    isExpanded={mcpMenuOpenId === mcp.id}
                                    aria-label="MCP actions"
                                  >
                                    <EllipsisVIcon />
                                  </MenuToggle>
                                )}
                                popperProps={{ position: 'right' }}
                              >
                                <DropdownList>
                                  <DropdownItem key="delete" onClick={() => handleDeleteMcp(mcp.id)}>
                                    Remove
                                  </DropdownItem>
                                </DropdownList>
                              </Dropdown>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  )}
                </div>
              </Tab>
              <Tab eventKey="catalog" title={<TabTitleText>Catalog</TabTitleText>}>
                <div style={{ paddingTop: 16 }}>
                  {renderCatalogTable(mcpsCatalog, handleInstallMcpFromCatalog, 'MCPs')}
                </div>
              </Tab>
              <Tab eventKey="registries" title={<TabTitleText>Registries</TabTitleText>}>
                <div style={{ paddingTop: 16 }}>
                  {renderRegistriesTable(mcpRegistries, handleToggleMcpRegistry, 'MCPs')}
                </div>
              </Tab>
            </Tabs>
          </>
        )}

        {activeTab === 'agent-configurations' && (
          <>
          <TabHeader title="Agent Configurations" subtitle="Define and manage AI agent configurations for your workspaces." />
          <EmptyState headingLevel="h3" icon={RobotIcon} titleText="No Agent Configurations" />
          </>
        )}
          </div>
        </div>
      </PageSection>

      {showAddRegistry && (
        <Modal
          isOpen
          onClose={() => { setShowAddRegistry(false); resetRegistryForm() }}
          variant="medium"
          aria-label="Add Container Registry"
        >
          <ModalHeader title="Add Container Registry" />
          <ModalBody>
            <FormGroup label="Registry" isRequired fieldId="reg-registry">
              <div style={{ display: 'flex', gap: 8 }}>
                <TextInput
                  id="reg-registry"
                  value={regRegistry}
                  onChange={(_e, val) => setRegRegistry(val)}
                  placeholder="Enter a registry"
                  isRequired
                  style={{ flex: 1 }}
                />
                <Button variant="control" aria-label="Open registry link" icon={<ExternalLinkAltIcon />} />
              </div>
            </FormGroup>
            <FormGroup label="Username" fieldId="reg-username" style={{ marginTop: 16 }}>
              <TextInput
                id="reg-username"
                value={regUsername}
                onChange={(_e, val) => setRegUsername(val)}
                placeholder="Enter a username"
              />
            </FormGroup>
            <FormGroup label="Password" isRequired fieldId="reg-password" style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <TextInput
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  value={regPassword}
                  onChange={(_e, val) => setRegPassword(val)}
                  placeholder="Enter a password"
                  isRequired
                  style={{ flex: 1 }}
                />
                <Button
                  variant="control"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(!showPassword)}
                  icon={showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                />
              </div>
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="primary"
              onClick={handleAddRegistry}
              isDisabled={!regRegistry || !regPassword}
            >
              Add
            </Button>
            <Button variant="link" onClick={() => { setShowAddRegistry(false); resetRegistryForm() }}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      )}

      {showAddToken && (
        <Modal
          isOpen
          onClose={() => { setShowAddToken(false); resetTokenForm() }}
          variant="medium"
          aria-label="Add Personal Access Token"
        >
          <ModalHeader title="Add Personal Access Token" />
          <ModalBody>
            <FormGroup label="Name" isRequired fieldId="token-name">
              <TextInput
                id="token-name"
                value={tokenName}
                onChange={(_e, val) => setTokenName(val)}
                placeholder="Enter a token name"
                isRequired
              />
            </FormGroup>
            <FormGroup label="Provider" isRequired fieldId="token-provider" style={{ marginTop: 16 }}>
              <TextInput
                id="token-provider"
                value={tokenProvider}
                onChange={(_e, val) => setTokenProvider(val)}
                placeholder="e.g. github, gitlab, bitbucket"
                isRequired
              />
            </FormGroup>
            <FormGroup label="Token" isRequired fieldId="token-value" style={{ marginTop: 16 }}>
              <TextInput
                id="token-value"
                type="password"
                value={tokenValue}
                onChange={(_e, val) => setTokenValue(val)}
                placeholder="Enter the access token"
                isRequired
              />
            </FormGroup>
            <FormGroup label="Endpoint" isRequired fieldId="token-endpoint" style={{ marginTop: 16 }}>
              <TextInput
                id="token-endpoint"
                value={tokenEndpoint}
                onChange={(_e, val) => setTokenEndpoint(val)}
                placeholder="e.g. https://github.com"
                isRequired
              />
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="primary"
              onClick={handleAddToken}
              isDisabled={!tokenName || !tokenProvider || !tokenValue || !tokenEndpoint}
            >
              Add
            </Button>
            <Button variant="link" onClick={() => { setShowAddToken(false); resetTokenForm() }}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      )}

      {showAddSSHKey && (
        <Modal
          isOpen
          onClose={() => { setShowAddSSHKey(false); resetSSHKeyForm() }}
          variant="medium"
          aria-label="Add SSH Key"
        >
          <ModalHeader title="Add SSH Key" />
          <ModalBody>
            <FormGroup label="Name" isRequired fieldId="ssh-name">
              <TextInput
                id="ssh-name"
                value={sshKeyName}
                onChange={(_e, val) => setSSHKeyName(val)}
                placeholder="Enter a key name"
                isRequired
              />
            </FormGroup>
            <FormGroup label="Key" isRequired fieldId="ssh-key" style={{ marginTop: 16 }}>
              <TextInput
                id="ssh-key"
                value={sshKeyValue}
                onChange={(_e, val) => setSSHKeyValue(val)}
                placeholder="Enter the SSH public key"
                isRequired
              />
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="primary"
              onClick={handleAddSSHKey}
              isDisabled={!sshKeyName || !sshKeyValue}
            >
              Add
            </Button>
            <Button variant="link" onClick={() => { setShowAddSSHKey(false); resetSSHKeyForm() }}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      )}

      {showAddSkill && (
        <Modal
          isOpen
          onClose={() => { setShowAddSkill(false); resetSkillForm() }}
          variant="medium"
          aria-label="Add Skill"
        >
          <ModalHeader title="Add Skill" />
          <ModalBody>
            <FormGroup label="Name" isRequired fieldId="skill-name">
              <TextInput
                id="skill-name"
                value={skillName}
                onChange={(_e, val) => setSkillName(val)}
                placeholder="Enter a skill name"
                isRequired
              />
            </FormGroup>
            <FormGroup label="Description" isRequired fieldId="skill-description" style={{ marginTop: 16 }}>
              <TextInput
                id="skill-description"
                value={skillDescription}
                onChange={(_e, val) => setSkillDescription(val)}
                placeholder="Describe what this skill does"
                isRequired
              />
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="primary"
              onClick={handleAddSkill}
              isDisabled={!skillName || !skillDescription}
            >
              Add
            </Button>
            <Button variant="link" onClick={() => { setShowAddSkill(false); resetSkillForm() }}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      )}

      {showImportSkills && (
        <Modal
          isOpen
          onClose={() => { setShowImportSkills(false); resetRhdhForm() }}
          variant="medium"
          aria-label="Import Skills from Red Hat Developer Hub"
        >
          <ModalHeader title="Import Skills from Red Hat Developer Hub" />
          <ModalBody>
            <FormGroup label="RHDH Instance URL" isRequired fieldId="rhdh-url">
              <div style={{ display: 'flex', gap: 8 }}>
                <TextInput
                  id="rhdh-url"
                  value={rhdhInstanceUrl}
                  onChange={(_e, val) => { setRhdhInstanceUrl(val); setRhdhConnected(false) }}
                  placeholder="https://developer-hub.example.com"
                  isRequired
                  isDisabled={rhdhConnected}
                  style={{ flex: 1 }}
                />
                <Button
                  variant="secondary"
                  onClick={handleRhdhConnect}
                  isDisabled={!rhdhInstanceUrl || rhdhConnected}
                >
                  {rhdhConnected ? 'Connected' : 'Connect'}
                </Button>
              </div>
            </FormGroup>

            {rhdhConnected && (
              <div style={{ marginTop: 24 }}>
                <Title headingLevel="h4" size="md" style={{ marginBottom: 12 }}>
                  Available Skills
                </Title>
                <Table aria-label="Available RHDH skills" variant="compact">
                  <Thead>
                    <Tr>
                      <Th screenReaderText="Select" />
                      <Th>Name</Th>
                      <Th>Description</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {MOCK_RHDH_SKILLS.map((skill, idx) => (
                      <Tr key={idx}>
                        <Td>
                          <Checkbox
                            id={`rhdh-skill-${idx}`}
                            isChecked={rhdhSelectedSkills.has(idx)}
                            onChange={() => handleToggleRhdhSkill(idx)}
                            aria-label={`Select ${skill.name}`}
                          />
                        </Td>
                        <Td dataLabel="Name">{skill.name}</Td>
                        <Td dataLabel="Description">{skill.description}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              variant="primary"
              onClick={handleImportRhdhSkills}
              isDisabled={!rhdhConnected || rhdhSelectedSkills.size === 0}
            >
              Import Selected ({rhdhSelectedSkills.size})
            </Button>
            <Button variant="link" onClick={() => { setShowImportSkills(false); resetRhdhForm() }}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </>
  )
}
