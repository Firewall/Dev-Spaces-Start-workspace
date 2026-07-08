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

interface AddProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (name: string, repoUrl: string) => void
}

export function AddProjectModal({ isOpen, onClose, onSave }: AddProjectModalProps) {
  const [name, setName] = useState('')
  const [repoUrl, setRepoUrl] = useState('')

  function handleSave() {
    if (!name.trim()) return
    onSave(name.trim(), repoUrl.trim())
    setName('')
    setRepoUrl('')
    onClose()
  }

  function handleClose() {
    setName('')
    setRepoUrl('')
    onClose()
  }

  return (
    <Modal variant="small" isOpen={isOpen} onClose={handleClose}>
      <ModalHeader title="Add Project" />
      <ModalBody>
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
      </ModalBody>
      <ModalFooter>
        <Button variant="primary" onClick={handleSave} isDisabled={!name.trim()}>
          Add Project
        </Button>
        <Button variant="link" onClick={handleClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  )
}
