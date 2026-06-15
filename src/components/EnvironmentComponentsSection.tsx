import { useState, useMemo } from 'react'
import {
  Button,
  Card,
  CardBody,
  Checkbox,
  CodeBlock,
  CodeBlockCode,
  FormGroup,
  Gallery,
  Grid,
  GridItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  TextInput,
} from '@patternfly/react-core'
import {
  CheckIcon,
  CopyIcon,
  CubeIcon,
  FileCodeIcon,
  PlusCircleIcon,
  TimesIcon,
} from '@patternfly/react-icons'
import { DependencyBrandIcon } from './DependencyBrandIcon'
import { getDependencyBrandIcon } from './dependencySimpleIcons'
import { getDevfileSnippetForComponent } from './envComponentDevfileSnippets'

function newSnippetRowId(): string {
  return `snip-${Math.random().toString(36).slice(2, 11)}`
}

interface SnippetEnvRow {
  id: string
  name: string
  value: string
}

interface SnippetPortRow {
  id: string
  name: string
  port: string
}

interface SnippetVolumeRow {
  id: string
  volumeName: string
  path: string
}

interface EnvComponent {
  id: string
  name: string
  subtitle?: string
  brand: string
}

type EnvComponentCategory =
  | 'Languages & runtimes'
  | 'Databases & messaging'
  | 'Infrastructure & ops'
  | 'Build & tooling'

const AVAILABLE_COMPONENTS: EnvComponent[] = [
  { id: 'java-11', name: 'Java 11', subtitle: 'LTS', brand: 'java' },
  { id: 'java-17', name: 'Java 17', subtitle: 'LTS', brand: 'java' },
  { id: 'java-21', name: 'Java 21', subtitle: 'LTS', brand: 'java' },
  { id: 'python-39', name: 'Python 3.9', brand: 'python' },
  { id: 'python-310', name: 'Python 3.10', brand: 'python' },
  { id: 'python-311', name: 'Python 3.11', brand: 'python' },
  { id: 'python-312', name: 'Python 3.12', brand: 'python' },
  { id: 'python-313', name: 'Python 3.13', brand: 'python' },
  { id: 'node-18', name: 'Node.js 18', subtitle: 'LTS', brand: 'nodejs' },
  { id: 'node-20', name: 'Node.js 20', subtitle: 'LTS', brand: 'nodejs' },
  { id: 'node-22', name: 'Node.js 22', brand: 'nodejs' },
  { id: 'node-23', name: 'Node.js 23', brand: 'nodejs' },
  { id: 'go-121', name: 'Go 1.21', brand: 'go' },
  { id: 'go-122', name: 'Go 1.22', brand: 'go' },
  { id: 'go-123', name: 'Go 1.23', brand: 'go' },
  { id: 'rust-stable', name: 'Rust', subtitle: 'stable', brand: 'rust' },
  { id: 'rust-nightly', name: 'Rust', subtitle: 'nightly', brand: 'rust' },
  { id: 'dotnet-6', name: '.NET 6', subtitle: 'LTS', brand: 'dotnet' },
  { id: 'dotnet-8', name: '.NET 8', subtitle: 'LTS', brand: 'dotnet' },
  { id: 'dotnet-9', name: '.NET 9', brand: 'dotnet' },
  { id: 'ruby-31', name: 'Ruby 3.1', brand: 'ruby' },
  { id: 'ruby-32', name: 'Ruby 3.2', brand: 'ruby' },
  { id: 'ruby-33', name: 'Ruby 3.3', brand: 'ruby' },
  { id: 'php-82', name: 'PHP 8.2', brand: 'php' },
  { id: 'php-83', name: 'PHP 8.3', brand: 'php' },
  { id: 'php-84', name: 'PHP 8.4', brand: 'php' },
  { id: 'kotlin-2', name: 'Kotlin 2.x', brand: 'kotlin' },
  { id: 'swift-5', name: 'Swift 5.x', brand: 'swift' },
  { id: 'typescript-5', name: 'TypeScript 5.x', brand: 'typescript' },
  { id: 'cpp-gcc', name: 'GCC toolchain', subtitle: 'C / C++', brand: 'gnu' },
  { id: 'cpp-llvm', name: 'LLVM / Clang', subtitle: 'C / C++', brand: 'llvm' },
  { id: 'scala-3', name: 'Scala 3.x', brand: 'scala' },
  { id: 'elixir-116', name: 'Elixir 1.16+', brand: 'elixir' },
  { id: 'deno-2', name: 'Deno 2.x', brand: 'deno' },
  { id: 'bun-1', name: 'Bun 1.x', brand: 'bun' },
  { id: 'clojure', name: 'Clojure', brand: 'clojure' },
  { id: 'haskell-ghc', name: 'Haskell GHC', brand: 'haskell' },
  { id: 'perl-538', name: 'Perl 5.38+', brand: 'perl' },
  { id: 'r-4', name: 'R 4.x', brand: 'rlang' },
  { id: 'julia-110', name: 'Julia 1.10+', brand: 'julia' },
  { id: 'erlang-26', name: 'Erlang / OTP 26+', brand: 'erlang' },
  { id: 'dart-3', name: 'Dart 3.x', brand: 'dart' },
  { id: 'flutter-3', name: 'Flutter 3.x', brand: 'flutter' },
  { id: 'docker-engine', name: 'Docker Engine', brand: 'docker' },
  { id: 'kubernetes', name: 'Kubernetes', subtitle: 'kubectl', brand: 'kubernetes' },
  { id: 'postgres-15', name: 'PostgreSQL 15', brand: 'postgres' },
  { id: 'postgres-16', name: 'PostgreSQL 16', brand: 'postgres' },
  { id: 'postgres-17', name: 'PostgreSQL 17', brand: 'postgres' },
  { id: 'redis-7', name: 'Redis 7', brand: 'redis' },
  { id: 'mongo-6', name: 'MongoDB 6', brand: 'mongo' },
  { id: 'mongo-7', name: 'MongoDB 7', brand: 'mongo' },
  { id: 'mysql-8', name: 'MySQL 8', brand: 'mysql' },
  { id: 'mariadb-11', name: 'MariaDB 11', brand: 'mariadb' },
  { id: 'sqlite-3', name: 'SQLite 3', brand: 'sqlite' },
  { id: 'rabbitmq-3', name: 'RabbitMQ 3.x', brand: 'rabbitmq' },
  { id: 'kafka-3', name: 'Apache Kafka 3.x', brand: 'kafka' },
  { id: 'nginx', name: 'Nginx', brand: 'nginx' },
  { id: 'terraform-1', name: 'Terraform 1.x', brand: 'terraform' },
  { id: 'cmake', name: 'CMake', brand: 'cmake' },
  { id: 'gradle-8', name: 'Gradle 8', brand: 'gradle' },
  { id: 'maven-3', name: 'Apache Maven 3', brand: 'maven' },
  { id: 'bash-5', name: 'Bash 5', brand: 'bash' },
]

const COMPONENT_CATEGORY_ORDER: EnvComponentCategory[] = [
  'Languages & runtimes',
  'Databases & messaging',
  'Infrastructure & ops',
  'Build & tooling',
]

const COMPONENT_CATEGORY_DESCRIPTIONS: Record<EnvComponentCategory, string> = {
  'Languages & runtimes': 'Language stacks, frameworks, and SDKs for application development.',
  'Databases & messaging': 'Data stores, queues, and event streaming services.',
  'Infrastructure & ops': 'Platform services and infrastructure tooling for runtime operations.',
  'Build & tooling': 'Compilers, package tooling, and command-line build utilities.',
}

interface EnvironmentComponentsSectionProps {
  selected: string[]
  onChange: (ids: string[]) => void
}

function getComponentCategory(component: EnvComponent): EnvComponentCategory {
  switch (component.brand) {
    case 'postgres':
    case 'redis':
    case 'mongo':
    case 'mysql':
    case 'mariadb':
    case 'sqlite':
    case 'rabbitmq':
    case 'kafka':
      return 'Databases & messaging'
    case 'docker':
    case 'kubernetes':
    case 'nginx':
    case 'terraform':
      return 'Infrastructure & ops'
    case 'gnu':
    case 'llvm':
    case 'cmake':
    case 'gradle':
    case 'maven':
    case 'bash':
      return 'Build & tooling'
    default:
      return 'Languages & runtimes'
  }
}

function ComponentIcon({ brand, size }: { brand: string; size: number }) {
  const icon = getDependencyBrandIcon(brand)
  if (icon) return <DependencyBrandIcon icon={icon} size={size} />
  return <CubeIcon style={{ fontSize: size }} aria-hidden />
}

export function EnvironmentComponentsSection({ selected, onChange }: EnvironmentComponentsSectionProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<'All' | EnvComponentCategory>('All')
  const [yamlPreview, setYamlPreview] = useState<EnvComponent | null>(null)
  const [snippetEnvRows, setSnippetEnvRows] = useState<SnippetEnvRow[]>([])
  const [snippetPortRows, setSnippetPortRows] = useState<SnippetPortRow[]>([])
  const [snippetVolumeRows, setSnippetVolumeRows] = useState<SnippetVolumeRow[]>([])
  const [snippetMemoryLimit, setSnippetMemoryLimit] = useState('')
  const [snippetMemoryRequest, setSnippetMemoryRequest] = useState('')
  const [snippetCpuLimit, setSnippetCpuLimit] = useState('')
  const [snippetCpuRequest, setSnippetCpuRequest] = useState('')
  const [snippetMountSources, setSnippetMountSources] = useState(true)
  const [snippetSourceMapping, setSnippetSourceMapping] = useState('')
  const [copyDone, setCopyDone] = useState(false)

  const mergedSnippet = useMemo(() => {
    if (!yamlPreview) return ''
    const env = snippetEnvRows
      .filter((r) => r.name.trim() !== '')
      .map((r) => ({ name: r.name, value: r.value }))
    const endpoints = snippetPortRows
      .map((r) => {
        const targetPort = Number.parseInt(r.port, 10)
        if (!Number.isInteger(targetPort) || targetPort < 1 || targetPort > 65535) return null
        return { name: r.name, targetPort }
      })
      .filter((e): e is { name: string; targetPort: number } => e !== null)
    const volumeMounts = snippetVolumeRows
      .filter((r) => r.volumeName.trim() !== '' && r.path.trim() !== '')
      .map((r) => ({ name: r.volumeName.trim(), path: r.path.trim() }))
    return getDevfileSnippetForComponent(yamlPreview.id, yamlPreview.name, {
      env,
      endpoints,
      volumeMounts,
      memoryLimit: snippetMemoryLimit.trim() || undefined,
      memoryRequest: snippetMemoryRequest.trim() || undefined,
      cpuLimit: snippetCpuLimit.trim() || undefined,
      cpuRequest: snippetCpuRequest.trim() || undefined,
      mountSources: snippetMountSources ? undefined : false,
      sourceMapping: snippetSourceMapping.trim() || undefined,
    })
  }, [
    yamlPreview, snippetEnvRows, snippetPortRows, snippetVolumeRows,
    snippetMemoryLimit, snippetMemoryRequest, snippetCpuLimit, snippetCpuRequest,
    snippetMountSources, snippetSourceMapping,
  ])

  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id])
  }

  function remove(id: string) {
    onChange(selected.filter((s) => s !== id))
  }

  function closePicker() {
    setOpen(false)
    setSearch('')
    setActiveCategory('All')
  }

  function openYamlPreview(c: EnvComponent) {
    setCopyDone(false)
    setSnippetEnvRows([{ id: newSnippetRowId(), name: '', value: '' }])
    setSnippetPortRows([{ id: newSnippetRowId(), name: '', port: '' }])
    setSnippetVolumeRows([{ id: newSnippetRowId(), volumeName: '', path: '' }])
    setSnippetMemoryLimit('')
    setSnippetMemoryRequest('')
    setSnippetCpuLimit('')
    setSnippetCpuRequest('')
    setSnippetMountSources(true)
    setSnippetSourceMapping('')
    setYamlPreview(c)
  }

  function handleCopy() {
    void navigator.clipboard.writeText(mergedSnippet).then(() => {
      setCopyDone(true)
      window.setTimeout(() => setCopyDone(false), 2000)
    })
  }

  const selectedItems = AVAILABLE_COMPONENTS.filter((c) => selected.includes(c.id))
  const normalizedSearch = search.trim().toLowerCase()
  const visibleSections = useMemo(() => {
    return COMPONENT_CATEGORY_ORDER
      .map((category) => ({
        category,
        items: AVAILABLE_COMPONENTS.filter((component) => {
          const matchesCategory = activeCategory === 'All' || category === activeCategory
          const matchesSearch =
            normalizedSearch === '' ||
            [component.name, component.subtitle ?? '', component.brand]
              .some((value) => value.toLowerCase().includes(normalizedSearch))
          return matchesCategory && matchesSearch && getComponentCategory(component) === category
        }),
      }))
      .filter((section) => section.items.length > 0)
  }, [activeCategory, normalizedSearch])
  const visibleComponentCount = visibleSections.reduce((total, section) => total + section.items.length, 0)
  const hasActiveFilters = normalizedSearch !== '' || activeCategory !== 'All'

  return (
    <div>
      {selectedItems.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {selectedItems.map((c) => (
            <div
              key={c.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 10px',
                border: '1px solid var(--pf-v6-global--BorderColor--100, #d2d2d2)',
                borderRadius: 9999,
                background: 'var(--pf-v6-global--BackgroundColor--100, #fff)',
              }}
            >
              <ComponentIcon brand={c.brand} size={14} />
              <span style={{ fontSize: 13, fontWeight: 500 }}>{c.name}</span>
              <Button
                variant="link"
                icon={<FileCodeIcon />}
                onClick={() => openYamlPreview(c)}
                style={{ padding: 0, fontSize: 12 }}
              >
                Edit
              </Button>
              <Button
                variant="plain"
                aria-label={`Remove ${c.name}`}
                icon={<TimesIcon />}
                onClick={() => remove(c.id)}
                style={{ padding: 0 }}
              />
            </div>
          ))}
        </div>
      )}

      <Button variant="secondary" icon={<PlusCircleIcon />} onClick={() => setOpen(true)}>
        Add Components
      </Button>

      {/* Component Selector Modal */}
      <Modal
        isOpen={open}
        onClose={closePicker}
        variant="large"
        aria-label="Environment components"
      >
        <ModalHeader
          title="Environment components"
          description="Select runtimes and language stacks to include in your workspace image."
        />
        <ModalBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                paddingBottom: 16,
                borderBottom: '1px solid var(--pf-v6-global--BorderColor--100, #d2d2d2)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 12,
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ flex: '1 1 280px' }}>
                  <TextInput
                    value={search}
                    onChange={(_e, val) => setSearch(val)}
                    aria-label="Search environment components"
                    placeholder="Search components, versions, or brands"
                  />
                </div>
                <span style={{ fontSize: 12, color: 'var(--pf-v6-global--Color--200, #6a6e73)' }}>
                  {visibleComponentCount} shown
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <Button
                  variant={activeCategory === 'All' ? 'primary' : 'secondary'}
                  onClick={() => setActiveCategory('All')}
                >
                  All
                </Button>
                {COMPONENT_CATEGORY_ORDER.map((category) => (
                  <Button
                    key={category}
                    variant={activeCategory === category ? 'primary' : 'secondary'}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 12,
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: 13, color: 'var(--pf-v6-global--Color--200, #6a6e73)' }}>
                  {selectedItems.length === 0
                    ? 'No components selected yet.'
                    : `${selectedItems.length} component${selectedItems.length === 1 ? '' : 's'} selected.`}
                </span>
                {hasActiveFilters && (
                  <Button
                    variant="link"
                    onClick={() => {
                      setSearch('')
                      setActiveCategory('All')
                    }}
                    style={{ padding: 0 }}
                  >
                    Reset filters
                  </Button>
                )}
              </div>
            </div>

            {visibleSections.length === 0 ? (
              <div
                style={{
                  padding: '24px 0',
                  textAlign: 'center',
                  color: 'var(--pf-v6-global--Color--200, #6a6e73)',
                }}
              >
                No components match your current search and filter combination.
              </div>
            ) : (
              visibleSections.map((section) => (
                <div
                  key={section.category}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                    padding: 16,
                    border: '1px solid var(--pf-v6-global--BorderColor--100, #d2d2d2)',
                    borderRadius: 12,
                    background: 'var(--pf-v6-global--BackgroundColor--200, #f5f5f5)',
                  }}
                >
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16 }}>
                      {section.category} ({section.items.length})
                    </h3>
                    <p
                      style={{
                        margin: '4px 0 0',
                        fontSize: 13,
                        color: 'var(--pf-v6-global--Color--200, #6a6e73)',
                      }}
                    >
                      {COMPONENT_CATEGORY_DESCRIPTIONS[section.category]}
                    </p>
                  </div>

                  <Gallery hasGutter minWidths={{ default: '220px' }}>
                    {section.items.map((c) => {
                      const isSelected = selected.includes(c.id)
                      return (
                        <Card
                          key={c.id}
                          isSelectable
                          isSelected={isSelected}
                          onClick={() => toggle(c.id)}
                          style={{
                            borderRadius: 12,
                            border: isSelected
                              ? '1px solid var(--pf-v6-global--primary-color--100, #0066cc)'
                              : '1px solid var(--pf-v6-global--BorderColor--100, #d2d2d2)',
                            boxShadow: isSelected
                              ? '0 0 0 1px color-mix(in srgb, var(--pf-v6-global--primary-color--100, #0066cc) 20%, transparent)'
                              : '0 1px 2px rgba(3, 3, 3, 0.08)',
                            background: 'var(--pf-v6-global--BackgroundColor--100, #fff)',
                          }}
                        >
                          <CardBody style={{ padding: '12px 14px' }}>
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 8,
                              }}
                            >
                              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 32,
                                    height: 32,
                                    borderRadius: 8,
                                    background: 'var(--pf-v6-global--BackgroundColor--200, #f5f5f5)',
                                    flexShrink: 0,
                                  }}
                                >
                                  <ComponentIcon brand={c.brand} size={20} />
                                </div>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                  <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.2 }}>{c.name}</div>
                                  {c.subtitle && (
                                    <div
                                      style={{
                                        marginTop: 1,
                                        fontSize: 12,
                                        lineHeight: 1.2,
                                        color: 'var(--pf-v6-global--Color--200, #6a6e73)',
                                      }}
                                    >
                                      {c.subtitle}
                                    </div>
                                  )}
                                </div>
                                <div
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-end',
                                    gap: 4,
                                    flexShrink: 0,
                                  }}
                                >
                                  <Button
                                    variant="link"
                                    icon={<FileCodeIcon />}
                                    aria-label={`View devfile YAML for ${c.name}`}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      openYamlPreview(c)
                                    }}
                                    style={{ padding: 0, minHeight: 'auto' }}
                                  >
                                    View YAML
                                  </Button>
                                  <span
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 6,
                                      fontSize: 12,
                                      color: isSelected
                                        ? 'var(--pf-v6-global--primary-color--100, #0066cc)'
                                        : 'var(--pf-v6-global--Color--200, #6a6e73)',
                                    }}
                                  >
                                    {isSelected ? (
                                      <>
                                        <CheckIcon />
                                        Selected
                                      </>
                                    ) : (
                                      'Click to add'
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      )
                    })}
                  </Gallery>
                </div>
              ))
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              width: '100%',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontSize: 13, color: 'var(--pf-v6-global--Color--200, #6a6e73)' }}>
              {selectedItems.length === 0
                ? 'Select one or more components to include in the workspace image.'
                : `${selectedItems.length} component${selectedItems.length === 1 ? '' : 's'} selected.`}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="link" onClick={() => onChange([])} isDisabled={selectedItems.length === 0}>
                Clear all
              </Button>
              <Button variant="primary" onClick={closePicker}>
                Done
              </Button>
            </div>
          </div>
        </ModalFooter>
      </Modal>

      {/* YAML Preview Modal */}
      <Modal
        isOpen={!!yamlPreview}
        onClose={() => setYamlPreview(null)}
        variant="medium"
        aria-label={`Devfile snippet — ${yamlPreview?.name ?? ''}`}
      >
        <ModalHeader title={`Devfile snippet — ${yamlPreview?.name ?? ''}`} />
        <ModalBody>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <p>
              Example <code>components</code> entry you can merge into your devfile. Image tags are
              illustrative; adjust for your registry and version policy.
            </p>
            <Button variant="secondary" icon={<CopyIcon />} onClick={handleCopy} style={{ flexShrink: 0, marginLeft: 16 }}>
              {copyDone ? 'Copied' : 'Copy'}
            </Button>
          </div>

          <CodeBlock>
            <CodeBlockCode>{mergedSnippet}</CodeBlockCode>
          </CodeBlock>

          {/* Environment variables */}
          <h4 style={{ marginTop: 24, marginBottom: 8 }}>Environment variables</h4>
          {snippetEnvRows.map((row) => (
            <div key={row.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <TextInput
                aria-label="Variable name"
                placeholder="NAME"
                value={row.name}
                onChange={(_e, val) =>
                  setSnippetEnvRows((rows) => rows.map((r) => (r.id === row.id ? { ...r, name: val } : r)))
                }
                style={{ flex: 1 }}
              />
              <TextInput
                aria-label="Value"
                placeholder="value"
                value={row.value}
                onChange={(_e, val) =>
                  setSnippetEnvRows((rows) => rows.map((r) => (r.id === row.id ? { ...r, value: val } : r)))
                }
                style={{ flex: 1 }}
              />
              <Button
                variant="plain"
                aria-label="Remove variable row"
                icon={<TimesIcon />}
                onClick={() =>
                  setSnippetEnvRows((rows) =>
                    rows.length <= 1
                      ? [{ id: newSnippetRowId(), name: '', value: '' }]
                      : rows.filter((r) => r.id !== row.id),
                  )
                }
              />
            </div>
          ))}
          <Button
            variant="link"
            icon={<PlusCircleIcon />}
            onClick={() => setSnippetEnvRows((rows) => [...rows, { id: newSnippetRowId(), name: '', value: '' }])}
          >
            Add variable
          </Button>

          {/* Ports */}
          <h4 style={{ marginTop: 24, marginBottom: 8 }}>Ports</h4>
          <p style={{ fontSize: 13, marginBottom: 8 }}>
            Adds <code>endpoints</code> with <code>exposure: public</code> (typical for browser apps).
          </p>
          {snippetPortRows.map((row) => (
            <div key={row.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <TextInput
                aria-label="Endpoint name"
                placeholder="http-3000"
                value={row.name}
                onChange={(_e, val) =>
                  setSnippetPortRows((rows) => rows.map((r) => (r.id === row.id ? { ...r, name: val } : r)))
                }
                style={{ flex: 1 }}
              />
              <TextInput
                type="number"
                aria-label="Target port"
                placeholder="3000"
                value={row.port}
                onChange={(_e, val) =>
                  setSnippetPortRows((rows) => rows.map((r) => (r.id === row.id ? { ...r, port: val } : r)))
                }
                style={{ width: 96, flexShrink: 0 }}
              />
              <Button
                variant="plain"
                aria-label="Remove port row"
                icon={<TimesIcon />}
                onClick={() =>
                  setSnippetPortRows((rows) =>
                    rows.length <= 1
                      ? [{ id: newSnippetRowId(), name: '', port: '' }]
                      : rows.filter((r) => r.id !== row.id),
                  )
                }
              />
            </div>
          ))}
          <Button
            variant="link"
            icon={<PlusCircleIcon />}
            onClick={() => setSnippetPortRows((rows) => [...rows, { id: newSnippetRowId(), name: '', port: '' }])}
          >
            Add port
          </Button>

          {/* Volume mounts */}
          <h4 style={{ marginTop: 24, marginBottom: 8 }}>Volume mounts</h4>
          <p style={{ fontSize: 13, marginBottom: 8 }}>
            <code>name</code> must match a <code>volume</code> component in your devfile.
          </p>
          {snippetVolumeRows.map((row) => (
            <div key={row.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <TextInput
                aria-label="Volume name"
                placeholder="projects"
                value={row.volumeName}
                onChange={(_e, val) =>
                  setSnippetVolumeRows((rows) => rows.map((r) => (r.id === row.id ? { ...r, volumeName: val } : r)))
                }
                style={{ flex: 1 }}
              />
              <TextInput
                aria-label="Mount path"
                placeholder="/where/to/mount"
                value={row.path}
                onChange={(_e, val) =>
                  setSnippetVolumeRows((rows) => rows.map((r) => (r.id === row.id ? { ...r, path: val } : r)))
                }
                style={{ flex: 1 }}
              />
              <Button
                variant="plain"
                aria-label="Remove volume mount row"
                icon={<TimesIcon />}
                onClick={() =>
                  setSnippetVolumeRows((rows) =>
                    rows.length <= 1
                      ? [{ id: newSnippetRowId(), volumeName: '', path: '' }]
                      : rows.filter((r) => r.id !== row.id),
                  )
                }
              />
            </div>
          ))}
          <Button
            variant="link"
            icon={<PlusCircleIcon />}
            onClick={() =>
              setSnippetVolumeRows((rows) => [...rows, { id: newSnippetRowId(), volumeName: '', path: '' }])
            }
          >
            Add volume mount
          </Button>

          {/* Resources */}
          <h4 style={{ marginTop: 24, marginBottom: 8 }}>Resources and sources</h4>
          <Grid hasGutter>
            <GridItem span={6}>
              <FormGroup label="memoryLimit" fieldId="snippet-mem-limit">
                <TextInput
                  id="snippet-mem-limit"
                  placeholder="2Gi"
                  value={snippetMemoryLimit}
                  onChange={(_e, val) => setSnippetMemoryLimit(val)}
                />
              </FormGroup>
            </GridItem>
            <GridItem span={6}>
              <FormGroup label="memoryRequest" fieldId="snippet-mem-req">
                <TextInput
                  id="snippet-mem-req"
                  placeholder="512Mi"
                  value={snippetMemoryRequest}
                  onChange={(_e, val) => setSnippetMemoryRequest(val)}
                />
              </FormGroup>
            </GridItem>
            <GridItem span={6}>
              <FormGroup label="cpuLimit" fieldId="snippet-cpu-limit">
                <TextInput
                  id="snippet-cpu-limit"
                  placeholder="2"
                  value={snippetCpuLimit}
                  onChange={(_e, val) => setSnippetCpuLimit(val)}
                />
              </FormGroup>
            </GridItem>
            <GridItem span={6}>
              <FormGroup label="cpuRequest" fieldId="snippet-cpu-req">
                <TextInput
                  id="snippet-cpu-req"
                  placeholder="500m"
                  value={snippetCpuRequest}
                  onChange={(_e, val) => setSnippetCpuRequest(val)}
                />
              </FormGroup>
            </GridItem>
          </Grid>

          <Checkbox
            id="snippet-mount-sources"
            label={<>Mount project sources (uncheck for <code>mountSources: false</code>)</>}
            isChecked={snippetMountSources}
            onChange={(_e, checked) => setSnippetMountSources(checked)}
            style={{ marginTop: 12, marginBottom: 12 }}
          />

          <FormGroup label="sourceMapping" fieldId="snippet-src-map">
            <TextInput
              id="snippet-src-map"
              placeholder="/projects"
              value={snippetSourceMapping}
              onChange={(_e, val) => setSnippetSourceMapping(val)}
            />
          </FormGroup>
        </ModalBody>
      </Modal>
    </div>
  )
}
