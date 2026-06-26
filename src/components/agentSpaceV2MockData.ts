import type { ChatProvider, ChatConversation, ChatWorkspace } from './agentSpaceV2Types'

export const CHAT_PROVIDERS: ChatProvider[] = [
  {
    id: 'opencode',
    name: 'OpenShift AI',
    models: [
      { id: 'glm-5.2', name: 'GLM-5.2', providerId: 'opencode' },
      { id: 'minimax-m3', name: 'MiniMax M3', providerId: 'opencode' },
      { id: 'qwen-3.7', name: 'Qwen 3.7', providerId: 'opencode' },
      { id: 'deepseek-v4-pro', name: 'Deepseek V4 Pro', providerId: 'opencode' },
      { id: 'kimi-k2.7', name: 'Kimi K2.7', providerId: 'opencode' },
      { id: 'mistral-medium-5', name: 'Mistral Medium 5', providerId: 'opencode' },
    ],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    models: [
      { id: 'claude-opus-4', name: 'Claude Opus 4', providerId: 'anthropic' },
      { id: 'claude-sonnet-4', name: 'Claude Sonnet 4', providerId: 'anthropic' },
      { id: 'claude-haiku-3.5', name: 'Claude Haiku 3.5', providerId: 'anthropic' },
    ],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', providerId: 'openai' },
      { id: 'o3', name: 'o3', providerId: 'openai' },
      { id: 'o4-mini', name: 'o4-mini', providerId: 'openai' },
    ],
  },
  {
    id: 'local',
    name: 'Local Models',
    models: [
      { id: 'llama-3', name: 'Llama 3', providerId: 'local' },
      { id: 'mistral-7b', name: 'Mistral 7B', providerId: 'local' },
      { id: 'deepseek-r1', name: 'DeepSeek R1', providerId: 'local' },
    ],
  },
]

export const CHAT_WORKSPACES: ChatWorkspace[] = [
  { id: 'ws-general', name: 'General', description: 'General-purpose conversations' },
  { id: 'ws-devspaces', name: 'DevSpaces Project', description: 'Conversations about the DevSpaces project' },
  { id: 'ws-review', name: 'Code Review', description: 'Code review and feedback' },
]

const now = Date.now()

export const MOCK_CONVERSATIONS: ChatConversation[] = [
  {
    id: 'conv-1',
    title: 'Kubernetes pod scheduling',
    workspaceId: 'ws-devspaces',
    modelId: 'glm-5.2',
    providerId: 'opencode',
    createdAt: now - 2 * 60 * 60 * 1000,
    updatedAt: now - 5 * 60 * 1000,
    messages: [
      { id: 'msg-1', role: 'user', content: 'How does Kubernetes handle pod scheduling when resource requests exceed available node capacity?', timestamp: now - 2 * 60 * 60 * 1000 },
      { id: 'msg-2', role: 'assistant', content: 'When pod resource requests exceed available node capacity, the Kubernetes scheduler cannot place the pod, and it enters a **Pending** state. Here\'s what happens:\n\n1. **Scheduler filtering**: The scheduler runs predicates (filter plugins) to find nodes that can satisfy the pod\'s resource requests (CPU, memory, etc.). If no node passes, the pod stays Pending.\n\n2. **Cluster Autoscaler**: If enabled, the Cluster Autoscaler detects unschedulable pods and provisions new nodes to accommodate them.\n\n3. **Priority and Preemption**: If the pod has a higher `PriorityClass`, the scheduler may evict lower-priority pods to make room.\n\nYou can check pending pods with:\n```bash\nkubectl get pods --field-selector=status.phase=Pending\n```\n\nAnd describe them to see scheduling failure reasons:\n```bash\nkubectl describe pod <pod-name>\n```', timestamp: now - 2 * 60 * 60 * 1000 + 3000 },
      { id: 'msg-3', role: 'user', content: 'What about resource limits vs requests? When should I set them differently?', timestamp: now - 30 * 60 * 1000 },
      { id: 'msg-4', role: 'assistant', content: 'Good question. **Requests** and **limits** serve different purposes:\n\n- **Requests** are what the scheduler uses to place pods. They guarantee minimum resources.\n- **Limits** cap what a container can use. Exceeding memory limits causes OOM kills; exceeding CPU limits causes throttling.\n\nSet them differently when:\n- Your app has **bursty workloads** — low average CPU but occasional spikes. Set requests to the average and limits higher.\n- You want **overcommitment** — total requests < node capacity < total limits. This improves utilization but risks contention.\n\nSet them equal when:\n- You need **predictable performance** (latency-sensitive services)\n- Running in a **Guaranteed QoS class** is important for eviction ordering\n\nA common pattern:\n```yaml\nresources:\n  requests:\n    cpu: "250m"\n    memory: "256Mi"\n  limits:\n    cpu: "1000m"\n    memory: "512Mi"\n```', timestamp: now - 30 * 60 * 1000 + 4000 },
    ],
  },
  {
    id: 'conv-2',
    title: 'React performance optimization',
    workspaceId: 'ws-general',
    modelId: 'glm-5.2',
    providerId: 'opencode',
    createdAt: now - 24 * 60 * 60 * 1000,
    updatedAt: now - 3 * 60 * 60 * 1000,
    messages: [
      { id: 'msg-5', role: 'user', content: 'My React app re-renders too often. What are the best strategies to reduce unnecessary renders?', timestamp: now - 24 * 60 * 60 * 1000 },
      { id: 'msg-6', role: 'assistant', content: 'Here are the most effective strategies, ordered by impact:\n\n**1. Memoize expensive components**\n```tsx\nconst ExpensiveList = React.memo(({ items }) => (\n  <ul>{items.map(item => <li key={item.id}>{item.name}</li>)}</ul>\n))\n```\n\n**2. Stabilize callback and object references**\n```tsx\nconst handleClick = useCallback(() => { /* ... */ }, [deps])\nconst config = useMemo(() => ({ theme, locale }), [theme, locale])\n```\n\n**3. Split state**\nDon\'t put unrelated state in the same object. Each `useState` update triggers a re-render, so separating them prevents cascading updates.\n\n**4. Use React DevTools Profiler**\nRecord renders, identify which components re-render and why. Look for the "Why did this render?" feature.\n\n**5. Virtualize long lists**\nFor lists with 100+ items, use `react-window` or `@tanstack/virtual` instead of rendering all items to the DOM.', timestamp: now - 24 * 60 * 60 * 1000 + 5000 },
    ],
  },
  {
    id: 'conv-3',
    title: 'Devfile schema validation',
    workspaceId: 'ws-devspaces',
    modelId: 'glm-5.2',
    providerId: 'opencode',
    createdAt: now - 48 * 60 * 60 * 1000,
    updatedAt: now - 24 * 60 * 60 * 1000,
    messages: [
      { id: 'msg-7', role: 'user', content: 'How can I validate a devfile v2 schema programmatically in TypeScript?', timestamp: now - 48 * 60 * 60 * 1000 },
      { id: 'msg-8', role: 'assistant', content: 'You can validate devfile v2 schemas using JSON Schema validation. The devfile v2 schema is published as a JSON Schema:\n\n```typescript\nimport Ajv from "ajv"\nimport devfileSchema from "@devfile/api/schemas/latest/devfile.json"\n\nconst ajv = new Ajv({ allErrors: true })\nconst validate = ajv.compile(devfileSchema)\n\nfunction validateDevfile(devfile: unknown): { valid: boolean; errors: string[] } {\n  const valid = validate(devfile)\n  return {\n    valid: !!valid,\n    errors: validate.errors?.map(e => `${e.instancePath} ${e.message}`) ?? [],\n  }\n}\n```\n\nAlternatively, the `@devfile/api` package provides TypeScript types you can use for compile-time checking, though that won\'t catch runtime issues with user-provided YAML files.', timestamp: now - 48 * 60 * 60 * 1000 + 3000 },
    ],
  },
  {
    id: 'conv-4',
    title: 'PR review: auth middleware refactor',
    workspaceId: 'ws-review',
    modelId: 'glm-5.2',
    providerId: 'opencode',
    createdAt: now - 4 * 60 * 60 * 1000,
    updatedAt: now - 2 * 60 * 60 * 1000,
    messages: [
      { id: 'msg-9', role: 'user', content: 'Review this middleware change. We moved from session-based auth to JWT tokens:\n\n```typescript\nexport function authMiddleware(req: Request, res: Response, next: NextFunction) {\n  const token = req.headers.authorization?.split(" ")[1]\n  if (!token) return res.status(401).json({ error: "No token" })\n  const decoded = jwt.verify(token, process.env.JWT_SECRET!)\n  req.user = decoded\n  next()\n}\n```', timestamp: now - 4 * 60 * 60 * 1000 },
      { id: 'msg-10', role: 'assistant', content: 'A few issues to address:\n\n**1. Missing error handling for `jwt.verify`**\nIf the token is invalid or expired, `jwt.verify` throws. Wrap it:\n```typescript\ntry {\n  const decoded = jwt.verify(token, process.env.JWT_SECRET!)\n  req.user = decoded\n  next()\n} catch (err) {\n  return res.status(401).json({ error: "Invalid token" })\n}\n```\n\n**2. Non-null assertion on `JWT_SECRET`**\nUsing `!` is risky. Validate at startup:\n```typescript\nif (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is required")\n```\n\n**3. No token type checking**\n`decoded` is typed as `string | JwtPayload`. You should narrow:\n```typescript\nif (typeof decoded === "string") {\n  return res.status(401).json({ error: "Unexpected token format" })\n}\n```\n\n**4. Consider token refresh strategy**\nJWTs are stateless — you can\'t revoke them. Plan for short expiry + refresh tokens, or maintain a revocation list for logout.', timestamp: now - 4 * 60 * 60 * 1000 + 5000 },
    ],
  },
]

export const MOCK_THINKING = [
  "The user is asking about architecture patterns. Let me consider the repository pattern and how it fits with their existing codebase. I should also think about error handling at each layer since they mentioned production use...",
  "I need to analyze the constraints here — 200ms p99 latency, 1000 concurrent requests, and data consistency. Optimistic concurrency control would be a good fit since pessimistic locking would bottleneck throughput. Let me think about the trade-offs...",
  "Looking at this from multiple angles: architecture (monolith vs microservices), database query optimization, and caching strategy. The query patterns suggest they'd benefit from composite indexes. Let me also think about cache invalidation...",
  "I should review this code carefully. The error handling has a gap — jwt.verify throws on invalid tokens. The non-null assertion on JWT_SECRET is risky for production. Let me also check for race conditions and resource leaks...",
]

export const MOCK_TOOL_CALLS = [
  [
    { id: 'tc-1', name: 'Read', input: 'src/services/repository.ts', output: 'export interface Repository<T> {\n  findById(id: string): Promise<T | null>\n  ...\n}' },
    { id: 'tc-2', name: 'Grep', input: 'pattern: "class.*Repository", path: "src/"', output: '3 matches found in src/services/' },
  ],
  [
    { id: 'tc-3', name: 'Bash', input: 'npm test -- --coverage', output: 'Tests: 42 passed, 3 failed\nCoverage: 78.4%' },
  ],
  [
    { id: 'tc-4', name: 'Read', input: 'src/db/queries.ts', output: 'const feedQuery = db.select().from(posts).where(...)' },
    { id: 'tc-5', name: 'Bash', input: 'psql -c "EXPLAIN ANALYZE SELECT ..."', output: 'Seq Scan on posts (cost=0.00..431.20 rows=8120)' },
    { id: 'tc-6', name: 'Edit', input: 'src/db/queries.ts: add index hint', output: 'File updated successfully' },
  ],
  [
    { id: 'tc-7', name: 'Read', input: 'src/middleware/auth.ts', output: 'export function authMiddleware(req, res, next) { ... }' },
    { id: 'tc-8', name: 'Grep', input: 'pattern: "jwt.verify", path: "src/"', output: '2 matches: src/middleware/auth.ts:15, src/utils/token.ts:8' },
  ],
]

export const MOCK_STREAMING_RESPONSES: string[] = [
  "That's a great question. Let me break this down:\n\n**Key Points:**\n\n1. The approach you're describing is commonly used in production systems. It provides good separation of concerns and makes the codebase easier to test.\n\n2. You'll want to consider error boundaries at each layer to prevent cascading failures.\n\n3. For the data layer, I'd recommend using a repository pattern:\n```typescript\ninterface Repository<T> {\n  findById(id: string): Promise<T | null>\n  findAll(filter?: Partial<T>): Promise<T[]>\n  create(data: Omit<T, 'id'>): Promise<T>\n  update(id: string, data: Partial<T>): Promise<T>\n  delete(id: string): Promise<void>\n}\n```\n\nThis gives you a clean abstraction that can be backed by any storage engine. Would you like me to elaborate on any of these points?",

  "Here's how I'd approach this:\n\nFirst, let's consider the **constraints**:\n- Performance needs to stay under 200ms p99\n- The system should handle at least 1000 concurrent requests\n- Data consistency is critical for this flow\n\nGiven those requirements, I'd suggest:\n\n```typescript\nasync function processRequest(input: RequestInput): Promise<Result> {\n  // Validate input at the boundary\n  const validated = schema.parse(input)\n  \n  // Use optimistic locking to prevent conflicts\n  const current = await db.findWithVersion(validated.id)\n  if (current.version !== validated.expectedVersion) {\n    throw new ConflictError('Resource was modified')\n  }\n  \n  // Process and persist\n  const result = transform(current, validated)\n  await db.saveWithVersion(result, current.version + 1)\n  \n  return result\n}\n```\n\nThe key insight is using **optimistic concurrency control** rather than pessimistic locking, which would bottleneck throughput at scale.",

  "Looking at this from a few angles:\n\n## Architecture\nThe current setup follows a monolithic pattern. For your scale, this is actually fine — microservices would add operational complexity without clear benefits until you hit team scaling issues.\n\n## Database\nYour query pattern suggests you'd benefit from:\n- An index on `(user_id, created_at DESC)` for the feed query\n- Denormalizing the view count into the main table to avoid the JOIN\n- Using `EXPLAIN ANALYZE` to verify the query plan\n\n```sql\nCREATE INDEX idx_posts_user_feed \n  ON posts (user_id, created_at DESC)\n  INCLUDE (title, preview);\n```\n\n## Caching\nFor the hot path (feed loading), a Redis sorted set keyed by `user:{id}:feed` with post IDs scored by timestamp would reduce database load by ~80% for repeat views.\n\nLet me know which area you'd like to dig deeper into.",

  "I've analyzed the code and here are my findings:\n\n**What's working well:**\n- Clean separation between the transport and business logic layers\n- Good use of TypeScript discriminated unions for the event types\n- Test coverage is solid for the happy path\n\n**Areas for improvement:**\n\n1. **Error handling gaps** — the `catch` block on line 47 swallows the error silently. At minimum, log it:\n```typescript\ncatch (error) {\n  logger.error('Processing failed', { error, context: event })\n  throw new ProcessingError('Failed to handle event', { cause: error })\n}\n```\n\n2. **Race condition** — the `isProcessing` flag isn't atomic. Under concurrent access, two requests could both read `false` before either sets it to `true`. Use a mutex or database-level locking.\n\n3. **Memory leak potential** — event listeners are added in `init()` but never removed. Add cleanup:\n```typescript\nfunction destroy() {\n  emitter.removeAllListeners()\n  clearInterval(healthCheckTimer)\n}\n```\n\nOverall the code is well-structured. These are refinements, not rewrites.",
]

export const DEFAULT_PROVIDER_ID = 'opencode' as const
export const DEFAULT_MODEL_ID = 'glm-5.2'
