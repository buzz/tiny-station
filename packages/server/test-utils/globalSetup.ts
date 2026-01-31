import { RedisContainer } from '@testcontainers/redis'
import type { StartedRedisContainer } from '@testcontainers/redis'

let container: StartedRedisContainer

async function setup() {
  container = await new RedisContainer('redis:7.2-alpine').start()

  // Expose the connection details to all test files via process.env
  process.env.TEST_REDIS_URL = container.getConnectionUrl()

  console.log(`🚀 Test Redis started at ${process.env.TEST_REDIS_URL}`)
}

async function teardown() {
  await container.stop()
}

export { setup, teardown }
