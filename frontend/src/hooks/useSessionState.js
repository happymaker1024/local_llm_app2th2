import { useEffect, useRef, useState } from 'react'

/**
 * useState와 똑같이 동작하지만 값을 sessionStorage에도 저장한다.
 * 새로고침해도 값이 유지되고, 브라우저 탭을 닫으면 사라진다. (사양서 4.6 "세션 단위 관리")
 *
 * @param {string} storageKey - sessionStorage에 저장할 키
 * @param {*|Function} initialValue - 저장된 값이 없을 때 사용할 기본값 (함수를 주면 호출해서 사용)
 */
export function useSessionState(storageKey, initialValue) {
  const [value, setValue] = useState(() => readFromSession(storageKey, initialValue))
  const isFirstRender = useRef(true)

  useEffect(() => {
    // 첫 렌더에서는 방금 읽어온 값을 다시 쓸 필요가 없다.
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    try {
      window.sessionStorage.setItem(storageKey, JSON.stringify(value))
    } catch {
      // 저장 실패(용량 초과, 시크릿 모드 등)는 앱 동작에 영향을 주지 않으므로 무시한다.
    }
  }, [storageKey, value])

  return [value, setValue]
}

function readFromSession(storageKey, initialValue) {
  // 기본값이 함수면 저장된 값이 없을 때만 호출한다. (useState의 지연 초기화와 동일)
  const resolveFallback = () => (typeof initialValue === 'function' ? initialValue() : initialValue)

  try {
    const rawValue = window.sessionStorage.getItem(storageKey)
    if (!rawValue) {
      return resolveFallback()
    }

    const parsedValue = JSON.parse(rawValue)
    return parsedValue ?? resolveFallback()
  } catch {
    return resolveFallback()
  }
}
