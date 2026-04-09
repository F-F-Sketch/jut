// ============================================================
// JUT â Core Type Definitions
// ============================================================

export type Locale = 'en' | 'es'

// ââ Auth / Users âââââââââââââââââââââââââââââââââââââââââââââ

export interface UserProfile {
  id: string
  user_id: string
  full_name: string | null
  avatar_url: string | null
  business_name: string | null
  plan: PlanType
  locale: Locale
  currency: 'USD' | 'COP'
  created_at: string
  updated_at: string
}

export type PlanType = 'free' | 'starter' | 'growth' | 'elite'

// ââ Business Configuration ââââââââââââââââââââââââââââââââââââ

export interface BusinessConfig {
  id: string
  user_id: string
  business_name: string
  business_type: string
  website: string | null
  phone: string | null
  email: string | null
  country: string
  timezone: string
  instagram_handle: string | null
  facebook_url: string | null
  whatsapp_number: string | null
  ai_tone: AITone
  primary_language: Locale
  qualification_criteria: string | null
  escalation_rules: string | null
  automation_goals: string | null
  faqs: FAQ[]
  offers: Offer[]
  created_at: string
  updated_at: string
}

export type AITone = 'formal' | 'friendly' | 'casual' | 'sales'

export interface FAQ {
  id: string
  question: string
  answer: string
}

export interface Offer {
  id: string
  name: string
  description: string
  price: number
  currency: 'USD' | 'COP'
}

// ââ Leads / CRM âââââââââââââââââââââââââââââââââââââââââââââââ

export interface Lead {
  id: string
  user_id: string
  full_name: string
  email: string | null
  phone: string | null
  instagram_handle: string | null
  source: LeadSource
  status: LeadStatus
  stage: LeadStage
  tags: string[]
  notes: string | null
  qualified: boolean
  assigned_to: string | null
  conversation_id: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export type LeadSource =
  | 'instagram_comment'
  | 'instagram_dm'
  | 'facebook'
  | 'whatsapp'
  | 'manual'
  | 'form'
  | 'other'

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted' | 'lost'

export type LeadStage = 'awareness' | 'interest' | 'consideration' | 'intent' | 'purchase' | 'retention'

export interface LeadActivity {
  id: string
  lead_id: string
  type: 'note' | 'status_change' | 'stage_change' | 'message_sent' | 'message_received' | 'call' | 'automation'
  content: string
  metadata: Record<string, unknown>
  created_at: string
  created_by: string | null
}

// ââ Conversations âââââââââââââââââââââââââââââââââââââââââââââ

export interface Conversation {
  id: string
  user_id: string
  lead_id: string | null
  channel: Channel
  status: ConversationStatus
  external_id: string | null
  participant_name: string | null
  participant_handle: string | null
  last_message: string | null
  last_message_at: string | null
  unread_count: number
  is_automated: boolean
  automation_id: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export type Channel = 'instagram' | 'facebook' | 'whatsapp' | 'sms' | 'email' | 'internal'

export type ConversationStatus = 'active' | 'resolved' | 'archived' | 'pending'

export interface Message {
  id: string
  conversation_id: string
  role: 'ai' | 'user' | 'human_agent'
  content: string
  channel: Channel
  external_id: string | null
  status: 'sent' | 'delivered' | 'read' | 'failed'
  metadata: Record<string, unknown>
  created_at: string
}

// ââ Automations âââââââââââââââââââââââââââââââââââââââââââââââ

export interface Automation {
  id: string
  user_id: string
  name: string
  description: string | null
  status: AutomationStatus
  trigger: AutomationTrigger
  actions: AutomationAction[]
  conditions: AutomationCondition[]
  run_count: number
  last_run_at: string | null
  created_at: string
  updated_at: string
}

export type AutomationStatus = 'active' | 'inactive' | 'draft' | 'paused'

export interface AutomationTrigger {
  type: TriggerType
  platform?: Channel
  content_type?: 'reel' | 'post' | 'carousel' | 'story'
  keywords?: string[]
  post_id?: string
  schedule?: string
  event?: string
}

export type TriggerType =
  | 'instagram_comment'
  | 'instagram_dm'
  | 'keyword_match'
  | 'new_follower'
  | 'schedule'
  | 'webhook'
  | 'manual'

export interface AutomationAction {
  id: string
  type: ActionType
  order: number
  config: Record<string, unknown>
  delay_seconds?: number
}

export type ActionType =
  | 'send_dm'
  | 'send_comment_reply'
  | 'add_tag'
  | 'update_lead_status'
  | 'create_lead'
  | 'send_notification'
  | 'wait'
  | 'condition_branch'
  | 'ai_response'
  | 'webhook'

export interface AutomationCondition {
  id: string
  field: string
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty'
  value: string | number | boolean
}

export interface AutomationRun {
  id: string
  automation_id: string
  trigger_data: Record<string, unknown>
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  started_at: string
  completed_at: string | null
  error: string | null
}

// ââ Social Triggers âââââââââââââââââââââââââââââââââââââââââââ

export interface SocialTrigger {
  id: string
  user_id: string
  automation_id: string
  platform: 'instagram' | 'facebook'
  content_type: 'reel' | 'post' | 'carousel' | 'story' | 'any'
  content_id: string | null
  keywords: string[]
  response_flow_id: string | null
  reply_comment: boolean
  reply_dm: boolean
  comment_reply_text: string | null
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

// ââ Sales / POS âââââââââââââââââââââââââââââââââââââââââââââââ

export interface Product {
  id: string
  user_id: string
  name: string
  description: string | null
  price: number
  currency: 'USD' | 'COP'
  category: string | null
  type: 'product' | 'service' | 'package' | 'subscription'
  status: 'active' | 'inactive' | 'draft'
  images: string[]
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  user_id: string
  lead_id: string | null
  conversation_id: string | null
  customer_name: string
  customer_email: string | null
  customer_phone: string | null
  items: OrderItem[]
  subtotal: number
  total: number
  currency: 'USD' | 'COP'
  status: OrderStatus
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  payment_method: string | null
  stripe_payment_intent: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type OrderStatus = 'draft' | 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled'

export interface OrderItem {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  total: number
}

// ââ AI / Agent ââââââââââââââââââââââââââââââââââââââââââââââââ

export interface AIRun {
  id: string
  user_id: string
  conversation_id: string | null
  automation_id: string | null
  prompt: string
  response: string
  model: string
  tokens_used: number
  latency_ms: number
  status: 'success' | 'error'
  error: string | null
  created_at: string
}

// ââ Analytics âââââââââââââââââââââââââââââââââââââââââââââââââ

export interface AnalyticsSummary {
  total_leads: number
  leads_today: number
  leads_this_week: number
  active_conversations: number
  automations_fired_today: number
  automations_fired_this_week: number
  revenue_this_month: number
  conversion_rate: number
}

// ââ Integrations ââââââââââââââââââââââââââââââââââââââââââââââ

export interface Integration {
  id: string
  user_id: string
  provider: 'instagram' | 'facebook' | 'whatsapp' | 'stripe' | 'openai'
  status: 'connected' | 'disconnected' | 'error' | 'pending'
  access_token: string | null
  refresh_token: string | null
  expires_at: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

// ââ API Response ââââââââââââââââââââââââââââââââââââââââââââââ

export interface ApiResponse<T = unknown> {
  data: T | null
  error: string | null
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  limit: number
  total_pages: number
}
