import type { Ref } from 'vue'

import type { TelemetryRecord } from '@gcorevideo/player'

// TODO construct the URL on the caller side
export default function useStatsEndpoint(
  streamConfigUrl: Readonly<Ref<string>>
) {
  let sp: Promise<WebSocket> | null = null

  function send(data: TelemetryRecord) {
    return openSocket()
      .then((s) => s.send(JSON.stringify(data)))
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
            socket.onopen = () => resolve(socket as WebSocket)
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
            new Error('Realtime statistics is not available')
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
