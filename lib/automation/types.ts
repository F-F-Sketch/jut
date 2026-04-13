export interface TriggerEvent {
  type: string
  platform: string
  payload: Record<string, unknown>
  timestamp: string
}

export interface ExecutionContext {
  userId: string
  automationId: string
  triggerData: Record<string, unknown>
}

export interface ExecutionResult {
  success: boolean
  actionsRun: number
  steps_executed: number
  automation_id?: string
  lead_id?: string
  conversation_id?: string
  error?: string
}
