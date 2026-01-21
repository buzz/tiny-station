import LinkifyIt from 'linkify-it'
import tlds from 'tlds'

import style from './MessagePane.module.css'

const linkify = new LinkifyIt()
linkify.tlds(tlds)

function MessageContent({ text }: MessageContentProps) {
  const matches = linkify.match(text)
  if (!matches) {
    return text
  }

  const elems = []

  let lastIndex = 0
  for (const [i, match] of matches.entries()) {
    // Preceding text
    if (match.index > lastIndex) {
      const substr = text.slice(lastIndex, match.index)
      elems.push(substr)
    }

    elems.push(
      <a href={match.url} key={i} target="_blank" rel="noopener noreferrer">
        {match.text}
      </a>
    )

    lastIndex = match.lastIndex
  }

  // Remaining text
  if (text.length > lastIndex) {
    elems.push(text.slice(Math.max(0, lastIndex)))
  }

  return <span className={style.text}>{elems.length === 1 ? elems[0] : elems}</span>
}

interface MessageContentProps {
  text: string
}

export default MessageContent
