export interface McpServer {
  id: string
  name: string
  description: string
  endpoint: string
  enabled: boolean
  status: 'connected' | 'disconnected' | 'error'
  tools: number
}

export interface Skill {
  id: string
  name: string
  description: string
  category: 'code' | 'research' | 'testing' | 'devops' | 'general'
  enabled: boolean
}

export const MOCK_MCP_CATALOG: McpServer[] = [
  {
    id: 'mcp-filesystem',
    name: 'Filesystem',
    description: 'Read, write, and manage files in your workspace',
    endpoint: 'stdio://filesystem-server',
    enabled: true,
    status: 'connected',
    tools: 8,
  },
  {
    id: 'mcp-github',
    name: 'GitHub',
    description: 'Create PRs, manage issues, and browse repositories',
    endpoint: 'stdio://github-mcp-server',
    enabled: true,
    status: 'connected',
    tools: 12,
  },
  {
    id: 'mcp-postgres',
    name: 'PostgreSQL',
    description: 'Query and manage PostgreSQL databases',
    endpoint: 'stdio://postgres-mcp-server',
    enabled: false,
    status: 'disconnected',
    tools: 6,
  },
  {
    id: 'mcp-kubernetes',
    name: 'Kubernetes',
    description: 'Manage pods, deployments, and cluster resources',
    endpoint: 'sse://k8s-mcp.internal:8080',
    enabled: true,
    status: 'connected',
    tools: 15,
  },
  {
    id: 'mcp-browser',
    name: 'Browser',
    description: 'Automate browser interactions and take screenshots',
    endpoint: 'stdio://puppeteer-mcp-server',
    enabled: false,
    status: 'disconnected',
    tools: 5,
  },
  {
    id: 'mcp-slack',
    name: 'Slack',
    description: 'Send messages, read channels, and manage Slack workspace',
    endpoint: 'stdio://slack-mcp-server',
    enabled: false,
    status: 'disconnected',
    tools: 7,
  },
  {
    id: 'mcp-jira',
    name: 'Jira',
    description: 'Create and manage Jira issues and sprints',
    endpoint: 'sse://jira-mcp.internal:9090',
    enabled: true,
    status: 'error',
    tools: 9,
  },
  {
    id: 'mcp-memory',
    name: 'Memory',
    description: 'Persistent knowledge graph for long-term context',
    endpoint: 'stdio://memory-mcp-server',
    enabled: true,
    status: 'connected',
    tools: 4,
  },
]

export const MOCK_SKILLS_CATALOG: Skill[] = [
  {
    id: 'skill-code-review',
    name: 'Code Review',
    description: 'Analyze code for bugs, security issues, and best practices',
    category: 'code',
    enabled: true,
  },
  {
    id: 'skill-test-gen',
    name: 'Test Generation',
    description: 'Automatically generate unit and integration tests',
    category: 'testing',
    enabled: true,
  },
  {
    id: 'skill-refactor',
    name: 'Refactoring',
    description: 'Suggest and apply code refactoring patterns',
    category: 'code',
    enabled: false,
  },
  {
    id: 'skill-deep-research',
    name: 'Deep Research',
    description: 'Multi-source research with fact-checking and citations',
    category: 'research',
    enabled: true,
  },
  {
    id: 'skill-ci-debug',
    name: 'CI/CD Debugger',
    description: 'Diagnose and fix pipeline failures',
    category: 'devops',
    enabled: false,
  },
  {
    id: 'skill-doc-gen',
    name: 'Documentation',
    description: 'Generate and update API docs, READMEs, and changelogs',
    category: 'general',
    enabled: true,
  },
  {
    id: 'skill-security-scan',
    name: 'Security Scanner',
    description: 'Scan code for OWASP vulnerabilities and CVEs',
    category: 'testing',
    enabled: false,
  },
  {
    id: 'skill-perf-analysis',
    name: 'Performance Analysis',
    description: 'Profile and optimize application performance',
    category: 'code',
    enabled: false,
  },
  {
    id: 'skill-migration',
    name: 'Migration Assistant',
    description: 'Automate framework and dependency migrations',
    category: 'devops',
    enabled: true,
  },
  {
    id: 'skill-api-design',
    name: 'API Design',
    description: 'Design RESTful and GraphQL APIs from specifications',
    category: 'general',
    enabled: false,
  },
]

export const SKILL_CATEGORY_LABELS: Record<Skill['category'], string> = {
  code: 'Code',
  research: 'Research',
  testing: 'Testing',
  devops: 'DevOps',
  general: 'General',
}
