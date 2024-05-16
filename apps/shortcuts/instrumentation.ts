import * as Sentry from '@sentry/nextjs'

export function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init({
      dsn: 'https://f6154cad843071616a95017ace8238e7@o4507083088920576.ingest.us.sentry.io/4507083090362368',
    
      // Adjust this value in production, or use tracesSampler for greater control
      tracesSampleRate: 1,
    
      // Setting this option to true will print useful information to the console while you're setting up Sentry.
      debug: false,
    
      // uncomment the line below to enable Spotlight (https://spotlightjs.com)
      // spotlight: process.env.NODE_ENV === 'development',
    })
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init({
      dsn: 'https://f6154cad843071616a95017ace8238e7@o4507083088920576.ingest.us.sentry.io/4507083090362368',
    
      // Adjust this value in production, or use tracesSampler for greater control
      tracesSampleRate: 1,
    
      // Setting this option to true will print useful information to the console while you're setting up Sentry.
      debug: false,
    })
  }
}