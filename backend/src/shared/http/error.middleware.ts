import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

export class AppError extends Error {
    constructor(
        public statusCode: number,
        message: string,
        public isOperational: boolean = true
    ) {
        super(message)
        this.name = this.constructor.name
        Error.captureStackTrace(this, this.constructor)
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super(400, message)
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = 'Unauthorized') {
        super(401, message)
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string = 'Access denied') {
        super(403, message)
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string) {
        super(404, `${resource} not found`)
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(409, message)
    }
}

export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction,
): void {
    // Log error for monitoring
    console.error('Error', {
        name: err.name,
        message: err.message,
        stack: process.env.NODE_ENV === 'develpoment' ? err.stack : undefined,
        path: req.path,
        method: req.method
    })

    // Zod validation errors (Just in case)
    if (err instanceof ZodError) {
        res.status(400).json({
            error: 'Validation failed',
            details: err.flatten(),
        })

        return
    }

    // Application errors
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            error: err.message
        })

        return
    }

    // Unkown errors
    const statusCode = 500
    const message = process.env.NODE_ENV === 'development'
        ? err.message
        : 'Internal server error'

    res.status(statusCode).json({
        error: message
    })
}

export function asyncHandler(
    fn: (req: Request, res: Response, next: NextFunction) => Promise<void> 
) {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next))
    }
}
