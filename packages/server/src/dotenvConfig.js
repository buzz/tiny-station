import dotenv from 'dotenv'
import path from 'path'

const baseDir = path.resolve(import.meta.dirname, '..', '..', '..')

dotenv.config({
  debug: true,
  path: [path.join(baseDir, '.env.local'), path.join(baseDir, '.env')],
})
