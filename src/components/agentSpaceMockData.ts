import type { Agent, AgentSettings, AgentToolId, InferenceProviderId, ModelOption, Project, ToolAuth } from './agentSpaceTypes'

export const AGENT_TOOLS: { id: AgentToolId; name: string; description: string }[] = [
  { id: 'claude-code', name: 'Claude Code', description: 'Anthropic AI coding agent' },
  { id: 'codex', name: 'Codex', description: 'OpenAI autonomous coding agent' },
  { id: 'opencode', name: 'OpenCode', description: 'Open-source AI coding CLI' },
  { id: 'cursor-agent', name: 'Cursor Agent', description: 'AI-powered code editor agent' },
]

export const MOCK_PROJECTS: Project[] = [
  { id: 'proj-1', name: 'web-app', repoUrl: 'https://github.com/acme/web-app' },
  { id: 'proj-2', name: 'api-service', repoUrl: 'https://github.com/acme/api-service' },
]

export const MOCK_AGENTS: Agent[] = [
  // web-app agents
  { id: 'agent-1', name: 'OpenCode - OAuth2 login flow', tool: 'opencode', status: 'running', projectId: 'proj-1', summary: 'Implementing OAuth2 login flow', lastActivity: Date.now() - 2 * 60 * 1000, model: 'Kimi K3', branch: 'feature/oauth2-login' },
  { id: 'agent-6', name: 'OpenCode - User profile page', tool: 'opencode', status: 'running', projectId: 'proj-1', summary: 'Add user profile settings page', lastActivity: Date.now() - 8 * 60 * 1000, model: 'Kimi K3', branch: 'feature/user-profile' },
  { id: 'agent-2', name: 'OpenCode - DB migrations', tool: 'opencode', status: 'running', projectId: 'proj-1', summary: 'Refactor database migration scripts', lastActivity: Date.now() - 14 * 60 * 60 * 1000, model: 'Llama 3.3 70B', branch: 'refactor/db-migrations' },
  { id: 'agent-7', name: 'Claude Code - React Router', tool: 'claude-code', status: 'running', projectId: 'proj-1', summary: 'Upgrade React Router to v7', lastActivity: Date.now() - 2 * 24 * 60 * 60 * 1000, model: 'Sonnet 5', branch: 'chore/react-router-v7' },
  { id: 'agent-8', name: 'OpenCode - Memory leak', tool: 'opencode', status: 'running', projectId: 'proj-1', summary: 'Investigate memory leak in dashboard', lastActivity: Date.now() - 3 * 24 * 60 * 60 * 1000, model: 'Granite 4.0 H', branch: 'bugfix/dashboard-leak' },
  { id: 'agent-3', name: 'OpenCode - Sidebar nav', tool: 'opencode', status: 'stopped', projectId: 'proj-1', summary: 'Fix sidebar navigation styling issues', lastActivity: Date.now() - 5 * 24 * 60 * 60 * 1000, model: 'DeepSeek V3.2', branch: 'bugfix/sidebar-nav' },
  { id: 'agent-9', name: 'OpenCode - Dark mode', tool: 'opencode', status: 'running', projectId: 'proj-1', summary: 'Add dark mode theme support', lastActivity: Date.now() - 7 * 24 * 60 * 60 * 1000, model: 'Qwen 3 Coder', branch: 'feature/dark-mode' },
  // api-service agents
  { id: 'agent-10', name: 'OpenCode - Rate limiter', tool: 'opencode', status: 'running', projectId: 'proj-2', summary: 'Fix rate limiting middleware', lastActivity: Date.now() - 3 * 60 * 1000, model: 'Kimi K3', branch: 'bugfix/rate-limiter' },
  { id: 'agent-5', name: 'OpenCode - API docs', tool: 'opencode', status: 'running', projectId: 'proj-2', summary: 'Generate API documentation from types', lastActivity: Date.now() - 10 * 60 * 1000, model: 'Llama 3.3 70B', branch: 'docs/api-types' },
  { id: 'agent-11', name: 'OpenCode - GraphQL subs', tool: 'opencode', status: 'stopped', projectId: 'proj-2', summary: 'Add GraphQL subscriptions for real-time', lastActivity: Date.now() - 1 * 24 * 60 * 60 * 1000, model: 'Mistral Small 3.2', branch: 'feature/graphql-subs' },
  { id: 'agent-12', name: 'Cursor - Query perf', tool: 'cursor-agent', status: 'running', projectId: 'proj-2', summary: 'Optimize database query performance', lastActivity: Date.now() - 4 * 24 * 60 * 60 * 1000, model: 'Grok 4.5', branch: 'perf/db-queries' },
  { id: 'agent-4', name: 'OpenCode - Integration tests', tool: 'opencode', status: 'running', projectId: 'proj-2', summary: 'Add integration tests for API endpoints', lastActivity: Date.now() - 6 * 24 * 60 * 60 * 1000, model: 'Kimi K3', branch: 'test/api-integration' },
  { id: 'agent-13', name: 'Claude Code - CI/CD', tool: 'claude-code', status: 'running', projectId: 'proj-2', summary: 'Set up CI/CD pipeline with GitHub Actions', lastActivity: Date.now() - 10 * 24 * 60 * 60 * 1000, model: 'Opus 4.8', branch: 'chore/ci-cd-pipeline' },
]

export const INITIAL_AUTH: ToolAuth[] = [
  { toolId: 'claude-code', authenticated: false },
  { toolId: 'codex', authenticated: false },
  { toolId: 'opencode', authenticated: true },
  { toolId: 'cursor-agent', authenticated: false },
]

export const HARNESS_PROVIDERS: Record<AgentToolId, InferenceProviderId[]> = {
  'claude-code': ['claude', 'aws-bedrock', 'google-vertex'],
  'codex': ['openai', 'aws-bedrock'],
  'opencode': ['redhat-ai', 'claude', 'openai', 'google-vertex', 'aws-bedrock', 'cursor'],
  'cursor-agent': ['cursor', 'claude', 'openai', 'google-vertex'],
}

export const INFERENCE_PROVIDERS: { id: InferenceProviderId; name: string; description: string }[] = [
  { id: 'redhat-ai', name: 'Red Hat AI', description: 'On-cluster inference via OpenShift AI model serving' },
  { id: 'claude', name: 'Claude', description: 'Anthropic Claude models' },
  { id: 'cursor', name: 'Cursor', description: 'Cursor inference API' },
  { id: 'openai', name: 'OpenAI', description: 'OpenAI GPT and reasoning models' },
  { id: 'google-vertex', name: 'Google Vertex', description: 'Google Cloud Vertex AI models' },
  { id: 'aws-bedrock', name: 'AWS Bedrock', description: 'Amazon Bedrock foundation models' },
]

export const INFERENCE_MODELS: Record<InferenceProviderId, ModelOption[]> = {
  'redhat-ai': [
    { id: 'kimi-k3', name: 'Kimi K3' },
    { id: 'granite-4.0-h-small', name: 'Granite 4.0 H Small' },
    { id: 'llama-3.3-70b', name: 'Llama 3.3 70B' },
    { id: 'mistral-small-3.2', name: 'Mistral Small 3.2' },
    { id: 'deepseek-v3.2', name: 'DeepSeek V3.2' },
    { id: 'qwen3-coder', name: 'Qwen 3 Coder' },
  ],
  'claude': [
    { id: 'opus-5', name: 'Opus 5' },
    { id: 'sonnet-5', name: 'Sonnet 5' },
    { id: 'fable-5', name: 'Fable 5' },
    { id: 'haiku-4.5', name: 'Haiku 4.5' },
  ],
  'cursor': [
    { id: 'grok-4.5', name: 'Grok 4.5' },
    { id: 'composer-2.5', name: 'Composer 2.5' },
  ],
  'openai': [
    { id: 'gpt-5.6-sol', name: 'GPT-5.6 Sol' },
    { id: 'gpt-5.6-terra', name: 'GPT-5.6 Terra' },
    { id: 'gpt-5.6-luna', name: 'GPT-5.6 Luna' },
    { id: 'gpt-5.5', name: 'GPT-5.5' },
  ],
  'google-vertex': [
    { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash' },
    { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash' },
    { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash-Lite' },
    { id: 'gemini-3.1-pro', name: 'Gemini 3.1 Pro' },
  ],
  'aws-bedrock': [
    { id: 'claude-opus-4.7', name: 'Claude Opus 4.7' },
    { id: 'claude-sonnet-4.6', name: 'Claude Sonnet 4.6' },
    { id: 'gpt-5.6-sol', name: 'GPT-5.6 Sol' },
    { id: 'llama-4', name: 'Llama 4' },
    { id: 'deepseek-v3.2', name: 'DeepSeek V3.2' },
  ],
}

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
  'cursor-agent': [
    { id: 'grok-4.5', name: 'Grok 4.5' },
    { id: 'composer-2.5', name: 'Composer 2.5' },
  ],
}

export const CONTEXT_WINDOW_OPTIONS: { id: string; label: string }[] = [
  { id: '128k', label: '128K' },
  { id: '200k', label: '200K' },
  { id: '1m', label: '1M' },
]

export const DEFAULT_AGENT_SETTINGS: AgentSettings = {
  reasoningMode: 'standard',
  inferenceProvider: 'redhat-ai',
  model: 'kimi-k3',
  contextWindow: '200k',
  fastMode: false,
  agentMode: 'build',
  accessMode: 'full-access',
}

export function resolveModelSettings(displayName?: string): { inferenceProvider: InferenceProviderId; model: string } {
  if (!displayName) return { inferenceProvider: DEFAULT_AGENT_SETTINGS.inferenceProvider, model: DEFAULT_AGENT_SETTINGS.model }
  for (const [providerId, models] of Object.entries(INFERENCE_MODELS)) {
    const match = models.find(m => m.name === displayName)
    if (match) return { inferenceProvider: providerId as InferenceProviderId, model: match.id }
  }
  return { inferenceProvider: DEFAULT_AGENT_SETTINGS.inferenceProvider, model: DEFAULT_AGENT_SETTINGS.model }
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
  'cursor-agent': [
    '$ cursor-agent',
    'Cursor Agent v0.1',
    'Connecting to workspace...',
    'Workspace loaded.',
    'Ready for instructions.',
    '> ',
  ],
}
