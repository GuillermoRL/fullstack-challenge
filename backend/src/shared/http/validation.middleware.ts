import type { Request, Response, NextFunction } from 'express'
import { z, ZodError, ZodSchema } from 'zod'

export interface ValidationError {
    error: string
    details: {
        fieldErrors: Record<string, string[]>
        formErrors: string[]
    }
}

/**
 * Generic validation middleware for validating request data
 * @param schema - Zod schema to validate against
 * @param source - Part of request to validate: 'body', 'params' or 'query'
 */
export function validateRequest(
    schema: ZodSchema,
    source: 'body' | 'params' | 'query' = 'body'
) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const result = schema.safeParse(req[source])

        if (!result.success) {
            const validationError: ValidationError = {
                error: 'Validation failed',
                details: result.error.flatten(),
            }

            res.status(400).json(validationError)
            return
        }

        // Replace request data with validated and typed data
        req[source] = result.data
        next()
    }
}

/**
 * Validation for UUID parameters
 */
export const uuidParamSchema = z.object({
    id: z.uuid()
})
