import { z } from 'zod'

/**
 * Extract user-friendly error messages from Zod validation
 */
export function getFieldErrors<T extends Record<string, any>>(
  error: z.ZodError<T>
): Record<string, string> {
  const fieldErrors: Record<string, string> = {}
  const flattened = error.flatten()

  for (const [field, errors] of Object.entries(flattened.fieldErrors)) {
    if (errors && errors.length > 0) {
      fieldErrors[field] = errors[0] // Take first error for each field
    }
  }

  return fieldErrors
}

/**
 * Validate form data with Zod schema
 */
export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  return {
    success: false,
    errors: getFieldErrors(result.error),
  }
}
