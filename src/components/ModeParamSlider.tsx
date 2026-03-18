import { useEffect, useState, type ChangeEvent } from 'react'
import type { ParamDescriptor } from '../types'

type ModeParamSliderProps = {
  descriptor: ParamDescriptor
  value: number
  onChange: (key: string, value: number) => void
}

export function ModeParamSlider({ descriptor, value, onChange }: ModeParamSliderProps) {
  const [localValue, setLocalValue] = useState(String(value))
  const [editing, setEditing] = useState(false)

  // Sync external value changes into local state
  useEffect(() => {
    if (!editing) {
      setLocalValue(String(value))
    }
  }, [value, editing])

  const handleSliderChange = (event: ChangeEvent<HTMLInputElement>) => {
    const num = Number(event.target.value)
    setLocalValue(String(num))
    onChange(descriptor.key, num)
  }

  const handleNumberFocus = () => {
    setEditing(true)
    setLocalValue(String(value))
  }

  const handleNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
    setLocalValue(event.target.value)
  }

  const handleNumberBlur = () => {
    setEditing(false)
    const parsed = Number(localValue)
    if (Number.isFinite(parsed)) {
      const clamped = Math.min(descriptor.max, Math.max(descriptor.min, Math.round(parsed / descriptor.step) * descriptor.step))
      onChange(descriptor.key, clamped)
    }
  }

  return (
    <div className="field field-slider">
      <span>{descriptor.label}</span>
      <div className="slider-row">
        <input
          className="slider-input"
          type="range"
          min={descriptor.min}
          max={descriptor.max}
          step={descriptor.step}
          value={value}
          onChange={handleSliderChange}
        />
        <input
          className="slider-number"
          type="number"
          min={descriptor.min}
          max={descriptor.max}
          step={descriptor.step}
          value={editing ? localValue : value}
          onChange={handleNumberChange}
          onFocus={handleNumberFocus}
          onBlur={handleNumberBlur}
        />
      </div>
    </div>
  )
}
