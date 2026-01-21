import './styles/index.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Modal from 'react-modal'

import App from './components/App'

const rootElem = document.querySelector('#root')

if (!rootElem) {
  throw new Error('Root element not found')
}

Modal.setAppElement(rootElem as HTMLElement)

createRoot(rootElem).render(
  <StrictMode>
    <App />
  </StrictMode>
)
