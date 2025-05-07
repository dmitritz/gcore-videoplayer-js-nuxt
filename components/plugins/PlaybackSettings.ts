import { Events, UICorePlugin } from "@clappr/core"
import type { QualityLevel } from "@gcorevideo/player"

const VERSION = '0.0.1'
const CLAPPR_VERSION = '0.11.3'
// const T = 'plugins.playback_settings'

export class PlaybackSettings extends UICorePlugin {
  static get version() {
    return VERSION
  }

  get supportedVersion() {
    return {
      min: CLAPPR_VERSION
    }
  }

  get name() {
    return 'playback_settings'
  }

  override bindEvents() {
    if (this.options.playbackSettings?.restrictResolution) {
      this.listenTo(this.core, Events.CORE_ACTIVE_CONTAINER_CHANGED, () => {
        this.listenTo(this.core.activePlayback, Events.PLAYBACK_LEVELS_AVAILABLE, (levels: QualityLevel[]) => {
          const targetLevel = levels.findIndex(level => {
            const matchVal = level.width > level.height ? level.height : level.width
            return matchVal >= this.options.playbackSettings.restrictResolution
          })
          if (targetLevel !== -1) {
            this.core.activePlayback.currentLevel = targetLevel
          }
        })
      })
    }
  }
}
