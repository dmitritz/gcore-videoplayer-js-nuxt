import useSettingsStore from '~/store/settings';
import { fetchStream } from '../utils/fetch-stream';
import type { StreamKind } from '../types';

export default function useFetchSource() {
  const settings = useSettingsStore();
  if (settings.apiToken && settings.streamId && settings.streamKind) {
    const kind = settings.streamKind as StreamKind;
    fetchStream(settings.apiToken, String(settings.streamId), kind).then((data) => {
      settings.setStreamDto(data, kind);
    }).catch(e => {
      console.error(e);
    })
  }
}

