import jwt from 'jsonwebtoken'
import { randomBytes } from 'crypto'
import type { AuthToken, TokenGenerator, TokenPayload, RefreshTokenResponse } from '../domain'

export class JwtTokenGenerator implements TokenGenerator {
  private readonly accessTokenExpiresInMs = 15 * 60 * 1000 // 15 minutes
  private readonly refreshTokenExpiresInMs = 7 * 24 * 60 * 60 * 1000 // 7 days

  constructor(private readonly secret: string) {}

  generate(userId: string, organizationId: string): AuthToken {
    const expiresAt = new Date(Date.now() + this.accessTokenExpiresInMs)

    const accessToken = jwt.sign(
      { userId, organizationId } satisfies TokenPayload,
      this.secret,
      { expiresIn: '15m' }
    )

    return {
      accessToken,
      expiresAt,
    }
  }

  generateRefreshToken(): RefreshTokenResponse {
    const refreshToken = randomBytes(64).toString('hex')
    const expiresAt = new Date(Date.now() + this.refreshTokenExpiresInMs)

    return { refreshToken, expiresAt }
  }

  verify(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.secret) as TokenPayload
      return decoded
    } catch {
      return null
    }
  }
}
