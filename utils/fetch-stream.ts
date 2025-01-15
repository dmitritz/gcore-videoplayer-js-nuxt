import type { StreamSource } from '../store/settings';
import type { StreamDto, StreamKind } from "../types";

const API_URL = 'https://api.gcore.com/streaming';

export function parseStreamDto(data: StreamDto, sk: StreamKind): StreamSource {
  return {
    // master: (data.uri || data.hls_url) as string,
    master: (data.hls_url || '') as string, // TODO
    dash: data.dash_url as string,
    hlsCmaf: data.hls_cmaf_url as string,
    hlsMpegts: data.hls_mpegts_url as string,
    poster: (data.screenshot || data.poster) as string,
  };
}

export function fetchStream(token: string, streamId: number, kind: StreamKind): Promise<StreamDto> {
  const resourceUrl = `${API_URL}/${kind}s/${streamId}`

  return fetch(resourceUrl, {
    headers: {
      authorization: `APIKey ${token}`
    },
    mode: 'cors',
  }).then((res) => {
    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
    }
    return res.json()
  });
}
