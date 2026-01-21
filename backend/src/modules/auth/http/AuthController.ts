import type { Request, Response } from 'express'
import type { AuthUseCases } from '../application'
import type { AuthenticatedRequest } from '@shared/http'

export class AuthController {
  constructor(private readonly authUseCases: AuthUseCases) {}

  async register(req: Request, res: Response): Promise<void> {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email and password are required' })
      return
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' })
      return
    }

    try {
      const result = await this.authUseCases.register({ name, email, password })
      res.status(201).json(result)
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({ error: error.message })
        return
      }
      throw error
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' })
      return
    }

    try {
      const result = await this.authUseCases.login({ email, password })
      res.json(result)
    } catch (error) {
      if (error instanceof Error && error.message.includes('Invalid credentials')) {
        res.status(401).json({ error: 'Invalid credentials' })
        return
      }
      throw error
    }
  }

  async refresh(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body

    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token is required' })
      return
    }

    try {
      const result = this.authUseCases.refresh({ refreshToken })
      res.json(result)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('reuse detected')) {
          res.status(401).json({ error: error.message })
          return
        }

        if (error.message.includes('Invalid') || error.message.includes('expired')) {
          res.status(401).json({ error: error.message })
          return
        }
      }
      throw error
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
      const { refreshToken } = req.body

    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token is required' })
      return
    }

    try {
      await this.authUseCases.logout(refreshToken)
      res.json({ message: 'Logged out successfully' })
    } catch (error) {
      throw error
    }
  }
  async logoutAll(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body

    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token is required' })
      return
    }

    try {
      await this.authUseCases.logout(refreshToken)
      res.json({ message: 'Logged out successfully' })
    } catch (error) {
      throw error
    }
  }
}
