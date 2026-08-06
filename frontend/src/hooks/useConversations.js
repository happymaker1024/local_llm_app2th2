import { useCallback, useMemo } from 'react'
import { useSessionState } from './useSessionState'

const CONVERSATIONS_STORAGE_KEY = 'local-llm-chat:conversations'
const ACTIVE_ID_STORAGE_KEY = 'local-llm-chat:active-conversation-id'
const NEW_CONVERSATION_TITLE = '새 대화'
const TITLE_MAX_LENGTH = 24

/** 브라우저가 crypto.randomUUID를 지원하지 않는 경우까지 대비한 id 생성기 */
export function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function createConversation() {
  return {
    id: createId(),
    title: NEW_CONVERSATION_TITLE,
    messages: [],
    createdAt: new Date().toISOString(),
  }
}

/** 첫 사용자 메시지를 대화 제목으로 사용한다. 너무 길면 잘라낸다. */
function buildTitleFromMessage(text) {
  const singleLineText = text.replace(/\s+/g, ' ').trim()

  if (singleLineText.length <= TITLE_MAX_LENGTH) {
    return singleLineText || NEW_CONVERSATION_TITLE
  }

  return `${singleLineText.slice(0, TITLE_MAX_LENGTH)}…`
}

/**
 * 대화 목록 상태를 관리한다. (생성 / 선택 / 삭제 / 메시지 추가 / 비우기)
 * 대화 내용은 sessionStorage에 저장되어 새로고침에도 유지된다.
 */
export function useConversations() {
  const [conversations, setConversations] = useSessionState(CONVERSATIONS_STORAGE_KEY, () => [
    createConversation(),
  ])
  const [activeConversationId, setActiveConversationId] = useSessionState(ACTIVE_ID_STORAGE_KEY, null)

  // 저장된 값이 비어 있거나 깨진 경우에도 항상 대화가 하나는 있도록 보정한다.
  const safeConversations = useMemo(
    () => (Array.isArray(conversations) && conversations.length > 0 ? conversations : [createConversation()]),
    [conversations],
  )

  const activeConversation = useMemo(
    () =>
      safeConversations.find((conversation) => conversation.id === activeConversationId) ??
      safeConversations[0],
    [activeConversationId, safeConversations],
  )

  /** 특정 대화만 골라 새 값으로 바꾸는 공통 헬퍼 */
  const updateConversation = useCallback(
    (conversationId, updater) => {
      setConversations((previous) =>
        (previous ?? []).map((conversation) =>
          conversation.id === conversationId ? updater(conversation) : conversation,
        ),
      )
    },
    [setConversations],
  )

  const startNewConversation = useCallback(() => {
    // 이미 비어 있는 대화를 보고 있다면 새로 만들지 않고 그대로 사용한다.
    if (activeConversation && activeConversation.messages.length === 0) {
      setActiveConversationId(activeConversation.id)
      return activeConversation.id
    }

    const newConversation = createConversation()
    setConversations((previous) => [newConversation, ...(previous ?? [])])
    setActiveConversationId(newConversation.id)
    return newConversation.id
  }, [activeConversation, setActiveConversationId, setConversations])

  const selectConversation = useCallback(
    (conversationId) => setActiveConversationId(conversationId),
    [setActiveConversationId],
  )

  const deleteConversation = useCallback(
    (conversationId) => {
      const remaining = safeConversations.filter((conversation) => conversation.id !== conversationId)
      // 마지막 대화를 지우면 빈 대화를 하나 만들어 화면이 비지 않게 한다.
      const nextConversations = remaining.length > 0 ? remaining : [createConversation()]

      setConversations(nextConversations)

      // 지운 대화를 보고 있었다면 첫 번째 대화로 옮겨준다.
      if (activeConversation?.id === conversationId) {
        setActiveConversationId(nextConversations[0].id)
      }
    },
    [activeConversation, safeConversations, setActiveConversationId, setConversations],
  )

  /** 현재 대화의 메시지를 모두 지운다. (대화 초기화) */
  const clearConversationMessages = useCallback(
    (conversationId) => {
      updateConversation(conversationId, (conversation) => ({
        ...conversation,
        title: NEW_CONVERSATION_TITLE,
        messages: [],
      }))
    },
    [updateConversation],
  )

  const appendMessage = useCallback(
    (conversationId, message) => {
      updateConversation(conversationId, (conversation) => {
        const isFirstUserMessage =
          message.role === 'user' && !conversation.messages.some((item) => item.role === 'user')

        return {
          ...conversation,
          // 제목은 첫 질문으로 한 번만 정한다.
          title: isFirstUserMessage ? buildTitleFromMessage(message.content) : conversation.title,
          messages: [...conversation.messages, message],
        }
      })
    },
    [updateConversation],
  )

  /** 실패한 메시지를 목록에서 되돌릴 때 사용한다. */
  const removeMessage = useCallback(
    (conversationId, messageId) => {
      updateConversation(conversationId, (conversation) => ({
        ...conversation,
        messages: conversation.messages.filter((message) => message.id !== messageId),
      }))
    },
    [updateConversation],
  )

  return {
    conversations: safeConversations,
    activeConversation,
    activeConversationId: activeConversation?.id ?? null,
    startNewConversation,
    selectConversation,
    deleteConversation,
    clearConversationMessages,
    appendMessage,
    removeMessage,
  }
}
