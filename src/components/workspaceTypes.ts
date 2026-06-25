export interface WorkspaceInfo {
  name: string
  repoUrl: string
  branch: string
  editor: string
  editorLabel: string
  templateName?: string
}

export function nameFromRepoUrl(url: string): string {
  try {
    const path = url.replace(/\.git$/, '').split('/').pop() || ''
    return path || ''
  } catch {
    return ''
  }
}
