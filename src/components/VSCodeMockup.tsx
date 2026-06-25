import { useState } from 'react'
import {
  Alert,
  Button,
  ClipboardCopy,
  ExpandableSection,
  PageSection,
} from '@patternfly/react-core'
import {
  ArrowLeftIcon,
  ExternalLinkAltIcon,
} from '@patternfly/react-icons'
import type { WorkspaceInfo } from './workspaceTypes'

interface VSCodeMockupProps {
  workspace: WorkspaceInfo
  onBackToWorkspaces: () => void
}

function buildVscodeUrl(workspace: WorkspaceInfo): string {
  const host = 'workspace.devspaces.io'
  return `vscode://devspaces.connect?workspace=${encodeURIComponent(workspace.name)}&host=${encodeURIComponent(host)}&editor=${encodeURIComponent(workspace.editor)}`
}

export function VSCodeMockup({ workspace, onBackToWorkspaces }: VSCodeMockupProps) {
  const [urlExpanded, setUrlExpanded] = useState(false)
  const vscodeUrl = buildVscodeUrl(workspace)

  return (
    <PageSection>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <Alert
          variant="info"
          isInline
          title="Your browser should have prompted you to open Visual Studio Code. If it didn't, click the button below."
          actionLinks={
            <>
              <Button
                variant="link"
                icon={<ExternalLinkAltIcon />}
                iconPosition="end"
                component="a"
                href={vscodeUrl}
              >
                Open Visual Studio Code
              </Button>
              <Button variant="link" icon={<ArrowLeftIcon />} onClick={onBackToWorkspaces}>
                Back to Workspaces
              </Button>
            </>
          }
          style={{ marginBottom: 16 }}
        />

        <ExpandableSection
          toggleText={urlExpanded ? 'Hide connection URL' : 'Show connection URL'}
          isExpanded={urlExpanded}
          onToggle={(_e, expanded) => setUrlExpanded(expanded)}
        >
          <ClipboardCopy isReadOnly isExpanded hoverTip="Copy" clickTip="Copied">
            {vscodeUrl}
          </ClipboardCopy>
        </ExpandableSection>
      </div>
    </PageSection>
  )
}
