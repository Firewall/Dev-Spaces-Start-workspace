import { useState } from 'react'
import {
  Button,
  FormGroup,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  TextArea,
  TextInput,
} from '@patternfly/react-core'

interface CustomEditorModalProps {
  onClose: () => void
  onSave: (config: { name: string; definition: string; image: string }) => void
}

export function CustomEditorModal({ onClose, onSave }: CustomEditorModalProps) {
  const [name, setName] = useState('')
  const [definition, setDefinition] = useState('')
  const [image, setImage] = useState('')

  return (
    <Modal
      isOpen
      onClose={onClose}
      variant="medium"
      aria-label="Custom Editor Configuration"
    >
      <ModalHeader title="Custom Editor Configuration" />
      <ModalBody>
        <FormGroup label="Editor Name" fieldId="editor-name">
          <TextInput
            id="editor-name"
            value={name}
            onChange={(_e, val) => setName(val)}
            placeholder="My Custom IDE"
          />
        </FormGroup>

        <FormGroup label="Editor Definition" fieldId="editor-definition">
          <TextArea
            id="editor-definition"
            value={definition}
            onChange={(_e, val) => setDefinition(val)}
            placeholder="YAML or JSON editor component definition"
            rows={4}
            resizeOrientation="vertical"
          />
        </FormGroup>

        <FormGroup label="Container Image" fieldId="editor-image">
          <TextInput
            id="editor-image"
            value={image}
            onChange={(_e, val) => setImage(val)}
            placeholder="registry.example.com/editor:latest"
          />
        </FormGroup>
      </ModalBody>
      <ModalFooter>
        <Button variant="primary" onClick={() => onSave({ name, definition, image })}>
          Save Configuration
        </Button>
        <Button variant="link" onClick={onClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  )
}
