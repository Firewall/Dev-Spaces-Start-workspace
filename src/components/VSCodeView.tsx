import { useState } from 'react'
import {
  FileCodeIcon,
  FolderIcon,
  FolderOpenIcon,
  SearchIcon,
  CodeBranchIcon,
  CubesIcon,
  BugIcon,
  CogIcon,
  TimesIcon,
  BellIcon,
  ExclamationTriangleIcon,
  InfoCircleIcon,
} from '@patternfly/react-icons'

const ACTIVITY_ICONS = [
  { id: 'explorer', icon: <FileCodeIcon />, label: 'Explorer' },
  { id: 'search', icon: <SearchIcon />, label: 'Search' },
  { id: 'git', icon: <CodeBranchIcon />, label: 'Source Control' },
  { id: 'debug', icon: <BugIcon />, label: 'Run and Debug' },
  { id: 'extensions', icon: <CubesIcon />, label: 'Extensions' },
]

interface FileNode {
  name: string
  path: string
  type: 'file' | 'folder'
  children?: FileNode[]
  lang?: string
}

const FILE_TREE: FileNode[] = [
  {
    name: 'src', path: 'src', type: 'folder', children: [
      {
        name: 'components', path: 'src/components', type: 'folder', children: [
          { name: 'App.tsx', path: 'src/components/App.tsx', type: 'file', lang: 'typescriptreact' },
          { name: 'Header.tsx', path: 'src/components/Header.tsx', type: 'file', lang: 'typescriptreact' },
          { name: 'Sidebar.tsx', path: 'src/components/Sidebar.tsx', type: 'file', lang: 'typescriptreact' },
        ],
      },
      {
        name: 'services', path: 'src/services', type: 'folder', children: [
          { name: 'api.ts', path: 'src/services/api.ts', type: 'file', lang: 'typescript' },
          { name: 'auth.ts', path: 'src/services/auth.ts', type: 'file', lang: 'typescript' },
        ],
      },
      { name: 'index.ts', path: 'src/index.ts', type: 'file', lang: 'typescript' },
    ],
  },
  { name: '.gitignore', path: '.gitignore', type: 'file' },
  { name: 'package.json', path: 'package.json', type: 'file', lang: 'json' },
  { name: 'tsconfig.json', path: 'tsconfig.json', type: 'file', lang: 'json' },
  { name: 'README.md', path: 'README.md', type: 'file', lang: 'markdown' },
]

const FILE_CONTENTS: Record<string, string> = {
  'src/components/App.tsx': `import React from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

export function App() {
  return (
    <div className="app">
      <Header />
      <div className="app-body">
        <Sidebar />
        <main className="content">
          <h1>Welcome</h1>
          <p>Getting started with the project.</p>
        </main>
      </div>
    </div>
  )
}`,
  'src/components/Header.tsx': `import React from 'react'

interface HeaderProps {
  title?: string
}

export function Header({ title = 'My App' }: HeaderProps) {
  return (
    <header className="header">
      <h1>{title}</h1>
      <nav>
        <a href="/home">Home</a>
        <a href="/about">About</a>
      </nav>
    </header>
  )
}`,
  'src/components/Sidebar.tsx': `import React, { useState } from 'react'

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
  { id: 'profile', label: 'Profile', icon: '👤' },
]

export function Sidebar() {
  const [active, setActive] = useState('dashboard')

  return (
    <aside className="sidebar">
      {MENU_ITEMS.map(item => (
        <button
          key={item.id}
          className={active === item.id ? 'active' : ''}
          onClick={() => setActive(item.id)}
        >
          {item.icon} {item.label}
        </button>
      ))}
    </aside>
  )
}`,
  'src/services/api.ts': `const BASE_URL = process.env.API_URL || 'https://api.example.com'

export async function fetchData<T>(endpoint: string): Promise<T> {
  const response = await fetch(\`\${BASE_URL}\${endpoint}\`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${getToken()}\`,
    },
  })

  if (!response.ok) {
    throw new Error(\`HTTP \${response.status}: \${response.statusText}\`)
  }

  return response.json()
}

function getToken(): string {
  return localStorage.getItem('auth_token') || ''
}`,
  'src/services/auth.ts': `import { fetchData } from './api'

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
}

export async function login(email: string, password: string): Promise<User> {
  const response = await fetchData<{ user: User; token: string }>('/auth/login')
  localStorage.setItem('auth_token', response.token)
  return response.user
}

export function logout(): void {
  localStorage.removeItem('auth_token')
  window.location.href = '/login'
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('auth_token')
}`,
  'src/index.ts': `import { App } from './components/App'

const root = document.getElementById('root')
if (root) {
  // Bootstrap application
  console.log('Starting application...')
}`,
  'package.json': `{
  "name": "my-project",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .ts,.tsx",
    "test": "vitest"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "@types/react": "^18.2.0"
  }
}`,
  'tsconfig.json': `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "outDir": "dist",
    "rootDir": "src",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"]
}`,
  'README.md': `# My Project

A modern web application built with React and TypeScript.

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Scripts

- \`dev\` — Start development server
- \`build\` — Build for production
- \`test\` — Run tests
`,
  '.gitignore': `node_modules/
dist/
.env
.env.local
*.log
.DS_Store`,
}

const TERMINAL_LINES = [
  { prompt: true, text: 'npm run dev' },
  { prompt: false, text: '' },
  { prompt: false, text: '  VITE v5.0.12  ready in 284 ms' },
  { prompt: false, text: '' },
  { prompt: false, text: '  ➜  Local:   http://localhost:5173/' },
  { prompt: false, text: '  ➜  Network: http://192.168.1.42:5173/' },
  { prompt: false, text: '  ➜  press h + enter to show help' },
]

function getFileIcon(name: string) {
  if (name.endsWith('.tsx') || name.endsWith('.ts')) return { color: '#519aba' }
  if (name.endsWith('.json')) return { color: '#cbcb41' }
  if (name.endsWith('.md')) return { color: '#519aba' }
  return { color: '#8c8c8c' }
}

function SidebarTree({ nodes, depth, selectedFile, expanded, onSelect, onToggle }: {
  nodes: FileNode[]
  depth: number
  selectedFile: string
  expanded: Set<string>
  onSelect: (path: string) => void
  onToggle: (path: string) => void
}) {
  return (
    <>
      {nodes.map(node => {
        const isFolder = node.type === 'folder'
        const isOpen = expanded.has(node.path)
        const isActive = node.path === selectedFile
        const iconStyle = getFileIcon(node.name)

        return (
          <div key={node.path}>
            <div
              onClick={() => isFolder ? onToggle(node.path) : onSelect(node.path)}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '1px 0', paddingLeft: 16 + depth * 12,
                cursor: 'pointer', fontSize: 13, lineHeight: '22px',
                background: isActive ? '#37373d' : undefined,
                color: isActive ? '#ffffff' : '#cccccc',
              }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = '#2a2d2e' }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = '' }}
            >
              {isFolder ? (
                <>
                  <span style={{ fontSize: 10, width: 10, textAlign: 'center', flexShrink: 0, opacity: 0.7 }}>{isOpen ? '▾' : '▸'}</span>
                  {isOpen
                    ? <FolderOpenIcon style={{ fontSize: 14, color: '#dcb67a', flexShrink: 0 }} />
                    : <FolderIcon style={{ fontSize: 14, color: '#dcb67a', flexShrink: 0 }} />}
                </>
              ) : (
                <>
                  <span style={{ width: 10, flexShrink: 0 }} />
                  <FileCodeIcon style={{ fontSize: 14, color: iconStyle.color, flexShrink: 0 }} />
                </>
              )}
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{node.name}</span>
            </div>
            {isFolder && isOpen && node.children && (
              <SidebarTree
                nodes={node.children}
                depth={depth + 1}
                selectedFile={selectedFile}
                expanded={expanded}
                onSelect={onSelect}
                onToggle={onToggle}
              />
            )}
          </div>
        )
      })}
    </>
  )
}

interface VSCodeViewProps {
  projectName?: string
  onBack: () => void
}

export function VSCodeView({ projectName = 'my-project', onBack }: VSCodeViewProps) {
  const [activeActivity, setActiveActivity] = useState('explorer')
  const [openTabs, setOpenTabs] = useState<string[]>(['src/components/App.tsx'])
  const [activeTab, setActiveTab] = useState('src/components/App.tsx')
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(['src', 'src/components', 'src/services']))
  const [terminalOpen, setTerminalOpen] = useState(true)

  const toggleFolder = (path: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  const openFile = (path: string) => {
    if (!openTabs.includes(path)) setOpenTabs(prev => [...prev, path])
    setActiveTab(path)
  }

  const closeTab = (path: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setOpenTabs(prev => {
      const next = prev.filter(t => t !== path)
      if (activeTab === path) setActiveTab(next[next.length - 1] || '')
      return next
    })
  }

  const content = FILE_CONTENTS[activeTab] ?? ''
  const lines = content.split('\n')
  const fileName = activeTab.split('/').pop() ?? ''

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#1e1e1e', color: '#cccccc' }}>
      {/* Title bar */}
      <div style={{
        height: 30, minHeight: 30,
        background: '#323233',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, color: '#a0a0a0',
        borderBottom: '1px solid #191919',
        position: 'relative',
      }}>
        <button
          onClick={onBack}
          style={{
            position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', color: '#a0a0a0', cursor: 'pointer',
            fontSize: 12, display: 'flex', alignItems: 'center', gap: 4,
            padding: '2px 8px', borderRadius: 4,
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#3c3c3c')}
          onMouseLeave={e => (e.currentTarget.style.background = '')}
        >
          ← Back to Agent Space
        </button>
        <span>{fileName ? `${fileName} — ${projectName}` : projectName} — Visual Studio Code</span>
      </div>

      {/* Main body */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* Activity bar */}
        <div style={{
          width: 48, minWidth: 48, background: '#333333',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          paddingTop: 4,
          borderRight: '1px solid #191919',
        }}>
          {ACTIVITY_ICONS.map(item => (
            <div
              key={item.id}
              onClick={() => setActiveActivity(item.id)}
              title={item.label}
              style={{
                width: 48, height: 48,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: 22,
                color: activeActivity === item.id ? '#ffffff' : '#808080',
                borderLeft: activeActivity === item.id ? '2px solid #ffffff' : '2px solid transparent',
                boxSizing: 'border-box',
              }}
            >
              {item.icon}
            </div>
          ))}
          <div style={{ flex: 1 }} />
          <div
            onClick={() => {}}
            title="Settings"
            style={{
              width: 48, height: 48,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: 20, color: '#808080',
            }}
          >
            <CogIcon />
          </div>
        </div>

        {/* Sidebar panel */}
        <div style={{
          width: 240, minWidth: 240, background: '#252526',
          borderRight: '1px solid #191919',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '10px 16px',
            fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px',
            color: '#bbbbbb',
          }}>
            {activeActivity === 'explorer' ? 'Explorer' : ACTIVITY_ICONS.find(a => a.id === activeActivity)?.label}
          </div>

          {activeActivity === 'explorer' && (
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <div style={{
                padding: '4px 16px', fontSize: 11, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.5px', color: '#bbbbbb',
                display: 'flex', alignItems: 'center',
              }}>
                {projectName}
              </div>
              <SidebarTree
                nodes={FILE_TREE}
                depth={0}
                selectedFile={activeTab}
                expanded={expanded}
                onSelect={openFile}
                onToggle={toggleFolder}
              />
            </div>
          )}

          {activeActivity === 'search' && (
            <div style={{ padding: '8px 12px' }}>
              <div style={{
                display: 'flex', alignItems: 'center',
                background: '#3c3c3c', border: '1px solid #3c3c3c',
                borderRadius: 2, padding: '4px 8px', gap: 6,
              }}>
                <SearchIcon style={{ fontSize: 13, color: '#808080' }} />
                <span style={{ fontSize: 13, color: '#808080' }}>Search</span>
              </div>
            </div>
          )}

          {activeActivity === 'git' && (
            <div style={{ padding: '8px 16px', fontSize: 13 }}>
              <div style={{ color: '#cccccc', marginBottom: 8 }}>Source Control</div>
              <div style={{ fontSize: 12, color: '#808080' }}>
                <div style={{ marginBottom: 4 }}>main</div>
                <div>No changes</div>
              </div>
            </div>
          )}

          {activeActivity === 'debug' && (
            <div style={{ padding: '8px 16px', fontSize: 13, color: '#808080' }}>
              No debug configurations found.
            </div>
          )}

          {activeActivity === 'extensions' && (
            <div style={{ padding: '8px 12px' }}>
              <div style={{
                display: 'flex', alignItems: 'center',
                background: '#3c3c3c', border: '1px solid #3c3c3c',
                borderRadius: 2, padding: '4px 8px', gap: 6, marginBottom: 12,
              }}>
                <span style={{ fontSize: 13, color: '#808080' }}>Search Extensions</span>
              </div>
              {['ESLint', 'Prettier', 'TypeScript Importer', 'GitLens'].map(ext => (
                <div key={ext} style={{
                  padding: '6px 4px', fontSize: 12, color: '#cccccc',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <CubesIcon style={{ fontSize: 16, color: '#519aba' }} />
                  {ext}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Editor + Terminal area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Editor tabs */}
          <div style={{
            display: 'flex', background: '#252526', minHeight: 35, maxHeight: 35,
            borderBottom: '1px solid #191919',
            overflowX: 'auto',
          }}>
            {openTabs.map(tab => {
              const tabName = tab.split('/').pop() ?? tab
              const isActive = tab === activeTab
              const iconStyle = getFileIcon(tabName)
              return (
                <div
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '0 12px', fontSize: 13, cursor: 'pointer',
                    background: isActive ? '#1e1e1e' : '#2d2d2d',
                    color: isActive ? '#ffffff' : '#969696',
                    borderRight: '1px solid #191919',
                    borderTop: isActive ? '1px solid #007acc' : '1px solid transparent',
                    whiteSpace: 'nowrap',
                    minWidth: 0,
                  }}
                >
                  <FileCodeIcon style={{ fontSize: 13, color: iconStyle.color, flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{tabName}</span>
                  <span
                    onClick={e => closeTab(tab, e)}
                    style={{
                      fontSize: 14, color: '#808080', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', marginLeft: 4, flexShrink: 0,
                      borderRadius: 3, padding: 1,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#3c3c3c')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                  >
                    <TimesIcon style={{ fontSize: 10 }} />
                  </span>
                </div>
              )
            })}
          </div>

          {/* Breadcrumb */}
          {activeTab && (
            <div style={{
              padding: '2px 12px', fontSize: 12, color: '#808080',
              background: '#1e1e1e', borderBottom: '1px solid #191919',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              {activeTab.split('/').map((part, i, arr) => (
                <span key={i}>
                  {i > 0 && <span style={{ margin: '0 2px' }}> › </span>}
                  <span style={{ color: i === arr.length - 1 ? '#cccccc' : '#808080' }}>{part}</span>
                </span>
              ))}
            </div>
          )}

          {/* Code editor area */}
          <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', background: '#1e1e1e' }}>
            {activeTab ? (
              <div style={{ display: 'flex', minHeight: '100%' }}>
                {/* Minimap gutter */}
                <div style={{ flex: 1 }}>
                  <table style={{
                    borderCollapse: 'collapse', width: '100%',
                    fontFamily: '"SF Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
                    fontSize: 13, lineHeight: '20px',
                  }}>
                    <tbody>
                      {lines.map((line, i) => (
                        <tr key={i} style={{ height: 20 }}>
                          <td style={{
                            textAlign: 'right', padding: '0 16px 0 16px',
                            color: '#858585', userSelect: 'none',
                            width: 50, minWidth: 50, fontSize: 13,
                          }}>
                            {i + 1}
                          </td>
                          <td style={{ padding: '0 16px 0 0', whiteSpace: 'pre', color: '#d4d4d4' }}>
                            {line}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Minimap */}
                <div style={{
                  width: 64, minWidth: 64, background: '#1e1e1e',
                  borderLeft: '1px solid #191919',
                  padding: '4px 4px',
                  overflow: 'hidden',
                }}>
                  {lines.map((line, i) => (
                    <div key={i} style={{
                      height: 3, marginBottom: 1,
                      background: line.trim() ? 'rgba(200,200,200,0.15)' : 'transparent',
                      width: `${Math.min(line.length * 1.2, 56)}px`,
                      borderRadius: 1,
                    }} />
                  ))}
                </div>
              </div>
            ) : (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '100%', color: '#808080', fontSize: 14,
              }}>
                Open a file to start editing
              </div>
            )}
          </div>

          {/* Terminal panel */}
          {terminalOpen && (
            <div style={{
              height: 180, minHeight: 180,
              borderTop: '1px solid #191919',
              display: 'flex', flexDirection: 'column',
              background: '#1e1e1e',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 12px', height: 34, minHeight: 34,
                background: '#252526', borderBottom: '1px solid #191919',
              }}>
                <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
                  {['PROBLEMS', 'OUTPUT', 'DEBUG CONSOLE', 'TERMINAL'].map((tab, i) => (
                    <span
                      key={tab}
                      style={{
                        color: i === 3 ? '#cccccc' : '#808080',
                        cursor: 'pointer',
                        borderBottom: i === 3 ? '1px solid #cccccc' : '1px solid transparent',
                        paddingBottom: 2,
                        fontWeight: i === 3 ? 500 : 400,
                      }}
                    >
                      {tab}
                    </span>
                  ))}
                </div>
                <span
                  onClick={() => setTerminalOpen(false)}
                  style={{ cursor: 'pointer', color: '#808080', fontSize: 14, display: 'flex' }}
                >
                  <TimesIcon style={{ fontSize: 10 }} />
                </span>
              </div>
              <div style={{
                flex: 1, padding: '8px 12px', overflowY: 'auto',
                fontFamily: '"SF Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                fontSize: 13, lineHeight: '20px',
              }}>
                {TERMINAL_LINES.map((line, i) => (
                  <div key={i} style={{ color: line.prompt ? '#4ec9b0' : '#d4d4d4' }}>
                    {line.prompt && <span style={{ color: '#6a9955' }}>❯ </span>}
                    {line.text}
                  </div>
                ))}
                <span style={{ animation: 'blink 1s step-end infinite', color: '#cccccc' }}>&#9612;</span>
                <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div style={{
        height: 22, minHeight: 22,
        background: '#007acc',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 10px',
        fontSize: 12, color: '#ffffff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <CodeBranchIcon style={{ fontSize: 12 }} /> main
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <ExclamationTriangleIcon style={{ fontSize: 11 }} /> 0
            <InfoCircleIcon style={{ fontSize: 11 }} /> 0
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {activeTab && <span>Ln 1, Col 1</span>}
          <span>Spaces: 2</span>
          <span>UTF-8</span>
          {activeTab && <span>{fileName.endsWith('.tsx') ? 'TypeScript React' : fileName.endsWith('.ts') ? 'TypeScript' : fileName.endsWith('.json') ? 'JSON' : 'Plain Text'}</span>}
          <BellIcon style={{ fontSize: 12 }} />
        </div>
      </div>
    </div>
  )
}
