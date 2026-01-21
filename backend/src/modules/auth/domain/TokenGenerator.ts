import type { AuthToken } from './Auth'

export interface TokenPayload {
  userId: string
  organizationId: string
}

export interface RefreshTokenResponse {
  refreshToken: string
  expiresAt: Date
}

export interface TokenGenerator {
  generate(userId: string, organizationId: string): AuthToken
  generateRefreshToken(): RefreshTokenResponse
  verify(token: string): TokenPayload | null
}
