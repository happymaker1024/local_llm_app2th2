import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'

const MAX_TEXTAREA_HEIGHT_PX = 200

/**
 * ChatComposer
 * 하단 고정 입력창. Enter로 전송, Shift+Enter로 줄바꿈한다. (사양서 7.2)
 * 빈 값이면 전송을 막고 안내 문구를 보여준다. (사양서 5.3)
 */
function ChatComposer({ onSendMessage, onStopGenerating, isSending }) {
  const [inputValue, setInputValue] = useState('')
  const [validationMessage, setValidationMessage] = useState('')
  const textareaRef = useRef(null)

  // 입력 내용에 맞춰 입력창 높이를 자동으로 늘린다. (최대 높이까지)
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) {
      return
    }

    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT_PX)}px`
  }, [inputValue])

  // 응답이 끝나면 다시 입력할 수 있도록 커서를 돌려준다.
  useEffect(() => {
    if (!isSending) {
      textareaRef.current?.focus()
    }
  }, [isSending])

  const handleSubmit = (event) => {
    event.preventDefault()

    const trimmedValue = inputValue.trim()

    if (!trimmedValue) {
      setValidationMessage('보낼 메시지를 입력해주세요.')
      textareaRef.current?.focus()
      return
    }

    if (isSending) {
      return
    }

    setValidationMessage('')
    setInputValue('')
    onSendMessage(trimmedValue)
  }

  const handleKeyDown = (event) => {
    // 한글 입력 조합 중(IME)에 Enter를 누르면 전송하지 않는다.
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      handleSubmit(event)
    }
  }

  const handleChange = (event) => {
    setInputValue(event.target.value)

    if (validationMessage) {
      setValidationMessage('')
    }
  }

  return (
    <div className="chat-composer">
      <form className="content-column chat-composer__form" onSubmit={handleSubmit}>
        <div className={`chat-composer__box ${validationMessage ? 'has-error' : ''}`}>
          <label className="visually-hidden" htmlFor="chat-input">
            메시지 입력
          </label>

          <textarea
            id="chat-input"
            ref={textareaRef}
            className="chat-composer__input"
            rows={1}
            placeholder={isSending ? '응답을 기다리는 중입니다…' : '메시지를 입력하세요 (Shift + Enter 줄바꿈)'}
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            aria-invalid={validationMessage ? 'true' : 'false'}
            aria-describedby="chat-input-help"
          />

          {isSending ? (
            <button
              type="button"
              className="btn btn--icon chat-composer__stop"
              onClick={onStopGenerating}
              aria-label="응답 생성 중지"
            >
              <Icon name="stop" size={16} />
            </button>
          ) : (
            <button
              type="submit"
              className="btn btn--icon btn--primary chat-composer__send"
              disabled={!inputValue.trim()}
              aria-label="메시지 전송"
            >
              <Icon name="send" size={18} />
            </button>
          )}
        </div>

        <p
          id="chat-input-help"
          className={`chat-composer__help ${validationMessage ? 'is-error' : ''}`}
          role={validationMessage ? 'alert' : undefined}
        >
          {validationMessage || 'Enter로 전송, Shift + Enter로 줄바꿈할 수 있습니다.'}
        </p>
      </form>
    </div>
  )
}

export default ChatComposer
