import style from './NavBar.module.css'

const StreamTitle = ({ streamTitle, streamOnline }) => {
  let titleText

  if (streamOnline === 'online') {
    titleText = streamTitle || ''
  } else if (streamOnline === 'offline') {
    titleText = 'Stream offline'
  } else {
    titleText = ''
  }

  return <div className={style.title}>{titleText}</div>
}

export default StreamTitle
