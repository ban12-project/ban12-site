import { EventSchemas } from 'inngest'

type VideoProcess = {
  name: 'video/process'
  data: {
    postId: number
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

type Events = VideoProcess | VideoUnderstanding

export const schemas = new EventSchemas().fromUnion<Events>()
