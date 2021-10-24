import ReactModal from 'react-modal'
import style from './Modal.sss'

const Modal = ({ modalAction, modalMessage, setModalMessage }) => {
  const onClick = () => {
    if (modalAction === 'reload') {
      window.location = process.env.BASE_URL
    } else {
      setModalMessage()
    }
  }

  return (
    <ReactModal
      className={style.contentWrapper}
      contentLabel="Message"
      isOpen={modalMessage !== undefined}
      overlayClassName={style.overlay}
      shouldCloseOnOverlayClick={false}
    >
      <div className={style.content}>
        <p>{modalMessage}</p>
        <button type="button" onClick={onClick}>
          Close
        </button>
      </div>
    </ReactModal>
  )
}

export default Modal
