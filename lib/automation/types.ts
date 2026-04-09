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
  error?: string
}
