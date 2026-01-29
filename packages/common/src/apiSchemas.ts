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
  subscribed: z.boolean(),
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

const forgotPasswordBodySchema = z.object({
  email: z.email(),
})

const resetPasswordBodySchema = z
  .object({
    token: z.string(),
    password: z.string().min(8),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Password confirmation does not match',
    path: ['passwordConfirm'],
  })

const chatMessagesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  before: z.coerce.number().int().optional(),
})

const chatMessagesResponseSchema = z.object({
  messages: z.array(
    z.object({
      uuid: z.string(),
      timestamp: z.number(),
      senderNickname: z.string(),
      message: z.string(),
    })
  ),
  pagination: z.object({
    hasMore: z.boolean(),
    earliestTimestamp: z.number().nullable(),
  }),
})

type ChatMessagesQuery = z.infer<typeof chatMessagesQuerySchema>
type ChatMessagesResponse = z.infer<typeof chatMessagesResponseSchema>

type ErrorResponse = z.infer<typeof errorResponseSchema>
type MessageResponse = z.infer<typeof messageResponseSchema>

type RegisterBody = z.infer<typeof registerBodySchema>
type LoginBody = z.infer<typeof loginBodySchema>
type LoginResponse = z.infer<typeof loginResponseSchema>
type VerifyJwtResponse = z.infer<typeof verifyJwtResponseSchema>
type VerifyEmailBody = z.infer<typeof verifyEmailBodySchema>
type UpdateNotificationsBody = z.infer<typeof updateNotificationsBodySchema>
type UpdateNotificationsResponse = z.infer<typeof updateNotificationsResponseSchema>
type ForgotPasswordBody = z.infer<typeof forgotPasswordBodySchema>
type ResetPasswordBody = z.infer<typeof resetPasswordBodySchema>

export type {
  ChatMessagesQuery,
  ChatMessagesResponse,
  ErrorResponse,
  ForgotPasswordBody,
  LoginBody,
  LoginResponse,
  MessageResponse,
  RegisterBody,
  ResetPasswordBody,
  UpdateNotificationsBody,
  UpdateNotificationsResponse,
  VerifyEmailBody,
  VerifyJwtResponse,
}

export {
  chatMessagesQuerySchema,
  chatMessagesResponseSchema,
  errorResponseSchema,
  forgotPasswordBodySchema,
  loginBodySchema,
  loginResponseSchema,
  messageResponseSchema,
  registerBodySchema,
  resetPasswordBodySchema,
  updateNotificationsBodySchema,
  updateNotificationsResponseSchema,
  verifyEmailBodySchema,
  verifyJwtResponseSchema,
}
