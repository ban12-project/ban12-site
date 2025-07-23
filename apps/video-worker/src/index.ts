import http from 'http'

import 'dotenv/config'

import { sql } from './db'
import { healthCheckHandler } from './health-check'
import { processPostHandler } from './process-post'

const PORT = process.env.PORT || 3000

// 定义 URL 路由模式
const processPostPattern = new URLPattern({ pathname: '/process-post/:postId' })
const healthCheckPattern = new URLPattern({ pathname: '/health-check' })

const server = http.createServer(async (req, res) => {
  const { url, method } = req

  const matchingPath = processPostPattern.exec(url)
  const healthMatch = healthCheckPattern.exec(url)

  if (matchingPath) {
    return processPostHandler(req, res, matchingPath.pathname.groups.postId)
  }
  if (healthMatch) {
    return healthCheckHandler(req, res)
  }

  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'Not Found' }))
})

server.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`)
})

// 添加优雅关闭逻辑
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
