import { EXAMPLE_PROMPTS } from '../constants/chatDefaults'
import { useAutoScroll } from '../hooks/useAutoScroll'
import Icon from './Icon'
import MessageBubble from './MessageBubble'

/**
 * MessageList
 * 대화 내용을 스크롤 영역에 그린다.
 * 빈 상태 / 로딩("응답 생성 중...") / 오류 상태를 함께 처리한다. (사양서 4.5)
 */
function MessageList({
  messages,
  isSending,
  errorMessage,
  canRetry,
  onRetry,
  onDismissError,
  onSelectExample,
  modelName,
}) {
  // 새 메시지나 로딩 상태가 바뀔 때마다 자동으로 맨 아래로 내린다.
  const { scrollRef, handleScroll, isPinnedToBottom, scrollToBottom } = useAutoScroll([
    messages.length,
    isSending,
    errorMessage,
  ])

  const isEmpty = messages.length === 0

  return (
    <div className="message-list">
      <div className="message-list__scroll scroll-area" ref={scrollRef} onScroll={handleScroll}>
        <div className="content-column message-list__inner">
          {isEmpty && !isSending ? (
            <EmptyState modelName={modelName} onSelectExample={onSelectExample} />
          ) : (
            messages.map((message) => <MessageBubble key={message.id} message={message} />)
          )}

          {/* 상태 변화는 스크린 리더에도 알려준다. */}
          <div aria-live="polite" aria-atomic="false">
            {isSending ? <TypingIndicator /> : null}

            {errorMessage ? (
              <div className="message-list__error" role="alert">
                <Icon name="warning" size={16} className="message-list__error-icon" />
                <p className="message-list__error-text">{errorMessage}</p>

                <div className="message-list__error-actions">
                  {canRetry ? (
                    <button type="button" className="btn btn--primary" onClick={onRetry}>
                      다시 시도
                    </button>
                  ) : null}
                  <button type="button" className="btn btn--ghost" onClick={onDismissError}>
                    닫기
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* 위로 올려 이전 대화를 보는 중일 때만 "맨 아래로" 버튼을 띄운다. */}
      {!isPinnedToBottom && !isEmpty ? (
        <button type="button" className="message-list__scroll-bottom" onClick={() => scrollToBottom()}>
          <Icon name="arrowDown" size={16} />
          <span className="visually-hidden">맨 아래로 이동</span>
        </button>
      ) : null}
    </div>
  )
}

/** 대화가 비어 있을 때 보여주는 안내 화면 */
function EmptyState({ modelName, onSelectExample }) {
  return (
    <div className="message-list__empty">
      <span className="message-list__empty-mark" aria-hidden="true">
        <Icon name="sparkles" size={22} />
      </span>

      <h2 className="message-list__empty-title">무엇을 도와드릴까요?</h2>
      <p className="message-list__empty-description">
        아래 예시를 눌러보거나 직접 질문을 입력해보세요.
        <br />
        현재 모델: <strong>{modelName}</strong>
      </p>

      <div className="message-list__examples">
        {EXAMPLE_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            className="message-list__example"
            onClick={() => onSelectExample(prompt)}
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  )
}

/** 응답 생성 중 표시 (사양서 4.5) */
function TypingIndicator() {
  return (
    <div className="message-list__typing">
      <span className="message-list__typing-dots" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      응답 생성 중...
    </div>
  )
}

export default MessageList
