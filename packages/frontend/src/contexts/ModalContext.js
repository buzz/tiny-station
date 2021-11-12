import React, { useCallback, useEffect, useMemo, useState } from 'react'

const ModalContext = React.createContext()

const ModalProvider = ({ children }) => {
  const [currentModal, setCurrentModal] = useState()
  const [modals, setModals] = useState([])

  const pushModal = useCallback((modal) => {
    setModals((oldModals) => [...oldModals, modal])
  }, [])

  const popModal = useCallback(() => {
    setModals((oldModals) => {
      oldModals.pop()
      return [...oldModals]
    })
  }, [])

  useEffect(() => {
    setCurrentModal(modals.length ? modals[modals.length - 1] : undefined)
  }, [modals])

  const value = useMemo(
    () => ({ currentModal, pushModal, popModal }),
    [currentModal, popModal, pushModal]
  )

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
}

export default ModalContext
export { ModalProvider }
