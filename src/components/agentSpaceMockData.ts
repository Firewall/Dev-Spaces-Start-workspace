import type { Agent, AgentSettings, AgentToolId, ModelOption, Project, ToolAuth } from './agentSpaceTypes'

export const AGENT_TOOLS: { id: AgentToolId; name: string; description: string }[] = [
  { id: 'claude-code', name: 'Claude Code', description: 'Anthropic AI coding agent' },
  { id: 'codex', name: 'Codex', description: 'OpenAI autonomous coding agent' },
  { id: 'opencode', name: 'OpenCode', description: 'Open-source AI coding CLI' },
  { id: 'openshift-ai', name: 'OpenShift AI', description: 'Local models via OpenShift AI' },
]

export const MOCK_PROJECTS: Project[] = [
  { id: 'proj-1', name: 'web-app', repoUrl: 'https://github.com/acme/web-app' },
  { id: 'proj-2', name: 'api-service', repoUrl: 'https://github.com/acme/api-service' },
]

export const MOCK_AGENTS: Agent[] = [
  // web-app agents
  { id: 'agent-1', name: 'Claude Code - Implementing OAuth2 login flow', tool: 'claude-code', status: 'running', projectId: 'proj-1', summary: 'Implementing OAuth2 login flow', lastActivity: Date.now() - 2 * 60 * 1000 },
  { id: 'agent-6', name: 'Claude Code - Add user profile settings page', tool: 'claude-code', status: 'running', projectId: 'proj-1', summary: 'Add user profile settings page', lastActivity: Date.now() - 8 * 60 * 1000 },
  { id: 'agent-2', name: 'Codex - Refactor database migration scripts', tool: 'codex', status: 'stopped', projectId: 'proj-1', summary: 'Refactor database migration scripts', lastActivity: Date.now() - 14 * 60 * 60 * 1000 },
  { id: 'agent-7', name: 'Codex - Upgrade React Router to v7', tool: 'codex', status: 'stopped', projectId: 'proj-1', summary: 'Upgrade React Router to v7', lastActivity: Date.now() - 2 * 24 * 60 * 60 * 1000 },
  { id: 'agent-8', name: 'OpenShift AI - Investigate memory leak in dashboard', tool: 'openshift-ai', status: 'stopped', projectId: 'proj-1', summary: 'Investigate memory leak in dashboard', lastActivity: Date.now() - 3 * 24 * 60 * 60 * 1000 },
  { id: 'agent-3', name: 'Claude Code - Fix sidebar navigation styling issues', tool: 'claude-code', status: 'stopped', projectId: 'proj-1', summary: 'Fix sidebar navigation styling issues', lastActivity: Date.now() - 5 * 24 * 60 * 60 * 1000 },
  { id: 'agent-9', name: 'Claude Code - Add dark mode theme support', tool: 'claude-code', status: 'stopped', projectId: 'proj-1', summary: 'Add dark mode theme support', lastActivity: Date.now() - 7 * 24 * 60 * 60 * 1000 },
  // api-service agents
  { id: 'agent-10', name: 'Claude Code - Fix rate limiting middleware', tool: 'claude-code', status: 'running', projectId: 'proj-2', summary: 'Fix rate limiting middleware', lastActivity: Date.now() - 3 * 60 * 1000 },
  { id: 'agent-5', name: 'Codex - Generate API documentation from types', tool: 'codex', status: 'running', projectId: 'proj-2', summary: 'Generate API documentation from types', lastActivity: Date.now() - 10 * 60 * 1000 },
  { id: 'agent-11', name: 'Claude Code - Add GraphQL subscriptions for real-time', tool: 'claude-code', status: 'stopped', projectId: 'proj-2', summary: 'Add GraphQL subscriptions for real-time', lastActivity: Date.now() - 1 * 24 * 60 * 60 * 1000 },
  { id: 'agent-12', name: 'OpenCode - Optimize database query performance', tool: 'opencode', status: 'stopped', projectId: 'proj-2', summary: 'Optimize database query performance', lastActivity: Date.now() - 4 * 24 * 60 * 60 * 1000 },
  { id: 'agent-4', name: 'OpenCode - Add integration tests for API endpoints', tool: 'opencode', status: 'stopped', projectId: 'proj-2', summary: 'Add integration tests for API endpoints', lastActivity: Date.now() - 6 * 24 * 60 * 60 * 1000 },
  { id: 'agent-13', name: 'Codex - Set up CI/CD pipeline with GitHub Actions', tool: 'codex', status: 'stopped', projectId: 'proj-2', summary: 'Set up CI/CD pipeline with GitHub Actions', lastActivity: Date.now() - 10 * 24 * 60 * 60 * 1000 },
]

export const INITIAL_AUTH: ToolAuth[] = [
  { toolId: 'claude-code', authenticated: true },
  { toolId: 'codex', authenticated: true },
  { toolId: 'opencode', authenticated: false },
  { toolId: 'openshift-ai', authenticated: false },
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
  'openshift-ai': [
    { id: 'granite-3b', name: 'Granite 3B' },
    { id: 'granite-8b', name: 'Granite 8B' },
    { id: 'granite-34b', name: 'Granite 34B' },
    { id: 'llama-3-8b', name: 'Llama 3 8B' },
    { id: 'mistral-7b-instruct', name: 'Mistral 7B Instruct' },
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
  'openshift-ai': [
    '$ openshift-ai',
    'OpenShift AI CLI v0.1.0',
    'Connecting to model serving endpoint...',
    'Model server ready: granite-8b',
    'Project loaded.',
    'Ready for instructions.',
    '> ',
  ],
}
