import { useState } from 'react'
import {
  Button,
  Form,
  FormGroup,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  TextInput,
} from '@patternfly/react-core'
import { GithubIcon, GitlabIcon, SearchIcon } from '@patternfly/react-icons'

interface AddProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (name: string, repoUrl: string) => void
}

interface MockRepo {
  name: string
  fullName: string
  url: string
  source: 'github' | 'gitlab'
  description: string
  updatedAt: string
}

const MOCK_REPOS: MockRepo[] = [
  { name: 'web-app', fullName: 'acme/web-app', url: 'https://github.com/acme/web-app', source: 'github', description: 'Main web application frontend', updatedAt: '2d ago' },
  { name: 'api-service', fullName: 'acme/api-service', url: 'https://github.com/acme/api-service', source: 'github', description: 'REST & GraphQL API backend', updatedAt: '1d ago' },
  { name: 'mobile-app', fullName: 'acme/mobile-app', url: 'https://github.com/acme/mobile-app', source: 'github', description: 'React Native mobile client', updatedAt: '5d ago' },
  { name: 'infra', fullName: 'acme/infra', url: 'https://github.com/acme/infra', source: 'github', description: 'Terraform infrastructure configs', updatedAt: '3d ago' },
  { name: 'design-system', fullName: 'acme/design-system', url: 'https://github.com/acme/design-system', source: 'github', description: 'Shared component library', updatedAt: '1w ago' },
  { name: 'data-pipeline', fullName: 'acme/data-pipeline', url: 'https://gitlab.com/acme/data-pipeline', source: 'gitlab', description: 'ETL and data processing jobs', updatedAt: '4d ago' },
  { name: 'ml-models', fullName: 'acme/ml-models', url: 'https://gitlab.com/acme/ml-models', source: 'gitlab', description: 'Machine learning model training', updatedAt: '6d ago' },
  { name: 'docs', fullName: 'acme/docs', url: 'https://github.com/acme/docs', source: 'github', description: 'Developer documentation site', updatedAt: '2w ago' },
]

type Mode = 'select' | 'manual'

export function AddProjectModal({ isOpen, onClose, onSave }: AddProjectModalProps) {
  const [mode, setMode] = useState<Mode>('select')
  const [name, setName] = useState('')
  const [repoUrl, setRepoUrl] = useState('')
  const [search, setSearch] = useState('')

  function handleSave() {
    if (!name.trim()) return
    onSave(name.trim(), repoUrl.trim())
    reset()
    onClose()
  }

  function handleSelectRepo(repo: MockRepo) {
    onSave(repo.name, repo.url)
    reset()
    onClose()
  }

  function reset() {
    setName('')
    setRepoUrl('')
    setSearch('')
    setMode('select')
  }

  function handleClose() {
    reset()
    onClose()
  }

  const filtered = search
    ? MOCK_REPOS.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.fullName.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase()))
    : MOCK_REPOS

  return (
    <Modal variant="medium" isOpen={isOpen} onClose={handleClose}>
      <ModalHeader title="Add Project" />
      <ModalBody>
        {mode === 'select' ? (
          <div>
            {/* Connected accounts banner */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px', marginBottom: 16,
              background: 'var(--pf-t--global--background--color--secondary--default)',
              borderRadius: 6,
              fontSize: 13,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <GithubIcon style={{ fontSize: 16 }} />
                <span style={{ color: 'var(--pf-t--global--text--color--regular)' }}>GitHub</span>
                <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 8, background: '#1a7f3720', color: '#1a7f37' }}>Connected</span>
              </div>
              <div style={{ width: 1, height: 16, background: 'var(--pf-t--global--border--color--default)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <GitlabIcon style={{ fontSize: 16 }} />
                <span style={{ color: 'var(--pf-t--global--text--color--regular)' }}>GitLab</span>
                <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 8, background: '#1a7f3720', color: '#1a7f37' }}>Connected</span>
              </div>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <SearchIcon style={{
                position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                fontSize: 13, color: 'var(--pf-t--global--text--color--subtle)',
              }} />
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search repositories..."
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '8px 12px 8px 32px', fontSize: 13, fontFamily: 'inherit',
                  border: '1px solid var(--pf-t--global--border--color--default)',
                  borderRadius: 6,
                  background: 'var(--pf-t--global--background--color--secondary--default)',
                  color: 'var(--pf-t--global--text--color--regular)',
                  outline: 'none',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--pf-t--global--color--brand--default)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--pf-t--global--border--color--default)')}
              />
            </div>

            {/* Repo list */}
            <div style={{ maxHeight: 320, overflowY: 'auto', border: '1px solid var(--pf-t--global--border--color--default)', borderRadius: 6 }}>
              {filtered.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', fontSize: 13, color: 'var(--pf-t--global--text--color--subtle)' }}>
                  No repositories found
                </div>
              ) : (
                filtered.map(repo => (
                  <button
                    key={repo.url}
                    onClick={() => handleSelectRepo(repo)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      width: '100%', padding: '10px 12px',
                      border: 'none', borderBottom: '1px solid var(--pf-t--global--border--color--default)',
                      background: 'transparent', cursor: 'pointer',
                      fontFamily: 'inherit', textAlign: 'left',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--pf-t--global--background--color--action--plain--hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{ display: 'inline-flex', marginTop: 2, flexShrink: 0, color: 'var(--pf-t--global--text--color--subtle)' }}>
                      {repo.source === 'github' ? <GithubIcon style={{ fontSize: 16 }} /> : <GitlabIcon style={{ fontSize: 16 }} />}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                          fontSize: 13, fontWeight: 500,
                          color: 'var(--pf-t--global--text--color--regular)',
                        }}>
                          {repo.name}
                        </span>
                        <span style={{
                          fontSize: 11,
                          color: 'var(--pf-t--global--text--color--subtle)',
                          fontFamily: '"SF Mono", ui-monospace, monospace',
                        }}>
                          {repo.fullName}
                        </span>
                      </div>
                      <div style={{
                        fontSize: 12, marginTop: 2,
                        color: 'var(--pf-t--global--text--color--subtle)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {repo.description}
                      </div>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--pf-t--global--text--color--subtle)', flexShrink: 0, marginTop: 2 }}>
                      {repo.updatedAt}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        ) : (
          <Form
            onSubmit={(e) => {
              e.preventDefault()
              handleSave()
            }}
          >
            <FormGroup label="Project Name" isRequired fieldId="project-name">
              <TextInput
                id="project-name"
                value={name}
                onChange={(_e, val) => setName(val)}
                placeholder="e.g. web-app"
                isRequired
              />
            </FormGroup>
            <FormGroup label="Repository URL" fieldId="project-repo">
              <TextInput
                id="project-repo"
                value={repoUrl}
                onChange={(_e, val) => setRepoUrl(val)}
                placeholder="https://github.com/org/repo"
              />
            </FormGroup>
          </Form>
        )}
      </ModalBody>
      <ModalFooter>
        {mode === 'select' ? (
          <>
            <Button variant="link" onClick={() => setMode('manual')}>
              Add manually
            </Button>
            <Button variant="link" onClick={handleClose}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button variant="primary" onClick={handleSave} isDisabled={!name.trim()}>
              Add Project
            </Button>
            <Button variant="link" onClick={() => setMode('select')}>
              Back to repositories
            </Button>
            <Button variant="link" onClick={handleClose}>
              Cancel
            </Button>
          </>
        )}
      </ModalFooter>
    </Modal>
  )
}
