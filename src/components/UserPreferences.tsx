import { useState } from 'react'
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  EmptyState,
  EmptyStateActions,
  EmptyStateFooter,
  FileUpload,
  FormGroup,
  HelperText,
  HelperTextItem,
  Label,
  MenuToggle,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Nav,
  NavExpandable,
  NavGroup,
  NavItem,
  PageSection,
  Switch,
  TextArea,
  TextInput,
  Title,
  ToggleGroup,
  ToggleGroupItem,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core'
import type { DropEvent } from '@patternfly/react-core'
import {
  AutomationIcon,
  CheckCircleIcon,
  CogIcon,
  CubesIcon,
  EllipsisVIcon,
  ExclamationCircleIcon,
  ExternalLinkAltIcon,
  EyeIcon,
  EyeSlashIcon,
  GitAltIcon,
  KeyIcon,
  LockIcon,
  MinusCircleIcon,
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

export type PreferencesTab =
  | 'container-registries' | 'git-services' | 'personal-access-tokens' | 'gitconfig' | 'ssh-keys'
  | 'skills-installed' | 'skills-catalog' | 'skills-registries'
  | 'mcps-installed' | 'mcps-catalog' | 'mcps-registries'
  | 'agent-configurations'

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
  source: 'manual' | 'rhdh' | 'catalog' | 'url' | 'file'
  rhdhInstance?: string
  registry?: string
  sourceUrl?: string
  markdownContent?: string
  fileName?: string
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

const MCP_STATUS_CONFIG: Record<InstalledMcp['status'], { icon: React.ReactNode; label: string }> = {
  connected: {
    icon: <CheckCircleIcon style={{ color: 'var(--pf-t--global--icon--color--status--success--default)' }} />,
    label: 'Connected',
  },
  disconnected: {
    icon: <MinusCircleIcon style={{ color: 'var(--pf-t--global--icon--color--status--info--default)' }} />,
    label: 'Disconnected',
  },
  error: {
    icon: <ExclamationCircleIcon style={{ color: 'var(--pf-t--global--icon--color--status--danger--default)' }} />,
    label: 'Error',
  },
}

function parseMarkdownSkill(md: string): { name: string; description: string } {
  const lines = md.split('\n')
  let name = ''
  let foundHeading = false
  const descLines: string[] = []
  for (const line of lines) {
    const headingMatch = line.match(/^#\s+(.+)/)
    if (headingMatch && !name) {
      name = headingMatch[1].trim()
      foundHeading = true
      continue
    }
    if (foundHeading) {
      const trimmed = line.trim()
      if (trimmed === '' && descLines.length > 0) break
      if (trimmed !== '' && !trimmed.startsWith('#')) descLines.push(trimmed)
    }
  }
  return { name, description: descLines.join(' ') }
}

function TabHeader({ title, subtitle, action }: { title: string; subtitle: string; action?: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Title headingLevel="h2" size="lg">{title}</Title>
        {action}
      </div>
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
  const [skillName, setSkillName] = useState('')
  const [skillDescription, setSkillDescription] = useState('')
  const [skillMenuOpenId, setSkillMenuOpenId] = useState<string | null>(null)
  const [skillAddMode, setSkillAddMode] = useState<'manual' | 'url' | 'file'>('url')
  const [skillUrl, setSkillUrl] = useState('')
  const [skillUrlLoading, setSkillUrlLoading] = useState(false)
  const [skillFileContent, setSkillFileContent] = useState('')
  const [skillFileName, setSkillFileName] = useState('')
  const [skillsCatalog, setSkillsCatalog] = useState<CatalogItem[]>(DEFAULT_SKILLS_CATALOG)
  const [skillRegistries, setSkillRegistries] = useState<Registry[]>(DEFAULT_SKILL_REGISTRIES)

  const [installedMcps, setInstalledMcps] = useState<InstalledMcp[]>(DEFAULT_INSTALLED_MCPS)
  const [mcpsCatalog, setMcpsCatalog] = useState<CatalogItem[]>(DEFAULT_MCPS_CATALOG)
  const [mcpRegistries, setMcpRegistries] = useState<Registry[]>(DEFAULT_MCP_REGISTRIES)
  const [mcpMenuOpenId, setMcpMenuOpenId] = useState<string | null>(null)
  const [showAddMcp, setShowAddMcp] = useState(false)
  const [mcpName, setMcpName] = useState('')
  const [mcpDescription, setMcpDescription] = useState('')

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
    setSkillAddMode('url')
    setSkillUrl('')
    setSkillUrlLoading(false)
    setSkillFileContent('')
    setSkillFileName('')
  }

  const handleAddSkill = () => {
    const newSkill: Skill = {
      id: String(Date.now()),
      name: skillName,
      description: skillDescription,
      source: skillAddMode,
    }
    if (skillAddMode === 'url') {
      newSkill.sourceUrl = skillUrl
    }
    if (skillAddMode === 'file') {
      newSkill.markdownContent = skillFileContent
      newSkill.fileName = skillFileName
    }
    setSkills(prev => [...prev, newSkill])
    setShowAddSkill(false)
    resetSkillForm()
  }

  const handleFetchSkillUrl = () => {
    setSkillUrlLoading(true)
    setTimeout(() => {
      const urlParts = skillUrl.split('/')
      const filename = urlParts[urlParts.length - 1] || 'imported-skill'
      const name = filename.replace(/\.md$/i, '').replace(/[-_]/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())
      setSkillName(name)
      setSkillDescription(`Skill imported from ${skillUrl}`)
      setSkillUrlLoading(false)
    }, 800)
  }

  const handleSkillFileInputChange = (_event: DropEvent, file: File) => {
    setSkillFileName(file.name)
  }

  const handleSkillFileDataChange = (_event: DropEvent, data: string) => {
    setSkillFileContent(data)
    const { name, description } = parseMarkdownSkill(data)
    if (name) setSkillName(name)
    if (description) setSkillDescription(description)
  }

  const handleSkillFileClear = () => {
    setSkillFileContent('')
    setSkillFileName('')
    setSkillName('')
    setSkillDescription('')
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

  const resetMcpForm = () => {
    setMcpName('')
    setMcpDescription('')
  }

  const handleAddMcp = () => {
    setInstalledMcps(prev => [...prev, {
      id: String(Date.now()),
      name: mcpName,
      description: mcpDescription,
      status: 'connected',
    }])
    setShowAddMcp(false)
    resetMcpForm()
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
              <NavExpandable title={<><AutomationIcon style={{ marginRight: 8 }} />Skills</>} isActive={activeTab.startsWith('skills-')} isExpanded>
                <NavItem itemId="skills-installed" isActive={activeTab === 'skills-installed'}>Installed ({skills.length})</NavItem>
                <NavItem itemId="skills-catalog" isActive={activeTab === 'skills-catalog'}>Catalog</NavItem>
                <NavItem itemId="skills-registries" isActive={activeTab === 'skills-registries'}>Registries</NavItem>
              </NavExpandable>
              <NavExpandable title={<><PluggedIcon style={{ marginRight: 8 }} />MCPs</>} isActive={activeTab.startsWith('mcps-')} isExpanded>
                <NavItem itemId="mcps-installed" isActive={activeTab === 'mcps-installed'}>Installed ({installedMcps.length})</NavItem>
                <NavItem itemId="mcps-catalog" isActive={activeTab === 'mcps-catalog'}>Catalog</NavItem>
                <NavItem itemId="mcps-registries" isActive={activeTab === 'mcps-registries'}>Registries</NavItem>
              </NavExpandable>
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

        {activeTab === 'skills-installed' && (
          <>
            <TabHeader
              title="Installed Skills"
              subtitle="Skills configured here will be available in every AI agent across all your workspaces."
              action={<Button variant="secondary" icon={<PlusCircleIcon />} onClick={() => setShowAddSkill(true)}>Add Skill</Button>}
            />
            {skills.length === 0 ? (
              <EmptyState headingLevel="h3" icon={AutomationIcon} titleText="No Skills installed">
                <EmptyStateFooter>
                  <EmptyStateActions>
                    <Button variant="link" icon={<PlusCircleIcon />} onClick={() => setShowAddSkill(true)}>
                      Add Skill
                    </Button>
                  </EmptyStateActions>
                </EmptyStateFooter>
              </EmptyState>
            ) : (
              <>
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
                          <Label isCompact color={
                            skill.source === 'rhdh' ? 'blue' :
                            skill.source === 'catalog' ? 'purple' :
                            skill.source === 'url' ? 'orange' :
                            skill.source === 'file' ? 'green' :
                            'grey'
                          }>
                            {skill.source === 'rhdh' ? 'RHDH' :
                             skill.source === 'catalog' ? 'Catalog' :
                             skill.source === 'url' ? 'URL' :
                             skill.source === 'file' ? 'File' :
                             'Manual'}
                          </Label>
                        </Td>
                        <Td dataLabel="Instance">
                          {skill.source === 'url' && skill.sourceUrl ? (
                            <a href={skill.sourceUrl} target="_blank" rel="noopener noreferrer"
                               style={{ fontFamily: 'monospace', fontSize: 13 }}>
                              {skill.sourceUrl.length > 40 ? skill.sourceUrl.substring(0, 40) + '...' : skill.sourceUrl}
                              {' '}<ExternalLinkAltIcon style={{ fontSize: 11 }} />
                            </a>
                          ) : skill.source === 'file' && skill.fileName ? (
                            <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{skill.fileName}</span>
                          ) : (
                            skill.rhdhInstance || skill.registry || '—'
                          )}
                        </Td>
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
          </>
        )}

        {activeTab === 'skills-catalog' && (
          <>
            <TabHeader title="Skills Catalog" subtitle="Browse and install skills from configured registries." />
            {renderCatalogTable(skillsCatalog, handleInstallSkillFromCatalog, 'Skills')}
          </>
        )}

        {activeTab === 'skills-registries' && (
          <>
            <TabHeader title="Skills Registries" subtitle="Manage registries that provide skills for your workspaces." />
            {renderRegistriesTable(skillRegistries, handleToggleSkillRegistry, 'Skills')}
          </>
        )}

        {activeTab === 'mcps-installed' && (
          <>
            <TabHeader
              title="Installed MCPs"
              subtitle="Connect Model Context Protocol servers to extend AI agent capabilities."
              action={<Button variant="secondary" icon={<PlusCircleIcon />} onClick={() => setShowAddMcp(true)}>Add MCP</Button>}
            />
            {installedMcps.length === 0 ? (
              <EmptyState headingLevel="h3" icon={PluggedIcon} titleText="No MCPs installed">
                <EmptyStateFooter>
                  <EmptyStateActions>
                    <Button variant="link" icon={<PlusCircleIcon />} onClick={() => setShowAddMcp(true)}>
                      Add MCP
                    </Button>
                  </EmptyStateActions>
                </EmptyStateFooter>
              </EmptyState>
            ) : (
              <>
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
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            {MCP_STATUS_CONFIG[mcp.status].icon}
                            {MCP_STATUS_CONFIG[mcp.status].label}
                          </span>
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
              </>
            )}
          </>
        )}

        {activeTab === 'mcps-catalog' && (
          <>
            <TabHeader title="MCPs Catalog" subtitle="Browse and install MCP servers from configured registries." />
            {renderCatalogTable(mcpsCatalog, handleInstallMcpFromCatalog, 'MCPs')}
          </>
        )}

        {activeTab === 'mcps-registries' && (
          <>
            <TabHeader title="MCPs Registries" subtitle="Manage registries that provide MCP servers." />
            {renderRegistriesTable(mcpRegistries, handleToggleMcpRegistry, 'MCPs')}
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
            <ToggleGroup aria-label="Skill import method">
              <ToggleGroupItem
                text="Manual"
                buttonId="skill-mode-manual"
                isSelected={skillAddMode === 'manual'}
                onChange={() => setSkillAddMode('manual')}
              />
              <ToggleGroupItem
                text="From URL"
                buttonId="skill-mode-url"
                isSelected={skillAddMode === 'url'}
                onChange={() => setSkillAddMode('url')}
              />
              <ToggleGroupItem
                text="From File"
                buttonId="skill-mode-file"
                isSelected={skillAddMode === 'file'}
                onChange={() => setSkillAddMode('file')}
              />
            </ToggleGroup>

            {skillAddMode === 'url' && (
              <FormGroup label="Skill Definition URL" isRequired fieldId="skill-url" style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <TextInput
                    id="skill-url"
                    value={skillUrl}
                    onChange={(_e, val) => setSkillUrl(val)}
                    placeholder="https://raw.githubusercontent.com/org/repo/main/skills/my-skill.md"
                    isRequired
                    style={{ flex: 1 }}
                  />
                  <Button
                    variant="secondary"
                    onClick={handleFetchSkillUrl}
                    isDisabled={!skillUrl || skillUrlLoading}
                    isLoading={skillUrlLoading}
                  >
                    Fetch
                  </Button>
                </div>
                <HelperText>
                  <HelperTextItem>Paste a URL to a raw .md skill definition file</HelperTextItem>
                </HelperText>
              </FormGroup>
            )}

            {skillAddMode === 'file' && (
              <FormGroup label="Skill Definition File" fieldId="skill-file" style={{ marginTop: 16 }}>
                <FileUpload
                  id="skill-file"
                  type="text"
                  value={skillFileContent}
                  filename={skillFileName}
                  onFileInputChange={handleSkillFileInputChange}
                  onDataChange={handleSkillFileDataChange}
                  onClearClick={handleSkillFileClear}
                  browseButtonText="Browse"
                  dropzoneProps={{
                    accept: { 'text/markdown': ['.md'] },
                    maxSize: 1024 * 1024,
                  }}
                  filenamePlaceholder="Drag and drop a .md file or browse to upload"
                />
                <HelperText>
                  <HelperTextItem>Drop a Markdown file to auto-populate skill name and description</HelperTextItem>
                </HelperText>
              </FormGroup>
            )}

            <FormGroup label="Name" isRequired fieldId="skill-name" style={{ marginTop: 16 }}>
              <TextInput
                id="skill-name"
                value={skillName}
                onChange={(_e, val) => setSkillName(val)}
                placeholder="Enter a skill name"
                isRequired
              />
            </FormGroup>
            <FormGroup label="Description" isRequired fieldId="skill-description" style={{ marginTop: 16 }}>
              <TextArea
                id="skill-description"
                value={skillDescription}
                onChange={(_e, val) => setSkillDescription(val)}
                placeholder="Describe what this skill does"
                isRequired
                resizeOrientation="vertical"
                rows={3}
                aria-label="Skill description"
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

      {showAddMcp && (
        <Modal
          isOpen
          onClose={() => { setShowAddMcp(false); resetMcpForm() }}
          variant="medium"
          aria-label="Add MCP"
        >
          <ModalHeader title="Add MCP" />
          <ModalBody>
            <FormGroup label="Name" isRequired fieldId="mcp-name">
              <TextInput
                id="mcp-name"
                value={mcpName}
                onChange={(_e, val) => setMcpName(val)}
                placeholder="Enter an MCP server name"
                isRequired
              />
            </FormGroup>
            <FormGroup label="Description" isRequired fieldId="mcp-description" style={{ marginTop: 16 }}>
              <TextInput
                id="mcp-description"
                value={mcpDescription}
                onChange={(_e, val) => setMcpDescription(val)}
                placeholder="Describe what this MCP server provides"
                isRequired
              />
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="primary"
              onClick={handleAddMcp}
              isDisabled={!mcpName || !mcpDescription}
            >
              Add
            </Button>
            <Button variant="link" onClick={() => { setShowAddMcp(false); resetMcpForm() }}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </>
  )
}
