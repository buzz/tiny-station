import style from './Chat.sss'

const Error = ({ failMessage, resetError }) => (
  <>
    <div className={style.label}>{failMessage}</div>
    <button type="button" onClick={() => resetError()}>
      OK
    </button>
  </>
)

export default Error
