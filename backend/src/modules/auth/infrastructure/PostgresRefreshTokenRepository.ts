import type { DataSource, Repository } from "typeorm";
import type { RefreshToken, RefreshTokenRepository } from "../domain";
import { RefreshTokenEntity } from "./RefreshTokenEntity";
import { createHash } from "crypto";

export class PostgresRefreshTokenRepository implements RefreshTokenRepository {
    private readonly repository: Repository<RefreshTokenEntity>

    constructor(dataSource: DataSource) {
        this.repository = dataSource.getRepository(RefreshTokenEntity)
    }

    private hashToken(token: string): string {
        return createHash('sha256').update(token).digest('hex')
    }

    async create(data: Omit<RefreshToken, "id" | "createdAt">): Promise<RefreshToken> {
        const entity = this.repository.create({
            token: this.hashToken(data.token),
            userId: data.userId,
            expiresAt: data.expiresAt,
            revokedAt: data.revokedAt,
            replacedByToken: data.replaceByToken ? this.hashToken(data.replaceByToken) : null,
        })

        const saved = await this.repository.save(entity)
        return this.toDomain(saved)
    }

    async findByToken(token: string): Promise<RefreshToken | null> {
        const hashedToken = this.hashToken(token)
        const entity = await this.repository.findOne({
            where: { token: hashedToken },
        })

        return entity ? this.toDomain(entity) : null
    }

    async revokeToken(token: string, replacedBy?: string): Promise<void> {
        const hashedToken = this.hashToken(token)
        await this.repository.update(
            { token: hashedToken },
            {
                revokedAt: new Date(),
                replacedByToken: replacedBy ? this.hashToken(replacedBy) : null,
            }
        )
    }

    async revokeAllForUser(userId: string): Promise<void> {
        await this.repository.update(
            { userId, revokedAt: null },
            { revokedAt: new Date() },
        )
    }

    async deleteExpired(): Promise<void> {
        await this.repository.delete({
            expiresAt: { $lt: new Date() },
        })
    }

    private toDomain(entity: RefreshTokenEntity): RefreshToken {
        return {
            id: entity.id,
            token: entity.token,
            userId: entity.userId,
            expiresAt: entity.expiresAt,
            createdAt: entity.createdAt,
            revokedAt: entity.revokedAt,
            replaceByToken: entity.replacedByToken,
        }
    }
}
