import type {
  Automation,
  AutomationTrigger,
  AutomationAction,
  AutomationCondition,
  Lead,
  Conversation,
} from '@/types'
import { generateId } from '@/lib/utils'

// ── Event Types ───────────────────────────────────────────────

export interface TriggerEvent {
  type: string
  platform?: string
  payload: Record<string, unknown>
  timestamp: string
}

export interface ExecutionContext {
  automation: Automation
  event: TriggerEvent
  lead?: Lead
  conversation?: Conversation
  variables: Record<string, unknown>
}

// ── Trigger Evaluator ─────────────────────────────────────────

export function evaluateTrigger(
  trigger: AutomationTrigger,
  event: TriggerEvent
): boolean {
  if (trigger.type !== event.type) return false

  if (trigger.platform && trigger.platform !== event.payload.platform) return false

  if (trigger.content_type && trigger.content_type !== 'any') {
    if (trigger.content_type !== event.payload.content_type) return false
  }

  if (trigger.keywords && trigger.keywords.length > 0) {
    const text = (event.payload.text as string || '').toLowerCase()
    const matched = trigger.keywords.some((kw) =>
      text.includes(kw.toLowerCase())
    )
    if (!matched) return false
  }

  if (trigger.post_id && trigger.post_id !== event.payload.post_id) return false

  return true
}

// ── Condition Evaluator ───────────────────────────────────────

export function evaluateCondition(
  condition: AutomationCondition,
  context: ExecutionContext
): boolean {
  const value = resolveVariable(condition.field, context)

  switch (condition.operator) {
    case 'equals':
      return String(value) === String(condition.value)
    case 'contains':
      return String(value).toLowerCase().includes(String(condition.value).toLowerCase())
    case 'greater_than':
      return Number(value) > Number(condition.value)
    case 'less_than':
      return Number(value) < Number(condition.value)
    case 'is_empty':
      return !value || value === ''
    case 'is_not_empty':
      return !!value && value !== ''
    default:
      return false
  }
}

export function evaluateConditions(
  conditions: AutomationCondition[],
  context: ExecutionContext
): boolean {
  if (!conditions || conditions.length === 0) return true
  return conditions.every((c) => evaluateCondition(c, context))
}

// ── Variable Resolver ─────────────────────────────────────────

function resolveVariable(field: string, context: ExecutionContext): unknown {
  const parts = field.split('.')
  let current: Record<string, unknown> = {
    event: context.event.payload,
    lead: context.lead || {},
    conversation: context.conversation || {},
    vars: context.variables,
  }

  for (const part of parts) {
    if (current && typeof current === 'object') {
      current = current[part] as Record<string, unknown>
    } else {
      return undefined
    }
  }

  return current
}

// ── Action Builder ────────────────────────────────────────────

export interface ActionResult {
  action_id: string
  type: string
  success: boolean
  output: Record<string, unknown>
  error?: string
}

export async function buildActionPayload(
  action: AutomationAction,
  context: ExecutionContext
): Promise<Record<string, unknown>> {
  const config = { ...action.config }

  // Interpolate template variables like {{lead.name}}
  for (const [key, val] of Object.entries(config)) {
    if (typeof val === 'string') {
      config[key] = val.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
        return String(resolveVariable(path.trim(), context) ?? '')
      })
    }
  }

  return config
}

// ── Execution Planner ─────────────────────────────────────────

export interface ExecutionPlan {
  automation_id: string
  run_id: string
  steps: ExecutionStep[]
}

export interface ExecutionStep {
  action: AutomationAction
  payload: Record<string, unknown>
  delay_ms: number
}

export async function planExecution(
  automation: Automation,
  event: TriggerEvent,
  lead?: Lead,
  conversation?: Conversation
): Promise<ExecutionPlan | null> {
  const context: ExecutionContext = {
    automation,
    event,
    lead,
    conversation,
    variables: {},
  }

  // Check all conditions
  if (!evaluateConditions(automation.conditions, context)) {
    return null
  }

  const sortedActions = [...automation.actions].sort((a, b) => a.order - b.order)

  const steps: ExecutionStep[] = await Promise.all(
    sortedActions.map(async (action) => ({
      action,
      payload: await buildActionPayload(action, context),
      delay_ms: (action.delay_seconds ?? 0) * 1000,
    }))
  )

  return {
    automation_id: automation.id,
    run_id: generateId(),
    steps,
  }
}

// ── Mock Event Factories ──────────────────────────────────────

export function createInstagramCommentEvent(
  postId: string,
  commentText: string,
  commenterHandle: string,
  contentType: 'reel' | 'post' | 'carousel' = 'reel'
): TriggerEvent {
  return {
    type: 'instagram_comment',
    platform: 'instagram',
    payload: {
      platform: 'instagram',
      post_id: postId,
      content_type: contentType,
      text: commentText,
      commenter_handle: commenterHandle,
      commenter_name: commenterHandle,
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
  }
}

export function createInstagramDMEvent(
  senderId: string,
  senderHandle: string,
  messageText: string
): TriggerEvent {
  return {
    type: 'instagram_dm',
    platform: 'instagram',
    payload: {
      platform: 'instagram',
      sender_id: senderId,
      sender_handle: senderHandle,
      text: messageText,
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
  }
}
