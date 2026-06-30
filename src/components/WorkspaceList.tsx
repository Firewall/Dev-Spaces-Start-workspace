import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  Flex,
  FlexItem,
  PageSection,
  Title,
  ToggleGroup,
  ToggleGroupItem,
} from '@patternfly/react-core'
import { PlusCircleIcon } from '@patternfly/react-icons'

interface WorkspaceListProps {
  phase: string
  onPhaseChange: (phase: 'phase1' | 'phase2') => void
  onCreateWorkspace: () => void
}

export function WorkspaceList({ phase, onPhaseChange, onCreateWorkspace }: WorkspaceListProps) {
  return (
    <>
      <PageSection variant="default">
        <Flex>
          <FlexItem>
            <Title headingLevel="h2">Workspaces</Title>
          </FlexItem>
          <FlexItem align={{ default: 'alignRight' }}>
            <Flex spaceItems={{ default: 'spaceItemsMd' }}>
              <FlexItem>
                <Button variant="primary" icon={<PlusCircleIcon />} onClick={onCreateWorkspace}>
                  Create Workspace
                </Button>
              </FlexItem>
              <FlexItem>
                <ToggleGroup aria-label="Prototype phase">
                  <ToggleGroupItem
                    text="Phase 1"
                    buttonId="phase1"
                    isSelected={phase === 'phase1'}
                    onChange={() => onPhaseChange('phase1')}
                  />
                  <ToggleGroupItem
                    text="Phase 2"
                    buttonId="phase2"
                    isSelected={phase === 'phase2'}
                    onChange={() => onPhaseChange('phase2')}
                  />
                </ToggleGroup>
              </FlexItem>
            </Flex>
          </FlexItem>
        </Flex>
      </PageSection>

      <PageSection isFilled>
        <EmptyState>
          <EmptyStateBody>No changes to this page</EmptyStateBody>
          <EmptyStateFooter>
            <EmptyStateActions>
              <Button variant="primary" icon={<PlusCircleIcon />} onClick={onCreateWorkspace}>
                Create Workspace
              </Button>
            </EmptyStateActions>
          </EmptyStateFooter>
        </EmptyState>
      </PageSection>
    </>
  )
}
