import React, { createContext, useEffect, useState } from 'react'
import api from '../api/client'
import { clearToken, getToken, setToken as storeToken } from '../utils/asyncStorageHelpers'

type AuthContextType = {
  user: any | null
  token: string | null
  setUser: React.Dispatch<React.SetStateAction<any | null>>
  signup: (data: any) => Promise<void>
  verifyEmail: (email: string, otp: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (email: string, otp: string, newPass: string) => Promise<void>
  resendOtp: (email: string, purpose: string) => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({} as any)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    (async () => {
      const t = await getToken()
      if (t) {
        setToken(t)
        const { data } = await api.get('/users/me')
        setUser(data)
      }
    })()
  }, [])

  const signup = async (data: any) => {
    await api.post('/auth/signup', data)
  }

  const verifyEmail = async (email: string, otp: string) => {
    const res = await api.post('/auth/verify-email', { email, otp })
    const { token: t, user: u } = res.data
    await storeToken(t)
    setToken(t)
    setUser(u)
  }

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { email, password })
      const { token: t, user: u } = res.data
      await storeToken(t)
      setToken(t)
      setUser(u)
    } catch (err: any) {
      if (err.response?.status === 403 && err.response.data.message === 'Email not verified') {
        throw { needsVerification: true }
      }
      throw err
    }
  }

  const logout = () => {
    clearToken()
    setToken(null)
    setUser(null)
  }

  const forgotPassword = async (email: string) => {
    await api.post('/auth/forgot-password', { email })
  }

  const resetPassword = async (email: string, otp: string, newPassword: string) => {
    await api.post('/auth/reset-password', { email, otp, newPassword })
  }

  const resendOtp = async (email: string, purpose: string) => {
    await api.post('/auth/resend-otp', { email, purpose })
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      setUser,
      signup,
      verifyEmail,
      login,
      logout,
      forgotPassword,
      resetPassword,
      resendOtp
    }}>
      {children}
    </AuthContext.Provider>
  )
}
