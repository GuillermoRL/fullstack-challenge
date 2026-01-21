import type { RefreshToken } from "./RefreshToken";

export interface RefreshTokenRepository {
    create(data: Omit<RefreshToken, 'id' | 'createdAt'>): Promise<RefreshToken>
    findByToken(token: string): Promise<RefreshToken | null>
    revokeToken(token: string, replacedBy?: string): Promise<void>
    revokeAllForUser(userId: string): Promise<void>
    deleteExpired(): Promise<void>
}
