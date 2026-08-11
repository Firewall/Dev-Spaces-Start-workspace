import { useCallback, useRef, useState } from 'react'
import {
  Alert,
  AlertActionCloseButton,
  AlertGroup,
  Button,
  Card,
  CardBody,
  CardTitle,
  Content,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Icon,
  Label,
  PageSection,
  Progress,
  ProgressMeasureLocation,
  Title,
} from '@patternfly/react-core'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckCircleIcon,
  CpuIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InfoCircleIcon,
  MemoryIcon,
  ServerIcon,
} from '@patternfly/react-icons'
import {
  Table,
  Thead,
  Tr,
  Th,
  type ThProps,
  Tbody,
  Td,
} from '@patternfly/react-table'

type StatusVariant = 'success' | 'warning' | 'danger' | 'info'

interface Metric {
  label: string
  value: number | string
  unit?: string
  prevValue: number
  lowerIsBetter?: boolean
  status?: StatusVariant
}

function TrendIndicator({ value, prevValue, unit, lowerIsBetter }: Omit<Metric, 'label'>) {
  const currentNum = typeof value === 'number' ? value : parseFloat(value)
  const diff = currentNum - prevValue
  const absDiff = Math.round(Math.abs(diff) * 10) / 10
  const displayDiff = unit ? `${absDiff}${unit}` : absDiff
  const isUp = diff > 0
  const isNeutral = diff === 0

  const isPositive = isNeutral ? null : lowerIsBetter ? !isUp : isUp
  const trendColor = isNeutral
    ? 'var(--pf-t--global--text--color--subtle)'
    : isPositive
      ? 'var(--pf-t--global--color--status--success--default)'
      : 'var(--pf-t--global--color--status--danger--default)'

  return (
    <Flex spaceItems={{ default: 'spaceItemsXs' }} alignItems={{ default: 'alignItemsCenter' }}>
      <FlexItem>
        <span style={{ color: trendColor, fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 2 }}>
          {!isNeutral && (
            <Icon size="sm">{isUp ? <ArrowUpIcon /> : <ArrowDownIcon />}</Icon>
          )}
          {displayDiff}
        </span>
      </FlexItem>
      <FlexItem>
        <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
          vs last week
        </Content>
      </FlexItem>
    </Flex>
  )
}

const STATUS_ICONS: Record<StatusVariant, { icon: React.ReactNode; color: string }> = {
  success: { icon: <CheckCircleIcon />, color: 'var(--pf-t--global--icon--color--status--success--default)' },
  warning: { icon: <ExclamationTriangleIcon />, color: 'var(--pf-t--global--icon--color--status--warning--default)' },
  danger: { icon: <ExclamationCircleIcon />, color: 'var(--pf-t--global--icon--color--status--danger--default)' },
  info: { icon: <InfoCircleIcon />, color: 'var(--pf-t--global--icon--color--status--info--default)' },
}

function SubMetric({ label, value, prevValue, unit, lowerIsBetter, status }: Metric) {
  const statusStyle = status ? STATUS_ICONS[status] : null
  return (
    <div>
      <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>{label}</Content>
      <Flex spaceItems={{ default: 'spaceItemsXs' }} alignItems={{ default: 'alignItemsCenter' }}>
        {statusStyle && (
          <FlexItem>
            <Icon status={status} size="md">{statusStyle.icon}</Icon>
          </FlexItem>
        )}
        <FlexItem>
          <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.2 }}>{value}</div>
        </FlexItem>
      </Flex>
      <div style={{ marginTop: 2 }}>
        <TrendIndicator value={value} prevValue={prevValue} unit={unit} lowerIsBetter={lowerIsBetter} />
      </div>
    </div>
  )
}

const ALERTS = [
  { key: 'memory', variant: 'warning' as const, title: 'Memory usage approaching limit on worker-03', description: 'worker-03 is at 90% memory utilization (28.8 / 32 Gi) with 9 active workspaces.', action: 'Manage workloads' },
]

const RESOURCE_USAGE = {
  cpuUsed: 34,
  cpuTotal: 96,
  cpuPrevUsed: 29,
  memoryUsedGi: 78,
  memoryTotalGi: 192,
  memoryPrevUsedGi: 71,
  storageUsedGi: 412,
  storageTotalGi: 1024,
  storagePrevUsedGi: 385,
}

const TOP_USERS = [
  { name: 'jane.doe', workspaces: 5, cpuCores: 8.4, memoryGi: 18.2, starts7d: 23 },
  { name: 'bob.smith', workspaces: 4, cpuCores: 6.1, memoryGi: 14.8, starts7d: 18 },
  { name: 'alice.wu', workspaces: 3, cpuCores: 5.7, memoryGi: 12.4, starts7d: 15 },
  { name: 'priya.patel', workspaces: 3, cpuCores: 4.2, memoryGi: 9.6, starts7d: 12 },
  { name: 'liu.wei', workspaces: 2, cpuCores: 3.8, memoryGi: 8.1, starts7d: 9 },
  { name: 'carlos.garcia', workspaces: 2, cpuCores: 3.1, memoryGi: 7.2, starts7d: 7 },
]

const RECENT_EVENTS = [
  { time: '2 min ago', user: 'jane.doe', action: 'Started workspace', target: 'quarkus-quickstart' },
  { time: '5 min ago', user: 'admin', action: 'Node marked NotReady', target: 'worker-06' },
  { time: '8 min ago', user: 'bob.smith', action: 'Created workspace', target: 'nodejs-react-app' },
  { time: '11 min ago', user: 'alice.wu', action: 'Workspace start failed', target: 'spring-petclinic' },
  { time: '14 min ago', user: 'alice.wu', action: 'Added container registry', target: 'registry.redhat.io' },
  { time: '18 min ago', user: 'carlos.garcia', action: 'Updated devfile', target: 'python-ml-demo' },
  { time: '22 min ago', user: 'carlos.garcia', action: 'Deleted workspace', target: 'python-ml-demo' },
  { time: '28 min ago', user: 'admin', action: 'Updated resource quota', target: 'team-backend' },
  { time: '35 min ago', user: 'jane.doe', action: 'Cloned workspace', target: 'dev-spaces-start-workspace' },
  { time: '42 min ago', user: 'priya.patel', action: 'Configured SSH key', target: '' },
  { time: '50 min ago', user: 'admin', action: 'Scaled node pool', target: '5 → 6 nodes' },
  { time: '1 hr ago', user: 'bob.smith', action: 'Stopped workspace', target: 'angular-dashboard' },
  { time: '2 hr ago', user: 'priya.patel', action: 'Installed MCP server', target: 'Kubernetes' },
  { time: '2 hr ago', user: 'liu.wei', action: 'Workspace auto-stopped (idle)', target: 'go-api-service' },
  { time: '3 hr ago', user: 'admin', action: 'Certificate renewed', target: '*.devspaces.example.com' },
]

const NODE_INFO = [
  { name: 'worker-06', status: 'NotReady', cpu: '0 / 16 cores', cpuUsed: 0, memory: '0 / 32 Gi', memUsed: 0, workspaces: 0 },
  { name: 'worker-01', status: 'Ready', cpu: '6.2 / 16 cores', cpuUsed: 6.2, memory: '14.1 / 32 Gi', memUsed: 14.1, workspaces: 8 },
  { name: 'worker-02', status: 'Ready', cpu: '5.8 / 16 cores', cpuUsed: 5.8, memory: '13.5 / 32 Gi', memUsed: 13.5, workspaces: 7 },
  { name: 'worker-03', status: 'Ready', cpu: '7.1 / 16 cores', cpuUsed: 7.1, memory: '28.8 / 32 Gi', memUsed: 28.8, workspaces: 9 },
  { name: 'worker-04', status: 'Ready', cpu: '4.9 / 16 cores', cpuUsed: 4.9, memory: '11.2 / 32 Gi', memUsed: 11.2, workspaces: 6 },
  { name: 'worker-05', status: 'Ready', cpu: '5.4 / 16 cores', cpuUsed: 5.4, memory: '12.9 / 32 Gi', memUsed: 12.9, workspaces: 5 },
]

const EVENTS_PAGE_SIZE = 10

type SortDir = 'asc' | 'desc'

function useSortableTable<T>(data: T[], defaultIndex: number, defaultDir: SortDir, keys: ((item: T) => string | number)[]) {
  const [sortIndex, setSortIndex] = useState(defaultIndex)
  const [sortDir, setSortDir] = useState<SortDir>(defaultDir)

  const sorted = [...data].sort((a, b) => {
    const aVal = keys[sortIndex](a)
    const bVal = keys[sortIndex](b)
    const cmp = typeof aVal === 'string' ? aVal.localeCompare(bVal as string) : (aVal as number) - (bVal as number)
    return sortDir === 'asc' ? cmp : -cmp
  })

  const getSortParams = (index: number): ThProps['sort'] => ({
    sortBy: { index: sortIndex, direction: sortDir },
    onSort: (_event, idx, direction) => {
      setSortIndex(idx)
      setSortDir(direction)
    },
    columnIndex: index,
  })

  return { sorted, getSortParams }
}

export function AdminDashboard() {
  const [visibleCount, setVisibleCount] = useState(EVENTS_PAGE_SIZE)
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())

  const nodeSort = useSortableTable(NODE_INFO, 1, 'asc', [
    (n) => n.name,
    (n) => n.status === 'Ready' ? 1 : 0,
    (n) => n.cpuUsed,
    (n) => n.memUsed,
    (n) => n.workspaces,
  ])

  const userSort = useSortableTable(TOP_USERS, 2, 'desc', [
    (u) => u.name,
    (u) => u.workspaces,
    (u) => u.cpuCores,
    (u) => u.memoryGi,
    (u) => u.starts7d,
  ])
  const observerRef = useRef<IntersectionObserver | null>(null)
  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) observerRef.current.disconnect()
    if (!node) return
    observerRef.current = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisibleCount((prev) => Math.min(prev + EVENTS_PAGE_SIZE, RECENT_EVENTS.length))
      }
    })
    observerRef.current.observe(node)
  }, [])

  const cpuPercent = Math.round((RESOURCE_USAGE.cpuUsed / RESOURCE_USAGE.cpuTotal) * 100)
  const memPercent = Math.round((RESOURCE_USAGE.memoryUsedGi / RESOURCE_USAGE.memoryTotalGi) * 100)
  const storagePercent = Math.round((RESOURCE_USAGE.storageUsedGi / RESOURCE_USAGE.storageTotalGi) * 100)

  const visibleAlerts = ALERTS.filter((a) => !dismissedAlerts.has(a.key))

  return (
    <>
      <PageSection variant="default">
        <Title headingLevel="h1" size="2xl" style={{ marginBottom: 4 }}>
          Cluster Overview
        </Title>
        <Content component="p" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
          Administration dashboard for your Dev Spaces cluster
        </Content>
      </PageSection>

      {visibleAlerts.length > 0 && (
        <PageSection variant="default" style={{ paddingTop: 0 }}>
          <AlertGroup>
            {visibleAlerts.map((alert) => (
              <Alert
                key={alert.key}
                variant={alert.variant}
                title={alert.title}
                actionClose={<AlertActionCloseButton onClose={() => setDismissedAlerts((prev) => new Set(prev).add(alert.key))} />}
                actionLinks={<Button variant="link" isInline>{alert.action}</Button>}
                style={{ marginBottom: 8 }}
              >
                {alert.description}
              </Alert>
            ))}
          </AlertGroup>
        </PageSection>
      )}

      <PageSection variant="default" style={{ paddingTop: 0 }}>
        <Grid hasGutter>
          <GridItem sm={12} md={6} lg={3}>
            <Card isFullHeight>
              <CardTitle>Active Users</CardTitle>
              <CardBody>
                <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.2, marginBottom: 4 }}>15</div>
                <TrendIndicator value={15} prevValue={12} />
              </CardBody>
            </Card>
          </GridItem>
          <GridItem sm={12} md={6} lg={5}>
            <Card isFullHeight>
              <CardTitle>Workspaces</CardTitle>
              <CardBody>
                <Grid hasGutter>
                  <GridItem span={3}><SubMetric label="Total" value={47} prevValue={43} /></GridItem>
                  <GridItem span={3}><SubMetric label="Running" value={12} prevValue={14} status="success" /></GridItem>
                  <GridItem span={3}><SubMetric label="Failed" value={3} prevValue={5} lowerIsBetter status="danger" /></GridItem>
                  <GridItem span={3}><SubMetric label="Stale" value={8} prevValue={6} lowerIsBetter status="warning" /></GridItem>
                </Grid>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem sm={12} md={12} lg={4}>
            <Card isFullHeight>
              <CardTitle>Startup Health</CardTitle>
              <CardBody>
                <Grid hasGutter>
                  <GridItem span={6}><SubMetric label="Start Failures" value={7} prevValue={12} lowerIsBetter status="danger" /></GridItem>
                  <GridItem span={6}><SubMetric label="Startup Time (p95)" value="4.2s" prevValue={3.8} unit="s" lowerIsBetter status="warning" /></GridItem>
                </Grid>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </PageSection>

      <PageSection variant="default" style={{ paddingTop: 0 }}>
        <Grid hasGutter>
          <GridItem sm={12} lg={8}>
            <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }} style={{ height: '100%' }}>
              <FlexItem>
                <Card>
                  <CardTitle>Resource Utilization</CardTitle>
                  <CardBody>
                    <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsLg' }}>
                      <FlexItem>
                        <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: 8 }}>
                          <FlexItem><Icon><CpuIcon /></Icon></FlexItem>
                          <FlexItem><strong>CPU</strong></FlexItem>
                          <FlexItem style={{ marginLeft: 'auto' }}>
                            <Content component="small">{RESOURCE_USAGE.cpuUsed} / {RESOURCE_USAGE.cpuTotal} cores</Content>
                          </FlexItem>
                        </Flex>
                        <Progress
                          value={cpuPercent}
                          measureLocation={ProgressMeasureLocation.outside}
                          variant={cpuPercent > 60 ? 'warning' : undefined}
                          aria-label="CPU usage"
                        />
                        <div style={{ marginTop: 4 }}>
                          <TrendIndicator value={RESOURCE_USAGE.cpuUsed} prevValue={RESOURCE_USAGE.cpuPrevUsed} unit=" cores" lowerIsBetter />
                        </div>
                      </FlexItem>
                      <FlexItem>
                        <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: 8 }}>
                          <FlexItem><Icon><MemoryIcon /></Icon></FlexItem>
                          <FlexItem><strong>Memory</strong></FlexItem>
                          <FlexItem style={{ marginLeft: 'auto' }}>
                            <Content component="small">{RESOURCE_USAGE.memoryUsedGi} / {RESOURCE_USAGE.memoryTotalGi} Gi</Content>
                          </FlexItem>
                        </Flex>
                        <Progress
                          value={memPercent}
                          measureLocation={ProgressMeasureLocation.outside}
                          variant={memPercent > 60 ? 'warning' : undefined}
                          aria-label="Memory usage"
                        />
                        <div style={{ marginTop: 4 }}>
                          <TrendIndicator value={RESOURCE_USAGE.memoryUsedGi} prevValue={RESOURCE_USAGE.memoryPrevUsedGi} unit=" Gi" lowerIsBetter />
                        </div>
                      </FlexItem>
                      <FlexItem>
                        <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: 8 }}>
                          <FlexItem><Icon><ServerIcon /></Icon></FlexItem>
                          <FlexItem><strong>Storage</strong></FlexItem>
                          <FlexItem style={{ marginLeft: 'auto' }}>
                            <Content component="small">{RESOURCE_USAGE.storageUsedGi} / {RESOURCE_USAGE.storageTotalGi} Gi</Content>
                          </FlexItem>
                        </Flex>
                        <Progress
                          value={storagePercent}
                          measureLocation={ProgressMeasureLocation.outside}
                          variant={storagePercent > 60 ? 'warning' : undefined}
                          aria-label="Storage usage"
                        />
                        <div style={{ marginTop: 4 }}>
                          <TrendIndicator value={RESOURCE_USAGE.storageUsedGi} prevValue={RESOURCE_USAGE.storagePrevUsedGi} unit=" Gi" lowerIsBetter />
                        </div>
                      </FlexItem>
                    </Flex>
                  </CardBody>
                </Card>
              </FlexItem>
              <FlexItem style={{ flex: 1 }}>
                <Card isFullHeight>
                  <CardTitle>Top Users by Resource Consumption</CardTitle>
                  <CardBody>
                    <Table aria-label="Top users table" variant="compact">
                      <Thead>
                        <Tr>
                          <Th width={25} sort={userSort.getSortParams(0)}>User</Th>
                          <Th width={15} sort={userSort.getSortParams(1)}>Workspaces</Th>
                          <Th width={20} sort={userSort.getSortParams(2)}>CPU (cores)</Th>
                          <Th width={20} sort={userSort.getSortParams(3)}>Memory (Gi)</Th>
                          <Th width={20} sort={userSort.getSortParams(4)}>Starts (7d)</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {userSort.sorted.map((user) => (
                          <Tr key={user.name}>
                            <Td dataLabel="User">
                              <strong>{user.name}</strong>
                              {user.workspaces >= 5 && (
                                <Label color="orange" isCompact style={{ marginLeft: 8 }}>At limit</Label>
                              )}
                            </Td>
                            <Td dataLabel="Workspaces">{user.workspaces} / {5}</Td>
                            <Td dataLabel="CPU (cores)">{user.cpuCores}</Td>
                            <Td dataLabel="Memory (Gi)">{user.memoryGi}</Td>
                            <Td dataLabel="Starts (7d)">{user.starts7d}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </CardBody>
                </Card>
              </FlexItem>
            </Flex>
          </GridItem>

          <GridItem sm={12} lg={4}>
            <Card isFullHeight>
              <CardTitle>Recent Activity</CardTitle>
              <CardBody style={{ overflowY: 'auto', maxHeight: 560, scrollbarWidth: 'thin', scrollbarGutter: 'stable' }}>
                {RECENT_EVENTS.slice(0, visibleCount).map((event, i) => (
                  <Flex
                    key={i}
                    direction={{ default: 'column' }}
                    style={{
                      paddingBottom: 12,
                      marginBottom: 12,
                      borderBottom: i < visibleCount - 1 ? '1px solid var(--pf-t--global--border--color--default)' : undefined,
                    }}
                  >
                    <FlexItem>
                      <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>{event.time}</Content>
                    </FlexItem>
                    <FlexItem>
                      <strong>{event.user}</strong>{' '}{event.action}
                      {event.target && <>{' '}<span style={{ color: 'var(--pf-t--global--color--brand--default)' }}>{event.target}</span></>}
                    </FlexItem>
                  </Flex>
                ))}
                {visibleCount < RECENT_EVENTS.length && <div ref={sentinelRef} style={{ height: 1 }} />}
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </PageSection>

      <PageSection variant="default" style={{ paddingTop: 0 }}>
        <Card>
          <CardTitle>Cluster Nodes</CardTitle>
          <CardBody>
            <Table aria-label="Cluster nodes table" variant="compact">
              <Thead>
                <Tr>
                  <Th width={20} sort={nodeSort.getSortParams(0)}>Node</Th>
                  <Th width={15} sort={nodeSort.getSortParams(1)}>Status</Th>
                  <Th width={25} sort={nodeSort.getSortParams(2)}>CPU</Th>
                  <Th width={25} sort={nodeSort.getSortParams(3)}>Memory</Th>
                  <Th width={15} sort={nodeSort.getSortParams(4)}>Workspaces</Th>
                </Tr>
              </Thead>
              <Tbody>
                {nodeSort.sorted.map((node) => (
                  <Tr key={node.name}>
                    <Td dataLabel="Node"><strong>{node.name}</strong></Td>
                    <Td dataLabel="Status">
                      {node.status === 'Ready' ? (
                        <Label color="green" icon={<CheckCircleIcon />} isCompact>Ready</Label>
                      ) : (
                        <Label color="orange" icon={<ExclamationTriangleIcon />} isCompact>NotReady</Label>
                      )}
                    </Td>
                    <Td dataLabel="CPU">{node.cpu}</Td>
                    <Td dataLabel="Memory">{node.memory}</Td>
                    <Td dataLabel="Workspaces">{node.workspaces}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      </PageSection>
    </>
  )
}
