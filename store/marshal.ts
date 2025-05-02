import type {
  PlaybackType,
  PlayerDebugTag,
  TransportPreference,
} from '@gcorevideo/player'
import { z } from 'zod'

export type AdditionalAbrRulesSettings = {
  insufficientBufferRule?: boolean
  droppedFramesRule?: boolean
  switchHistoryRule?: boolean
  abandonRequestsRule?: boolean
}

export type DashAbrStrategy =
  | 'abrDynamic'
  | 'abrBola'
  | 'abrL2A'
  | 'abrLoLP'
  | 'abrThroughput'

export type DashSettings = {
  streaming: {
    abr?: {
      ABRStrategy?: DashAbrStrategy
      additionalAbrRules?: AdditionalAbrRulesSettings
      autoSwitchBitrate?: {
        audio?: boolean
        video?: boolean
      }
      initialBitrate?: {
        audio?: number
        video?: number
      }
      maxBitrate?: {
        audio?: number
        video?: number
      }
    }
    delay?: {
      liveDelay: number
    }
    liveCatchup?: {
      maxDrift?: number
      playbackRate?: {
        max?: number
        min?: number
      }
    }
    retryAttempts?: {
      MPD?: number
      IndexSegment?: number
      InitializationSegment?: number
      MediaSegment?: number
      BitstreamSwitchingSegment?: number
      FragmentInfoSegment?: number
      XLinkExpansion?: number
      license?: number
      other?: number
      lowLatencyReductionFactor?: number
      lowLatencyMultiplyFactor?: number
    }
  }
}

export type PersistentSettings = {
  autoplay: boolean
  dash: DashSettings
  debug: PlayerDebugTag
  // experimental: Record<string, unknown>
  // godMode: boolean
  loop: boolean
  mute: boolean
  playbackType?: PlaybackType
  plugins: string[]
  poster: string
  priorityTransport: TransportPreference
  restrictResolution: number
  clips: string
  recycleVideo: boolean
  thumbnails: {
    sprite: string
    vtt: string
    // backdropHeight: number
    // backdropMinOpacity: number
    // backdropMaxOpacity: number
    // spotlightHeight: number
  },
  sources: string[]
}

const dashRuleSchema = z.object({ active: z.boolean() })
const dashSchema = z.object({
  streaming: z.object({
    abr: z.object({
      ABRStrategy: z
        .enum(['abrDynamic', 'abrThroughput', 'abrBola'])
        .optional(),
      additionalAbrRules: z
        .object({
          throughputRule: z.boolean().optional(),
          insufficientBufferRule: dashRuleSchema.optional(),
          droppedFramesRule: dashRuleSchema.optional(),
          switchHistoryRule: dashRuleSchema.optional(),
        })
        .optional(),
      autoSwitchBitrate: z
        .object({
          audio: z.boolean().optional(),
          video: z.boolean().optional(),
        })
        .optional(),
      initialBitrate: z
        .object({
          audio: z.number().optional(),
          video: z.number().optional(),
        })
        .optional(),
      maxBitrate: z
        .object({
          audio: z.number().optional(),
          video: z.number().optional(),
        })
        .optional(),
    }),
    delay: z.object({ liveDelay: z.number().optional() }).optional(),
    liveCatchup: z
      .object({
        maxDrift: z.number().optional(),
        playbackRate: z
          .object({
            max: z.number().optional(),
            min: z.number().optional(),
          })
          .optional(),
      })
      .optional(),
  }).optional(),
})

const schema = z.object({
  autoplay: z.boolean().optional(),
  clips: z.string().optional(),
  dash: dashSchema.optional(),
  debug: z.string().optional(),
  experimental: z.record(z.any()).optional(),
  loop: z.boolean().optional(),
  mute: z.boolean().optional(),
  playbackType: z.enum(['live', 'vod']).optional(),
  plugins: z.array(z.string()).optional(),
  poster: z.string().optional(),
  priorityTransport: z.enum(['dash', 'hls']).optional(),
  recycleVideo: z.boolean().optional(),
  restrictResolution: z.number().optional(),
  sources: z.array(z.string()).optional(),
  thumbnails: z.object({
    sprite: z.string().optional(),
    vtt: z.string().optional(),
  }).optional(),
})

export function parseSettings(data: unknown): Partial<PersistentSettings> {
  return schema.parse(data) as Partial<PersistentSettings>
}

export function parseDashSettings(data: unknown): DashSettings {
  return dashSchema.parse(data) as DashSettings
}
