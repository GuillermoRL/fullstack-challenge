import { z } from 'zod'

export const dealStatusSchema = z.enum(['open', 'won', 'lost'], {
  errorMap: () => ({ message: 'Status must be one of: open, won, lost' }),
})

export const createDealSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters')
    .trim(),
  value: z
    .number({
      required_error: 'Value is required',
      invalid_type_error: 'Value must be a number',
    })
    .nonnegative('Value must be a positive number')
    .max(1000000000, 'Value exceeds maximum allowed'),
  contactId: z
    .uuid('Invalid contact ID format')
    .optional(),
  stageId: z
    .uuid('Invalid stage ID format')
    .optional(),
})

export const updateDealSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters')
    .trim()
    .optional(),
  value: z
    .number({
      invalid_type_error: 'Value must be a number',
    })
    .nonnegative('Value must be a positive number')
    .max(1000000000, 'Value exceeds maximum allowed')
    .optional(),
  contactId: z
    .uuid('Invalid contact ID format')
    .nullable()
    .optional(),
  stageId: z
    .uuid('Invalid stage ID format')
    .nullable()
    .optional(),
  status: dealStatusSchema.optional(),
})

// Type inference
export type CreateDealInput = z.infer<typeof createDealSchema>
export type UpdateDealInput = z.infer<typeof updateDealSchema>
