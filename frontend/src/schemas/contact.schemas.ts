import { z } from 'zod'

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .trim(),
  email: z
    .string()
    .email('Invalid email format')
    .max(255, 'Email must not exceed 255 characters')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .regex(/^[\d\s\-\+\(\)]+$/, 'Phone number can only contain digits, spaces, and +()-')
    .min(7, 'Phone number must be at least 7 digits')
    .max(20, 'Phone number must not exceed 20 characters')
    .optional()
    .or(z.literal('')),
})

export type ContactFormData = z.infer<typeof contactSchema>
