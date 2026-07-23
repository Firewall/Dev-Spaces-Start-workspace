export type ChatRole = 'user' | 'assistant' | 'system'

export type ProviderId = 'anthropic' | 'openai' | 'local' | 'opencode'

export interface ChatProvider {
  id: ProviderId
  name: string
  models: ChatModel[]
}

export interface ChatModel {
  id: string
  name: string
  providerId: ProviderId
}

export interface ToolCall {
  id: string
  name: string
  input: string
  output?: string
}

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  timestamp: number
  isStreaming?: boolean
  thinking?: string
  toolCalls?: ToolCall[]
}

export interface ChatConversation {
  id: string
  title: string
  workspaceId: string
  modelId: string
  providerId: ProviderId
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
}

export interface ChatWorkspace {
  id: string
  name: string
  description: string
}
