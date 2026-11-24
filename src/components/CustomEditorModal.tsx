import { useState } from 'react'
import {
  Button,
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  TextInput,
} from '@patternfly/react-core'
import { InfoIcon } from '@patternfly/react-icons'

const CUSTOM_EDITOR_DOCS_URL =
  'https://eclipse.dev/che/docs/stable/develop/url-parameter-for-the-ide/'

interface CustomEditorModalProps {
  onClose: () => void
  onSave: (config: { definition: string; image: string }) => void
}

export function CustomEditorModal({ onClose, onSave }: CustomEditorModalProps) {
  const [definition, setDefinition] = useState('')
  const [image, setImage] = useState('')

  return (
    <Modal
      isOpen
      onClose={onClose}
      variant="medium"
      aria-labelledby="custom-editor-modal-title"
      aria-describedby="custom-editor-modal-description"
    >
      <ModalHeader
        title="Custom Editor Configuration"
        labelId="custom-editor-modal-title"
        descriptorId="custom-editor-modal-description"
        description={
          <>
            Run an editor that isn't in the list. Provide its definition, and optionally a
            container image to replace the default one.{' '}
            <a href={CUSTOM_EDITOR_DOCS_URL} target="_blank" rel="noopener noreferrer">
              Learn more about custom editors
            </a>
          </>
        }
      />
      <ModalBody>
        <Form onSubmit={(e) => e.preventDefault()}>
          <FormGroup label="Editor Definition" fieldId="editor-definition">
            <TextInput
              id="editor-definition"
              value={definition}
              onChange={(_e, val) => setDefinition(val)}
              placeholder="Enter the link to a container editor definition URL or an editor id"
            />
            <FormHelperText>
              <HelperText>
                <HelperTextItem icon={<InfoIcon />}>
                  Default editor will be used if no definition is provided.
                </HelperTextItem>
              </HelperText>
            </FormHelperText>
          </FormGroup>

          <FormGroup label="Editor Image" fieldId="editor-image">
            <TextInput
              id="editor-image"
              value={image}
              onChange={(_e, val) => setImage(val)}
              placeholder="Enter an editor container image"
            />
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button variant="primary" onClick={() => onSave({ definition, image })}>
          Save Configuration
        </Button>
        <Button variant="link" onClick={onClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  )
}
