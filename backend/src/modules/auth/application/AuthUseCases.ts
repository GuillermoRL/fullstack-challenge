import type {
  RegisterDTO,
  LoginDTO,
  RefreshTokenDTO,
  AuthResponse,
  AuthRepository,
  PasswordHasher,
  TokenGenerator,
  RefreshTokenRepository,
} from '../domain'
import type { OrganizationRepository } from '@modules/organization/domain'
import type { WorkflowRepository } from '@modules/workflow/domain'

export class AuthUseCases {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenGenerator: TokenGenerator,
    private readonly organizationRepository: OrganizationRepository,
    private readonly workflowRepository: WorkflowRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async register(data: RegisterDTO): Promise<AuthResponse> {
    const existingUser = await this.authRepository.findByEmail(data.email)
    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    // Create organization for the new user
    const organization = await this.organizationRepository.create({
      name: `${data.name}'s Organization`,
    })

    // Create default workflow for the organization
    await this.workflowRepository.create({
      organizationId: organization.id,
      name: 'Sales Pipeline',
      stages: [
        { name: 'Lead', order: 1, color: '#6B7280' },
        { name: 'Qualified', order: 2, color: '#3B82F6' },
        { name: 'Proposal', order: 3, color: '#8B5CF6' },
        { name: 'Negotiation', order: 4, color: '#F59E0B' },
        { name: 'Won', order: 5, color: '#10B981' },
        { name: 'Lost', order: 6, color: '#EF4444' },
      ],
    })

    const hashedPassword = await this.passwordHasher.hash(data.password)

    const user = await this.authRepository.create({
      name: data.name,
      email: data.email,
      password: data.password,
      hashedPassword,
      organizationId: organization.id,
    })

    const token = this.tokenGenerator.generate(user.id, organization.id)
  
    // Generate and store refresh token
    const { refreshToken, expiresAt } = this.tokenGenerator.generateRefreshToken()
    this.refreshTokenRepository.create({
      token: refreshToken,
      userId: user.id,
      expiresAt,
      revokedAt: null,
      replaceByToken: null 
    })

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        organizationId: user.organizationId,
      },
      token,
      refreshToken,
    }
  }

  async login(data: LoginDTO): Promise<AuthResponse> {
    const user = await this.authRepository.findByEmail(data.email)
    if (!user) {
      throw new Error('Invalid credentials')
    }

    const isValidPassword = await this.passwordHasher.verify(
      data.password,
      user.password
    )
    if (!isValidPassword) {
      throw new Error('Invalid credentials')
    }

    if (!user.organizationId) {
      throw new Error('User has no organization')
    }

    const token = this.tokenGenerator.generate(user.id, user.organizationId)

    // Revoke old refresh tokens and generate a new one
    await this.refreshTokenRepository.revokeAllForUser(user.id)
    const { refreshToken, expiresAt } = this.tokenGenerator.generateRefreshToken()
    await this.refreshTokenRepository.create({
      token: refreshToken,
      userId: user.id,
      expiresAt,
      revokedAt: null,
      replaceByToken: null,
    })

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        organizationId: user.organizationId,
      },
      token,
      refreshToken,
    }
  }

  async refresh(data: RefreshTokenDTO): Promise<AuthResponse> {
    const storedToken = await this.refreshTokenRepository.findByToken(data.refreshToken)

    if (!storedToken) {
      throw new Error('Invalid refresh token')
    }

    // token reuse - potential attack
    if (storedToken.revokedAt) {
      await this.refreshTokenRepository.revokeAllForUser(storedToken.userId)
      throw new Error('Token reuse detected. All sessions have been revoked.')
    }

    if (storedToken.expiresAt < new Date()) {
      throw new Error('Refresh token expired')
    }

    const user = await this.authRepository.findByEmail(storedToken.userId)
    if (!user || !user.organizationId) {
      throw new Error('User not found')
    }

    const token = this.tokenGenerator.generate(user.id, user.organizationId)
    const { refreshToken: newRefreshToken, expiresAt } = this.tokenGenerator.generateRefreshToken()

    await this.refreshTokenRepository.revokeToken(data.refreshToken, newRefreshToken)
    await this.refreshTokenRepository.create({
      token: newRefreshToken,
      userId: user.id,
      expiresAt,
      revokedAt: null,
      replaceByToken: null
    })

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        organizationId: user.organizationId,
      },
      token,
      refreshToken: newRefreshToken,
    }
  }

  async logout(refreshToken: string): Promise<void> {
    await this.refreshTokenRepository.revokeToken(refreshToken)
  }

  async logoutAll(userId: string): Promise<void> {
    await this.refreshTokenRepository.revokeAllForUser(userId)
  }
}
