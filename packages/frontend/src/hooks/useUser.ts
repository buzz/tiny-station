import { use } from 'react'

import UserContext from '#contexts/UserContext'
import type { UserContextValue } from '#contexts/UserContext'

function useUser(): UserContextValue {
  const ctx = use(UserContext)
  if (!ctx) {
    throw new Error('useUser must be used within <UserProvider>')
  }
  return ctx
}

export default useUser
