import { useContext } from 'react'
import ReactModal from 'react-modal'

import ModalContext from '../contexts/ModalContext'
import style from './Modal.sss'

const Modal = () => {
  const [setModal, modal] = useContext(ModalContext)
  const { action, btnLabel, content } = modal

  const onClick = () => {
    if (action) {
      action()
    } else {
      setModal({})
    }
  }

  const modalContent = typeof content === 'string' ? <p>{content}</p> : content

  return (
    <ReactModal
      className={style.contentWrapper}
      contentLabel="Message"
      isOpen={content !== undefined}
      overlayClassName={style.overlay}
      shouldCloseOnOverlayClick={false}
    >
      <div className={style.content}>
        {modalContent}
        <button type="button" onClick={onClick}>
          {btnLabel || 'Close'}
        </button>
      </div>
    </ReactModal>
  )
}

export default Modal
