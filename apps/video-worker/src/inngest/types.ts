import { EventSchemas } from 'inngest'

type VideoProcess = {
  name: 'video/process'
  data: {
    postId: number
    restaurantId: string
  }
}

type VideoUnderstanding = {
  name: 'video/understanding'
  data: {
    id: string
    fileUri?: string
    part?: {
      uri: string
      mimeType: string
    }
  }
}

type TriggerRevalidation = {
  name: 'web/revalidation.trigger'
  data: {
    /** restaurant ID */
    id: string
  }
}

type Events = VideoProcess | VideoUnderstanding | TriggerRevalidation

export const schemas = new EventSchemas().fromUnion<Events>()
