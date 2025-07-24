import http from 'http'

import 'dotenv/config'

import { serve } from 'inngest/node'

import { sql } from './db'
import { healthCheckHandler } from './health-check'
import { functions, inngest } from './inngest'

const PORT = process.env.PORT || 3000

const server = http.createServer((req, res) => {
  if (req.url?.startsWith('/api/inngest')) {
    return serve({
      client: inngest,
      functions,
    })(req, res)
  }

  if (req.url?.startsWith('/health-check')) {
    return healthCheckHandler(req, res)
  }

  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'Not Found' }))
})

server.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`)
})

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server')
  server.close(() => {
    console.log('HTTP server closed')
    sql.end().then(() => {
      console.log('Database connection closed')
      process.exit(0)
    })
  })
})
