import { Events as CoreEvents, UICorePlugin, UIObject } from '@clappr/core'
import {
  type PlaybackModule,
  type PlaybackType,
  type QualityLevel,
} from '@gcorevideo/player'
import assert from 'assert'
import type { Ref } from 'vue'

export type ExampleUIOptions = {
  activeSource: Ref<string>
  activeSourceType: Ref<string>
  bitrate: Ref<number>
  currentTime: Ref<number>
  errors: Ref<string[]>
  hd: Ref<boolean>
  height: Ref<number>
  paused: Ref<boolean>
  playback: Ref<PlaybackModule | null>
  playbackType: Ref<PlaybackType | null>
  playing: Ref<boolean>
  ready: Ref<boolean>
  starting: Ref<boolean>
  stopped: Ref<boolean>
  width: Ref<number>
}

const CLAPPR_VERSION = '0.11.4'
const VERSION = '0.1.0'

const T = 'plugins.example_ui'

export class ExampleUI extends UICorePlugin {
  private timerId: ReturnType<typeof setInterval> | null = null

  get name() {
    return 'example_ui'
  }

  get supportedVersion() {
    return { min: CLAPPR_VERSION };
  }

  static get version() {
    return VERSION;
  }

  private get activePlayback(): PlaybackModule | null {
    if (!this.core.activePlayback) {
      return null
    }
    switch (this.core.activePlayback.name) {
      case 'dash':
        return 'dash'
      case 'hls':
        return 'hls'
      default:
        return 'html5_video'
    }
  }

  private get playbackType(): PlaybackType | null {
    return this.core.activePlayback?.getPlaybackType() ?? null
  }

  override bindEvents() {
    this.listenTo(this.core, CoreEvents.CORE_READY, this.onReady)
  }

  private get pins(): ExampleUIOptions {
    return this.options.exampleUI as ExampleUIOptions
  }

  private onReady() {
    // TODO
    this.pins.ready.value = true
    this.addContainerEventListeners()
  }

  private addContainerEventListeners() {
    const container = this.core.activeContainer
    assert(container, 'Container is not available')
    this.listenTo(container, CoreEvents.CONTAINER_ENDED, this.onEnded)
    this.listenTo(container, CoreEvents.CONTAINER_PLAY, this.onPlay)
    this.listenTo(container, CoreEvents.CONTAINER_PAUSE, this.onPause)
    this.listenTo(container, CoreEvents.CONTAINER_STOP, this.onStop)
    this.listenTo(
      this.core,
      CoreEvents.CORE_ACTIVE_CONTAINER_CHANGED,
      this.bindActiveContainerListeners
    )
    this.bindActiveContainerListeners()
  }

  private onEnded() {
    this.pins.playing.value = false
    this.pins.paused.value = false
    this.pins.starting.value = false
    this.pins.stopped.value = true
  }

  private onPause() {
    this.pins.playing.value = false
    this.pins.paused.value = true
  }

  private onPlay() {
    this.pins.playing.value = true
    this.pins.paused.value = false
    this.pins.stopped.value = false
    this.pins.starting.value = false
    this.pins.playback.value = this.activePlayback
    this.pins.playbackType.value = this.playbackType
    if (!this.timerId) {
      this.timerId = setInterval(() => {
        this.pins.currentTime.value = new Date().getTime()
      }, 1000)
    }
  }

  private onStop() {
    this.pins.playing.value = false
    this.pins.playback.value = null
    this.pins.playbackType.value = null
    this.pins.stopped.value = true
    this.pins.hd.value = false
    this.pins.bitrate.value = 0
    this.pins.width.value = 0
    this.pins.height.value = 0
    this.pins.paused.value = false
    this.pins.starting.value = false
    this.pins.currentTime.value = 0
    this.stopTimer()
  }

  private stopTimer() {
    if (this.timerId) {
      clearInterval(this.timerId)
      this.timerId = null
    }
  }

  override destroy(): UIObject {
    this.stopTimer()
    return super.destroy()
  }

  private bindActiveContainerListeners() {
    const activeContainer = this.core.activeContainer
    const activePlayback = this.core.activePlayback
    assert(activeContainer, 'Active container is not available')
    assert(activePlayback, 'Active playback is not available')

    this.pins.activeSource.value = activePlayback.options.src
    this.pins.activeSourceType.value = activePlayback.options.mimeType
    activePlayback.on(
      CoreEvents.PLAYBACK_LEVELS_AVAILABLE,
      (levels: QualityLevel[]) => {
        assert(levels.length > 0, 'No quality levels available')
        const qLevel = levels[0]
        this.setQualityLevel(qLevel)
      }
    )
    activeContainer.on(CoreEvents.CONTAINER_BITRATE, (level: QualityLevel) => {
      this.setQualityLevel(level)
    })
    activePlayback.on(CoreEvents.PLAYBACK_ERROR, (error: Error) => {
      console.log('playback error', error)
      // this.pins.errors.value.push(error.message || error.description)
    })
  }

  private setQualityLevel(level: QualityLevel) {
    this.pins.bitrate.value = level.bitrate
    this.pins.width.value = level.width
    this.pins.height.value = level.height
    this.pins.hd.value = level.height >= 720
  }
}
