import { Inngest } from 'inngest'

// Create a client to send and receive events
// It's recommended to use the same app ID as your main application
// to see all events under one service in Inngest Cloud.
export const inngest = new Inngest({ id: 'ban12' })