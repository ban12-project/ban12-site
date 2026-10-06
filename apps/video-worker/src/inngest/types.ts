import { eventType, staticSchema } from "inngest";

type VideoProcessData = {
  postId: number;
  restaurantId: string;
};

type VideoUnderstandingData = {
  id: string;
  fileUri?: string;
  part?: {
    uri: string;
    mimeType: string;
  };
};

type TriggerRevalidationData = {
  /** restaurant ID */
  id: string;
};

export type VideoProcess = {
  name: "video/process";
  data: VideoProcessData;
};

export type VideoUnderstanding = {
  name: "video/understanding";
  data: VideoUnderstandingData;
};

export type TriggerRevalidation = {
  name: "web/revalidation.trigger";
  data: TriggerRevalidationData;
};

export type Events = VideoProcess | VideoUnderstanding | TriggerRevalidation;

export const videoProcess = eventType("video/process", {
  schema: staticSchema<VideoProcessData>(),
});

export const videoUnderstanding = eventType("video/understanding", {
  schema: staticSchema<VideoUnderstandingData>(),
});

export const triggerRevalidation = eventType("web/revalidation.trigger", {
  schema: staticSchema<TriggerRevalidationData>(),
});
