/**
 * chatApi.js
 * FastAPI 백엔드(/chat, /models)와 통신하는 함수 모음.
 * 화면 컴포넌트는 fetch를 직접 쓰지 않고 이 파일의 함수만 사용한다.
 */

// const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '')
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api");

/** 로컬 LLM은 응답이 느릴 수 있어 넉넉하게 잡는다. (2분) */
const CHAT_TIMEOUT_MS = 120_000
const MODELS_TIMEOUT_MS = 15_000

/** 사용자에게 보여줄 표준 오류 메시지 (프론트엔드 사양서 5.3) */
export const CHAT_ERROR_MESSAGE = '응답을 받아오지 못했습니다. 잠시 후 다시 시도해주세요.'
export const MODELS_ERROR_MESSAGE =
  '모델 목록을 불러오지 못했습니다. 백엔드 서버가 실행 중인지 확인해주세요.'

/** API 호출 실패를 나타내는 오류. message는 그대로 화면에 노출해도 되는 문구다. */
export class ApiError extends Error {
  constructor(message, { status = 0, detail = '', cause } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
    this.cause = cause
  }
}

/** 사용자가 직접 요청을 중단했을 때 발생하는 오류 (에러 배너를 띄우지 않는다) */
export class CanceledError extends Error {
  constructor(message = '요청을 취소했습니다.') {
    super(message)
    this.name = 'CanceledError'
  }
}

/**
 * fetch를 감싸 타임아웃 / 취소 / 오류 메시지 변환을 한 번에 처리한다.
 * @param {string} path        - '/chat' 같은 API 경로
 * @param {object} options
 * @param {'GET'|'POST'} [options.method]
 * @param {object} [options.body]          - JSON으로 직렬화할 요청 본문
 * @param {AbortSignal} [options.signal]   - 호출한 쪽에서 취소할 때 쓰는 신호
 * @param {number} [options.timeoutMs]
 * @param {string} options.errorMessage    - 실패 시 사용자에게 보여줄 문구
 */
async function requestJson(path, { method = 'GET', body, signal, timeoutMs, errorMessage }) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort('timeout'), timeoutMs)

  // 호출한 쪽의 취소 신호를 내부 컨트롤러로 이어준다.
  const forwardAbort = () => controller.abort('canceled')
  if (signal) {
    if (signal.aborted) {
      forwardAbort()
    } else {
      signal.addEventListener('abort', forwardAbort)
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })

    if (!response.ok) {
      // FastAPI는 오류를 { "detail": "..." } 형태로 내려준다.
      const errorBody = await response.json().catch(() => ({}))
      throw new ApiError(errorMessage, {
        status: response.status,
        detail: typeof errorBody.detail === 'string' ? errorBody.detail : '',
      })
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    if (error.name === 'AbortError') {
      if (controller.signal.reason === 'timeout') {
        throw new ApiError('응답 시간이 너무 오래 걸립니다. 잠시 후 다시 시도해주세요.')
      }
      throw new CanceledError()
    }

    // 네트워크 오류(서버 미실행, CORS 등)
    throw new ApiError(errorMessage, { cause: error })
  } finally {
    clearTimeout(timeoutId)
    signal?.removeEventListener('abort', forwardAbort)
  }
}

/**
 * 사용 가능한 모델 목록을 가져온다.
 * @returns {Promise<string[]>} 예: ['exaone3.5:7.8b', 'llama3.2:3b']
 */
export async function fetchModels({ signal } = {}) {
  const data = await requestJson('/models', {
    signal,
    timeoutMs: MODELS_TIMEOUT_MS,
    errorMessage: MODELS_ERROR_MESSAGE,
  })

  // 응답 형식이 바뀌어도 화면이 깨지지 않도록 방어적으로 읽는다.
  return Array.isArray(data?.models) ? data.models.filter((model) => typeof model === 'string') : []
}

/**
 * 채팅 메시지를 백엔드로 보내고 AI 응답을 받는다.
 * @param {object} params
 * @param {string} params.message
 * @param {string} params.model
 * @param {string} params.systemPrompt
 * @param {number} params.temperature
 * @param {number} params.topP
 * @param {number} params.numPredict
 * @param {AbortSignal} [params.signal]
 * @returns {Promise<{ model: string, message: string, elapsedTime: number }>}
 */
export async function sendChatMessage({
  message,
  model,
  systemPrompt,
  temperature,
  topP,
  numPredict,
  signal,
}) {
  const data = await requestJson('/chat', {
    method: 'POST',
    // 백엔드 스키마는 snake_case를 사용한다.
    body: {
      message,
      model,
      system_prompt: systemPrompt,
      temperature,
      top_p: topP,
      num_predict: numPredict,
    },
    signal,
    timeoutMs: CHAT_TIMEOUT_MS,
    errorMessage: CHAT_ERROR_MESSAGE,
  })

  // 백엔드 응답을 프론트에서 쓰기 편한 camelCase로 한 번만 변환한다.
  return {
    model: data?.model ?? model,
    message: data?.message ?? '',
    elapsedTime: typeof data?.elapsed_time === 'number' ? data.elapsed_time : null,
  }
}
