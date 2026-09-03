import type { HTMLAttributes } from 'react'

export {}

declare global {
  interface ModelContextTool {
    name: string
    title?: string
    description: string
    inputSchema?: Record<string, unknown>
    annotations?: {
      readOnlyHint?: boolean
      untrustedContentHint?: boolean
    }
    execute: (input: Record<string, unknown>, options: { signal: AbortSignal }) => Promise<unknown>
  }

  interface RegisteredModelContextTool {
    name: string
    title?: string
    description: string
    inputSchema?: Record<string, unknown>
    annotations?: ModelContextTool['annotations']
    window: Window
    origin: string
  }

  interface ModelContext extends EventTarget {
    registerTool(
      tool: ModelContextTool,
      options?: { signal?: AbortSignal; exposedTo?: string[] }
    ): Promise<void>
    getTools(options?: { targetOrigins?: string[] }): Promise<RegisteredModelContextTool[]>
    executeTool(
      tool: RegisteredModelContextTool,
      input?: Record<string, unknown>,
      options?: { signal?: AbortSignal; expectedTargetOrigin?: string }
    ): Promise<string>
    ontoolchange: ((event: Event) => void) | null
  }

  interface Document {
    readonly modelContext?: ModelContext
  }
}

declare module 'react' {
  interface FormHTMLAttributes<T> extends HTMLAttributes<T> {
    toolname?: string
    tooldescription?: string
    toolautosubmit?: boolean
  }

  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    toolparamdescription?: string
  }

  interface TextareaHTMLAttributes<T> extends HTMLAttributes<T> {
    toolparamdescription?: string
  }
}
