import type { Agent, AgentSettings, AgentToolId, ModelOption, Project, ToolAuth } from './agentSpaceTypes'

export const AGENT_TOOLS: { id: AgentToolId; name: string; description: string }[] = [
  { id: 'claude-code', name: 'Claude Code', description: 'Anthropic AI coding agent' },
  { id: 'codex', name: 'Codex', description: 'OpenAI autonomous coding agent' },
  { id: 'opencode', name: 'OpenCode', description: 'Open-source AI coding CLI' },
]

export const MOCK_PROJECTS: Project[] = [
  { id: 'proj-1', name: 'web-app', repoUrl: 'https://github.com/acme/web-app' },
  { id: 'proj-2', name: 'api-service', repoUrl: 'https://github.com/acme/api-service' },
]

export const MOCK_AGENTS: Agent[] = [
  { id: 'agent-1', name: 'Claude - feature/auth', tool: 'claude-code', status: 'running', projectId: 'proj-1', summary: 'Implementing OAuth2 login flow', lastActivity: Date.now() - 2 * 60 * 1000 },
  { id: 'agent-2', name: 'Codex - refactor DB', tool: 'codex', status: 'stopped', projectId: 'proj-1', summary: 'Refactor database migration scripts', lastActivity: Date.now() - 14 * 60 * 60 * 1000 },
  { id: 'agent-3', name: 'Claude - fix nav styles', tool: 'claude-code', status: 'stopped', projectId: 'proj-1', summary: 'Fix sidebar navigation styling issues', lastActivity: Date.now() - 5 * 24 * 60 * 60 * 1000 },
  { id: 'agent-4', name: 'OpenCode - tests', tool: 'opencode', status: 'stopped', projectId: 'proj-2', summary: 'Add integration tests for API endpoints', lastActivity: Date.now() - 6 * 24 * 60 * 60 * 1000 },
  { id: 'agent-5', name: 'Codex - docs', tool: 'codex', status: 'running', projectId: 'proj-2', summary: 'Generate API documentation from types', lastActivity: Date.now() - 10 * 60 * 1000 },
]

export const INITIAL_AUTH: ToolAuth[] = [
  { toolId: 'claude-code', authenticated: true },
  { toolId: 'codex', authenticated: true },
  { toolId: 'opencode', authenticated: false },
]

export const PROVIDER_MODELS: Record<AgentToolId, ModelOption[]> = {
  'claude-code': [
    { id: 'opus', name: 'Opus' },
    { id: 'sonnet', name: 'Sonnet' },
    { id: 'haiku', name: 'Haiku' },
  ],
  'codex': [
    { id: 'gpt-4o', name: 'GPT-4o' },
    { id: 'o3', name: 'o3' },
    { id: 'o4-mini', name: 'o4-mini' },
  ],
  'opencode': [
    { id: 'claude-sonnet', name: 'Claude Sonnet' },
    { id: 'gpt-4o', name: 'GPT-4o' },
    { id: 'deepseek-r1', name: 'DeepSeek R1' },
  ],
}

export const CONTEXT_WINDOW_OPTIONS: { id: string; label: string }[] = [
  { id: '128k', label: '128K' },
  { id: '200k', label: '200K' },
  { id: '1m', label: '1M' },
]

export const DEFAULT_AGENT_SETTINGS: AgentSettings = {
  reasoningMode: 'standard',
  model: 'opus',
  contextWindow: '200k',
  fastMode: false,
  agentMode: 'build',
  accessMode: 'full-access',
}

export const MOCK_TERMINAL_OUTPUT: Record<AgentToolId, string[]> = {
  'claude-code': [
    '$ claude',
    'Claude Code v1.0.0',
    'Connecting to workspace...',
    'Connected to acme/web-app',
    'Ready. Type your request or use /help for commands.',
    '> ',
  ],
  'codex': [
    '$ codex',
    'Codex Agent v0.1',
    'Initializing sandbox...',
    'Sandbox ready.',
    'Enter a prompt to begin.',
    '> ',
  ],
  'opencode': [
    '$ opencode',
    'OpenCode v0.2.0',
    'Loading project context...',
    'Project loaded: api-service',
    'Ready for instructions.',
    '> ',
  ],
}
