import express, { type Express } from 'express'
import cors from 'cors'
import type { DataSource } from 'typeorm'
import { createAuthMiddleware } from '@shared/http'
import {
  UserUseCases,
  UserEntity,
  PostgresUserRepository,
  UserController,
  createUserRoutes,
} from '@modules/users'
import {
  AuthUseCases,
  PostgresAuthRepository,
  BcryptPasswordHasher,
  JwtTokenGenerator,
  AuthController,
  createAuthRoutes,
} from '@modules/auth'
import {
  OrganizationUseCases,
  OrganizationEntity,
  PostgresOrganizationRepository,
  OrganizationController,
  createOrganizationRoutes,
} from '@modules/organization'
import {
  ContactUseCases,
  ContactEntity,
  PostgresContactRepository,
  ContactController,
  createContactRoutes,
} from '@modules/contact'
import {
  WorkflowUseCases,
  WorkflowEntity,
  StageEntity,
  PostgresWorkflowRepository,
  WorkflowController,
  createWorkflowRoutes,
} from '@modules/workflow'
import {
  DealUseCases,
  DealEntity,
  PostgresDealRepository,
  DealController,
  createDealRoutes,
} from '@modules/deal'
import { PostgresRefreshTokenRepository } from '@modules/auth/infrastructure/PostgresRefreshTokenRepository'

const JWT_SECRET = process.env.JWT_SECRET ?? 'your-secret-key-change-in-production'

export function createApp(dataSource: DataSource): Express {
  const app = express()

  // Middleware
  app.use(cors())
  app.use(express.json())

  // Token Generator (shared for auth and middleware)
  const tokenGenerator = new JwtTokenGenerator(JWT_SECRET)

  // Auth Middleware
  const authMiddleware = createAuthMiddleware(tokenGenerator)

  // Organization Module - Dependency Injection
  const organizationRepository = new PostgresOrganizationRepository(
    dataSource.getRepository(OrganizationEntity)
  )
  const organizationUseCases = new OrganizationUseCases(organizationRepository)
  const organizationController = new OrganizationController(organizationUseCases)

  // Users Module - Dependency Injection
  const userRepository = new PostgresUserRepository(
    dataSource.getRepository(UserEntity)
  )
  const userUseCases = new UserUseCases(userRepository)
  const userController = new UserController(userUseCases)

  // Workflow Module - Dependency Injection
  const workflowRepository = new PostgresWorkflowRepository(
    dataSource.getRepository(WorkflowEntity),
    dataSource.getRepository(StageEntity)
  )
  const workflowUseCases = new WorkflowUseCases(workflowRepository)
  const workflowController = new WorkflowController(workflowUseCases)

  // Auth Module - Dependency Injection
  const authRepository = new PostgresAuthRepository(
    dataSource.getRepository(UserEntity)
  )
  const passwordHasher = new BcryptPasswordHasher()
  const refreshTokenRepository = new PostgresRefreshTokenRepository(dataSource)

  const authUseCases = new AuthUseCases(
    authRepository,
    passwordHasher,
    tokenGenerator,
    organizationRepository,
    workflowRepository,
    refreshTokenRepository,
  )
  const authController = new AuthController(authUseCases)

  // Contact Module - Dependency Injection
  const contactRepository = new PostgresContactRepository(
    dataSource.getRepository(ContactEntity)
  )
  const contactUseCases = new ContactUseCases(contactRepository)
  const contactController = new ContactController(contactUseCases)

  // Deal Module - Dependency Injection
  const dealRepository = new PostgresDealRepository(
    dataSource.getRepository(DealEntity)
  )
  const dealUseCases = new DealUseCases(dealRepository)
  const dealController = new DealController(dealUseCases)

  // Routes (public)
  app.use('/api/auth', createAuthRoutes(authController, authMiddleware))
  app.use('/api/users', createUserRoutes(userController))

  // Routes (protected - require auth)
  app.use('/api/organizations', createOrganizationRoutes(organizationController, authMiddleware))
  app.use('/api/contacts', createContactRoutes(contactController, authMiddleware))
  app.use('/api/workflows', createWorkflowRoutes(workflowController, authMiddleware))
  app.use('/api/deals', createDealRoutes(dealController, authMiddleware))

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  return app
}
