import { useCopyToClipboard } from '../hooks/useCopyToClipboard'
import { formatElapsedTime } from '../utils/formatMessage'
import Icon from './Icon'
import MessageContent from './MessageContent'

/**
 * MessageBubble
 * 메시지 하나를 말풍선으로 그린다.
 * 사용자 메시지는 오른쪽, AI 메시지는 왼쪽에 배치한다. (사양서 7.1)
 */
function MessageBubble({ message }) {
  const isAssistant = message.role === 'assistant'
  const { isCopied, copy } = useCopyToClipboard()
  const elapsedTimeText = formatElapsedTime(message.elapsedTime)

  return (
    <article className={`message-bubble ${isAssistant ? 'is-assistant' : 'is-user'}`}>
      <div className="message-bubble__meta">
        <span className="message-bubble__author">{isAssistant ? 'AI' : '나'}</span>
        {message.timestamp ? <time className="message-bubble__time">{message.timestamp}</time> : null}
      </div>

      <div className="message-bubble__body">
        <MessageContent content={message.content} />
      </div>

      <div className="message-bubble__footer">
        {isAssistant && message.model ? <span className="message-bubble__tag">{message.model}</span> : null}
        {isAssistant && elapsedTimeText ? (
          <span className="message-bubble__tag">응답 시간 {elapsedTimeText}</span>
        ) : null}

        <button
          type="button"
          className="message-bubble__copy"
          onClick={() => copy(message.content)}
          aria-label={isCopied ? '메시지를 복사했습니다' : '메시지 복사'}
        >
          <Icon name={isCopied ? 'check' : 'copy'} size={14} />
          {isCopied ? '복사됨' : '복사'}
        </button>
      </div>
    </article>
  )
}

export default MessageBubble
