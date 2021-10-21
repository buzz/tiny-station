import style from './NavBar.sss'

const StreamTitle = ({ streamTitle, streamOnline }) => {
  let titleText

  if (streamOnline === 'online') {
    titleText = streamTitle || 'No name stream'
  } else if (streamOnline === 'offline') {
    titleText = 'Stream offline'
  } else {
    titleText = ''
  }

  return <div className={style.title}>{titleText}</div>
}

export default StreamTitle
