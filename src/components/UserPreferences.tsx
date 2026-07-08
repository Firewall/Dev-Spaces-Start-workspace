import { useState } from 'react'
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  FormGroup,
  MenuToggle,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Nav,
  NavGroup,
  NavItem,
  PageSection,
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

type PreferencesTab = 'container-registries' | 'git-services' | 'personal-access-tokens' | 'gitconfig' | 'ssh-keys' | 'ai-skills' | 'ai-mcps' | 'ai-agent-configurations'

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

const INITIAL_TOKENS: PersonalAccessToken[] = [
  { id: '1', name: 'qnxmh', provider: 'github', endpoint: 'https://github.com' },
]

function EmptyState({ icon: Icon, title, action }: { icon: React.ComponentType<{ size?: number }>; title: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0' }}>
      <Icon size={48} />
      <div style={{ marginTop: 16, fontSize: 18, fontWeight: 600 }}>{title}</div>
      {action && <div style={{ marginTop: 12 }}>{action}</div>}
    </div>
  )
}

export function UserPreferences() {
  const [activeTab, setActiveTab] = useState<PreferencesTab>('container-registries')

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

  const allTokensSelected = tokens.length > 0 && selectedTokenIds.size === tokens.length

  return (
    <>
      <PageSection hasBodyWrapper={false} style={{ paddingBottom: 0 }}>
        <Title headingLevel="h1" size="xl">User Preferences</Title>
      </PageSection>

      <PageSection hasBodyWrapper={false} style={{ paddingTop: 16 }}>
        <div style={{ display: 'flex', gap: 24 }}>
          <Nav
            onSelect={(_event, result) => setActiveTab(result.itemId as PreferencesTab)}
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
              <NavItem itemId="ai-skills" isActive={activeTab === 'ai-skills'} icon={<AutomationIcon />}>Skills</NavItem>
              <NavItem itemId="ai-mcps" isActive={activeTab === 'ai-mcps'} icon={<PluggedIcon />}>MCPs</NavItem>
              <NavItem itemId="ai-agent-configurations" isActive={activeTab === 'ai-agent-configurations'} icon={<RobotIcon />}>Agent Configurations</NavItem>
            </NavGroup>
          </Nav>

          <div style={{ flex: 1, minWidth: 0 }}>
        {activeTab === 'container-registries' && (
          <div style={{ background: 'var(--pf-t--global--background--color--secondary--default)', borderRadius: 8, padding: 24 }}>
            {registries.length === 0 ? (
              <EmptyState
                icon={CubesIcon}
                title="No Container Registries"
                action={
                  <Button variant="link" icon={<PlusCircleIcon />} onClick={() => setShowAddRegistry(true)}>
                    Add Container Registry
                  </Button>
                }
              />
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
          </div>
        )}

        {activeTab === 'git-services' && (
          <div style={{ background: 'var(--pf-t--global--background--color--secondary--default)', borderRadius: 8, padding: 24 }}>
            <EmptyState icon={CubesIcon} title="No Git Services" />
          </div>
        )}

        {activeTab === 'personal-access-tokens' && (
          <>
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
            <div style={{ background: 'var(--pf-t--global--background--color--secondary--default)', borderRadius: 8 }}>
              {tokens.length === 0 ? (
                <div style={{ padding: '60px 0', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>No Personal Access Tokens</div>
                </div>
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
            </div>
          </>
        )}

        {activeTab === 'gitconfig' && (
          <div style={{ background: 'var(--pf-t--global--background--color--secondary--default)', borderRadius: 8, padding: 24 }}>
            <EmptyState icon={CogIcon} title="No gitconfig found" />
          </div>
        )}

        {activeTab === 'ssh-keys' && (
          <div style={{ background: 'var(--pf-t--global--background--color--secondary--default)', borderRadius: 8, padding: 24 }}>
            {sshKeys.length === 0 ? (
              <EmptyState
                icon={KeyIcon}
                title="No SSH Keys"
                action={
                  <Button variant="link" icon={<PlusCircleIcon />} onClick={() => setShowAddSSHKey(true)}>
                    Add SSH Key
                  </Button>
                }
              />
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
          </div>
        )}

        {activeTab === 'ai-skills' && (
          <div style={{ background: 'var(--pf-t--global--background--color--secondary--default)', borderRadius: 8, padding: 24 }}>
            <EmptyState icon={AutomationIcon} title="No Skills configured" />
          </div>
        )}

        {activeTab === 'ai-mcps' && (
          <div style={{ background: 'var(--pf-t--global--background--color--secondary--default)', borderRadius: 8, padding: 24 }}>
            <EmptyState icon={PluggedIcon} title="No MCPs configured" />
          </div>
        )}

        {activeTab === 'ai-agent-configurations' && (
          <div style={{ background: 'var(--pf-t--global--background--color--secondary--default)', borderRadius: 8, padding: 24 }}>
            <EmptyState icon={RobotIcon} title="No Agent Configurations" />
          </div>
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
    </>
  )
}
