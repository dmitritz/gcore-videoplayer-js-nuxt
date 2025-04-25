import { Events as CoreEvents, UICorePlugin, UIObject } from '@clappr/core'
import {
  CmcdConfig,
  type PlaybackModule,
  type PlaybackType,
  type QualityLevel,
  trace,
} from '@gcorevideo/player'
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
  cmcdSid: Ref<string>
  cmcdCid: Ref<string>
  viewport: Ref<{ width: number, height: number }>
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
    return { min: CLAPPR_VERSION }
  }

  static get version() {
    return VERSION
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
    this.listenTo(
      this.core,
      CoreEvents.CORE_ACTIVE_CONTAINER_CHANGED,
      this.bindActiveContainerListeners
    )
    this.listenTo(this.core, CoreEvents.CORE_RESIZE, this.onResize)
  }

  private get pins(): ExampleUIOptions {
    return this.options.exampleUI as ExampleUIOptions
  }

  private onReady() {
    this.pins.ready.value = true
    this.setSize()
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
    const activePlayback = this.core.activePlayback
    const container = this.core.activeContainer

    trace(`${T}.bindActiveContainerListeners`, {
      activePlayback: activePlayback?.name,
    })

    this.listenTo(container, CoreEvents.CONTAINER_ENDED, this.onEnded)
    this.listenTo(container, CoreEvents.CONTAINER_PLAY, this.onPlay)
    this.listenTo(container, CoreEvents.CONTAINER_PAUSE, this.onPause)
    this.listenTo(container, CoreEvents.CONTAINER_STOP, this.onStop)

    this.pins.activeSource.value = activePlayback.options.src
    this.pins.activeSourceType.value = activePlayback.options.mimeType
    activePlayback.on(
      CoreEvents.PLAYBACK_LEVELS_AVAILABLE,
      (levels: QualityLevel[]) => {
        trace(`${T}.on PLAYBACK_LEVELS_AVAILABLE`, {
          levels,
          currentLevel: activePlayback.currentLevel,
        })
        if (activePlayback.currentLevel !== -1) {
          this.setQualityLevel(levels[activePlayback.currentLevel])
        }
      }
    )
    activePlayback.on(CoreEvents.PLAYBACK_BITRATE, (level: QualityLevel) => {
      trace(`${T}.on PLAYBACK_BITRATE`, { level })
      this.setQualityLevel(level)
    })
    activePlayback.on(CoreEvents.PLAYBACK_ERROR, (error: Error) => {
      console.log('playback error', error)
      // this.pins.errors.value.push(error.message || error.description)
    })
    const cmcd = this.core.getPlugin('cmcd') as CmcdConfig | undefined
    if (cmcd) {
      const { sid, cid } = cmcd.exportIds()
      this.pins.cmcdSid.value = sid
      this.pins.cmcdCid.value = cid
    }
  }

  private setQualityLevel(level: QualityLevel) {
    this.pins.bitrate.value = level.bitrate
    this.pins.width.value = level.width
    this.pins.height.value = level.height
    this.pins.hd.value = level.height >= 720
  }

  override onResize() {
    this.setSize()
    return super.onResize()
  }

  private setSize() {
    const width = this.core.$el.width()
    const height = this.core.$el.height()
    trace(`${T} setSize`, {
      width,
      height,
    })
    this.pins.viewport.value = {
      width,
      height,
    }
  }
}
