import { useCallback, useEffect, useRef, useState } from 'react'

/** 이 픽셀 이내로 바닥에 가까우면 "바닥을 보고 있다"고 판단한다. */
const BOTTOM_THRESHOLD_PX = 80

/**
 * 새 메시지가 올 때 대화창을 자동으로 맨 아래까지 스크롤한다.
 * 단, 사용자가 위로 올려 이전 대화를 읽는 중이라면 방해하지 않는다.
 *
 * @param {unknown[]} dependencies - 이 값들이 바뀌면 스크롤을 시도한다.
 */
export function useAutoScroll(dependencies = []) {
  const scrollRef = useRef(null)
  const [isPinnedToBottom, setIsPinnedToBottom] = useState(true)

  const scrollToBottom = useCallback((behavior = 'smooth') => {
    const element = scrollRef.current
    if (!element) {
      return
    }

    element.scrollTo({ top: element.scrollHeight, behavior })
    setIsPinnedToBottom(true)
  }, [])

  // 사용자가 스크롤을 움직일 때마다 바닥 근처인지 다시 계산한다.
  const handleScroll = useCallback(() => {
    const element = scrollRef.current
    if (!element) {
      return
    }

    const distanceFromBottom = element.scrollHeight - element.scrollTop - element.clientHeight
    setIsPinnedToBottom(distanceFromBottom <= BOTTOM_THRESHOLD_PX)
  }, [])

  useEffect(() => {
    if (isPinnedToBottom) {
      scrollToBottom()
    }
    // isPinnedToBottom은 스크롤 위치 판단용이라 의존성에 넣지 않는다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)

  return { scrollRef, handleScroll, isPinnedToBottom, scrollToBottom }
}
