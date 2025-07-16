'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from './supabaseClient'
import { Session, User } from '@supabase/supabase-js'

interface UserContextType {
  user: User | null
  session: Session | null
  loading: boolean
}

const UserContext = createContext<UserContextType>({
  user: null,
  session: null,
  loading: true,
})

export const useUser = () => useContext(UserContext)

export function UserProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  return (
    <UserContext.Provider value={{ user, session, loading }}>
      {children}
    </UserContext.Provider>
  )
}
