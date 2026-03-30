import { createContext, useContext, useState, type ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile } from '../types'

// DEMO MODE: No real auth, mock user for testing UI
const DEMO_MODE = true

const mockProfile: Profile = {
  id: 'demo-user-001',
  role: 'driver',
  full_name: 'Demo User',
  phone: '+998901234567',
  avatar_url: null,
  car_model: 'Chevrolet Cobalt',
  car_color: 'White',
  license_plate: '01A123BC',
  seats_total: 4,
  deposit_balance: 500000,
  avg_rating: 4.5,
  rating_count: 12,
  language: 'ru',
  is_banned: false,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  signInWithOTP: (phone: string) => Promise<{ error: Error | null }>
  verifyOTP: (phone: string, token: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>
  refreshProfile: () => Promise<void>
  setDemoRole: (role: Profile['role']) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(DEMO_MODE ? mockProfile : null)
  const [loading] = useState(false)

  const signInWithOTP = async (_phone: string) => {
    return { error: null }
  }

  const verifyOTP = async (_phone: string, _token: string) => {
    if (DEMO_MODE) {
      setProfile(mockProfile)
    }
    return { error: null }
  }

  const signOut = async () => {
    if (DEMO_MODE) {
      setProfile(null)
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (DEMO_MODE && profile) {
      setProfile({ ...profile, ...updates } as Profile)
    }
    return { error: null }
  }

  const refreshProfile = async () => {}

  const setDemoRole = (role: Profile['role']) => {
    setProfile(prev => prev ? { ...prev, role } : null)
  }

  const mockUser = DEMO_MODE && profile ? { id: profile.id } as User : null

  return (
    <AuthContext.Provider value={{
      user: mockUser,
      session: null,
      profile,
      loading,
      signInWithOTP, verifyOTP, signOut,
      updateProfile, refreshProfile,
      setDemoRole,
    }}>
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
