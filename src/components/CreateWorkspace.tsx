import { useState, useCallback, useRef } from 'react'
import {
  Alert,
  Button,
  Content,
  Flex,
  FlexItem,
  Form,
  FormGroup,
  HelperText,
  HelperTextItem,
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
import {
  ArrowRightIcon,
  CheckCircleIcon,
  CodeBranchIcon,
  CubeIcon,
  HelpIcon,
} from '@patternfly/react-icons'
import { DependencyBrandIcon } from './DependencyBrandIcon'
import { getDependencyBrandIcon } from './dependencySimpleIcons'
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

type CreationMode = 'repo' | 'template'

interface Template {
  id: string
  name: string
  description: string
  icon: string
  repoUrl: string
}

const TEMPLATES: Template[] = [
  {
    id: 'empty-project',
    name: 'Empty Project',
    description: 'Blank workspace with the Universal Developer Image',
    icon: '',
    repoUrl: '',
  },
  {
    id: 'python-flask',
    name: 'Python Flask',
    description: 'REST API with Flask and SQLAlchemy',
    icon: 'python',
    repoUrl: 'https://github.com/devspaces/python-flask-starter',
  },
  {
    id: 'nodejs-express',
    name: 'Node.js Express',
    description: 'Web server with Express and TypeScript',
    icon: 'nodejs',
    repoUrl: 'https://github.com/devspaces/nodejs-express-starter',
  },
  {
    id: 'java-quarkus',
    name: 'Java Quarkus',
    description: 'Cloud-native Java with Quarkus',
    icon: 'java',
    repoUrl: 'https://github.com/devspaces/java-quarkus-starter',
  },
  {
    id: 'go-gin',
    name: 'Go Gin',
    description: 'HTTP web framework with Gin',
    icon: 'go',
    repoUrl: 'https://github.com/devspaces/go-gin-starter',
  },
  {
    id: 'rust-actix',
    name: 'Rust Actix',
    description: 'Web framework with Actix Web',
    icon: 'rust',
    repoUrl: 'https://github.com/devspaces/rust-actix-starter',
  },
  {
    id: 'dotnet-webapi',
    name: '.NET Web API',
    description: 'ASP.NET Core Web API',
    icon: 'dotnet',
    repoUrl: 'https://github.com/devspaces/dotnet-webapi-starter',
  },
  {
    id: 'php-laravel',
    name: 'PHP Laravel',
    description: 'Full-stack framework with Laravel',
    icon: 'php',
    repoUrl: 'https://github.com/devspaces/php-laravel-starter',
  },
  {
    id: 'ruby-rails',
    name: 'Ruby on Rails',
    description: 'Full-stack web framework',
    icon: 'ruby',
    repoUrl: 'https://github.com/devspaces/ruby-rails-starter',
  },
]

const EXISTING_WORKSPACES = [
  'https://github.com/acme/web-app',
  'https://github.com/acme/api-service',
  'https://github.com/acme/infra',
]

interface CreateWorkspaceProps {
  phase: string
  onPhaseChange: (phase: 'phase1' | 'phase2') => void
}

function nameFromRepoUrl(url: string): string {
  try {
    const path = url.replace(/\.git$/, '').split('/').pop() || ''
    return path || ''
  } catch {
    return ''
  }
}

function nameFromTemplate(templateId: string): string {
  const tpl = TEMPLATES.find((t) => t.id === templateId)
  if (!tpl) return ''
  return tpl.id
}

export function CreateWorkspace({ phase, onPhaseChange }: CreateWorkspaceProps) {
  const [mode, setMode] = useState<CreationMode>('repo')
  const [name, setName] = useState('')
  const [repoUrl, setRepoUrl] = useState('')
  const [branch, setBranch] = useState('main')
  const [editor, setEditor] = useState('vscode-oss')
  const [environmentComponents, setEnvironmentComponents] = useState<string[]>([])
  const [aiTools, setAiTools] = useState<string[]>([])
  const [tempStorage, setTempStorage] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [envSettings, setEnvSettings] = useState({
    containerImage: '',
    memoryLimit: '',
    cpuLimit: '',
    devfilePath: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const nameManuallyEdited = useRef(false)

  const isDuplicate =
    repoUrl.trim() !== '' &&
    EXISTING_WORKSPACES.some(
      (ws) => ws.toLowerCase() === repoUrl.trim().toLowerCase(),
    )

  const hasRepoInput = repoUrl.trim() !== ''
  const canSubmit =
    mode === 'repo' ? hasRepoInput : selectedTemplate !== null

  const handleModeChange = useCallback((newMode: CreationMode) => {
    setMode(newMode)
    if (newMode === 'repo') {
      setSelectedTemplate(null)
      if (!nameManuallyEdited.current) {
        setName(repoUrl.trim() ? nameFromRepoUrl(repoUrl) : '')
      }
    } else {
      setRepoUrl('')
      setBranch('main')
      if (!nameManuallyEdited.current) {
        setName(selectedTemplate ? nameFromTemplate(selectedTemplate) : '')
      }
    }
  }, [repoUrl, selectedTemplate])

  const handleNameChange = useCallback((_e: unknown, val: string) => {
    setName(val)
    nameManuallyEdited.current = val !== ''
  }, [])

  const handleTemplateClick = useCallback((templateId: string) => {
    setSelectedTemplate((prev) => {
      const next = prev === templateId ? null : templateId
      if (!nameManuallyEdited.current) {
        setName(next ? nameFromTemplate(next) : '')
      }
      return next
    })
  }, [])

  const handleRepoChange = useCallback((_e: unknown, val: string) => {
    setRepoUrl(val)
    if (!nameManuallyEdited.current) {
      setName(val.trim() ? nameFromRepoUrl(val) : '')
    }
  }, [])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!canSubmit) return
      setSubmitting(true)
      setTimeout(() => setSubmitting(false), 2000)
    },
    [canSubmit],
  )

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

      <PageSection style={{ maxWidth: 860 }}>
        <Content>
          <Title headingLevel="h1">Create Workspace</Title>
          <p>
            Import a Git repository or start from a template to launch a cloud
            development environment.
          </p>
        </Content>

        <Form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
          <ToggleGroup aria-label="Creation mode">
            <ToggleGroupItem
              icon={<CodeBranchIcon />}
              text="Import from Git"
              buttonId="mode-repo"
              isSelected={mode === 'repo'}
              onChange={() => handleModeChange('repo')}
            />
            <ToggleGroupItem
              icon={<CubeIcon />}
              text="Start from Template"
              buttonId="mode-template"
              isSelected={mode === 'template'}
              onChange={() => handleModeChange('template')}
            />
          </ToggleGroup>

          {mode === 'repo' && (
            <FormGroup
              label="Git Repository"
              isRequired
              fieldId="repo-url"
              labelHelp={
                <FieldHelp text="Enter the HTTPS or SSH URL of your Git repository. The workspace will be configured from the devfile in this repository." />
              }
            >
              <Split hasGutter>
                <SplitItem isFilled>
                  <TextInput
                    id="repo-url"
                    value={repoUrl}
                    onChange={handleRepoChange}
                    placeholder="https://github.com/org/repo"
                    aria-label="Git Repository URL"
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
                    disabled={!hasRepoInput}
                  />
                </SplitItem>
              </Split>
              <HelperText>
                <HelperTextItem>
                  The workspace will be configured using the devfile found in
                  this repository.
                </HelperTextItem>
              </HelperText>
            </FormGroup>
          )}

          {mode === 'template' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: 10,
                marginTop: 4,
              }}
            >
              {TEMPLATES.map((tpl) => {
                const icon = getDependencyBrandIcon(tpl.icon)
                const isSelected = selectedTemplate === tpl.id
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleTemplateClick(tpl.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: '14px 12px',
                      border: isSelected
                        ? '3px solid var(--pf-t--global--color--brand--default)'
                        : '1px solid var(--pf-t--global--border--color--default)',
                      borderRadius: 8,
                      background: 'var(--pf-t--global--background--color--primary--default)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s ease',
                      outline: 'none',
                      position: 'relative',
                      height: 130,
                    }}
                  >
                    <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                      {icon ? (
                        <DependencyBrandIcon icon={icon} size={24} />
                      ) : (
                        <CubeIcon
                          style={{
                            width: 24,
                            height: 24,
                            opacity: 0.5,
                          }}
                        />
                      )}
                    </span>
                    <span
                      style={{
                        fontSize: 'var(--pf-t--global--font--size--sm)',
                        fontWeight: 600,
                        color: 'var(--pf-t--global--text--color--regular)',
                        lineHeight: 1.3,
                      }}
                    >
                      {tpl.name}
                    </span>
                    <span
                      style={{
                        fontSize: 'var(--pf-t--global--font--size--xs)',
                        color: 'var(--pf-t--global--text--color--subtle)',
                        lineHeight: 1.3,
                      }}
                    >
                      {tpl.description}
                    </span>
                    {isSelected && (
                      <CheckCircleIcon
                        style={{
                          position: 'absolute',
                          top: -7,
                          right: -7,
                          color: 'var(--pf-t--global--color--brand--default)',
                          fontSize: 18,
                          background: 'var(--pf-t--global--background--color--primary--default)',
                          borderRadius: '50%',
                        }}
                      />
                    )}
                  </button>
                )
              })}
            </div>
          )}

          <FormGroup
            label="Workspace Name"
            fieldId="workspace-name"
            labelHelp={
              <FieldHelp text="A human-readable name for your workspace. Auto-generated from the repo or template if left blank." />
            }
          >
            <TextInput
              id="workspace-name"
              value={name}
              onChange={handleNameChange}
              placeholder="my-project"
            />
          </FormGroup>

          <FormGroup
            label="Select an Editor"
            labelHelp={
              <FieldHelp text="Choose the IDE that will be launched in your workspace. The default editor is Visual Studio Code - Open Source (Web). Select 'Custom Editor' for advanced configuration." />
            }
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
            labelHelp={
              <FieldHelp text="Enable ephemeral storage for temporary files. Data in temp storage does not persist across workspace restarts." />
            }
          >
            <Switch
              id="temp-storage"
              isChecked={tempStorage}
              onChange={(_e, checked) => setTempStorage(checked)}
              aria-label="Temp storage"
            />
          </FormGroup>

          <EnvironmentSettings value={envSettings} onChange={setEnvSettings} />

          <div style={{ marginTop: 24 }}>
            <Button
              type="submit"
              variant="primary"
              isLoading={submitting}
              isDisabled={submitting || !canSubmit}
              spinnerAriaValueText="Creating"
              icon={<ArrowRightIcon />}
              iconPosition="end"
            >
              {submitting ? 'Creating Workspace…' : 'Create Workspace'}
            </Button>
          </div>
        </Form>
      </PageSection>
    </>
  )
}
