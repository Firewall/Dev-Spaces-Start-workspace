// First entry in `versions` is the default version for that editor.
export const EDITORS: {
  id: string
  label: string
  versions?: string[]
  isDefault?: boolean
  isTechPreview?: boolean
  isCustom?: true
}[] = [
  { id: 'vscode-oss', label: 'Visual Studio Code - Open Source (Web)', isDefault: true, versions: ['insiders', 'latest'] },
  { id: 'vscode', label: 'Visual Studio Code - Desktop (SSH)', versions: ['latest', 'next'] },
  { id: 'kiro', label: 'Kiro (SSH)', isTechPreview: true, versions: ['latest'] },
  { id: 'clion', label: 'CLion', versions: ['latest', 'next'] },
  { id: 'goland', label: 'GoLand', versions: ['latest', 'next'] },
  { id: 'intellij', label: 'IntelliJ IDEA Ultimate', versions: ['latest', 'next'] },
  { id: 'phpstorm', label: 'PhpStorm', versions: ['latest', 'next'] },
  { id: 'pycharm', label: 'PyCharm Professional', versions: ['latest', 'next'] },
  { id: 'rider', label: 'Rider', versions: ['latest', 'next'] },
  { id: 'rubymine', label: 'RubyMine', versions: ['latest', 'next'] },
  { id: 'terminal', label: 'Web Terminal', versions: ['latest'] },
  { id: 'webstorm', label: 'WebStorm', versions: ['latest', 'next'] },
  { id: 'toolbox', label: 'JetBrains Toolbox App', isTechPreview: true, versions: ['latest'] },
  { id: 'custom', label: 'Custom Editor', isCustom: true as const },
]

export function getEditorVersions(id: string): string[] {
  return EDITORS.find((e) => e.id === id)?.versions ?? []
}

export function getDefaultEditorVersion(id: string): string {
  return getEditorVersions(id)[0] ?? ''
}
