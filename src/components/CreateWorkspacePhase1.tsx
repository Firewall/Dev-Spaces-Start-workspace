import { useState, useCallback, useRef } from 'react'
import {
  Alert,
  Button,
  Card,
  CardBody,
  Content,
  Flex,
  FlexItem,
  Form,
  FormGroup,
  Gallery,
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
  CubeIcon,
  HelpIcon,
} from '@patternfly/react-icons'
import { DependencyBrandIcon } from './DependencyBrandIcon'
import { getDependencyBrandIcon } from './dependencySimpleIcons'
import { BranchDropdown } from './BranchDropdown'
import { EditorDropdown } from './EditorDropdown'

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

interface CreateWorkspacePhase1Props {
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

export function CreateWorkspacePhase1({ phase, onPhaseChange }: CreateWorkspacePhase1Props) {
  const [name, setName] = useState('')
  const [repoUrl, setRepoUrl] = useState('')
  const [branch, setBranch] = useState('main')
  const [editor, setEditor] = useState('vscode-oss')
  const [tempStorage, setTempStorage] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const nameManuallyEdited = useRef(false)

  const isDuplicate =
    repoUrl.trim() !== '' &&
    EXISTING_WORKSPACES.some(
      (ws) => ws.toLowerCase() === repoUrl.trim().toLowerCase(),
    )

  const hasRepoInput = repoUrl.trim() !== ''
  const canSubmit = hasRepoInput || selectedTemplate !== null

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
    setRepoUrl('')
  }, [])

  const handleRepoChange = useCallback((_e: unknown, val: string) => {
    setRepoUrl(val)
    if (val.trim() !== '') {
      setSelectedTemplate(null)
      if (!nameManuallyEdited.current) {
        setName(nameFromRepoUrl(val))
      }
    } else if (!nameManuallyEdited.current) {
      setName('')
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
            label="Git Repository"
            fieldId="repo-url"
            labelHelp={
              <FieldHelp text="Enter the HTTPS or SSH URL of your Git repository. The workspace will clone this repo on start." />
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
          </FormGroup>

          <FormGroup
            label="Select an Editor"
            labelHelp={
              <FieldHelp text="Choose the IDE that will be launched in your workspace." />
            }
          >
            <EditorDropdown value={editor} onChange={setEditor} />
          </FormGroup>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              margin: '8px 0',
            }}
          >
            <div
              style={{
                flex: 1,
                height: 1,
                backgroundColor: 'var(--pf-t--global--border--color--default)',
              }}
            />
            <span
              style={{
                fontSize: 'var(--pf-t--global--font--size--sm)',
                color: 'var(--pf-t--global--text--color--subtle)',
                fontWeight: 500,
              }}
            >
              or start from a template
            </span>
            <div
              style={{
                flex: 1,
                height: 1,
                backgroundColor: 'var(--pf-t--global--border--color--default)',
              }}
            />
          </div>

          <Gallery hasGutter minWidths={{ default: '180px' }}>
            {TEMPLATES.map((tpl) => {
              const icon = getDependencyBrandIcon(tpl.icon)
              const isSelected = selectedTemplate === tpl.id
              return (
                <Card
                  key={tpl.id}
                  isSelectable
                  isSelected={isSelected}
                  onClick={() => handleTemplateClick(tpl.id)}
                  style={{ cursor: 'pointer', position: 'relative' }}
                >
                  {isSelected && (
                    <CheckCircleIcon
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        color: 'var(--pf-t--global--color--status--success--default)',
                        fontSize: 18,
                      }}
                    />
                  )}
                  <CardBody>
                    <Flex
                      direction={{ default: 'column' }}
                      alignItems={{ default: 'alignItemsCenter' }}
                      gap={{ default: 'gapSm' }}
                    >
                      <FlexItem>
                        {icon ? (
                          <DependencyBrandIcon icon={icon} size={32} />
                        ) : (
                          <CubeIcon
                            style={{ width: 32, height: 32, opacity: 0.5 }}
                          />
                        )}
                      </FlexItem>
                      <FlexItem>
                        <strong>{tpl.name}</strong>
                      </FlexItem>
                      <FlexItem>
                        <span
                          style={{
                            fontSize:
                              'var(--pf-t--global--font--size--sm)',
                            color:
                              'var(--pf-t--global--text--color--subtle)',
                            textAlign: 'center',
                            display: 'block',
                          }}
                        >
                          {tpl.description}
                        </span>
                      </FlexItem>
                    </Flex>
                  </CardBody>
                </Card>
              )
            })}
          </Gallery>

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
