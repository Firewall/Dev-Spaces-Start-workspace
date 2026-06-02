import { useState, useCallback } from 'react'
import {
  Alert,
  Button,
  Form,
  FormGroup,
  Popover,
  Switch,
  TextInput,
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

export function CreateWorkspace() {
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
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <header
        style={{
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface)',
        }}
      >
        <div
          style={{
            padding: '16px 32px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>Workspaces</span>
          <button
            type="button"
            className="header-grid-launcher"
            aria-label="Open app grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 9px)',
              gridTemplateRows: 'repeat(3, 9px)',
              gap: 2,
              marginLeft: 'auto',
              padding: 4,
              border: 'none',
              background: 'transparent',
              borderRadius: 6,
            }}
          >
            {Array.from({ length: 9 }, (_, i) => (
              <span
                key={i}
                style={{
                  borderRadius: 2.5,
                  background: '#ced4da',
                  border: '1px solid #ced4da',
                  boxSizing: 'border-box',
                }}
              />
            ))}
          </button>
        </div>
      </header>

      {/* Main */}
      <main style={{ maxWidth: 720, padding: '32px 32px 64px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Create Workspace</h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 32 }}>
          Configure and launch a new cloud development environment.
        </p>

        <Form onSubmit={handleSubmit}>
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
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 240 }}>
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
                </div>
                <div>
                  <BranchDropdown
                    value={branch}
                    onChange={setBranch}
                    disabled={repoUrl.trim() === ''}
                  />
                </div>
              </div>
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
      </main>
    </div>
  )
}
