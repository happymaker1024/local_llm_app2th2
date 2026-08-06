/**
 * formatMessage.js
 * LLM 응답에 자주 등장하는 간단한 마크다운을 화면에 그리기 좋은 형태로 나눈다.
 * 외부 라이브러리 없이 동작하며, HTML을 직접 삽입하지 않아 안전하다.
 */

/**
 * 답변 텍스트를 코드 블록과 일반 문단으로 나눈다.
 * @param {string} content
 * @returns {Array<{ type: 'code', language: string, value: string } | { type: 'text', value: string }>}
 */
export function splitMessageBlocks(content) {
  const text = typeof content === 'string' ? content : ''
  if (!text.trim()) {
    return []
  }

  const blocks = []
  // ```언어\n코드\n``` 형태를 찾는다.
  const codeFencePattern = /```([\w+-]*)\n?([\s\S]*?)```/g
  let lastIndex = 0
  let match = codeFencePattern.exec(text)

  while (match !== null) {
    if (match.index > lastIndex) {
      blocks.push({ type: 'text', value: text.slice(lastIndex, match.index) })
    }

    blocks.push({ type: 'code', language: match[1] || 'text', value: match[2].replace(/\n$/, '') })
    lastIndex = codeFencePattern.lastIndex
    match = codeFencePattern.exec(text)
  }

  if (lastIndex < text.length) {
    blocks.push({ type: 'text', value: text.slice(lastIndex) })
  }

  // 코드 블록 사이의 빈 문단은 걸러낸다.
  return blocks.filter((block) => block.type === 'code' || block.value.trim().length > 0)
}

/**
 * 일반 문단 안의 **굵게** 와 `인라인 코드` 를 조각으로 나눈다.
 * @param {string} text
 * @returns {Array<{ type: 'plain' | 'bold' | 'code', value: string }>}
 */
export function splitInlineTokens(text) {
  const tokens = []
  const inlinePattern = /(\*\*[^*\n]+\*\*|`[^`\n]+`)/g
  let lastIndex = 0
  let match = inlinePattern.exec(text)

  while (match !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'plain', value: text.slice(lastIndex, match.index) })
    }

    const token = match[0]
    if (token.startsWith('**')) {
      tokens.push({ type: 'bold', value: token.slice(2, -2) })
    } else {
      tokens.push({ type: 'code', value: token.slice(1, -1) })
    }

    lastIndex = inlinePattern.lastIndex
    match = inlinePattern.exec(text)
  }

  if (lastIndex < text.length) {
    tokens.push({ type: 'plain', value: text.slice(lastIndex) })
  }

  return tokens
}

/** 메시지에 붙일 "오후 3:24" 형태의 시각 문자열을 만든다. */
export function formatTimestamp(date = new Date()) {
  return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

/** 응답 소요 시간을 "1.23초"처럼 보기 좋게 다듬는다. */
export function formatElapsedTime(seconds) {
  if (typeof seconds !== 'number' || !Number.isFinite(seconds)) {
    return ''
  }

  return `${seconds.toFixed(2)}초`
}
