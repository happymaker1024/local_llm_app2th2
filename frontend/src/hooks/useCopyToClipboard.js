import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * 텍스트를 클립보드에 복사하고 잠시 "복사됨" 표시를 보여준다.
 *
 * @param {number} resetDelayMs - "복사됨" 표시를 유지할 시간(ms)
 * @returns {{ isCopied: boolean, copy: (text: string) => Promise<void> }}
 */
export function useCopyToClipboard(resetDelayMs = 1600) {
  const [isCopied, setIsCopied] = useState(false)
  const timeoutRef = useRef(null)

  // 컴포넌트가 사라질 때 예약된 타이머를 정리한다.
  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  const copy = useCallback(
    async (text) => {
      try {
        await navigator.clipboard.writeText(text)

        setIsCopied(true)
        clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => setIsCopied(false), resetDelayMs)
      } catch {
        // 클립보드 권한이 없는 환경(비 HTTPS 등)에서는 조용히 넘어간다.
      }
    },
    [resetDelayMs],
  )

  return { isCopied, copy }
}
