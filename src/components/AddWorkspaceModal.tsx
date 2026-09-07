import { useState } from 'react'
import {
  Alert,
  Button,
  Form,
  FormGroup,
  MenuToggle,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Select,
  SelectList,
  SelectOption,
  TextInput,
} from '@patternfly/react-core'
import type { AgentToolId } from './agentSpaceTypes'
import { AGENT_TOOLS } from './agentSpaceMockData'
import { BrandIcon } from './BrandIcons'

interface AddWorkspaceModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (name: string, repoUrl: string, defaultBranch: string, firstAgentTool?: AgentToolId) => string | undefined
}

export function AddWorkspaceModal({ isOpen, onClose, onSave }: AddWorkspaceModalProps) {
  const [name, setName] = useState('')
  const [repoUrl, setRepoUrl] = useState('')
  const [defaultBranch, setDefaultBranch] = useState('main')
  const [startAgent, setStartAgent] = useState(true)
  const [firstAgentTool, setFirstAgentTool] = useState<AgentToolId>('opencode')
  const [agentSelectOpen, setAgentSelectOpen] = useState(false)
  const [validationError, setValidationError] = useState('')

  function handleSave() {
    if (!name.trim()) return
    const error = onSave(name.trim(), repoUrl.trim(), defaultBranch.trim() || 'main', startAgent ? firstAgentTool : undefined)
    if (error) {
      setValidationError(error)
      return
    }
    reset()
    onClose()
  }

  function reset() {
    setName('')
    setRepoUrl('')
    setDefaultBranch('main')
    setStartAgent(true)
    setFirstAgentTool('opencode')
    setAgentSelectOpen(false)
    setValidationError('')
  }

  function handleClose() {
    reset()
    onClose()
  }

  return (
    <Modal variant="medium" isOpen={isOpen} onClose={handleClose}>
      <ModalHeader title="Add Workspace" />
      <ModalBody>
        <Form
          onSubmit={(e) => {
            e.preventDefault()
            handleSave()
          }}
        >
          <FormGroup label="Workspace Name" isRequired fieldId="workspace-name">
            <TextInput
              id="workspace-name"
              value={name}
              onChange={(_e, val) => setName(val)}
              placeholder="e.g. web-app-workspace"
              isRequired
            />
          </FormGroup>
          <FormGroup label="Repository URL (optional)" fieldId="workspace-repo">
            <TextInput
              id="workspace-repo"
              value={repoUrl}
              onChange={(_e, val) => setRepoUrl(val)}
              placeholder="https://github.com/org/repo"
            />
          </FormGroup>
          <FormGroup label="Default branch" fieldId="workspace-branch">
            <TextInput
              id="workspace-branch"
              value={defaultBranch}
              onChange={(_e, val) => setDefaultBranch(val)}
              placeholder="main"
            />
          </FormGroup>
          <FormGroup label="First agent" fieldId="first-agent">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
              <input
                id="start-first-agent"
                type="checkbox"
                checked={startAgent}
                onChange={e => setStartAgent(e.target.checked)}
              />
              Start an agent immediately
            </label>
            {startAgent && (
              <Select
                isOpen={agentSelectOpen}
                onOpenChange={setAgentSelectOpen}
                onSelect={(_e, value) => {
                  setFirstAgentTool(value as AgentToolId)
                  setAgentSelectOpen(false)
                }}
                selected={firstAgentTool}
                toggle={(toggleRef) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={() => setAgentSelectOpen(open => !open)}
                    isExpanded={agentSelectOpen}
                    icon={<BrandIcon id={firstAgentTool} size={18} />}
                    style={{ width: '100%', marginTop: 8 }}
                  >
                    {AGENT_TOOLS.find(tool => tool.id === firstAgentTool)?.name ?? firstAgentTool}
                  </MenuToggle>
                )}
              >
                <SelectList>
                  {AGENT_TOOLS.map(tool => (
                    <SelectOption key={tool.id} value={tool.id} description={tool.description} icon={<BrandIcon id={tool.id} size={20} />}>
                      {tool.name}
                    </SelectOption>
                  ))}
                </SelectList>
              </Select>
            )}
          </FormGroup>
          {validationError && <Alert variant="danger" isInline isPlain title={validationError} />}
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button variant="primary" onClick={handleSave} isDisabled={!name.trim()}>Add Workspace</Button>
        <Button variant="link" onClick={handleClose}>Cancel</Button>
      </ModalFooter>
    </Modal>
  )
}
