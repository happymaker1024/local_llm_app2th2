/**
 * chatDefaults.js
 * 백엔드 schema.py(ChatRequest)에 정의된 기본값과 허용 범위를 한 곳에 모아둔다.
 * 백엔드 스키마가 바뀌면 이 파일만 수정하면 된다.
 */

/** 백엔드 ChatRequest의 기본값과 동일하게 맞춘 값 */
export const DEFAULT_SETTINGS = {
  model: 'exaone3.5:7.8b',
  systemPrompt: '너는 초보자를 돕는 친절한 AI 강사다.',
  temperature: 0.5,
  topP: 0.9,
  numPredict: 512,
}

/**
 * 파라미터별 허용 범위와 설명.
 * SettingsPanel이 이 정보를 그대로 읽어 슬라이더와 안내 문구를 만든다.
 */
export const PARAMETER_META = {
  temperature: {
    label: 'Temperature',
    min: 0,
    max: 2,
    step: 0.1,
    hint: '값이 낮을수록 일관되고, 높을수록 창의적인 답변이 나옵니다. (0 ~ 2)',
  },
  topP: {
    label: 'Top P',
    min: 0,
    max: 1,
    step: 0.05,
    hint: '다음 단어를 고를 후보의 범위입니다. 보통 0.9를 사용합니다. (0 ~ 1)',
  },
  numPredict: {
    label: 'Num Predict',
    min: 1,
    max: 2048,
    step: 1,
    hint: '한 번에 생성할 최대 토큰 수입니다. 길수록 답변이 길어집니다. (1 ~ 2048)',
  },
}

/** 대화가 비어 있을 때 보여줄 예시 질문 */
export const EXAMPLE_PROMPTS = [
  'WSL이 무엇인지 초보자에게 설명해줘.',
  'FastAPI와 Flask의 차이를 표로 비교해줘.',
  'React에서 useState와 useEffect의 역할을 알려줘.',
  'Ollama로 로컬 LLM을 실행하는 순서를 알려줘.',
]

/**
 * 숫자를 허용 범위 안으로 보정한다.
 * 사용자가 입력창에 범위를 벗어난 값을 넣어도 백엔드 검증 오류가 나지 않게 한다.
 */
export function clampNumber(value, { min, max }, fallback = min) {
  const numericValue = Number(value)

  if (!Number.isFinite(numericValue)) {
    return fallback
  }

  return Math.min(max, Math.max(min, numericValue))
}
