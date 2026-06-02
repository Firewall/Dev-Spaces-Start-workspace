import { useState, useEffect, useMemo } from 'react'
import { TextInput } from '@patternfly/react-core'
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
  /** Key into `DEPENDENCY_BRANDS` (simple-icons) */
  brand: string
}

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

interface EnvironmentComponentsSectionProps {
  selected: string[]
  onChange: (ids: string[]) => void
}

function ComponentIcon({ brand, size }: { brand: string; size: number }) {
  const icon = getDependencyBrandIcon(brand)
  if (icon) return <DependencyBrandIcon icon={icon} size={size} />
  return <CubeIcon style={{ fontSize: size, color: 'var(--text-muted)', flexShrink: 0 }} aria-hidden />
}

export function EnvironmentComponentsSection({ selected, onChange }: EnvironmentComponentsSectionProps) {
  const [open, setOpen] = useState(false)
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
    yamlPreview,
    snippetEnvRows,
    snippetPortRows,
    snippetVolumeRows,
    snippetMemoryLimit,
    snippetMemoryRequest,
    snippetCpuLimit,
    snippetCpuRequest,
    snippetMountSources,
    snippetSourceMapping,
  ])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      if (yamlPreview) {
        setYamlPreview(null)
        return
      }
      setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, yamlPreview])

  function toggle(id: string) {
    onChange(
      selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id],
    )
  }

  function remove(id: string) {
    onChange(selected.filter((s) => s !== id))
  }

  const selectedItems = AVAILABLE_COMPONENTS.filter((c) => selected.includes(c.id))

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        {selectedItems.map((c) => (
          <span
            key={c.id}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              height: 30,
              padding: '0 10px',
              fontSize: 14,
              background: 'var(--accent-light)',
              color: 'var(--accent)',
              borderRadius: 6,
              fontWeight: 500,
            }}
          >
            <ComponentIcon brand={c.brand} size={14} />
            {c.name}
            <button
              type="button"
              onClick={() => remove(c.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                border: 'none',
                background: 'transparent',
                color: 'var(--accent)',
                cursor: 'pointer',
                padding: 0,
                marginLeft: 2,
              }}
              aria-label={`Remove ${c.name}`}
            >
              <TimesIcon />
            </button>
          </span>
        ))}

        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-haspopup="dialog"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            border: '1px dashed var(--border)',
            borderRadius: 'var(--radius)',
            background: 'transparent',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'all var(--transition)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)'
            e.currentTarget.style.color = 'var(--accent)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)'
            e.currentTarget.style.color = 'var(--text-muted)'
          }}
        >
          <PlusCircleIcon />
        </button>
      </div>

      {open && (
        <>
        <div
          role="presentation"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0, 0, 0, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="env-components-dialog-title"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(920px, 100%)',
              maxHeight: 'min(88vh, 900px)',
              overflow: 'auto',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              padding: 24,
            }}
          >
            <h2
              id="env-components-dialog-title"
              style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, color: 'var(--text)' }}
            >
              Environment components
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Select runtimes and language stacks to include in your workspace image.
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(172px, 1fr))',
                gap: 12,
              }}
            >
              {AVAILABLE_COMPONENTS.map((c) => {
                const isSelected = selected.includes(c.id)
                return (
                  <div
                    key={c.id}
                    style={{
                      position: 'relative',
                      borderRadius: 'var(--radius)',
                      border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border)',
                      background: isSelected ? 'var(--accent-light)' : 'var(--surface-muted)',
                      minHeight: 88,
                      transition: 'border-color var(--transition), background var(--transition)',
                    }}
                  >
                    {isSelected && (
                      <span
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          zIndex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          background: 'var(--accent)',
                          color: '#fff',
                          pointerEvents: 'none',
                        }}
                        aria-hidden
                      >
                        <CheckIcon />
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => toggle(c.id)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: 8,
                        width: '100%',
                        minHeight: 88,
                        boxSizing: 'border-box',
                        padding: '12px 14px',
                        paddingBottom: 36,
                        paddingRight: isSelected ? 30 : 14,
                        textAlign: 'left',
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--text)',
                        cursor: 'pointer',
                        borderRadius: 'var(--radius)',
                      }}
                    >
                      <ComponentIcon brand={c.brand} size={24} />
                      <span style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.25 }}>{c.name}</span>
                      {c.subtitle && (
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: -4 }}>{c.subtitle}</span>
                      )}
                    </button>
                    <button
                      type="button"
                      aria-label={`View example devfile YAML for ${c.name}`}
                      onClick={(e) => {
                        e.stopPropagation()
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
                      }}
                      style={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        zIndex: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 30,
                        height: 30,
                        borderRadius: 6,
                        border: '1px solid var(--border)',
                        background: 'var(--surface)',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        transition: 'color var(--transition), border-color var(--transition), background var(--transition)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent)'
                        e.currentTarget.style.color = 'var(--accent)'
                        e.currentTarget.style.background = 'var(--accent-light)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border)'
                        e.currentTarget.style.color = 'var(--text-muted)'
                        e.currentTarget.style.background = 'var(--surface)'
                      }}
                    >
                      <FileCodeIcon />
                    </button>
                  </div>
                )
              })}
            </div>
            <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{
                  padding: '8px 16px',
                  fontSize: 14,
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: 9999,
                  background: 'var(--accent)',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>

        {yamlPreview && (
          <div
            role="presentation"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 110,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
            }}
            onClick={() => setYamlPreview(null)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="env-component-yaml-title"
              onClick={(e) => e.stopPropagation()}
              style={{
                width: 'min(560px, 100%)',
                maxHeight: 'min(72vh, 640px)',
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: '14px 16px',
                  borderBottom: '1px solid var(--border)',
                  flexShrink: 0,
                  flexGrow: 0,
                }}
              >
                <h3
                  id="env-component-yaml-title"
                  style={{ fontSize: 15, fontWeight: 600, margin: 0, color: 'var(--text)' }}
                >
                  Devfile snippet — {yamlPreview.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard.writeText(mergedSnippet).then(() => {
                        setCopyDone(true)
                        window.setTimeout(() => setCopyDone(false), 2000)
                      })
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 12px',
                      fontSize: 13,
                      fontWeight: 500,
                      border: '1px solid var(--border)',
                      borderRadius: 6,
                      background: 'var(--surface-muted)',
                      color: 'var(--text)',
                      cursor: 'pointer',
                    }}
                  >
                    <CopyIcon />
                    {copyDone ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setYamlPreview(null)}
                    aria-label="Close"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 34,
                      height: 34,
                      border: 'none',
                      borderRadius: 6,
                      background: 'transparent',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    <TimesIcon />
                  </button>
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  minHeight: 0,
                  overflow: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '10px 16px 0', lineHeight: 1.45 }}>
                  Example <code style={{ fontSize: 12 }}>components</code> entry you can merge into your devfile. Image tags are
                  illustrative; adjust for your registry and version policy.
                </p>
                <pre
                  style={{
                    margin: '12px 16px 0',
                    padding: 14,
                    fontSize: 12,
                    lineHeight: 1.5,
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                    background: 'var(--surface-muted)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    overflow: 'auto',
                    flexShrink: 0,
                    color: 'var(--text)',
                  }}
                >
                  <code>{mergedSnippet}</code>
                </pre>

                <div style={{ padding: '16px 16px 18px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, margin: '0 0 8px', color: 'var(--text)' }}>
                    Environment variables
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {snippetEnvRows.map((row) => (
                      <div key={row.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <TextInput
                          aria-label="Variable name"
                          placeholder="NAME"
                          value={row.name}
                          onChange={(_e, val) =>
                            setSnippetEnvRows((rows) =>
                              rows.map((r) => (r.id === row.id ? { ...r, name: val } : r)),
                            )
                          }
                          style={{ flex: 1, height: 34, fontSize: 13, minWidth: 0 }}
                        />
                        <TextInput
                          aria-label="Value"
                          placeholder="value"
                          value={row.value}
                          onChange={(_e, val) =>
                            setSnippetEnvRows((rows) =>
                              rows.map((r) => (r.id === row.id ? { ...r, value: val } : r)),
                            )
                          }
                          style={{ flex: 1.2, height: 34, fontSize: 13, minWidth: 0 }}
                        />
                        <button
                          type="button"
                          aria-label="Remove variable row"
                          onClick={() =>
                            setSnippetEnvRows((rows) =>
                              rows.length <= 1
                                ? [{ id: newSnippetRowId(), name: '', value: '' }]
                                : rows.filter((r) => r.id !== row.id),
                            )
                          }
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 34,
                            height: 34,
                            flexShrink: 0,
                            border: '1px solid var(--border)',
                            borderRadius: 6,
                            background: 'var(--surface-muted)',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                          }}
                        >
                          <TimesIcon />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setSnippetEnvRows((rows) => [...rows, { id: newSnippetRowId(), name: '', value: '' }])
                    }
                    style={{
                      marginTop: 8,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 10px',
                      fontSize: 13,
                      fontWeight: 500,
                      border: '1px dashed var(--border)',
                      borderRadius: 6,
                      background: 'transparent',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                    }}
                  >
                    <PlusCircleIcon />
                    Add variable
                  </button>

                  <p style={{ fontSize: 12, fontWeight: 600, margin: '18px 0 8px', color: 'var(--text)' }}>Ports</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 8px', lineHeight: 1.45 }}>
                    Adds <code style={{ fontSize: 11 }}>endpoints</code> with <code style={{ fontSize: 11 }}>exposure: public</code>
                    (typical for apps you open in the browser). Change exposure in your devfile if you need internal-only routes.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {snippetPortRows.map((row) => (
                      <div key={row.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <TextInput
                          aria-label="Endpoint name"
                          placeholder="http-3000"
                          value={row.name}
                          onChange={(_e, val) =>
                            setSnippetPortRows((rows) =>
                              rows.map((r) => (r.id === row.id ? { ...r, name: val } : r)),
                            )
                          }
                          style={{ flex: 1, height: 34, fontSize: 13, minWidth: 0 }}
                        />
                        <input
                          type="number"
                          aria-label="Target port"
                          placeholder="3000"
                          min={1}
                          max={65535}
                          value={row.port}
                          onChange={(e) =>
                            setSnippetPortRows((rows) =>
                              rows.map((r) => (r.id === row.id ? { ...r, port: e.target.value } : r)),
                            )
                          }
                          style={{
                            width: 96,
                            flexShrink: 0,
                            height: 34,
                            padding: '0 10px',
                            fontSize: 13,
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius)',
                            background: 'var(--surface)',
                            color: 'var(--text)',
                            boxSizing: 'border-box',
                          }}
                        />
                        <button
                          type="button"
                          aria-label="Remove port row"
                          onClick={() =>
                            setSnippetPortRows((rows) =>
                              rows.length <= 1
                                ? [{ id: newSnippetRowId(), name: '', port: '' }]
                                : rows.filter((r) => r.id !== row.id),
                            )
                          }
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 34,
                            height: 34,
                            flexShrink: 0,
                            border: '1px solid var(--border)',
                            borderRadius: 6,
                            background: 'var(--surface-muted)',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                          }}
                        >
                          <TimesIcon />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setSnippetPortRows((rows) => [...rows, { id: newSnippetRowId(), name: '', port: '' }])
                    }
                    style={{
                      marginTop: 8,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 10px',
                      fontSize: 13,
                      fontWeight: 500,
                      border: '1px dashed var(--border)',
                      borderRadius: 6,
                      background: 'transparent',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                    }}
                  >
                    <PlusCircleIcon />
                    Add port
                  </button>

                  <p style={{ fontSize: 12, fontWeight: 600, margin: '18px 0 8px', color: 'var(--text)' }}>
                    Volume mounts
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 8px', lineHeight: 1.45 }}>
                    <code style={{ fontSize: 11 }}>name</code> must match a <code style={{ fontSize: 11 }}>volume</code>{' '}
                    component in your devfile (for example <code style={{ fontSize: 11 }}>projects</code> for the
                    workspace sources).
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {snippetVolumeRows.map((row) => (
                      <div key={row.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <TextInput
                          aria-label="Volume component name"
                          placeholder="projects"
                          value={row.volumeName}
                          onChange={(_e, val) =>
                            setSnippetVolumeRows((rows) =>
                              rows.map((r) => (r.id === row.id ? { ...r, volumeName: val } : r)),
                            )
                          }
                          style={{ flex: 1, height: 34, fontSize: 13, minWidth: 0 }}
                        />
                        <TextInput
                          aria-label="Mount path"
                          placeholder="/where/to/mount"
                          value={row.path}
                          onChange={(_e, val) =>
                            setSnippetVolumeRows((rows) =>
                              rows.map((r) => (r.id === row.id ? { ...r, path: val } : r)),
                            )
                          }
                          style={{ flex: 1.2, height: 34, fontSize: 13, minWidth: 0 }}
                        />
                        <button
                          type="button"
                          aria-label="Remove volume mount row"
                          onClick={() =>
                            setSnippetVolumeRows((rows) =>
                              rows.length <= 1
                                ? [{ id: newSnippetRowId(), volumeName: '', path: '' }]
                                : rows.filter((r) => r.id !== row.id),
                            )
                          }
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 34,
                            height: 34,
                            flexShrink: 0,
                            border: '1px solid var(--border)',
                            borderRadius: 6,
                            background: 'var(--surface-muted)',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                          }}
                        >
                          <TimesIcon />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setSnippetVolumeRows((rows) => [
                        ...rows,
                        { id: newSnippetRowId(), volumeName: '', path: '' },
                      ])
                    }
                    style={{
                      marginTop: 8,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 10px',
                      fontSize: 13,
                      fontWeight: 500,
                      border: '1px dashed var(--border)',
                      borderRadius: 6,
                      background: 'transparent',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                    }}
                  >
                    <PlusCircleIcon />
                    Add volume mount
                  </button>

                  <p style={{ fontSize: 12, fontWeight: 600, margin: '18px 0 8px', color: 'var(--text)' }}>
                    Resources and sources
                  </p>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 10,
                      marginBottom: 12,
                    }}
                  >
                    <div>
                      <label
                        htmlFor="snippet-mem-limit"
                        style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}
                      >
                        memoryLimit
                      </label>
                      <TextInput
                        id="snippet-mem-limit"
                        placeholder="2Gi"
                        value={snippetMemoryLimit}
                        onChange={(_e, val) => setSnippetMemoryLimit(val)}
                        style={{ height: 34, fontSize: 13 }}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="snippet-mem-req"
                        style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}
                      >
                        memoryRequest
                      </label>
                      <TextInput
                        id="snippet-mem-req"
                        placeholder="512Mi"
                        value={snippetMemoryRequest}
                        onChange={(_e, val) => setSnippetMemoryRequest(val)}
                        style={{ height: 34, fontSize: 13 }}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="snippet-cpu-limit"
                        style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}
                      >
                        cpuLimit
                      </label>
                      <TextInput
                        id="snippet-cpu-limit"
                        placeholder="2"
                        value={snippetCpuLimit}
                        onChange={(_e, val) => setSnippetCpuLimit(val)}
                        style={{ height: 34, fontSize: 13 }}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="snippet-cpu-req"
                        style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}
                      >
                        cpuRequest
                      </label>
                      <TextInput
                        id="snippet-cpu-req"
                        placeholder="500m"
                        value={snippetCpuRequest}
                        onChange={(_e, val) => setSnippetCpuRequest(val)}
                        style={{ height: 34, fontSize: 13 }}
                      />
                    </div>
                  </div>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 13,
                      color: 'var(--text)',
                      cursor: 'pointer',
                      marginBottom: 10,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={snippetMountSources}
                      onChange={(e) => setSnippetMountSources(e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: 'var(--accent)', cursor: 'pointer' }}
                    />
                    Mount project sources (uncheck for <code style={{ fontSize: 11 }}>mountSources: false</code>)
                  </label>
                  <div>
                    <label
                      htmlFor="snippet-src-map"
                      style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}
                    >
                      sourceMapping
                    </label>
                    <TextInput
                      id="snippet-src-map"
                      placeholder="/projects"
                      value={snippetSourceMapping}
                      onChange={(_e, val) => setSnippetSourceMapping(val)}
                      style={{ height: 34, fontSize: 13 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        </>
      )}
    </div>
  )
}
