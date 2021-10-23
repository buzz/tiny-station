import ReactDOM from 'react-dom'
import Modal from 'react-modal'

import './styles/base.sss'
import App from './App'

const rootElem = document.getElementById('root')
Modal.setAppElement(rootElem)
ReactDOM.render(<App />, rootElem)
