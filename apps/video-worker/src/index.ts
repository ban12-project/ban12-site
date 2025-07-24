import { createServer } from 'http'
import { ConnectionState } from 'inngest/components/connect/types'
import { connect } from 'inngest/connect'

import 'dotenv/config'

import { serve } from 'inngest/node'

import { sql } from './db'
import { functions, inngest } from './inngest'

const PORT = process.env.PORT || 3000

;(async () => {
  const connection = await connect({
    apps: [{ client: inngest, functions }],
  })

  console.log('Worker: connected', connection)

  const httpServer = createServer((req, res) => {
    if (req.url?.startsWith('/api/inngest')) {
      return serve({
        client: inngest,
        functions,
      })(req, res)
    }

    if (req.url === '/ready') {
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

      if (req.method === 'OPTIONS') {
        res.writeHead(204)
        res.end()
        return
      }

      if (connection.state === ConnectionState.ACTIVE) {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ status: 'ok' }))
      } else {
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'NOT OK' }))
      }
      return
    }

    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Not Found' }))
  })

  httpServer.listen(PORT, () => {
    console.log(`Worker: HTTP server listening on port ${PORT}`)
  })

  process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server')
    // When the Inngest connection has gracefully closed,
    // this will resolve and the app will exit.
    await connection.closed
    console.log('Worker: Shut down')

    httpServer.close(() => {
      console.log('HTTP server closed')
      sql.end().then(() => {
        console.log('Database connection closed')
        process.exit(0)
      })
    })
  })
})()
