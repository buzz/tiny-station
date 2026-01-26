import { z } from 'zod'

const trimmedString = (min?: number, max?: number) =>
  z
    .string()
    .trim()
    .min(min ?? 1)
    .max(max ?? Infinity)

const RegisterSchema = z
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

const LoginSchema = z.object({
  nickname: trimmedString(1),
  password: z.string().min(1),
})

const VerifyEmailSchema = z.object({
  token: z.string(),
})

const UpdateNotificationsSchema = z.object({
  subscribed: z.boolean(),
})

type RegisterData = z.infer<typeof RegisterSchema>
type LoginData = z.infer<typeof LoginSchema>
type VerifyEmailData = z.infer<typeof VerifyEmailSchema>
type UpdateNotificationsData = z.infer<typeof UpdateNotificationsSchema>

export type { LoginData, RegisterData, UpdateNotificationsData, VerifyEmailData }
export { LoginSchema, RegisterSchema, UpdateNotificationsSchema, VerifyEmailSchema }
