import ReactModal from 'react-modal'
import style from './Modal.sss'

const Modal = ({ modal, setModal }) => {
  const onClick = () => {
    if (modal.action) {
      modal.action()
    } else {
      setModal({})
    }
  }

  const modalContent = typeof modal.content === 'string' ? <p>{modal.content}</p> : modal.content

  return (
    <ReactModal
      className={style.contentWrapper}
      contentLabel="Message"
      isOpen={modal && modal.content !== undefined}
      overlayClassName={style.overlay}
      shouldCloseOnOverlayClick={false}
    >
      <div className={style.content}>
        {modalContent}
        <button type="button" onClick={onClick}>
          {modal && modal.btnLabel ? modal.btnLabel : 'Close'}
        </button>
      </div>
    </ReactModal>
  )
}

export default Modal
