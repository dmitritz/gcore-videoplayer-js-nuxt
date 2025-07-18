import type { Ref } from 'vue'

import type { TelemetryRecord } from '@gcorevideo/player'

// TODO construct the URL on the caller side
export default function useStatsEndpoint(
  streamConfigUrl: Readonly<Ref<string>>
) {
  let sp: Promise<WebSocket> | null = null

  async function send(data: TelemetryRecord) {
    try {
      const s = await openSocket()
      s.send(JSON.stringify(data))
    } catch (error) {
      console.error('useStatsEndpoint send', error)
    }
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
      .then((data) => data.realtimeStats)
  }

  return {
    send,
    close,
  }
}
