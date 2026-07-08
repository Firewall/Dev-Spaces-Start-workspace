import { useCallback, useMemo, useState } from 'react'
import {
  Button,
  Content,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  MenuToggle,
  PageSection,
  SearchInput,
  Title,
  ToggleGroup,
  ToggleGroupItem,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core'
import {
  EllipsisVIcon,
  ExternalLinkAltIcon,
  PlusCircleIcon,
} from '@patternfly/react-icons'
import {
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  type ThProps,
} from '@patternfly/react-table'

type SortableColumn = 'name' | 'editor' | 'lastModified'
type SortDirection = 'asc' | 'desc'

interface Workspace {
  id: string
  name: string
  editor: string
  editorIcon: string
  lastModified: Date
  projects: string[]
  status: 'running' | 'stopped' | 'starting'
}

const MOCK_WORKSPACES: Workspace[] = [
  {
    id: '1',
    name: 'dev-spaces-start-workspace',
    editor: 'Web Terminal',
    editorIcon: 'terminal',
    lastModified: new Date('2026-06-29T07:35:00'),
    projects: ['dev-spaces-start-workspace'],
    status: 'running',
  },
  {
    id: '2',
    name: 'quarkus-quickstart',
    editor: 'VS Code',
    editorIcon: 'vscode',
    lastModified: new Date('2026-06-28T14:22:00'),
    projects: ['quarkus-quickstart'],
    status: 'stopped',
  },
  {
    id: '3',
    name: 'spring-petclinic',
    editor: 'IntelliJ IDEA',
    editorIcon: 'intellij',
    lastModified: new Date('2026-06-27T09:10:00'),
    projects: ['spring-petclinic'],
    status: 'stopped',
  },
  {
    id: '4',
    name: 'nodejs-react-app',
    editor: 'VS Code',
    editorIcon: 'vscode',
    lastModified: new Date('2026-06-25T16:45:00'),
    projects: ['nodejs-react-app'],
    status: 'running',
  },
]

function formatDate(date: Date): string {
  const month = date.toLocaleString('en-US', { month: 'short' })
  const day = date.getDate()
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const ampm = hours >= 12 ? 'p.m.' : 'a.m.'
  const h = hours % 12 || 12
  const m = minutes.toString().padStart(2, '0')
  return `${month} ${day}, ${h}:${m} ${ampm}`
}

function StatusIcon({ status }: { status: Workspace['status'] }) {
  const colors: Record<string, string> = {
    running: 'var(--pf-t--global--color--status--success--default)',
    stopped: 'var(--pf-t--global--color--status--danger--default)',
    starting: 'var(--pf-t--global--color--status--warning--default)',
  }
  return (
    <span
      style={{
        display: 'inline-block',
        width: 10,
        height: 10,
        borderRadius: '50%',
        backgroundColor: colors[status] ?? '#888',
        marginRight: 8,
        border: status === 'running'
          ? `2px solid ${colors.running}`
          : `2px solid ${colors[status] ?? '#888'}`,
        boxShadow: status === 'running' ? `0 0 0 2px ${colors.running}33` : undefined,
      }}
      title={status.charAt(0).toUpperCase() + status.slice(1)}
    />
  )
}

function EditorBadge({ editor, icon }: { editor: string; icon: string }) {
  const bgColors: Record<string, string> = {
    terminal: '#1a1a2e',
    vscode: '#007ACC',
    intellij: '#FE315D',
  }
  return (
    <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
      <FlexItem>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 22,
            height: 22,
            borderRadius: 4,
            backgroundColor: bgColors[icon] ?? '#666',
            color: '#fff',
            fontSize: 10,
            fontWeight: 700,
          }}
        >
          {icon === 'terminal' ? '>_' : icon === 'vscode' ? 'VS' : 'IJ'}
        </span>
      </FlexItem>
      <FlexItem>{editor}</FlexItem>
    </Flex>
  )
}

interface WorkspaceListProps {
  onCreateWorkspace: () => void
}

export function WorkspaceList({ onCreateWorkspace }: WorkspaceListProps) {
  const [searchValue, setSearchValue] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<SortableColumn>('lastModified')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [activeTab, setActiveTab] = useState<'active' | 'backups'>('active')
  const [openKebabId, setOpenKebabId] = useState<string | null>(null)

  const filteredWorkspaces = useMemo(() => {
    let ws = MOCK_WORKSPACES
    if (searchValue.trim()) {
      const q = searchValue.toLowerCase()
      ws = ws.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.editor.toLowerCase().includes(q) ||
          w.projects.some((p) => p.toLowerCase().includes(q)),
      )
    }
    ws = [...ws].sort((a, b) => {
      let cmp = 0
      if (sortBy === 'name') cmp = a.name.localeCompare(b.name)
      else if (sortBy === 'editor') cmp = a.editor.localeCompare(b.editor)
      else if (sortBy === 'lastModified') cmp = a.lastModified.getTime() - b.lastModified.getTime()
      return sortDirection === 'asc' ? cmp : -cmp
    })
    return ws
  }, [searchValue, sortBy, sortDirection])

  const allSelected = filteredWorkspaces.length > 0 && filteredWorkspaces.every((w) => selectedIds.has(w.id))

  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredWorkspaces.map((w) => w.id)))
    }
  }, [allSelected, filteredWorkspaces])

  const handleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const getSortParams = (column: SortableColumn): ThProps['sort'] => ({
    sortBy: {
      index: column === 'name' ? 0 : column === 'editor' ? 1 : 2,
      direction: sortBy === column ? sortDirection : 'asc',
    },
    onSort: (_event, _index, direction) => {
      setSortBy(column)
      setSortDirection(direction)
    },
    columnIndex: column === 'name' ? 0 : column === 'editor' ? 1 : 2,
  })

  return (
    <>
      <PageSection variant="default">
        <Title headingLevel="h1" size="2xl" style={{ marginBottom: 8 }}>
          Workspaces
        </Title>
        <Content component="p" style={{ marginBottom: 16 }}>
          A workspace is where your projects live and run. Create workspaces from stacks that define
          projects, runtimes, and commands.{' '}
          <Button variant="link" isInline component="a" icon={<ExternalLinkAltIcon />} iconPosition="end">
            Learn more
          </Button>
        </Content>

        <Flex alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem>
            <ToggleGroup aria-label="Workspace tabs">
              <ToggleGroupItem
                text="Active Workspaces"
                buttonId="active"
                isSelected={activeTab === 'active'}
                onChange={() => setActiveTab('active')}
              />
              <ToggleGroupItem
                text="Backups"
                buttonId="backups"
                isSelected={activeTab === 'backups'}
                onChange={() => setActiveTab('backups')}
              />
            </ToggleGroup>
          </FlexItem>
          <FlexItem align={{ default: 'alignRight' }}>
            <Content component="small" style={{ color: 'var(--pf-t--global--color--nonstatus--gray--default)' }}>
              No backup schedule configured
            </Content>
          </FlexItem>
        </Flex>
      </PageSection>

      <PageSection variant="default" padding={{ default: 'noPadding' }} style={{ paddingLeft: 24, paddingRight: 24 }}>
        <Toolbar>
          <ToolbarContent>
            <ToolbarItem>
              <SearchInput
                placeholder="Search"
                value={searchValue}
                onChange={(_event, value) => setSearchValue(value)}
                onClear={() => setSearchValue('')}
                style={{ minWidth: 240 }}
              />
            </ToolbarItem>
            <ToolbarItem>
              <Button
                variant="secondary"
                isDisabled={selectedIds.size === 0}
              >
                Delete
              </Button>
            </ToolbarItem>
            <ToolbarItem align={{ default: 'alignEnd' }}>
              <Button
                variant="link"
                icon={<PlusCircleIcon />}
                onClick={onCreateWorkspace}
              >
                Create Workspace
              </Button>
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
      </PageSection>

      <PageSection isFilled variant="default" padding={{ default: 'noPadding' }} style={{ paddingLeft: 24, paddingRight: 24 }}>
        {activeTab === 'active' ? (
          <Table aria-label="Workspaces table" variant="compact">
            <Thead>
              <Tr>
                <Th
                  select={{
                    onSelect: handleSelectAll,
                    isSelected: allSelected,
                  }}
                />
                <Th sort={getSortParams('name')} width={30}>Name</Th>
                <Th sort={getSortParams('editor')} width={15}>Editor</Th>
                <Th sort={getSortParams('lastModified')} width={15}>Last Modified</Th>
                <Th width={20}>Project(s)</Th>
                <Th width={10} screenReaderText="Open" />
                <Th width={10} screenReaderText="Actions" />
              </Tr>
            </Thead>
            <Tbody>
              {filteredWorkspaces.map((ws) => (
                <Tr key={ws.id}>
                  <Td
                    select={{
                      rowIndex: Number(ws.id),
                      onSelect: () => handleSelect(ws.id),
                      isSelected: selectedIds.has(ws.id),
                    }}
                  />
                  <Td dataLabel="Name">
                    <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                      <FlexItem>
                        <StatusIcon status={ws.status} />
                      </FlexItem>
                      <FlexItem>
                        <Button variant="link" isInline>
                          {ws.name}
                        </Button>
                      </FlexItem>
                    </Flex>
                  </Td>
                  <Td dataLabel="Editor">
                    <EditorBadge editor={ws.editor} icon={ws.editorIcon} />
                  </Td>
                  <Td dataLabel="Last Modified">{formatDate(ws.lastModified)}</Td>
                  <Td dataLabel="Project(s)">{ws.projects.join(', ')}</Td>
                  <Td dataLabel="Actions">
                    <Button variant="link" isInline>
                      Open
                    </Button>
                  </Td>
                  <Td isActionCell>
                    <Dropdown
                      isOpen={openKebabId === ws.id}
                      onSelect={() => setOpenKebabId(null)}
                      onOpenChange={(isOpen) => {
                        if (!isOpen) setOpenKebabId(null)
                      }}
                      popperProps={{ position: 'right' }}
                      toggle={(toggleRef) => (
                        <MenuToggle
                          ref={toggleRef}
                          variant="plain"
                          onClick={() =>
                            setOpenKebabId((prev) => (prev === ws.id ? null : ws.id))
                          }
                          isExpanded={openKebabId === ws.id}
                          aria-label={`Actions for ${ws.name}`}
                        >
                          <EllipsisVIcon />
                        </MenuToggle>
                      )}
                    >
                      <DropdownList>
                        <DropdownItem key="open">Open</DropdownItem>
                        <DropdownItem key="stop" isDisabled={ws.status !== 'running'}>
                          Stop workspace
                        </DropdownItem>
                        <DropdownItem key="restart">Restart workspace</DropdownItem>
                        <DropdownItem key="clone">Clone workspace</DropdownItem>
                        <DropdownItem
                          key="delete"
                          style={{ color: 'var(--pf-t--global--color--status--danger--default)' }}
                        >
                          Delete workspace
                        </DropdownItem>
                      </DropdownList>
                    </Dropdown>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        ) : (
          <Content component="p" style={{ padding: '40px 0', textAlign: 'center', color: 'var(--pf-t--global--color--nonstatus--gray--default)' }}>
            No backups available.
          </Content>
        )}
      </PageSection>

    </>
  )
}
