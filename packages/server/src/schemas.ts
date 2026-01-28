import { z } from 'zod'

const userDataSchema = z.object({
  _id: z.email(),
  nickname: z.string().nonempty(),
})

const jwtPayloadSchema = z.object({ user: userDataSchema })

const icecastStatusSchema = z.tuple([
  // Index 0: Metadata/Namespace object
  z.object({
    name: z.string(),
    ns: z.string(),
  }),
  // Index 1: Server and Stream stats
  z.object({
    admin: z.string().optional(),
    host: z.string().optional(),
    location: z.string().optional(),
    server_id: z.string().optional(),
    server_start_iso8601: z.string().optional(),
    // 'source' is an object where keys are mountpoints (e.g., "/stream.ogg")
    source: z
      .record(
        z.string(),
        z.object({
          listenurl: z.string(),
          server_name: z.string(),
          stream_start_iso8601: z.string(),
          listeners: z.number(),
        })
      )
      .optional(),
  }),
])

export { icecastStatusSchema, jwtPayloadSchema, userDataSchema }
