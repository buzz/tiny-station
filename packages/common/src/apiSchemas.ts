import { z } from 'zod'

const trimmedString = (min?: number, max?: number) =>
  z
    .string()
    .trim()
    .min(min ?? 1)
    .max(max ?? Infinity)

const errorResponseSchema = z.object({ error: z.string() })
const messageResponseSchema = z.object({ message: z.string() })

const registerBodySchema = z
  .object({
    nickname: trimmedString(3, 16),
    email: z.email(),
    password: z.string().min(8),
    passwordConfirm: z.string(),
    notif: z.boolean().default(false),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Password confirmation does not match',
    path: ['passwordConfirm'],
  })

const loginBodySchema = z.object({
  nickname: trimmedString(1),
  password: z.string().min(1),
})

const loginResponseSchema = z.object({
  token: z.string(),
  nickname: z.string(),
  subscribed: z.boolean(),
})

const verifyJwtResponseSchema = z.object({
  nickname: z.string(),
  email: z.string(),
})

const verifyEmailBodySchema = z.object({
  token: z.string(),
})

const updateNotificationsBodySchema = z.object({
  subscribed: z.boolean(),
})

const updateNotificationsResponseSchema = messageResponseSchema.extend({
  subscribed: z.boolean(),
})

type ErrorResponse = z.infer<typeof errorResponseSchema>
type MessageResponse = z.infer<typeof messageResponseSchema>

type RegisterBody = z.infer<typeof registerBodySchema>
type LoginBody = z.infer<typeof loginBodySchema>
type LoginResponse = z.infer<typeof loginResponseSchema>
type VerifyJwtResponse = z.infer<typeof verifyJwtResponseSchema>
type VerifyEmailBody = z.infer<typeof verifyEmailBodySchema>
type UpdateNotificationsBody = z.infer<typeof updateNotificationsBodySchema>
type UpdateNotificationsResponse = z.infer<typeof updateNotificationsResponseSchema>

export type {
  ErrorResponse,
  LoginBody,
  LoginResponse,
  MessageResponse,
  RegisterBody,
  UpdateNotificationsBody,
  UpdateNotificationsResponse,
  VerifyEmailBody,
  VerifyJwtResponse,
}

export {
  errorResponseSchema,
  loginBodySchema,
  loginResponseSchema,
  messageResponseSchema,
  registerBodySchema,
  updateNotificationsBodySchema,
  updateNotificationsResponseSchema,
  verifyEmailBodySchema,
  verifyJwtResponseSchema,
}
