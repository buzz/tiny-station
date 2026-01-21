import { use } from 'react'

import ModalContext from '#contexts/ModalContext'
import type { ModalContextValue } from '#contexts/ModalContext'

function useModal(): ModalContextValue {
  const ctx = use(ModalContext)
  if (!ctx) {
    throw new Error('useModal must be used within <ModalProvider>')
  }
  return ctx
}

export default useModal
