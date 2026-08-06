import { useCallback, useEffect, useRef, useState } from 'react'
import { sendChatMessage } from '../api/chatApi'
import { useChatSettings } from '../hooks/useChatSettings'
import { useConversations, createId } from '../hooks/useConversations'
import { useModels } from '../hooks/useModels'
import { formatTimestamp } from '../utils/formatMessage'
import ChatComposer from './ChatComposer'
import ChatHeader from './ChatHeader'
import MessageList from './MessageList'
import Sidebar from './Sidebar'

/**
 * ChatPage
 * 화면 전체를 조립하고, 메시지 전송 흐름(요청 -> 로딩 -> 성공/실패)을 담당한다.
 * 상태 관리는 훅(useConversations / useChatSettings / useModels)으로 나누어
 * 이 컴포넌트는 "무엇을 언제 하는지"만 다루도록 유지한다.
 */
function ChatPage() {
  const {
    conversations,
    activeConversation,
    activeConversationId,
    startNewConversation,
    selectConversation,
    deleteConversation,
    clearConversationMessages,
    appendMessage,
  } = useConversations()

  const { settings, updateSetting, resetSettings, isDefaultSettings } = useChatSettings()
  const { models, status: modelsStatus, error: modelsError, reload: reloadModels } = useModels()

  const [isSending, setIsSending] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // 진행 중인 요청을 취소하기 위한 컨트롤러
  const abortControllerRef = useRef(null)
  // "다시 시도"에 사용할 마지막 질문 (버튼 노출 여부를 결정하므로 상태로 둔다)
  const [lastUserMessage, setLastUserMessage] = useState('')

  // 화면을 떠날 때 진행 중인 요청을 정리한다.
  useEffect(() => () => abortControllerRef.current?.abort(), [])

  // 모델 목록을 받아왔는데 현재 선택값이 목록에 없으면 첫 번째 모델로 맞춰준다.
  useEffect(() => {
    if (models.length > 0 && !models.includes(settings.model)) {
      updateSetting('model', models[0])
    }
  }, [models, settings.model, updateSetting])

  const runChatRequest = useCallback(
    async (messageText, conversationId) => {
      const controller = new AbortController()
      abortControllerRef.current = controller
      setIsSending(true)
      setErrorMessage('')

      try {
        const response = await sendChatMessage({
          message: messageText,
          model: settings.model,
          systemPrompt: settings.systemPrompt,
          temperature: settings.temperature,
          topP: settings.topP,
          numPredict: settings.numPredict,
          signal: controller.signal,
        })

        appendMessage(conversationId, {
          id: createId(),
          role: 'assistant',
          content: response.message,
          model: response.model,
          elapsedTime: response.elapsedTime,
          timestamp: formatTimestamp(),
        })
      } catch (error) {
        // 사용자가 직접 중지한 경우는 오류가 아니므로 배너를 띄우지 않는다.
        if (error.name !== 'CanceledError') {
          setErrorMessage(error.message)
        }
      } finally {
        abortControllerRef.current = null
        setIsSending(false)
      }
    },
    [appendMessage, settings],
  )

  /** 입력창에서 메시지를 보냈을 때 호출된다. (사양서 4.1) */
  const handleSendMessage = useCallback(
    async (messageText) => {
      // 한 번에 하나의 요청만 처리한다.
      if (isSending || !activeConversationId) {
        return
      }

      setLastUserMessage(messageText)
      appendMessage(activeConversationId, {
        id: createId(),
        role: 'user',
        content: messageText,
        timestamp: formatTimestamp(),
      })

      await runChatRequest(messageText, activeConversationId)
    },
    [activeConversationId, appendMessage, isSending, runChatRequest],
  )

  /** 오류 배너의 "다시 시도" — 같은 질문을 다시 보낸다. (메시지를 중복으로 쌓지 않는다) */
  const handleRetry = useCallback(() => {
    if (isSending || !lastUserMessage || !activeConversationId) {
      return
    }

    runChatRequest(lastUserMessage, activeConversationId)
  }, [activeConversationId, isSending, lastUserMessage, runChatRequest])

  const handleStopGenerating = useCallback(() => {
    abortControllerRef.current?.abort()
  }, [])

  const handleNewConversation = useCallback(() => {
    handleStopGenerating()
    setErrorMessage('')
    startNewConversation()
    setIsSidebarOpen(false)
  }, [handleStopGenerating, startNewConversation])

  const handleSelectConversation = useCallback(
    (conversationId) => {
      selectConversation(conversationId)
      setErrorMessage('')
      setIsSidebarOpen(false)
    },
    [selectConversation],
  )

  /** 헤더의 "대화 초기화" — 현재 대화의 메시지만 비운다. */
  const handleClearConversation = useCallback(() => {
    if (!activeConversationId) {
      return
    }

    handleStopGenerating()
    clearConversationMessages(activeConversationId)
    setErrorMessage('')
  }, [activeConversationId, clearConversationMessages, handleStopGenerating])

  const messages = activeConversation?.messages ?? []

  return (
    <div className="app-shell">
      {isSidebarOpen ? (
        <button
          type="button"
          className="app-shell__overlay"
          aria-label="사이드바 닫기"
          onClick={() => setIsSidebarOpen(false)}
        />
      ) : null}

      <Sidebar
        className={`app-shell__sidebar ${isSidebarOpen ? 'is-open' : ''}`}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={deleteConversation}
        onClose={() => setIsSidebarOpen(false)}
        settings={settings}
        onSettingChange={updateSetting}
        onResetSettings={resetSettings}
        isDefaultSettings={isDefaultSettings}
        isSending={isSending}
      />

      <main className="app-shell__main">
        <ChatHeader
          title={activeConversation?.title}
          messageCount={messages.length}
          models={models}
          modelsStatus={modelsStatus}
          modelsError={modelsError}
          onReloadModels={reloadModels}
          selectedModel={settings.model}
          onModelChange={(model) => updateSetting('model', model)}
          onClearConversation={handleClearConversation}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          isSending={isSending}
        />

        <div className="app-shell__body">
          <MessageList
            messages={messages}
            isSending={isSending}
            errorMessage={errorMessage}
            canRetry={Boolean(lastUserMessage)}
            onRetry={handleRetry}
            onDismissError={() => setErrorMessage('')}
            onSelectExample={handleSendMessage}
            modelName={settings.model}
          />
        </div>

        <ChatComposer
          onSendMessage={handleSendMessage}
          onStopGenerating={handleStopGenerating}
          isSending={isSending}
        />
      </main>
    </div>
  )
}

export default ChatPage
