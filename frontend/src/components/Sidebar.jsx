import { useState } from 'react'
import Icon from './Icon'
import SettingsPanel from './SettingsPanel'

/**
 * Sidebar
 * 왼쪽 패널. 위쪽 세그먼트로 "대화 목록"과 "모델 설정"을 전환한다.
 * 모바일에서는 서랍(drawer)처럼 열리고 닫힌다.
 */
function Sidebar({
  className = '',
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onClose,
  settings,
  onSettingChange,
  onResetSettings,
  isDefaultSettings,
  isSending,
}) {
  const [activeTab, setActiveTab] = useState('conversations')

  return (
    <aside className={`sidebar ${className}`} aria-label="대화 목록과 모델 설정">
      <div className="sidebar__top">
        <div className="sidebar__brand">
          <span className="sidebar__brand-mark" aria-hidden="true">
            <Icon name="sparkles" size={16} />
          </span>
          <div>
            <p className="sidebar__brand-title">Local LLM Chat</p>
            <p className="sidebar__brand-subtitle">React + FastAPI + Ollama</p>
          </div>
        </div>

        <button type="button" className="btn btn--icon btn--ghost sidebar__close" onClick={onClose}>
          <Icon name="close" />
          <span className="visually-hidden">사이드바 닫기</span>
        </button>
      </div>

      {/* 탭 전환: 접근성을 위해 role="tablist" 구조를 사용한다. */}
      <div className="sidebar__tabs" role="tablist" aria-label="사이드바 보기 전환">
        <button
          type="button"
          role="tab"
          id="tab-conversations"
          aria-selected={activeTab === 'conversations'}
          aria-controls="panel-conversations"
          className={`sidebar__tab ${activeTab === 'conversations' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('conversations')}
        >
          <Icon name="chat" size={15} />
          대화
        </button>
        <button
          type="button"
          role="tab"
          id="tab-settings"
          aria-selected={activeTab === 'settings'}
          aria-controls="panel-settings"
          className={`sidebar__tab ${activeTab === 'settings' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Icon name="sliders" size={15} />
          모델 설정
        </button>
      </div>

      {activeTab === 'conversations' ? (
        <div className="sidebar__panel" role="tabpanel" id="panel-conversations" aria-labelledby="tab-conversations">
          <button type="button" className="btn btn--secondary sidebar__new" onClick={onNewConversation}>
            <Icon name="plus" size={16} />새 대화 시작
          </button>

          <ul className="sidebar__list scroll-area">
            {conversations.map((conversation) => {
              const isActive = conversation.id === activeConversationId

              return (
                <li key={conversation.id} className={`sidebar__item ${isActive ? 'is-active' : ''}`}>
                  <button
                    type="button"
                    className="sidebar__item-button"
                    onClick={() => onSelectConversation(conversation.id)}
                    aria-current={isActive ? 'true' : undefined}
                  >
                    <span className="sidebar__item-title">{conversation.title}</span>
                    <span className="sidebar__item-meta">
                      {conversation.messages.length > 0
                        ? `메시지 ${conversation.messages.length}개`
                        : '아직 메시지가 없습니다'}
                    </span>
                  </button>

                  <button
                    type="button"
                    className="sidebar__item-delete"
                    onClick={() => onDeleteConversation(conversation.id)}
                  >
                    <Icon name="trash" size={15} />
                    <span className="visually-hidden">{conversation.title} 대화 삭제</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ) : (
        <div className="sidebar__panel" role="tabpanel" id="panel-settings" aria-labelledby="tab-settings">
          <SettingsPanel
            settings={settings}
            onSettingChange={onSettingChange}
            onResetSettings={onResetSettings}
            isDefaultSettings={isDefaultSettings}
            isSending={isSending}
          />
        </div>
      )}

      <p className="sidebar__footer">대화는 브라우저 탭을 닫으면 사라집니다.</p>
    </aside>
  )
}

export default Sidebar
