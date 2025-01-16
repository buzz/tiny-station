import LinkifyIt from 'linkify-it'
import tlds from 'tlds'

import style from './MessagePane.module.css'

const linkify = new LinkifyIt()
linkify.tlds(tlds)

const MessageContent = ({ text }) => {
  const matches = linkify.match(text)
  if (!matches) {
    return text
  }

  const elems = []

  let lastIndex = 0
  matches.forEach((match, i) => {
    // Preceding text
    if (match.index > lastIndex) {
      elems.push(text.substring(lastIndex, match.index))
    }

    elems.push(
      // eslint-disable-next-line react/no-array-index-key
      <a href={match.url} key={i} target="_blank" rel="noopener noreferrer">
        {match.text}
      </a>
    )

    lastIndex = match.lastIndex
  })

  // Remaining text
  if (text.length > lastIndex) {
    elems.push(text.substring(lastIndex))
  }

  return <span className={style.text}>{elems.length === 1 ? elems[0] : elems}</span>
}

export default MessageContent
