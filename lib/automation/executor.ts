import { createClient } from '@supabase/supabase-js'
import { planExecution, type TriggerEvent } from './engine'
import { generateResponse, buildSystemPrompt, type ChatMessage } from '@/lib/ai/client'
import type { Automation, Lead, Conversation, BusinessConfig } from '@/types'
import { generateId, sleep } from '@/lib/utils'

// Service-role client for server-side execution
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface ExecutionResult {
  run_id: string
  automation_id: string
  steps_executed: number
  steps_failed: number
  lead_id?: string
  conversation_id?: string
  error?: string
}

// ── Main Executor ─────────────────────────────────────────────

export async function executeAutomation(
  automation: Automation,
  event: TriggerEvent,
  userId: string,
  existingLead?: Lead,
  existingConvo?: Conversation
): Promise<ExecutionResult> {
  const runId = generateId()

  // Create run log
  await supabase.from('automation_runs').insert({
    id: runId,
    automation_id: automation.id,
    trigger_data: { event, user_id: userId },
    status: 'running',
  })

  let lead = existingLead
  let conversation = existingConvo
  let stepsExecuted = 0
  let stepsFailed = 0

  try {
    // Load business config for this user
    const { data: configData } = await supabase
      .from('business_configs')
      .select('*')
      .eq('user_id', userId)
      .single()

    const businessConfig = configData as BusinessConfig | null

    // Build execution plan
    const plan = await planExecution(automation, event, lead, conversation)
    if (!plan) {
      await supabase.from('automation_runs').update({
        status: 'cancelled',
        completed_at: new Date().toISOString(),
        error: 'Conditions not met',
      }).eq('id', runId)
      return { run_id: runId, automation_id: automation.id, steps_executed: 0, steps_failed: 0 }
    }

    // Execute each step
    for (const step of plan.steps) {
      // Apply delay
      if (step.delay_ms > 0) await sleep(step.delay_ms)

      try {
        const result = await executeAction(
          step.action.type,
          step.payload,
          { userId, lead, conversation, businessConfig, event }
        )

        // Track created resources
        if (result.lead) lead = result.lead
        if (result.conversation) conversation = result.conversation

        stepsExecuted++
      } catch (err) {
        console.error(`[Executor] Step ${step.action.type} failed:`, err)
        stepsFailed++
        // Continue execution for non-critical failures
      }
    }

    // Update automation run count
    await supabase
      .from('automations')
      .update({
        run_count: (automation.run_count ?? 0) + 1,
        last_run_at: new Date().toISOString(),
      })
      .eq('id', automation.id)

    // Mark run complete
    await supabase.from('automation_runs').update({
      status: stepsFailed > 0 ? 'completed' : 'completed',
      completed_at: new Date().toISOString(),
    }).eq('id', runId)

    return {
      run_id: runId,
      automation_id: automation.id,
      steps_executed: stepsExecuted,
      steps_failed: stepsFailed,
      lead_id: lead?.id,
      conversation_id: conversation?.id,
    }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    await supabase.from('automation_runs').update({
      status: 'failed',
      completed_at: new Date().toISOString(),
      error: errMsg,
    }).eq('id', runId)

    return {
      run_id: runId,
      automation_id: automation.id,
      steps_executed: stepsExecuted,
      steps_failed: stepsFailed + 1,
      error: errMsg,
    }
  }
}

// ── Action Handlers ───────────────────────────────────────────

interface ActionContext {
  userId: string
  lead?: Lead
  conversation?: Conversation
  businessConfig: BusinessConfig | null
  event: TriggerEvent
}

interface ActionOutput {
  lead?: Lead
  conversation?: Conversation
  message?: string
}

async function executeAction(
  type: string,
  payload: Record<string, unknown>,
  ctx: ActionContext
): Promise<ActionOutput> {
  switch (type) {
    case 'create_lead':
      return createLeadAction(payload, ctx)

    case 'send_dm':
    case 'send_comment_reply':
      return sendMessageAction(type, payload, ctx)

    case 'ai_response':
      return aiResponseAction(payload, ctx)

    case 'add_tag':
      return addTagAction(payload, ctx)

    case 'update_lead_status':
      return updateLeadStatusAction(payload, ctx)

    case 'send_notification':
      return sendNotificationAction(payload, ctx)

    case 'wait':
      // Already handled by delay_ms in the plan
      return {}

    default:
      console.warn(`[Executor] Unknown action type: ${type}`)
      return {}
  }
}

async function createLeadAction(
  payload: Record<string, unknown>,
  ctx: ActionContext
): Promise<ActionOutput> {
  if (ctx.lead) return { lead: ctx.lead } // already exists

  const commenterHandle = ctx.event.payload.commenter_handle as string ?? ''
  const commenterName = ctx.event.payload.commenter_name as string ?? commenterHandle

  const { data } = await supabase.from('leads').insert({
    user_id: ctx.userId,
    full_name: commenterName || 'Unknown',
    instagram_handle: commenterHandle || null,
    source: ctx.event.type === 'instagram_comment' ? 'instagram_comment' : 'instagram_dm',
    status: 'new',
    stage: 'awareness',
    metadata: { trigger_event: ctx.event.type, post_id: ctx.event.payload.post_id },
  }).select().single()

  return { lead: data as Lead }
}

async function sendMessageAction(
  type: string,
  payload: Record<string, unknown>,
  ctx: ActionContext
): Promise<ActionOutput> {
  const message = String(payload.message ?? payload.reply ?? '')
  if (!message) return {}

  // Interpolate variables
  const interpolated = message.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
    if (key === 'lead.name' && ctx.lead) return ctx.lead.full_name
    if (key === 'lead.instagram') return String(ctx.event.payload.commenter_handle ?? '')
    return ''
  })

  // Create or get conversation
  let conversation = ctx.conversation
  if (!conversation && ctx.lead) {
    const { data } = await supabase.from('conversations').insert({
      user_id: ctx.userId,
      lead_id: ctx.lead.id,
      channel: 'instagram',
      status: 'active',
      is_automated: true,
      automation_id: ctx.lead.conversation_id,
      participant_name: ctx.lead.full_name,
      participant_handle: ctx.lead.instagram_handle,
      last_message: interpolated,
      last_message_at: new Date().toISOString(),
    }).select().single()
    conversation = data as Conversation
  }

  if (conversation) {
    await supabase.from('messages').insert({
      conversation_id: conversation.id,
      role: 'ai',
      content: interpolated,
      channel: 'instagram',
      status: 'sent',
    })
    await supabase.from('conversations').update({
      last_message: interpolated,
      last_message_at: new Date().toISOString(),
    }).eq('id', conversation.id)
  }

  console.log(`[Executor] ${type}: "${interpolated.slice(0, 60)}..."`)
  return { conversation, message: interpolated }
}

async function aiResponseAction(
  payload: Record<string, unknown>,
  ctx: ActionContext
): Promise<ActionOutput> {
  if (!ctx.businessConfig) return {}

  const userMessage = String(ctx.event.payload.text ?? '')
  const locale = ctx.businessConfig.primary_language ?? 'en'

  const messages: ChatMessage[] = [{ role: 'user', content: userMessage }]
  const { response, tokens, latency } = await generateResponse(messages, ctx.businessConfig, locale)

  // Log AI run
  await supabase.from('ai_runs').insert({
    user_id: ctx.userId,
    conversation_id: ctx.conversation?.id ?? null,
    prompt: userMessage,
    response,
    model: 'gpt-4o-mini',
    tokens_used: tokens,
    latency_ms: latency,
    status: 'success',
  })

  return sendMessageAction('send_dm', { message: response }, { ...ctx, conversation: ctx.conversation })
}

async function addTagAction(
  payload: Record<string, unknown>,
  ctx: ActionContext
): Promise<ActionOutput> {
  if (!ctx.lead) return {}
  const tag = String(payload.tag ?? '')
  if (!tag) return {}

  const currentTags = ctx.lead.tags ?? []
  if (currentTags.includes(tag)) return { lead: ctx.lead }

  const { data } = await supabase
    .from('leads')
    .update({ tags: [...currentTags, tag] })
    .eq('id', ctx.lead.id)
    .select()
    .single()

  return { lead: data as Lead }
}

async function updateLeadStatusAction(
  payload: Record<string, unknown>,
  ctx: ActionContext
): Promise<ActionOutput> {
  if (!ctx.lead) return {}
  const status = String(payload.status ?? 'contacted')

  const { data } = await supabase
    .from('leads')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', ctx.lead.id)
    .select()
    .single()

  return { lead: data as Lead }
}

async function sendNotificationAction(
  payload: Record<string, unknown>,
  ctx: ActionContext
): Promise<ActionOutput> {
  // Log the notification — real push/email delivery would be wired here
  console.log(`[Executor] Notification: ${payload.message} → User ${ctx.userId}`)
  return {}
}

// ── Trigger Matcher ───────────────────────────────────────────

export async function matchAndRunAutomations(
  event: TriggerEvent,
  userId: string
): Promise<ExecutionResult[]> {
  const { data: automations } = await supabase
    .from('automations')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')

  if (!automations?.length) return []

  const { evaluateTrigger } = await import('./engine')
  const matched = (automations as Automation[]).filter(a => evaluateTrigger(a.trigger, event))

  const results = await Promise.all(
    matched.map(auto => executeAutomation(auto, event, userId))
  )

  return results
}
