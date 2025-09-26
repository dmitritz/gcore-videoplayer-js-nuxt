import type { Ref } from 'vue'

import {
  TelemetryEvent,
  type PlaybackType,
  type TelemetryRecord,
} from '@gcorevideo/player'

type GcoreRealtimeStatsRecord = {
  event: 'init' | 'start' | 'watch' | 'heatmap'
  type?: PlaybackType
  count?: number
  time?: number
  total_ms?: number
}

export default function useStatsEndpoint(
  streamConfigUrl: Readonly<Ref<string>>
) {
  let sp: Promise<WebSocket> | null = null

  function send(data: TelemetryRecord) {
    return openSocket()
      .then((s) => s.send(JSON.stringify(translateEvent(data))))
      .catch((error) => {
        console.error('useStatsEndpoint', error)
      })
  }

  function close() {
    if (sp) {
      sp.then((s) => s.close())
    }
  }

  function openSocket(): Promise<WebSocket> {
    if (!sp) {
      sp = new Promise<WebSocket>((resolve, reject) => {
        fetchStatsEndpointUrl()
          .then((url: string) => {
            const socket = new WebSocket(url)
            socket.onopen = () => resolve(socket)
            socket.onerror = (error) => reject(error)
          })
          .catch(reject)
      })
    }
    return sp
  }

  function fetchStatsEndpointUrl(): Promise<string> {
    if (!streamConfigUrl.value) {
      return Promise.reject(new Error('Stream config URL is not set'))
    }
    return fetch(streamConfigUrl.value)
      .then((res) => res.json())
      .then((data) => {
        if (!data.realtimeStats) {
          return Promise.reject(
            new Error(
              `Realtime statistics is not available - check the player config at ${streamConfigUrl.value}`
            )
          )
        }
        return data.realtimeStats
      })
  }

  return {
    send,
    close,
  }
}

function translateEvent(data: TelemetryRecord): GcoreRealtimeStatsRecord {
  const { event, ...rest } = data
  return {
    event: fromTelemetryEvent(event),
    ...rest,
  }
}

function fromTelemetryEvent(
  event: TelemetryEvent
): GcoreRealtimeStatsRecord['event'] {
  switch (event) {
    case TelemetryEvent.Init:
      return 'init'
    case TelemetryEvent.Start:
      return 'start'
    case TelemetryEvent.Watch:
      return 'watch'
    case TelemetryEvent.Stall:
      return 'heatmap'
    default:
      throw new Error(`Unknown telemetry event: ${event}`)
  }
}
