import { useState, useCallback } from 'react'
import {
  Alert,
  Button,
  Content,
  Flex,
  FlexItem,
  Form,
  FormGroup,
  PageSection,
  Popover,
  Split,
  SplitItem,
  Switch,
  TextInput,
  Title,
  ToggleGroup,
  ToggleGroupItem,
} from '@patternfly/react-core'
import { HelpIcon } from '@patternfly/react-icons'
import { BranchDropdown } from './BranchDropdown'
import { EditorDropdown } from './EditorDropdown'
import { EnvironmentComponentsSection } from './EnvironmentComponentsSection'
import { AIToolsSection } from './AIToolsSection'
import { EnvironmentSettings } from './EnvironmentSettings'

function FieldHelp({ text }: { text: string }) {
  return (
    <Popover bodyContent={text}>
      <button
        type="button"
        aria-label="More info"
        onClick={(e) => e.preventDefault()}
        className="pf-v6-c-form__group-label-help"
      >
        <HelpIcon />
      </button>
    </Popover>
  )
}

const EXISTING_WORKSPACES = [
  'https://github.com/acme/web-app',
  'https://github.com/acme/api-service',
  'https://github.com/acme/infra',
]

interface CreateWorkspaceProps {
  phase: string
  onPhaseChange: (phase: 'phase1' | 'phase2') => void
}

export function CreateWorkspace({ phase, onPhaseChange }: CreateWorkspaceProps) {
  const [name, setName] = useState('')
  const [repoUrl, setRepoUrl] = useState('')
  const [branch, setBranch] = useState('main')
  const [editor, setEditor] = useState('vscode-oss')
  const [environmentComponents, setEnvironmentComponents] = useState<string[]>([])
  const [aiTools, setAiTools] = useState<string[]>([])
  const [tempStorage, setTempStorage] = useState(false)
  const [envSettings, setEnvSettings] = useState({
    containerImage: '',
    memoryLimit: '',
    cpuLimit: '',
    devfilePath: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const isDuplicate = repoUrl.trim() !== '' && EXISTING_WORKSPACES.some(
    (ws) => ws.toLowerCase() === repoUrl.trim().toLowerCase(),
  )

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setTimeout(() => setSubmitting(false), 2000)
  }, [])

  return (
    <>
      <PageSection variant="default">
        <Flex>
          <FlexItem>
            <Title headingLevel="h2">Workspaces</Title>
          </FlexItem>
          <FlexItem align={{ default: 'alignRight' }}>
            <ToggleGroup aria-label="Prototype phase">
              <ToggleGroupItem
                text="Phase 1"
                buttonId="phase1"
                isSelected={phase === 'phase1'}
                onChange={() => onPhaseChange('phase1')}
              />
              <ToggleGroupItem
                text="Phase 2"
                buttonId="phase2"
                isSelected={phase === 'phase2'}
                onChange={() => onPhaseChange('phase2')}
              />
            </ToggleGroup>
          </FlexItem>
        </Flex>
      </PageSection>

      <PageSection style={{ maxWidth: 720 }}>
        <Content>
          <Title headingLevel="h1">Create Workspace</Title>
          <p>Configure and launch a new cloud development environment.</p>
        </Content>

        <Form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
          <FormGroup
            label="Workspace Name"
            fieldId="workspace-name"
            labelHelp={<FieldHelp text="A human-readable name for your workspace. This will be used to identify it in the dashboard and CLI." />}
          >
            <TextInput
              id="workspace-name"
              value={name}
              onChange={(_e, val) => setName(val)}
              placeholder="my-project"
            />
          </FormGroup>

          <FormGroup
            label="Git Repository URL"
            fieldId="repo-url"
            labelHelp={<FieldHelp text="Enter the HTTPS or SSH URL of your Git repository. Leave blank to provision an empty workspace using the default Universal Developer Image." />}
          >
            <Split hasGutter>
              <SplitItem isFilled>
                <TextInput
                  id="repo-url"
                  value={repoUrl}
                  onChange={(_e, val) => setRepoUrl(val)}
                  placeholder="https://github.com/org/repo"
                />
                {isDuplicate && (
                  <Alert
                    variant="warning"
                    isInline
                    isPlain
                    title="A workspace using this repository already exists. You can still create a new one."
                    style={{ marginTop: 8 }}
                  />
                )}
              </SplitItem>
              <SplitItem>
                <BranchDropdown
                  value={branch}
                  onChange={setBranch}
                  disabled={repoUrl.trim() === ''}
                />
              </SplitItem>
            </Split>
          </FormGroup>

          <FormGroup
            label="Select an Editor"
            labelHelp={<FieldHelp text="Choose the IDE that will be launched in your workspace. The default editor is Visual Studio Code - Open Source (Web). Select 'Custom Editor' for advanced configuration." />}
          >
            <EditorDropdown value={editor} onChange={setEditor} />
          </FormGroup>

          <FormGroup
            label="Select Environment Components"
            labelHelp={<FieldHelp text="Choose language runtimes and stacks to layer into your workspace image. You can pick multiple components." />}
          >
            <EnvironmentComponentsSection
              selected={environmentComponents}
              onChange={setEnvironmentComponents}
            />
          </FormGroup>

          <FormGroup
            label="Add AI Tools"
            labelHelp={<FieldHelp text="Select AI-powered coding assistants to install in your workspace. Tools marked with a checkmark are already authenticated with your account." />}
          >
            <AIToolsSection selected={aiTools} onChange={setAiTools} />
          </FormGroup>

          <FormGroup
            label="Temp Storage"
            labelHelp={<FieldHelp text="Enable ephemeral storage for temporary files. Data in temp storage does not persist across workspace restarts." />}
          >
            <Switch
              id="temp-storage"
              isChecked={tempStorage}
              onChange={(_e, checked) => setTempStorage(checked)}
              aria-label="Temp storage"
            />
          </FormGroup>

          <EnvironmentSettings value={envSettings} onChange={setEnvSettings} />

          <Button
            type="submit"
            variant="primary"
            isLoading={submitting}
            isDisabled={submitting}
            spinnerAriaValueText="Creating"
          >
            {submitting ? 'Creating Workspace…' : 'Create Workspace'}
          </Button>
        </Form>
      </PageSection>
    </>
  )
}
