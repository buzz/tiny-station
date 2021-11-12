import React, { useMemo, useState } from 'react'

const ModalContext = React.createContext()

const ModalProvider = ({ children }) => {
  const [modal, setModal] = useState({})

  const value = useMemo(() => [setModal, modal], [modal])

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
}

export default ModalContext
export { ModalProvider }
