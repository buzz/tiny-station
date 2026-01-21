import { createContext, useCallback, useMemo, useState } from 'react'
import type { PropsWithChildren, ReactNode } from 'react'

const ModalContext = createContext<ModalContextValue | undefined>(undefined)

function ModalProvider({ children }: PropsWithChildren) {
  const [modals, setModals] = useState<Modal[]>([])
  const currentModal = modals.length > 0 ? modals.at(-1) : undefined

  const pushModal = useCallback((modal: Modal) => {
    setModals((oldModals) => [...oldModals, modal])
  }, [])

  const popModal = useCallback(() => {
    setModals((oldModals) => {
      oldModals.pop()
      return [...oldModals]
    })
  }, [])

  const value = useMemo(
    () => ({ currentModal, pushModal, popModal }),
    [currentModal, popModal, pushModal]
  )

  return <ModalContext value={value}>{children}</ModalContext>
}

interface Modal {
  action?: () => void
  btnLabel?: string
  content: ReactNode
}

interface ModalContextValue {
  currentModal: Modal | undefined
  pushModal: (modal: Modal) => void
  popModal: () => void
}

export type { ModalContextValue }
export { ModalProvider }
export default ModalContext
