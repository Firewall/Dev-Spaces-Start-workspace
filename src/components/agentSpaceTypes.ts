export type AgentToolId = 'claude-code' | 'codex' | 'opencode' | 'cursor-agent'

export type InferenceProviderId = 'redhat-ai' | 'claude' | 'cursor' | 'openai' | 'google-vertex' | 'aws-bedrock'

export type AgentStatus = 'running' | 'complete' | 'blocked'

export type IssueSource = 'github' | 'jira'

export type IssueStatus = 'open' | 'in-progress' | 'closed' | 'merged'

export interface LinkedPR {
  id: string
  number: number
  title: string
  url: string
  status: 'open' | 'merged' | 'closed' | 'draft'
}

export interface LinkedIssue {
  source: IssueSource
  id: string
  number?: number
  title: string
  description: string
  url: string
  status: IssueStatus
  labels?: string[]
  assignee?: string
  pr?: LinkedPR
  branch?: string
}

export interface Agent {
  id: string
  name: string
  tool: AgentToolId
  status: AgentStatus
  projectId: string
  summary: string
  lastActivity: number
  model?: string
  branch?: string
  issue?: LinkedIssue
}

export interface Project {
  id: string
  name: string
  repoUrl: string
}

export interface ToolAuth {
  toolId: AgentToolId
  authenticated: boolean
}

export type ReasoningMode = 'standard' | 'extended'

export type ContextWindowSize = '128k' | '200k' | '1m'

export type AgentMode = 'build' | 'plan'

export type AccessMode = 'full-access' | 'auto-accept-edits' | 'supervised'

export interface ModelOption {
  id: string
  name: string
}

export interface AgentSettings {
  reasoningMode: ReasoningMode
  inferenceProvider: InferenceProviderId
  model: string
  contextWindow: ContextWindowSize
  fastMode: boolean
  agentMode: AgentMode
  accessMode: AccessMode
}
