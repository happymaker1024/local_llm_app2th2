import { useState } from 'react'
import { DEFAULT_SETTINGS, PARAMETER_META, clampNumber } from '../constants/chatDefaults'
import Icon from './Icon'

/**
 * SettingsPanel
 * 시스템 프롬프트와 생성 파라미터(temperature / top_p / num_predict)를 조정한다.
 * 각 항목의 기본값과 허용 범위를 함께 보여주어 처음 쓰는 사람도 이해할 수 있게 한다.
 */
function SettingsPanel({ settings, onSettingChange, onResetSettings, isDefaultSettings, isSending }) {
  return (
    <div className="settings-panel">
      <section className="settings-panel__section">
        <label className="field" htmlFor="system-prompt">
          <span className="field__label">시스템 프롬프트</span>
          <textarea
            id="system-prompt"
            className="textarea"
            rows={5}
            value={settings.systemPrompt}
            onChange={(event) => onSettingChange('systemPrompt', event.target.value)}
            placeholder={DEFAULT_SETTINGS.systemPrompt}
          />
          <span className="field__hint">AI의 역할과 말투를 정합니다. 다음 질문부터 적용됩니다.</span>
        </label>
      </section>

      <section className="settings-panel__section">
        <SliderField
          id="temperature"
          meta={PARAMETER_META.temperature}
          value={settings.temperature}
          defaultValue={DEFAULT_SETTINGS.temperature}
          onChange={(value) => onSettingChange('temperature', value)}
        />

        <SliderField
          id="topP"
          meta={PARAMETER_META.topP}
          value={settings.topP}
          defaultValue={DEFAULT_SETTINGS.topP}
          onChange={(value) => onSettingChange('topP', value)}
        />

        <NumberField
          id="numPredict"
          meta={PARAMETER_META.numPredict}
          value={settings.numPredict}
          defaultValue={DEFAULT_SETTINGS.numPredict}
          onChange={(value) => onSettingChange('numPredict', value)}
        />
      </section>

      <button
        type="button"
        className="btn btn--ghost settings-panel__reset"
        onClick={onResetSettings}
        disabled={isDefaultSettings}
      >
        <Icon name="refresh" size={15} />
        기본값으로 되돌리기
      </button>

      {isSending ? <p className="settings-panel__note">응답을 생성하는 중입니다. 변경한 값은 다음 질문부터 적용됩니다.</p> : null}
    </div>
  )
}

/** 슬라이더로 조정하는 실수 파라미터 (temperature, top_p) */
function SliderField({ id, meta, value, defaultValue, onChange }) {
  // 슬라이더 채움 정도를 CSS 그라데이션으로 표현하기 위한 비율
  const fillPercent = ((value - meta.min) / (meta.max - meta.min)) * 100

  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        <span>{meta.label}</span>
        <span className="field__value">{value.toFixed(2)}</span>
      </label>

      <input
        id={id}
        className="slider"
        type="range"
        min={meta.min}
        max={meta.max}
        step={meta.step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{
          background: `linear-gradient(to right, var(--color-accent) ${fillPercent}%, var(--color-separator-strong) ${fillPercent}%)`,
        }}
      />

      <span className="field__hint">
        {meta.hint} 기본값 {defaultValue}
      </span>
    </div>
  )
}

/** 숫자 입력으로 조정하는 정수 파라미터 (num_predict) */
function NumberField({ id, meta, value, defaultValue, onChange }) {
  // 입력 중간 상태("", "5")를 허용하려고 화면용 문자열을 따로 둔다.
  const [draftValue, setDraftValue] = useState(String(value))
  const [lastSyncedValue, setLastSyncedValue] = useState(value)

  // 바깥에서 값이 바뀌면(예: 기본값 되돌리기) 입력창에도 반영한다.
  if (value !== lastSyncedValue) {
    setLastSyncedValue(value)
    setDraftValue(String(value))
  }

  // 입력을 마쳤을 때 허용 범위 안의 정수로 확정한다.
  const commitValue = () => {
    const nextValue = Math.round(clampNumber(draftValue, meta, defaultValue))
    setDraftValue(String(nextValue))
    onChange(nextValue)
  }

  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        <span>{meta.label}</span>
        <span className="field__value">{value}</span>
      </label>

      <input
        id={id}
        className="input"
        type="number"
        inputMode="numeric"
        min={meta.min}
        max={meta.max}
        step={meta.step}
        value={draftValue}
        onChange={(event) => setDraftValue(event.target.value)}
        onBlur={commitValue}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            commitValue()
          }
        }}
      />

      <span className="field__hint">
        {meta.hint} 기본값 {defaultValue}
      </span>
    </div>
  )
}

export default SettingsPanel
