import type { Tracer } from '@gcorevideo/player'

type TraceRecord = {
  message: string
  detail?: Record<string, unknown>
  time: number
}

type TimerId = ReturnType<typeof setTimeout>

export class RemoteTracer implements Tracer {
  private buffer: Array<TraceRecord> = []
  private timerId: TimerId | null = null

  constructor(
    private baseTracer: Tracer | undefined,
    private tags: Record<string, unknown> = {}
  ) {}

  reportError(e: unknown): void {
    if (this.baseTracer) {
      this.baseTracer.reportError(e)
    }
    const message = String(e)
    const detail =
      e instanceof Error && 'detail' in e
        ? (e.detail as Record<string, unknown>)
        : undefined
    this.send(message, detail)
  }

  trace(message: string, detail: Record<string, unknown>): void {
    if (this.baseTracer) {
      this.baseTracer.trace(message, detail)
    }
    this.send(message, detail)
  }

  private send(message: string, detail?: Record<string, unknown>) {
    const time = new Date().getTime()
    this.buffer.push({ message, detail, time })
    if (!this.timerId) {
      this.timerId = setTimeout(() => {
        this.timerId = null
        this.flush()
      }, 1000)
    }
  }

  private flush() {
    fetch('/api/traceb', {
      method: 'POST',
      body: JSON.stringify({
        records: this.buffer.splice(0, this.buffer.length),
        tags: this.tags,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    }).catch((e) => console.error(e))
  }
}
