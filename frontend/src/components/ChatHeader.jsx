import Icon from './Icon'

/**
 * ChatHeader
 * 상단 바. 현재 대화 제목, 모델 선택 드롭다운, 대화 초기화 버튼을 담는다.
 * 모바일에서는 왼쪽의 메뉴 버튼으로 사이드바를 연다.
 */
function ChatHeader({
  title,
  messageCount,
  models,
  modelsStatus,
  modelsError,
  onReloadModels,
  selectedModel,
  onModelChange,
  onClearConversation,
  onOpenSidebar,
  isSending,
}) {
  const isModelsLoading = modelsStatus === 'loading'
  const hasModelsError = modelsStatus === 'error'

  return (
    <header className="chat-header">
      <div className="chat-header__row">
        <button type="button" className="btn btn--icon btn--ghost chat-header__menu" onClick={onOpenSidebar}>
          <Icon name="menu" />
          <span className="visually-hidden">대화 목록 열기</span>
        </button>

        <div className="chat-header__titles">
          <h1 className="chat-header__title">{title || 'Local LLM Chat'}</h1>
          <p className="chat-header__subtitle">
            {messageCount > 0 ? `메시지 ${messageCount}개` : '무엇이든 물어보세요'}
          </p>
        </div>

        <div className="chat-header__actions">
          <div className="chat-header__model">
            <label className="visually-hidden" htmlFor="model-select">
              모델 선택
            </label>

            {hasModelsError ? (
              <button type="button" className="btn btn--secondary chat-header__reload" onClick={onReloadModels}>
                <Icon name="refresh" size={15} />
                모델 다시 불러오기
              </button>
            ) : (
              <select
                id="model-select"
                className="select chat-header__select"
                value={selectedModel}
                onChange={(event) => onModelChange(event.target.value)}
                disabled={isModelsLoading || models.length === 0}
              >
                {isModelsLoading ? (
                  <option value={selectedModel}>모델 불러오는 중…</option>
                ) : null}

                {/* 목록에 없는 모델이 선택돼 있어도 화면에서 사라지지 않게 함께 보여준다. */}
                {!isModelsLoading && !models.includes(selectedModel) ? (
                  <option value={selectedModel}>{selectedModel}</option>
                ) : null}

                {models.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            )}
          </div>

          <button
            type="button"
            className="btn btn--secondary chat-header__clear"
            onClick={onClearConversation}
            disabled={messageCount === 0 && !isSending}
          >
            대화 초기화
          </button>
        </div>
      </div>

      {hasModelsError ? (
        <p className="chat-header__error" role="status">
          <Icon name="warning" size={14} />
          {modelsError}
        </p>
      ) : null}
    </header>
  )
}

export default ChatHeader
