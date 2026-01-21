import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react'
import { authService, type User } from '../services'

interface AuthContextType {
  user: User | null
  token: string | null
  login: (token: string, refreshToken: string, user: User) => void
  logout: () => Promise<void>
  logoutAll: () => Promise<void>
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedToken = authService.getToken()
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = useCallback((newToken: string, newRefreshToken: string, newUser: User) => {
    authService.setToken(newToken)
    authService.setRefreshToken(newRefreshToken)
    localStorage.setItem('user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }, [])

  const logout = useCallback(async () => {
    const refreshToken = authService.getRefreshToken()

    if (refreshToken) {
      try {
        await authService.logout(refreshToken)
      } catch (error) {
        console.error('Logout error', error)
      }
    }

    authService.removeToken()
    authService.removeRefreshToken()
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }, [])

  const logoutAll = useCallback(async () => {
    try {
      await authService.logoutAll()
    } catch (error) {
      console.error('Logout all error', error)
    }

    authService.removeToken()
    authService.removeRefreshToken()
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }, [])
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        logoutAll,
        isAuthenticated: !!token,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
