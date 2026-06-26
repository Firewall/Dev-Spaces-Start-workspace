import {
  Button,
  MenuToggle,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core'
import { useState } from 'react'
import type { AgentToolId } from './agentSpaceTypes'
import { AGENT_TOOLS } from './agentSpaceMockData'
import { BrandIcon } from './BrandIcons'

interface AddAgentModalProps {
  isOpen: boolean
  projectName: string
  onClose: () => void
  onSave: (tool: AgentToolId) => void
}

export function AddAgentModal({ isOpen, projectName, onClose, onSave }: AddAgentModalProps) {
  const [tool, setTool] = useState<AgentToolId>('openshift-ai')
  const [toolSelectOpen, setToolSelectOpen] = useState(false)

  const selectedToolName = AGENT_TOOLS.find((t) => t.id === tool)?.name ?? tool

  function handleSave() {
    onSave(tool)
    setTool('openshift-ai')
    onClose()
  }

  function handleClose() {
    setTool('openshift-ai')
    onClose()
  }

  return (
    <Modal variant="small" isOpen={isOpen} onClose={handleClose}>
      <ModalHeader title={`Add Agent to ${projectName}`} />
      <ModalBody>
        <p style={{ marginBottom: 12 }}>Select a tool for this agent:</p>
        <Select
          isOpen={toolSelectOpen}
          onOpenChange={setToolSelectOpen}
          onSelect={(_e, val) => {
            setTool(val as AgentToolId)
            setToolSelectOpen(false)
          }}
          selected={tool}
          toggle={(toggleRef) => (
            <MenuToggle
              ref={toggleRef}
              onClick={() => setToolSelectOpen((o) => !o)}
              isExpanded={toolSelectOpen}
              style={{ width: '100%' }}
              icon={<BrandIcon id={tool} size={18} />}
            >
              {selectedToolName}
            </MenuToggle>
          )}
        >
          <SelectList>
            {AGENT_TOOLS.map((t) => (
              <SelectOption
                key={t.id}
                value={t.id}
                description={t.description}
                icon={<BrandIcon id={t.id} size={20} />}
              >
                {t.name}
              </SelectOption>
            ))}
          </SelectList>
        </Select>
      </ModalBody>
      <ModalFooter>
        <Button variant="primary" onClick={handleSave}>
          Add Agent
        </Button>
        <Button variant="link" onClick={handleClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  )
}
