import configure from './sentry.common.config'
import { version } from '@gcorevideo/player'

configure({
  gplayer: version().gplayer,
})
