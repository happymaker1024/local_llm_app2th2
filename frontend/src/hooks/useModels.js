import { useCallback, useEffect, useState } from 'react'
import { fetchModels } from '../api/chatApi'

/**
 * /models API에서 사용 가능한 모델 목록을 불러온다.
 * 로딩/실패 상태와 "다시 시도" 함수까지 함께 제공한다.
 *
 * @returns {{
 *   models: string[],
 *   status: 'loading' | 'success' | 'error',
 *   error: string,
 *   reload: () => void,
 * }}
 */
export function useModels() {
  const [models, setModels] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  // 이 값이 바뀔 때마다 아래 effect가 다시 실행되어 목록을 새로 불러온다.
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    fetchModels({ signal: controller.signal })
      .then((loadedModels) => {
        if (controller.signal.aborted) {
          return
        }

        setModels(loadedModels)
        setStatus('success')
      })
      .catch((loadError) => {
        // 화면을 떠나며 취소된 요청은 오류로 표시하지 않는다.
        if (controller.signal.aborted || loadError.name === 'CanceledError') {
          return
        }

        setModels([])
        setError(loadError.message)
        setStatus('error')
      })

    return () => controller.abort()
  }, [reloadToken])

  /** 사용자가 "모델 다시 불러오기"를 눌렀을 때 */
  const reload = useCallback(() => {
    setStatus('loading')
    setError('')
    setReloadToken((token) => token + 1)
  }, [])

  return { models, status, error, reload }
}
