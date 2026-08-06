import { useCopyToClipboard } from '../hooks/useCopyToClipboard'
import { splitInlineTokens, splitMessageBlocks } from '../utils/formatMessage'
import Icon from './Icon'

/**
 * MessageContent
 * 메시지 본문을 그린다. 줄바꿈을 유지하고, 코드 블록과 간단한 마크다운을 보기 좋게 표시한다.
 * HTML을 직접 삽입하지 않고 React 요소로만 만들기 때문에 안전하다.
 */
function MessageContent({ content }) {
  const blocks = splitMessageBlocks(content)

  if (blocks.length === 0) {
    return <p className="message-content__paragraph">(빈 응답입니다)</p>
  }

  return (
    <div className="message-content">
      {blocks.map((block, index) =>
        block.type === 'code' ? (
          <CodeBlock key={index} language={block.language} value={block.value} />
        ) : (
          <TextBlock key={index} value={block.value} />
        ),
      )}
    </div>
  )
}

/** 일반 문단: 줄바꿈을 유지하고 **굵게**, `코드` 를 처리한다. */
function TextBlock({ value }) {
  const lines = value.replace(/^\n+|\n+$/g, '').split('\n')

  return (
    <p className="message-content__paragraph">
      {lines.map((line, lineIndex) => (
        <span key={lineIndex}>
          {lineIndex > 0 ? <br /> : null}
          {splitInlineTokens(line).map((token, tokenIndex) => {
            if (token.type === 'bold') {
              return <strong key={tokenIndex}>{token.value}</strong>
            }

            if (token.type === 'code') {
              return (
                <code key={tokenIndex} className="message-content__inline-code">
                  {token.value}
                </code>
              )
            }

            return <span key={tokenIndex}>{token.value}</span>
          })}
        </span>
      ))}
    </p>
  )
}

/** 코드 블록: 언어 표시와 복사 버튼을 함께 보여준다. */
function CodeBlock({ language, value }) {
  const { isCopied, copy } = useCopyToClipboard()

  return (
    <div className="message-content__code">
      <div className="message-content__code-bar">
        <span className="message-content__code-language">{language}</span>
        <button type="button" className="message-content__code-copy" onClick={() => copy(value)}>
          <Icon name={isCopied ? 'check' : 'copy'} size={14} />
          {isCopied ? '복사됨' : '복사'}
        </button>
      </div>
      <pre className="scroll-area">
        <code>{value}</code>
      </pre>
    </div>
  )
}

export default MessageContent
