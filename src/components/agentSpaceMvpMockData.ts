import type { MvpAgent, Workspace } from './agentSpaceMvpTypes'
import { MOCK_AGENTS, MOCK_PROJECTS } from './agentSpaceMockData'

function workspaceIdForProject(projectId: string): string {
  return `workspace-${projectId.replace('proj-', '')}`
}

export const MOCK_WORKSPACES: Workspace[] = MOCK_PROJECTS.map((project) => ({
  id: workspaceIdForProject(project.id),
  name: `${project.name}-workspace`,
  repoUrl: project.repoUrl,
  defaultBranch: 'main',
}))

export const MOCK_MVP_AGENTS: MvpAgent[] = MOCK_AGENTS.map(({ projectId: legacyProjectId, ...agent }) => ({
  ...agent,
  workspaceId: workspaceIdForProject(legacyProjectId),
}))
