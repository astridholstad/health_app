import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext(null)

const STORAGE_KEY = 'health_app_session'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && parsed.user) setUser(parsed.user)
      }
    } catch {}
    setLoading(false)
  }, [])

  const login = async ({ email, password }) => {
    // Mock: aksepterer alle eposter med passordlengde >= 4
    if (!email || !password || password.length < 4) {
      throw new Error('Ugyldig legitimasjon')
    }
    const mockUser = { id: crypto.randomUUID(), email }
    setUser(mockUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: mockUser }))
    return mockUser
  }

  const logout = async () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  const value = useMemo(() => ({ user, login, logout, loading }), [user, loading])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}


