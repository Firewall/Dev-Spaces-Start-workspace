import type { Agent } from './agentSpaceTypes'

export interface Workspace {
  id: string
  name: string
  repoUrl: string
  defaultBranch: string
}

export type MvpAgent = Omit<Agent, 'projectId'> & {
  workspaceId: string
}
