import { useCallback, useMemo } from 'react'
import { DEFAULT_SETTINGS, PARAMETER_META, clampNumber } from '../constants/chatDefaults'
import { useSessionState } from './useSessionState'

const SETTINGS_STORAGE_KEY = 'local-llm-chat:settings'

/**
 * 모델 / 시스템 프롬프트 / 생성 파라미터를 한 덩어리로 관리한다.
 * 값은 sessionStorage에 저장되고, 항상 백엔드가 허용하는 범위로 보정된다.
 */
export function useChatSettings() {
  const [settings, setSettings] = useSessionState(SETTINGS_STORAGE_KEY, DEFAULT_SETTINGS)

  // 저장된 값에 빠진 항목이 있어도 기본값으로 채워준다.
  const safeSettings = useMemo(() => ({ ...DEFAULT_SETTINGS, ...(settings ?? {}) }), [settings])

  const updateSetting = useCallback(
    (key, value) => {
      const range = PARAMETER_META[key]
      // 숫자 파라미터는 허용 범위를 벗어나지 않도록 보정한다.
      const nextValue = range ? clampNumber(value, range, DEFAULT_SETTINGS[key]) : value

      setSettings((previous) => ({ ...DEFAULT_SETTINGS, ...(previous ?? {}), [key]: nextValue }))
    },
    [setSettings],
  )

  const resetSettings = useCallback(() => {
    // 모델 선택은 유지하고 프롬프트/파라미터만 기본값으로 되돌린다.
    setSettings((previous) => ({ ...DEFAULT_SETTINGS, model: previous?.model ?? DEFAULT_SETTINGS.model }))
  }, [setSettings])

  const isDefaultSettings = useMemo(
    () =>
      safeSettings.systemPrompt === DEFAULT_SETTINGS.systemPrompt &&
      safeSettings.temperature === DEFAULT_SETTINGS.temperature &&
      safeSettings.topP === DEFAULT_SETTINGS.topP &&
      safeSettings.numPredict === DEFAULT_SETTINGS.numPredict,
    [safeSettings],
  )

  return { settings: safeSettings, updateSetting, resetSettings, isDefaultSettings }
}
