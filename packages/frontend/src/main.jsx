import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './styles/index.css'

import App from './App.jsx'
import Modal from 'react-modal'

const rootElem = document.getElementById('root')
Modal.setAppElement(rootElem)
createRoot(rootElem).render(
  <StrictMode>
    <App />
  </StrictMode>
)
