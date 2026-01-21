import ReactModal from 'react-modal'

import useModal from '#hooks/useModal'

import style from './Modal.module.css'

function Modal() {
  const { currentModal, popModal } = useModal()
  const { action, btnLabel, content } = currentModal ?? {}

  const onClick = () => {
    if (action) {
      action()
    } else {
      popModal()
    }
  }

  const modalContent = typeof content === 'string' ? <p>{content}</p> : content

  return (
    <ReactModal
      className={style.contentWrapper}
      contentLabel="Message"
      isOpen={currentModal !== undefined}
      overlayClassName={style.overlay}
      shouldCloseOnOverlayClick={false}
    >
      <div className={style.content}>
        {modalContent}
        <button type="button" onClick={onClick}>
          {btnLabel ?? 'Close'}
        </button>
      </div>
    </ReactModal>
  )
}

export default Modal
