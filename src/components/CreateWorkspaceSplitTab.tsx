import { useState, useCallback, useMemo, useRef } from 'react'
import {
  Alert,
  Button,
  Card,
  CardBody,
  ExpandableSection,
  Flex,
  FlexItem,
  Form,
  FormGroup,
  Gallery,
  FormHelperText,
  HelperText,
  HelperTextItem,
  MenuSearch,
  MenuSearchInput,
  MenuToggle,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  NumberInput,
  PageSection,
  Popover,
  Select,
  SelectList,
  SelectOption,
  Split,
  SplitItem,
  Switch,
  Tab,
  Tabs,
  TabTitleText,
  TextInput,
  Title,
  ToggleGroup,
  ToggleGroupItem,
} from '@patternfly/react-core'
import {
  CheckIcon,
  CubeIcon,
  DesktopIcon,
  FilterIcon,
  HelpIcon,
  MinusIcon,
  PlusCircleIcon,
} from '@patternfly/react-icons'
import { DependencyBrandIcon } from './DependencyBrandIcon'
import { getDependencyBrandIcon } from './dependencySimpleIcons'
import { BranchDropdown } from './BranchDropdown'
import { BrandIcon } from './BrandIcons'
import { hasBrandIcon } from './brandIconData'
import { EditorDropdown, EDITORS } from './EditorDropdown'
import { EnvironmentComponentsSection } from './EnvironmentComponentsSection'
import { AIToolsSection } from './AIToolsSection'
import { WorkspaceProvisioning } from './WorkspaceProvisioning'
import { VSCodeMockup } from './VSCodeMockup'
import { nameFromRepoUrl } from './workspaceTypes'
import type { WorkspaceInfo } from './workspaceTypes'

function FieldHelp({ text }: { text: string }) {
  return (
    <Popover bodyContent={text}>
      <button
        type="button"
        aria-label="More info"
        onClick={(e) => e.preventDefault()}
        className="pf-v6-c-form__group-label-help"
        style={{ background: 'none', border: 'none' }}
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
  tags: string[]
}

interface GitRemote {
  name: string
  url: string
}

const TEMPLATES: Template[] = [
  { id: 'empty-project', name: 'Empty Project', description: 'Blank workspace with the Universal Developer Image', icon: '', repoUrl: '', tags: ['Starter'] },
  { id: 'python-flask', name: 'Python Flask', description: 'REST API with Flask and SQLAlchemy', icon: 'python', repoUrl: 'https://github.com/devspaces/python-flask-starter', tags: ['Python', 'Web API', 'Backend'] },
  { id: 'python-django', name: 'Python Django', description: 'Full-stack web framework with Django and PostgreSQL', icon: 'python', repoUrl: 'https://github.com/devspaces/python-django-starter', tags: ['Python', 'Full-stack', 'Backend'] },
  { id: 'python-fastapi', name: 'Python FastAPI', description: 'Async REST API with FastAPI and Pydantic', icon: 'python', repoUrl: 'https://github.com/devspaces/python-fastapi-starter', tags: ['Python', 'Web API', 'Backend'] },
  { id: 'python-ml', name: 'Python ML Notebook', description: 'Jupyter notebook with scikit-learn, pandas, and matplotlib', icon: 'python', repoUrl: 'https://github.com/devspaces/python-ml-starter', tags: ['Python', 'AI/ML', 'Data Science'] },
  { id: 'python-langchain', name: 'Python LangChain', description: 'LLM application with LangChain and vector stores', icon: 'python', repoUrl: 'https://github.com/devspaces/python-langchain-starter', tags: ['Python', 'AI/ML'] },
  { id: 'nodejs-express', name: 'Node.js Express', description: 'Web server with Express and TypeScript', icon: 'nodejs', repoUrl: 'https://github.com/devspaces/nodejs-express-starter', tags: ['Node.js', 'Web API', 'Backend', 'TypeScript'] },
  { id: 'nodejs-nestjs', name: 'Node.js NestJS', description: 'Enterprise-grade Node.js framework with NestJS', icon: 'nodejs', repoUrl: 'https://github.com/devspaces/nodejs-nestjs-starter', tags: ['Node.js', 'Web API', 'Backend', 'TypeScript', 'Enterprise'] },
  { id: 'nodejs-nextjs', name: 'Next.js', description: 'Full-stack React framework with server-side rendering', icon: 'nodejs', repoUrl: 'https://github.com/devspaces/nextjs-starter', tags: ['Node.js', 'Full-stack', 'Frontend', 'TypeScript', 'React'] },
  { id: 'nodejs-remix', name: 'Remix', description: 'Full-stack web framework built on web standards', icon: 'nodejs', repoUrl: 'https://github.com/devspaces/remix-starter', tags: ['Node.js', 'Full-stack', 'Frontend', 'TypeScript', 'React'] },
  { id: 'react-vite', name: 'React + Vite', description: 'Single-page app with React, TypeScript, and Vite', icon: 'nodejs', repoUrl: 'https://github.com/devspaces/react-vite-starter', tags: ['Node.js', 'Frontend', 'TypeScript', 'React'] },
  { id: 'angular', name: 'Angular', description: 'Enterprise SPA with Angular and TypeScript', icon: 'nodejs', repoUrl: 'https://github.com/devspaces/angular-starter', tags: ['Node.js', 'Frontend', 'TypeScript', 'Enterprise'] },
  { id: 'java-quarkus', name: 'Java Quarkus', description: 'Cloud-native Java with Quarkus', icon: 'java', repoUrl: 'https://github.com/devspaces/java-quarkus-starter', tags: ['Java', 'Web API', 'Cloud-native', 'Backend'] },
  { id: 'java-springboot', name: 'Java Spring Boot', description: 'Production-ready Spring Boot REST API', icon: 'java', repoUrl: 'https://github.com/devspaces/java-springboot-starter', tags: ['Java', 'Web API', 'Backend', 'Enterprise'] },
  { id: 'java-vertx', name: 'Java Vert.x', description: 'Reactive microservice with Eclipse Vert.x', icon: 'java', repoUrl: 'https://github.com/devspaces/java-vertx-starter', tags: ['Java', 'Microservice', 'Backend'] },
  { id: 'java-micronaut', name: 'Java Micronaut', description: 'Lightweight JVM framework with Micronaut', icon: 'java', repoUrl: 'https://github.com/devspaces/java-micronaut-starter', tags: ['Java', 'Microservice', 'Cloud-native', 'Backend'] },
  { id: 'kotlin-ktor', name: 'Kotlin Ktor', description: 'Async web framework with Kotlin and Ktor', icon: 'kotlin', repoUrl: 'https://github.com/devspaces/kotlin-ktor-starter', tags: ['Kotlin', 'Web API', 'Backend'] },
  { id: 'go-gin', name: 'Go Gin', description: 'HTTP web framework with Gin', icon: 'go', repoUrl: 'https://github.com/devspaces/go-gin-starter', tags: ['Go', 'Web API', 'Backend'] },
  { id: 'go-echo', name: 'Go Echo', description: 'High-performance Go web framework with Echo', icon: 'go', repoUrl: 'https://github.com/devspaces/go-echo-starter', tags: ['Go', 'Web API', 'Backend'] },
  { id: 'go-cli', name: 'Go CLI', description: 'Command-line tool with Cobra and Viper', icon: 'go', repoUrl: 'https://github.com/devspaces/go-cli-starter', tags: ['Go', 'CLI'] },
  { id: 'rust-actix', name: 'Rust Actix', description: 'Web framework with Actix Web', icon: 'rust', repoUrl: 'https://github.com/devspaces/rust-actix-starter', tags: ['Rust', 'Web API', 'Backend'] },
  { id: 'rust-axum', name: 'Rust Axum', description: 'Ergonomic web framework with Axum and Tokio', icon: 'rust', repoUrl: 'https://github.com/devspaces/rust-axum-starter', tags: ['Rust', 'Web API', 'Backend'] },
  { id: 'rust-cli', name: 'Rust CLI', description: 'Command-line tool with clap', icon: 'rust', repoUrl: 'https://github.com/devspaces/rust-cli-starter', tags: ['Rust', 'CLI'] },
  { id: 'dotnet-webapi', name: '.NET Web API', description: 'ASP.NET Core Web API', icon: 'dotnet', repoUrl: 'https://github.com/devspaces/dotnet-webapi-starter', tags: ['.NET', 'Web API', 'Backend', 'Enterprise'] },
  { id: 'dotnet-blazor', name: '.NET Blazor', description: 'Interactive web UI with Blazor Server', icon: 'dotnet', repoUrl: 'https://github.com/devspaces/dotnet-blazor-starter', tags: ['.NET', 'Full-stack', 'Frontend', 'Enterprise'] },
  { id: 'dotnet-maui', name: '.NET MAUI', description: 'Cross-platform native app with .NET MAUI', icon: 'dotnet', repoUrl: 'https://github.com/devspaces/dotnet-maui-starter', tags: ['.NET', 'Mobile', 'Enterprise'] },
  { id: 'php-laravel', name: 'PHP Laravel', description: 'Full-stack framework with Laravel', icon: 'php', repoUrl: 'https://github.com/devspaces/php-laravel-starter', tags: ['PHP', 'Full-stack', 'Backend'] },
  { id: 'php-symfony', name: 'PHP Symfony', description: 'Enterprise PHP framework with Symfony', icon: 'php', repoUrl: 'https://github.com/devspaces/php-symfony-starter', tags: ['PHP', 'Web API', 'Backend', 'Enterprise'] },
  { id: 'ruby-rails', name: 'Ruby on Rails', description: 'Full-stack web framework', icon: 'ruby', repoUrl: 'https://github.com/devspaces/ruby-rails-starter', tags: ['Ruby', 'Full-stack', 'Backend'] },
  { id: 'ruby-sinatra', name: 'Ruby Sinatra', description: 'Lightweight web framework with Sinatra', icon: 'ruby', repoUrl: 'https://github.com/devspaces/ruby-sinatra-starter', tags: ['Ruby', 'Web API', 'Backend'] },
  { id: 'scala-play', name: 'Scala Play', description: 'Reactive web framework with Play and Akka', icon: 'scala', repoUrl: 'https://github.com/devspaces/scala-play-starter', tags: ['Scala', 'Web API', 'Backend'] },
  { id: 'elixir-phoenix', name: 'Elixir Phoenix', description: 'Real-time web framework with Phoenix and LiveView', icon: 'elixir', repoUrl: 'https://github.com/devspaces/elixir-phoenix-starter', tags: ['Elixir', 'Full-stack', 'Backend'] },
  { id: 'cpp-cmake', name: 'C++ CMake', description: 'Modern C++ project with CMake build system', icon: 'gnu', repoUrl: 'https://github.com/devspaces/cpp-cmake-starter', tags: ['C/C++', 'CLI'] },
  { id: 'terraform-aws', name: 'Terraform AWS', description: 'Infrastructure as Code for AWS with Terraform', icon: 'terraform', repoUrl: 'https://github.com/devspaces/terraform-aws-starter', tags: ['DevOps', 'Cloud-native'] },
  { id: 'kubernetes-operator', name: 'Kubernetes Operator', description: 'Custom Kubernetes operator with Go and Operator SDK', icon: 'kubernetes', repoUrl: 'https://github.com/devspaces/k8s-operator-starter', tags: ['Go', 'DevOps', 'Cloud-native'] },
]

const ALL_TAGS: string[] = Array.from(
  new Set(TEMPLATES.flatMap((t) => t.tags)),
).sort()

const EXISTING_WORKSPACES = [
  'https://github.com/acme/web-app',
  'https://github.com/acme/api-service',
  'https://github.com/acme/infra',
]

interface CreateWorkspaceSplitTabProps {
  phase: string
  onPhaseChange: (phase: 'phase1' | 'phase2' | 'dialog') => void
}

function nameFromTemplate(templateId: string): string {
  const tpl = TEMPLATES.find((t) => t.id === templateId)
  if (!tpl) return ''
  return tpl.id
}

function TemplateIcon({ icon, size }: { icon: string; size: number }) {
  const svg = getDependencyBrandIcon(icon)
  if (svg) return <DependencyBrandIcon icon={svg} size={size} />
  return <CubeIcon style={{ fontSize: size, opacity: 0.5 }} aria-hidden />
}

export function CreateWorkspaceSplitTab({ phase, onPhaseChange }: CreateWorkspaceSplitTabProps) {
  const isPhase2 = phase === 'phase2'
  const isDialogPhase = phase === 'dialog'
  const [mode, setMode] = useState<CreationMode>('repo')
  const [name, setName] = useState('')
  const [repoUrl, setRepoUrl] = useState('')
  const [branch, setBranch] = useState('main')
  const [editor, setEditor] = useState('vscode-oss')
  const [environmentComponents, setEnvironmentComponents] = useState<string[]>([])
  const [tempStorage, setTempStorage] = useState(false)
  const nameManuallyEdited = useRef(false)
  const [createNew, setCreateNew] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [gitRemotes, setGitRemotes] = useState<GitRemote[]>([{ name: 'origin', url: '' }])
  const [aiTools, setAiTools] = useState<string[]>([])
  const [advancedOptionsOpen, setAdvancedOptionsOpen] = useState(false)
  const [envSettings, setEnvSettings] = useState({
    containerImage: '',
    memoryLimit: '2',
    cpuLimit: '1',
    devfilePath: '',
  })
  const [viewState, setViewState] = useState<'form' | 'provisioning' | 'connected'>('form')

  const [templateSearch, setTemplateSearch] = useState('')
  const [templateTag, setTemplateTag] = useState<string>('All')
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false)
  const [tagSearch, setTagSearch] = useState('')
  const [templatePanelOpen, setTemplatePanelOpen] = useState(false)
  const [templateModalOpen, setTemplateModalOpen] = useState(false)
  const [editorModalOpen, setEditorModalOpen] = useState(false)

  const normalizedTemplateSearch = templateSearch.trim().toLowerCase()
  const filteredTemplates = useMemo(() => {
    return TEMPLATES.filter((t) => {
      const matchesTag = templateTag === 'All' || t.tags.includes(templateTag)
      const matchesSearch =
        normalizedTemplateSearch === '' ||
        [t.name, t.description, ...t.tags].some((v) =>
          v.toLowerCase().includes(normalizedTemplateSearch),
        )
      return matchesTag && matchesSearch
    })
  }, [templateTag, normalizedTemplateSearch])

  const hasActiveTemplateFilters = normalizedTemplateSearch !== '' || templateTag !== 'All'
  const selectedTemplateObj = selectedTemplate ? TEMPLATES.find((t) => t.id === selectedTemplate) : null


  const isDuplicate =
    repoUrl.trim() !== '' &&
    EXISTING_WORKSPACES.some(
      (ws) => ws.toLowerCase() === repoUrl.trim().toLowerCase(),
    )

  const hasRepoInput = repoUrl.trim() !== ''
  const canSubmit =
    mode === 'repo' ? hasRepoInput : mode === 'template' ? selectedTemplate !== null : false

  const handleModeChange = useCallback((_event: React.MouseEvent<HTMLElement>, eventKey: string | number) => {
    const newMode = eventKey as CreationMode
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

  const handleTemplateClick = useCallback((templateId: string) => {
    setSelectedTemplate((prev) => {
      const next = prev === templateId ? null : templateId
      if (!nameManuallyEdited.current) {
        setName(next ? nameFromTemplate(next) : '')
      }
      return next
    })
    setTemplatePanelOpen(false)
  }, [])

  const handleNameChange = useCallback((_e: unknown, val: string) => {
    setName(val)
    nameManuallyEdited.current = val !== ''
  }, [])

  const handleRepoChange = useCallback((_e: unknown, val: string) => {
    setRepoUrl(val)
    if (!nameManuallyEdited.current) {
      setName(val.trim() ? nameFromRepoUrl(val) : '')
    }
  }, [])

  const addGitRemote = useCallback(() => {
    setGitRemotes((prev) => [...prev, { name: '', url: '' }])
  }, [])

  const removeGitRemote = useCallback((index: number) => {
    setGitRemotes((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const updateGitRemote = useCallback((index: number, field: keyof GitRemote, value: string) => {
    setGitRemotes((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)),
    )
  }, [])

  const workspaceInfo: WorkspaceInfo = useMemo(() => {
    const editorEntry = EDITORS.find((e) => e.id === editor)
    return {
      name: name || (mode === 'repo' ? nameFromRepoUrl(repoUrl) : selectedTemplate || 'workspace'),
      repoUrl,
      branch,
      editor,
      editorLabel: editorEntry?.label ?? editor,
      templateName: selectedTemplate ? (TEMPLATES.find((t) => t.id === selectedTemplate)?.name ?? selectedTemplate) : undefined,
    }
  }, [name, mode, repoUrl, branch, editor, selectedTemplate])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!canSubmit) return
      setViewState('provisioning')
    },
    [canSubmit],
  )

  const phaseToggle = (
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
      <ToggleGroupItem
        text="Dialog"
        buttonId="dialog"
        isSelected={phase === 'dialog'}
        onChange={() => onPhaseChange('dialog')}
      />
    </ToggleGroup>
  )

  const formView = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* HEADER */}
      <PageSection variant="default">
        <Flex>
          <FlexItem>
            <Title headingLevel="h1">Create Workspace</Title>
            <p style={{ marginTop: 'var(--pf-t--global--spacer--sm)', color: 'var(--pf-t--global--text--color--subtle)' }}>
              Import a Git repository or start from a template to launch a cloud development environment.
            </p>
          </FlexItem>
          <FlexItem align={{ default: 'alignRight' }}>
            {phaseToggle}
          </FlexItem>
        </Flex>
      </PageSection>

      {/* TABS */}
      <div style={{ padding: '0 var(--pf-t--global--spacer--lg)', borderBottom: '1px solid var(--pf-t--global--border--color--default)' }}>
        <Tabs
          activeKey={mode}
          onSelect={handleModeChange}
          aria-label="Creation mode"
        >
          <Tab
            eventKey="repo"
            title={<TabTitleText>Import from Git</TabTitleText>}
          />
          <Tab
            eventKey="template"
            title={<TabTitleText>Start from Template</TabTitleText>}
          />
        </Tabs>
      </div>

      {/* MIDDLE CONTENT */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        {mode === 'template' && (
          <>
            {/* LEFT COLUMN: config form */}
            <div
              style={{
                width: isDialogPhase ? 600 : 440,
                flexShrink: 0,
                overflowY: 'auto',
                overflowX: 'hidden',
                borderRight: templatePanelOpen && !isDialogPhase ? '1px solid var(--pf-t--global--border--color--default)' : 'none',
                padding: 'var(--pf-t--global--spacer--lg)',
                paddingRight: 'var(--pf-t--global--spacer--xl)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--pf-t--global--spacer--lg)',
              }}
            >
              <Form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pf-t--global--spacer--lg)' }}>
                  <FormGroup
                    label="Workspace Name"
                    fieldId="workspace-name"
                    labelHelp={<FieldHelp text="A human-readable name for your workspace. Auto-generated from the template if left blank." />}
                  >
                    <TextInput
                      id="workspace-name"
                      value={name}
                      onChange={handleNameChange}
                      placeholder="my-project"
                    />
                  </FormGroup>

                  <FormGroup label="Template" fieldId="select-template">
                    {selectedTemplateObj ? (
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '6px 12px',
                          border: '1px solid var(--pf-t--global--border--color--default)',
                          borderRadius: 'var(--pf-t--global--border--radius--small)',
                          background: 'var(--pf-t--global--background--color--primary--default)',
                        }}
                      >
                        <TemplateIcon icon={selectedTemplateObj.icon} size={16} />
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{selectedTemplateObj.name}</span>
                        <Button
                          variant="link"
                          onClick={() => {
                            if (isDialogPhase) {
                              setTemplateModalOpen(true)
                            } else {
                              setTemplatePanelOpen((o) => !o)
                            }
                          }}
                          style={{ padding: 0, fontSize: 13 }}
                        >
                          Change
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="link"
                        icon={<PlusCircleIcon />}
                        onClick={() => {
                          if (isDialogPhase) {
                            setTemplateModalOpen(true)
                          } else {
                            setTemplatePanelOpen(true)
                          }
                        }}
                        style={{ borderRadius: 'var(--pf-t--global--border--radius--small)' }}
                      >
                        Select a Template
                      </Button>
                    )}
                  </FormGroup>

                  <FormGroup
                    label="Select an Editor"
                    labelHelp={<FieldHelp text="Choose the IDE that will be launched in your workspace." />}
                  >
                    {isDialogPhase ? (
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '6px 12px',
                          border: '1px solid var(--pf-t--global--border--color--default)',
                          borderRadius: 'var(--pf-t--global--border--radius--small)',
                          background: 'var(--pf-t--global--background--color--primary--default)',
                        }}
                      >
                        {hasBrandIcon(editor) ? <BrandIcon id={editor} size={16} /> : <DesktopIcon style={{ fontSize: 16 }} />}
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{EDITORS.find((e) => e.id === editor)?.label ?? editor}</span>
                        <Button
                          variant="link"
                          onClick={() => setEditorModalOpen(true)}
                          style={{ padding: 0, fontSize: 13 }}
                        >
                          Change
                        </Button>
                      </div>
                    ) : (
                      <EditorDropdown value={editor} onChange={setEditor} />
                    )}
                  </FormGroup>

                  <FormGroup
                    label="Add AI Tools"
                    labelHelp={<FieldHelp text="Select AI-powered coding assistants to install in your workspace." />}
                  >
                    <AIToolsSection selected={aiTools} onChange={setAiTools} />
                  </FormGroup>

                  <ExpandableSection
                    toggleText={advancedOptionsOpen ? 'Hide Advanced Options' : 'Show Advanced Options'}
                    isExpanded={advancedOptionsOpen}
                    onToggle={(_e, expanded) => setAdvancedOptionsOpen(expanded)}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                      <FormGroup
                        label="Create New"
                        fieldId="create-new"
                        labelHelp={<FieldHelp text="When enabled, a new workspace will be created from the selected template. When disabled, the existing workspace previously created from this template will be re-used." />}
                      >
                        <Switch
                          id="create-new"
                          isChecked={createNew}
                          onChange={(_e, checked) => setCreateNew(checked)}
                          aria-label="Create new workspace"
                        />
                        <HelperText>
                          <HelperTextItem>
                            {createNew
                              ? 'A new workspace will be created from this template.'
                              : 'The existing workspace for this template will be re-used.'}
                          </HelperTextItem>
                        </HelperText>
                      </FormGroup>

                      <FormGroup fieldId="temporary-storage" label="Temporary Storage">
                        <Switch
                          id="temp-storage"
                          isChecked={tempStorage}
                          onChange={(_e, checked) => setTempStorage(checked)}
                          aria-label="Temporary storage"
                        />
                      </FormGroup>

                      {isPhase2 && (
                        <>
                          <FormGroup
                            label={`CPU Limit (${envSettings.cpuLimit ? `${envSettings.cpuLimit} cores` : 'default'})`}
                            fieldId="cpu-limit"
                          >
                            <NumberInput
                              id="cpu-limit"
                              value={envSettings.cpuLimit ? Number(envSettings.cpuLimit) : undefined}
                              onMinus={() =>
                                setEnvSettings((prev) => ({
                                  ...prev,
                                  cpuLimit: String(Math.max(0, parseFloat(((Number(prev.cpuLimit) || 0) - 0.5).toFixed(2)))),
                                }))
                              }
                              onPlus={() =>
                                setEnvSettings((prev) => ({
                                  ...prev,
                                  cpuLimit: String(parseFloat(((Number(prev.cpuLimit) || 0) + 0.5).toFixed(2))),
                                }))
                              }
                              onChange={(event: React.FormEvent<HTMLInputElement>) => {
                                const val = (event.target as HTMLInputElement).value
                                setEnvSettings((prev) => ({ ...prev, cpuLimit: val }))
                              }}
                              inputAriaLabel="CPU limit"
                              minusBtnAriaLabel="Decrease CPU"
                              plusBtnAriaLabel="Increase CPU"
                              min={0}
                              inputProps={{ step: 0.01 }}
                            />
                          </FormGroup>

                          <FormGroup
                            label={`Memory Limit (${envSettings.memoryLimit ? `${envSettings.memoryLimit}Gi` : 'default'})`}
                            fieldId="memory-limit"
                          >
                            <NumberInput
                              id="memory-limit"
                              value={envSettings.memoryLimit ? Number(envSettings.memoryLimit) : undefined}
                              onMinus={() =>
                                setEnvSettings((prev) => ({
                                  ...prev,
                                  memoryLimit: String(Math.max(0, parseFloat(((Number(prev.memoryLimit) || 0) - 0.5).toFixed(2)))),
                                }))
                              }
                              onPlus={() =>
                                setEnvSettings((prev) => ({
                                  ...prev,
                                  memoryLimit: String(parseFloat(((Number(prev.memoryLimit) || 0) + 0.5).toFixed(2))),
                                }))
                              }
                              onChange={(event: React.FormEvent<HTMLInputElement>) => {
                                const val = (event.target as HTMLInputElement).value
                                setEnvSettings((prev) => ({ ...prev, memoryLimit: val }))
                              }}
                              inputAriaLabel="Memory limit"
                              minusBtnAriaLabel="Decrease memory"
                              plusBtnAriaLabel="Increase memory"
                              min={0}
                              inputProps={{ step: 0.01 }}
                            />
                          </FormGroup>
                        </>
                      )}
                    </div>
                  </ExpandableSection>
                </div>
              </Form>
            </div>

            {/* RIGHT PANEL: template gallery (shown when templatePanelOpen, hidden in dialog mode) */}
            {templatePanelOpen && !isDialogPhase && (
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  padding: 'var(--pf-t--global--spacer--lg)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 12,
                    alignItems: 'center',
                    paddingBottom: 16,
                    marginBottom: 16,
                    borderBottom: '1px solid var(--pf-t--global--border--color--default)',
                  }}
                >
                  <div style={{ flex: '1 1 280px' }}>
                    <TextInput
                      value={templateSearch}
                      onChange={(_e, val) => setTemplateSearch(val)}
                      aria-label="Search templates"
                      placeholder="Search templates…"
                    />
                  </div>
                  <Select
                    isOpen={tagDropdownOpen}
                    onOpenChange={(open) => {
                      setTagDropdownOpen(open)
                      if (!open) setTagSearch('')
                    }}
                    onSelect={(_e, val) => {
                      setTemplateTag(val as string)
                      setTagDropdownOpen(false)
                      setTagSearch('')
                    }}
                    selected={templateTag}
                    toggle={(toggleRef) => (
                      <MenuToggle
                        ref={toggleRef}
                        onClick={() => setTagDropdownOpen((o) => !o)}
                        isExpanded={tagDropdownOpen}
                        icon={<FilterIcon />}
                        style={{ minWidth: 160 }}
                      >
                        {templateTag === 'All' ? 'All Tags' : templateTag}
                      </MenuToggle>
                    )}
                  >
                    <MenuSearch>
                      <MenuSearchInput>
                        <TextInput
                          value={tagSearch}
                          onChange={(_e, val) => setTagSearch(val)}
                          aria-label="Filter tags"
                          placeholder="Filter tags…"
                        />
                      </MenuSearchInput>
                    </MenuSearch>
                    <SelectList style={{ maxHeight: 400, overflowY: 'auto' }}>
                      {tagSearch.trim() === '' && (
                        <SelectOption value="All" isSelected={templateTag === 'All'}>
                          All Tags
                        </SelectOption>
                      )}
                      {ALL_TAGS
                        .filter((tag) =>
                          tagSearch.trim() === '' ||
                          tag.toLowerCase().includes(tagSearch.trim().toLowerCase()),
                        )
                        .map((tag) => (
                          <SelectOption key={tag} value={tag} isSelected={templateTag === tag}>
                            {tag}
                          </SelectOption>
                        ))}
                    </SelectList>
                  </Select>
                  <span style={{ fontSize: 12, color: 'var(--pf-t--global--text--color--subtle)' }}>
                    {filteredTemplates.length} shown
                  </span>
                  {hasActiveTemplateFilters && (
                    <Button
                      variant="link"
                      onClick={() => {
                        setTemplateSearch('')
                        setTemplateTag('All')
                      }}
                      style={{ padding: 0 }}
                    >
                      Reset filters
                    </Button>
                  )}
                </div>

                {filteredTemplates.length === 0 ? (
                  <div
                    style={{
                      padding: '24px 0',
                      textAlign: 'center',
                      color: 'var(--pf-t--global--text--color--subtle)',
                    }}
                  >
                    No templates match your search and filter.
                  </div>
                ) : (
                  <Gallery hasGutter minWidths={{ default: '260px' }}>
                    {filteredTemplates.map((tpl) => {
                      const isSelected = selectedTemplate === tpl.id
                      return (
                        <Card
                          key={tpl.id}
                          isSelectable
                          isSelected={isSelected}
                          onClick={() => handleTemplateClick(tpl.id)}
                          style={{
                            borderRadius: 12,
                            border: isSelected
                              ? '1px solid var(--pf-t--global--color--brand--default)'
                              : '1px solid var(--pf-t--global--border--color--default)',
                            boxShadow: isSelected
                              ? '0 0 0 1px color-mix(in srgb, var(--pf-t--global--color--brand--default) 20%, transparent)'
                              : '0 1px 2px rgba(3, 3, 3, 0.08)',
                            background: 'var(--pf-t--global--background--color--primary--default)',
                          }}
                        >
                          <CardBody style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: 32,
                                  height: 32,
                                  borderRadius: 8,
                                  background: 'var(--pf-t--global--background--color--secondary--default)',
                                  flexShrink: 0,
                                }}
                              >
                                <TemplateIcon icon={tpl.icon} size={20} />
                              </div>
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.2 }}>{tpl.name}</div>
                                <div
                                  style={{
                                    marginTop: 2,
                                    fontSize: 12,
                                    lineHeight: 1.3,
                                    color: 'var(--pf-t--global--text--color--subtle)',
                                  }}
                                >
                                  {tpl.description}
                                </div>
                              </div>
                              {isSelected && (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    fontSize: 12,
                                    flexShrink: 0,
                                    color: 'var(--pf-t--global--color--brand--default)',
                                  }}
                                >
                                  <CheckIcon />
                                  Selected
                                </span>
                              )}
                            </div>
                          </CardBody>
                        </Card>
                      )
                    })}
                  </Gallery>
                )}
              </div>
            )}

            {/* Template Selector Modal (dialog phase) */}
            <Modal
              isOpen={templateModalOpen}
              onClose={() => setTemplateModalOpen(false)}
              variant="large"
              aria-label="Select a template"
            >
              <ModalHeader
                title="Select a Template"
                description="Choose a template to start your workspace from."
              />
              <ModalBody>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 12,
                    alignItems: 'center',
                    paddingBottom: 16,
                    marginBottom: 16,
                    borderBottom: '1px solid var(--pf-t--global--border--color--default)',
                  }}
                >
                  <div style={{ flex: '1 1 280px' }}>
                    <TextInput
                      value={templateSearch}
                      onChange={(_e, val) => setTemplateSearch(val)}
                      aria-label="Search templates"
                      placeholder="Search templates…"
                    />
                  </div>
                  <Select
                    isOpen={tagDropdownOpen}
                    onOpenChange={(open) => {
                      setTagDropdownOpen(open)
                      if (!open) setTagSearch('')
                    }}
                    onSelect={(_e, val) => {
                      setTemplateTag(val as string)
                      setTagDropdownOpen(false)
                      setTagSearch('')
                    }}
                    selected={templateTag}
                    toggle={(toggleRef) => (
                      <MenuToggle
                        ref={toggleRef}
                        onClick={() => setTagDropdownOpen((o) => !o)}
                        isExpanded={tagDropdownOpen}
                        icon={<FilterIcon />}
                        style={{ minWidth: 160 }}
                      >
                        {templateTag === 'All' ? 'All Tags' : templateTag}
                      </MenuToggle>
                    )}
                  >
                    <MenuSearch>
                      <MenuSearchInput>
                        <TextInput
                          value={tagSearch}
                          onChange={(_e, val) => setTagSearch(val)}
                          aria-label="Filter tags"
                          placeholder="Filter tags…"
                        />
                      </MenuSearchInput>
                    </MenuSearch>
                    <SelectList style={{ maxHeight: 400, overflowY: 'auto' }}>
                      {tagSearch.trim() === '' && (
                        <SelectOption value="All" isSelected={templateTag === 'All'}>
                          All Tags
                        </SelectOption>
                      )}
                      {ALL_TAGS
                        .filter((tag) =>
                          tagSearch.trim() === '' ||
                          tag.toLowerCase().includes(tagSearch.trim().toLowerCase()),
                        )
                        .map((tag) => (
                          <SelectOption key={tag} value={tag} isSelected={templateTag === tag}>
                            {tag}
                          </SelectOption>
                        ))}
                    </SelectList>
                  </Select>
                  <span style={{ fontSize: 12, color: 'var(--pf-t--global--text--color--subtle)' }}>
                    {filteredTemplates.length} shown
                  </span>
                  {hasActiveTemplateFilters && (
                    <Button
                      variant="link"
                      onClick={() => {
                        setTemplateSearch('')
                        setTemplateTag('All')
                      }}
                      style={{ padding: 0 }}
                    >
                      Reset filters
                    </Button>
                  )}
                </div>

                {filteredTemplates.length === 0 ? (
                  <div
                    style={{
                      padding: '24px 0',
                      textAlign: 'center',
                      color: 'var(--pf-t--global--text--color--subtle)',
                    }}
                  >
                    No templates match your search and filter.
                  </div>
                ) : (
                  <Gallery hasGutter minWidths={{ default: '260px' }}>
                    {filteredTemplates.map((tpl) => {
                      const isSelected = selectedTemplate === tpl.id
                      return (
                        <Card
                          key={tpl.id}
                          isSelectable
                          isSelected={isSelected}
                          onClick={() => {
                            setSelectedTemplate((prev) => {
                              const next = prev === tpl.id ? null : tpl.id
                              if (!nameManuallyEdited.current) {
                                setName(next ? nameFromTemplate(next) : '')
                              }
                              return next
                            })
                          }}
                          style={{
                            borderRadius: 12,
                            border: isSelected
                              ? '1px solid var(--pf-t--global--color--brand--default)'
                              : '1px solid var(--pf-t--global--border--color--default)',
                            boxShadow: isSelected
                              ? '0 0 0 1px color-mix(in srgb, var(--pf-t--global--color--brand--default) 20%, transparent)'
                              : '0 1px 2px rgba(3, 3, 3, 0.08)',
                            background: 'var(--pf-t--global--background--color--primary--default)',
                          }}
                        >
                          <CardBody style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: 32,
                                  height: 32,
                                  borderRadius: 8,
                                  background: 'var(--pf-t--global--background--color--secondary--default)',
                                  flexShrink: 0,
                                }}
                              >
                                <TemplateIcon icon={tpl.icon} size={20} />
                              </div>
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.2 }}>{tpl.name}</div>
                                <div
                                  style={{
                                    marginTop: 2,
                                    fontSize: 12,
                                    lineHeight: 1.3,
                                    color: 'var(--pf-t--global--text--color--subtle)',
                                  }}
                                >
                                  {tpl.description}
                                </div>
                              </div>
                              {isSelected && (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    fontSize: 12,
                                    flexShrink: 0,
                                    color: 'var(--pf-t--global--color--brand--default)',
                                  }}
                                >
                                  <CheckIcon />
                                  Selected
                                </span>
                              )}
                            </div>
                          </CardBody>
                        </Card>
                      )
                    })}
                  </Gallery>
                )}
              </ModalBody>
              <ModalFooter>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, width: '100%' }}>
                  <span style={{ fontSize: 13, color: 'var(--pf-t--global--text--color--subtle)' }}>
                    {selectedTemplateObj
                      ? `Selected: ${selectedTemplateObj.name}`
                      : 'Click a template card to select it.'}
                  </span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button variant="link" onClick={() => setTemplateModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      isDisabled={!selectedTemplate}
                      onClick={() => setTemplateModalOpen(false)}
                    >
                      Done
                    </Button>
                  </div>
                </div>
              </ModalFooter>
            </Modal>

          </>
        )}

        {mode === 'repo' && (
          <div style={{ width: 600, overflowY: 'auto', padding: 'var(--pf-t--global--spacer--lg)' }}>
            <Form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pf-t--global--spacer--lg)' }}>
                {isPhase2 && (
                  <FormGroup
                    label="Workspace Name"
                    fieldId="workspace-name-repo"
                    labelHelp={<FieldHelp text="A human-readable name for your workspace. Auto-generated from the repo URL if left blank." />}
                  >
                    <TextInput
                      id="workspace-name-repo"
                      value={name}
                      onChange={handleNameChange}
                      placeholder="my-project"
                    />
                  </FormGroup>
                )}

                <FormGroup fieldId="repo-url" label="Git Repository URL" isRequired>
                    <Split hasGutter>
                      <SplitItem isFilled>
                        <TextInput
                          id="repo-url"
                          aria-label="HTTPS or SSH URL"
                          placeholder="Enter HTTPS or SSH URL"
                          value={repoUrl}
                          onChange={handleRepoChange}
                        />
                      </SplitItem>
                      <SplitItem>
                        <BranchDropdown
                          value={branch}
                          onChange={setBranch}
                          disabled={!hasRepoInput}
                        />
                      </SplitItem>
                    </Split>
                  {isDuplicate && (
                    <Alert
                      variant="warning"
                      isInline
                      isPlain
                      title="A workspace using this repository already exists. You can still create a new one."
                      style={{ marginTop: 8 }}
                    />
                  )}
                  <FormHelperText>
                    <HelperText>
                      <HelperTextItem>
                        Import from a Git repository to launch a Cloud Development Environment.
                      </HelperTextItem>
                    </HelperText>
                  </FormHelperText>
                </FormGroup>

                <FormGroup
                  label="Select an Editor"
                  labelHelp={<FieldHelp text="Choose the IDE that will be launched in your workspace." />}
                >
                  {isDialogPhase ? (
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '6px 12px',
                        border: '1px solid var(--pf-t--global--border--color--default)',
                        borderRadius: 'var(--pf-t--global--border--radius--small)',
                        background: 'var(--pf-t--global--background--color--primary--default)',
                      }}
                    >
                      {hasBrandIcon(editor) ? <BrandIcon id={editor} size={16} /> : <DesktopIcon style={{ fontSize: 16 }} />}
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{EDITORS.find((e) => e.id === editor)?.label ?? editor}</span>
                      <Button
                        variant="link"
                        onClick={() => setEditorModalOpen(true)}
                        style={{ padding: 0, fontSize: 13 }}
                      >
                        Change
                      </Button>
                    </div>
                  ) : (
                    <EditorDropdown value={editor} onChange={setEditor} />
                  )}
                </FormGroup>

                {isPhase2 && (
                  <FormGroup
                    label="Select Environment Components"
                    labelHelp={<FieldHelp text="Choose language runtimes and stacks to layer into your workspace image. You can pick multiple components." />}
                  >
                    <EnvironmentComponentsSection
                      selected={environmentComponents}
                      onChange={setEnvironmentComponents}
                    />
                  </FormGroup>
                )}

                <FormGroup
                  label="Add AI Tools"
                  labelHelp={<FieldHelp text="Select AI-powered coding assistants to install in your workspace." />}
                >
                  <AIToolsSection selected={aiTools} onChange={setAiTools} />
                </FormGroup>

                <ExpandableSection
                  toggleText={advancedOptionsOpen ? 'Hide Advanced Options' : 'Show Advanced Options'}
                  isExpanded={advancedOptionsOpen}
                  onToggle={(_e, expanded) => setAdvancedOptionsOpen(expanded)}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <FormGroup
                      label="Create New"
                      fieldId="create-new-repo"
                      labelHelp={<FieldHelp text="When enabled, a new workspace will be created from this repository. When disabled, the existing workspace previously created from this repository will be re-used." />}
                    >
                      <Switch
                        id="create-new-repo"
                        isChecked={createNew}
                        onChange={(_e, checked) => setCreateNew(checked)}
                        aria-label="Create new workspace"
                      />
                      <HelperText>
                        <HelperTextItem>
                          {createNew
                            ? 'A new workspace will be created from this repository.'
                            : 'The existing workspace for this repository will be re-used.'}
                        </HelperTextItem>
                      </HelperText>
                    </FormGroup>

                    <FormGroup
                      label="Path to Devfile"
                      fieldId="devfile-path"
                      labelHelp={<FieldHelp text="Specify a custom path to your devfile relative to the repository root." />}
                    >
                      <TextInput
                        id="devfile-path"
                        value={envSettings.devfilePath}
                        onChange={(_e, val) => setEnvSettings((prev) => ({ ...prev, devfilePath: val }))}
                        placeholder="Enter the relative path to the Devfile in the Git Repository"
                      />
                    </FormGroup>

                    <FormGroup
                      label="Container Image"
                      fieldId="container-image"
                      labelHelp={<FieldHelp text="Override the default Universal Developer Image with a custom container image." />}
                    >
                      <TextInput
                        id="container-image"
                        value={envSettings.containerImage}
                        onChange={(_e, val) => setEnvSettings((prev) => ({ ...prev, containerImage: val }))}
                        placeholder="Enter the container image"
                      />
                    </FormGroup>

                    <FormGroup label="Temporary Storage" fieldId="temp-storage-git">
                      <Switch
                        id="temp-storage-git"
                        isChecked={tempStorage}
                        onChange={(_e, checked) => setTempStorage(checked)}
                        aria-label="Temporary storage"
                      />
                    </FormGroup>

                    {isPhase2 && (
                      <>
                        <FormGroup
                          label={`CPU Limit (${envSettings.cpuLimit ? `${envSettings.cpuLimit} cores` : 'default'})`}
                          fieldId="cpu-limit-repo"
                        >
                          <NumberInput
                            id="cpu-limit-repo"
                            value={envSettings.cpuLimit ? Number(envSettings.cpuLimit) : undefined}
                            onMinus={() =>
                              setEnvSettings((prev) => ({
                                ...prev,
                                cpuLimit: String(Math.max(0, parseFloat(((Number(prev.cpuLimit) || 0) - 0.5).toFixed(2)))),
                              }))
                            }
                            onPlus={() =>
                              setEnvSettings((prev) => ({
                                ...prev,
                                cpuLimit: String(parseFloat(((Number(prev.cpuLimit) || 0) + 0.5).toFixed(2))),
                              }))
                            }
                            onChange={(event: React.FormEvent<HTMLInputElement>) => {
                              const val = (event.target as HTMLInputElement).value
                              setEnvSettings((prev) => ({ ...prev, cpuLimit: val }))
                            }}
                            inputAriaLabel="CPU limit"
                            minusBtnAriaLabel="Decrease CPU"
                            plusBtnAriaLabel="Increase CPU"
                            min={0}
                            inputProps={{ step: 0.01 }}
                          />
                        </FormGroup>

                        <FormGroup
                          label={`Memory Limit (${envSettings.memoryLimit ? `${envSettings.memoryLimit}Gi` : 'default'})`}
                          fieldId="memory-limit-repo"
                        >
                          <NumberInput
                            id="memory-limit-repo"
                            value={envSettings.memoryLimit ? Number(envSettings.memoryLimit) : undefined}
                            onMinus={() =>
                              setEnvSettings((prev) => ({
                                ...prev,
                                memoryLimit: String(Math.max(0, parseFloat(((Number(prev.memoryLimit) || 0) - 0.5).toFixed(2)))),
                              }))
                            }
                            onPlus={() =>
                              setEnvSettings((prev) => ({
                                ...prev,
                                memoryLimit: String(parseFloat(((Number(prev.memoryLimit) || 0) + 0.5).toFixed(2))),
                              }))
                            }
                            onChange={(event: React.FormEvent<HTMLInputElement>) => {
                              const val = (event.target as HTMLInputElement).value
                              setEnvSettings((prev) => ({ ...prev, memoryLimit: val }))
                            }}
                            inputAriaLabel="Memory limit"
                            minusBtnAriaLabel="Decrease memory"
                            plusBtnAriaLabel="Increase memory"
                            min={0}
                            inputProps={{ step: 0.01 }}
                          />
                        </FormGroup>
                      </>
                    )}

                    <FormGroup label="Additional Git Remotes" fieldId="git-remotes">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {gitRemotes.map((remote, index) => (
                          <Split hasGutter key={index} style={{ alignItems: 'flex-end' }}>
                            <SplitItem>
                              <FormGroup label="Remote Name" fieldId={`remote-name-${index}`}>
                                <TextInput
                                  id={`remote-name-${index}`}
                                  value={remote.name}
                                  onChange={(_e, val) => updateGitRemote(index, 'name', val)}
                                  placeholder="origin"
                                  aria-label="Remote Name"
                                />
                              </FormGroup>
                            </SplitItem>
                            <SplitItem isFilled>
                              <FormGroup label="Remote URL" fieldId={`remote-url-${index}`}>
                                <TextInput
                                  id={`remote-url-${index}`}
                                  value={remote.url}
                                  onChange={(_e, val) => updateGitRemote(index, 'url', val)}
                                  placeholder="HTTP or SSH URL"
                                  aria-label="Remote URL"
                                />
                              </FormGroup>
                            </SplitItem>
                            <SplitItem>
                              <Button
                                variant="plain"
                                aria-label="Remove remote"
                                onClick={() => removeGitRemote(index)}
                                icon={<MinusIcon />}
                              />
                            </SplitItem>
                          </Split>
                        ))}
                        <div>
                          <Button
                            variant="link"
                            icon={<PlusCircleIcon />}
                            onClick={addGitRemote}
                          >
                            Add Remote
                          </Button>
                        </div>
                      </div>
                    </FormGroup>
                  </div>
                </ExpandableSection>
              </div>
            </Form>
          </div>
        )}
      </div>

      {/* Editor Selector Modal (dialog phase) */}
      <Modal
        isOpen={editorModalOpen}
        onClose={() => setEditorModalOpen(false)}
        variant="medium"
        aria-label="Select an editor"
      >
        <ModalHeader
          title="Select an Editor"
          description="Choose the IDE that will be launched in your workspace."
        />
        <ModalBody>
          <Gallery hasGutter minWidths={{ default: '240px' }}>
            {EDITORS.filter((e) => !e.isCustom).map((e) => {
              const isSelected = editor === e.id
              return (
                <Card
                  key={e.id}
                  isSelectable
                  isSelected={isSelected}
                  onClick={() => {
                    setEditor(e.id)
                    setEditorModalOpen(false)
                  }}
                  style={{
                    borderRadius: 12,
                    border: isSelected
                      ? '1px solid var(--pf-t--global--color--brand--default)'
                      : '1px solid var(--pf-t--global--border--color--default)',
                    boxShadow: isSelected
                      ? '0 0 0 1px color-mix(in srgb, var(--pf-t--global--color--brand--default) 20%, transparent)'
                      : '0 1px 2px rgba(3, 3, 3, 0.08)',
                    background: 'var(--pf-t--global--background--color--primary--default)',
                  }}
                >
                  <CardBody style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: 'var(--pf-t--global--background--color--secondary--default)',
                          flexShrink: 0,
                        }}
                      >
                        {hasBrandIcon(e.id) ? <BrandIcon id={e.id} size={20} /> : <DesktopIcon style={{ fontSize: 20, opacity: 0.5 }} />}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.2 }}>{e.label}</div>
                      </div>
                      {isSelected && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 12,
                            flexShrink: 0,
                            color: 'var(--pf-t--global--color--brand--default)',
                          }}
                        >
                          <CheckIcon />
                          Selected
                        </span>
                      )}
                    </div>
                  </CardBody>
                </Card>
              )
            })}
          </Gallery>
        </ModalBody>
      </Modal>

      {/* FOOTER */}
      <div style={{
        flexShrink: 0,
        padding: 'var(--pf-t--global--spacer--md) var(--pf-t--global--spacer--lg)',
        borderTop: '1px solid var(--pf-t--global--border--color--default)',
      }}>
        <Button
          type="button"
          variant="primary"
          isDisabled={!canSubmit}
          onClick={handleSubmit}
        >
          Create Workspace
        </Button>
      </div>
    </div>
  )

  if (viewState === 'provisioning') {
    return (
      <>
        <PageSection variant="default">
          <Flex>
            <FlexItem>
              <Title headingLevel="h2">Workspaces</Title>
            </FlexItem>
            <FlexItem align={{ default: 'alignRight' }}>
              {phaseToggle}
            </FlexItem>
          </Flex>
        </PageSection>
        <WorkspaceProvisioning
          workspace={workspaceInfo}
          onComplete={() => setViewState('connected')}
          onCancel={() => setViewState('form')}
        />
      </>
    )
  }

  if (viewState === 'connected') {
    return (
      <>
        <PageSection variant="default">
          <Flex>
            <FlexItem>
              <Title headingLevel="h2">Workspaces</Title>
            </FlexItem>
            <FlexItem align={{ default: 'alignRight' }}>
              {phaseToggle}
            </FlexItem>
          </Flex>
        </PageSection>
        <VSCodeMockup
          workspace={workspaceInfo}
          onBackToWorkspaces={() => setViewState('form')}
        />
      </>
    )
  }

  return formView
}
