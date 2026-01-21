import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { UserEntity } from "@modules/users";

@Entity('refresh_tokens')
export class RefreshTokenEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column({ type: 'varchar', length: 255, unique: true })
    token!: string // Hashed token

    @Column({ type: 'uuid' })
    userId!: string

    @ManyToOne(() => UserEntity)
    @JoinColumn({ name_: 'userId '})
    user!: UserEntity

    @Column({ type: 'timestamp' })
    expiresAt!: Date

    @CreateDateColumn()
    createdAt!: Date

    @Column({ type: 'timestamp', nullable: true })
    revokedAt!: Date | null

    @Column({ type: 'varchar', length: 255, nullable: true })
    replacedByToken!: string | null
}
