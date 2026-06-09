'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

const keys = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ñ'],
  ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'Backspace'],
  ['123', ',', ' ', '.', 'Enter'],
]

const numberKeys = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['-', '/', ':', ';', '(', ')', '$', '&', '@', '"'],
  ['#', '+', '=', '*', '%', '!', '?', "'", 'Backspace'],
  ['ABC', ',', ' ', '.', 'Enter'],
]

export function VirtualKeyboard() {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)
  const [isShift, setIsShift] = useState(false)
  const [isNumbers, setIsNumbers] = useState(false)
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    const onFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        if (target.closest('[data-totem-input]')) {
          inputRef.current = target
          setFocused(true)
        }
      }
    }
    const onBlur = () => {
      setTimeout(() => {
        inputRef.current = null
        setFocused(false)
      }, 150)
    }

    document.addEventListener('focusin', onFocus)
    document.addEventListener('focusout', onBlur)
    return () => {
      document.removeEventListener('focusin', onFocus)
      document.removeEventListener('focusout', onBlur)
    }
  }, [])

  const insertChar = useCallback((char: string) => {
    const el = inputRef.current
    if (!el) return
    const start = el.selectionStart ?? el.value.length
    const end = el.selectionEnd ?? start
    const newValue = el.value.slice(0, start) + char + el.value.slice(end)
    el.value = newValue
    el.setSelectionRange(start + 1, start + 1)
    el.dispatchEvent(new Event('input', { bubbles: true }))
    el.focus()
  }, [])

  const deleteChar = useCallback(() => {
    const el = inputRef.current
    if (!el) return
    const start = el.selectionStart ?? el.value.length
    if (start === 0) return
    const newValue = el.value.slice(0, start - 1) + el.value.slice(start)
    el.value = newValue
    el.setSelectionRange(start - 1, start - 1)
    el.dispatchEvent(new Event('input', { bubbles: true }))
    el.focus()
  }, [])

  const handleKey = (key: string) => {
    const el = inputRef.current
    if (!el) return

    switch (key) {
      case 'Enter':
        el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
        el.form?.requestSubmit()
        break
      case 'Backspace':
        deleteChar()
        break
      case 'Space':
        insertChar(' ')
        break
      case 'Shift':
        setIsShift((s) => !s)
        break
      case 'ABC':
      case '123':
        setIsNumbers((s) => !s)
        break
      default:
        insertChar(isShift ? key.toUpperCase() : key)
        if (isShift) setIsShift(false)
    }
  }

  if (!focused) return null

  const currentKeys = isNumbers ? numberKeys : keys

  return (
    <div className="fixed bottom-64 left-0 right-0 z-50 bg-zinc-900/95 backdrop-blur-md border-t border-white/10 px-4 py-3 select-none">
      <div className="flex flex-col gap-1.5 max-w-xl mx-auto">
        {currentKeys.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-1.5">
            {row.map((key) => {
              const isSpecial = key === 'Shift' || key === 'Backspace' || key === 'Enter' || key === '123' || key === 'ABC'
              const isSpace = key === ' '
              return (
                <button
                  key={key}
                  onPointerDown={(e) => {
                    e.preventDefault()
                    handleKey(key)
                  }}
                  className={`
                    flex items-center justify-center rounded-xl
                    text-white font-semibold active:scale-95 transition-transform
                    ${isSpace ? 'w-40' : isSpecial ? 'px-5' : 'w-11'}
                    h-14 text-lg
                    ${isSpecial ? 'bg-zinc-700 hover:bg-zinc-600' : 'bg-zinc-800 hover:bg-zinc-700'}
                    ${key === 'Shift' && isShift ? 'bg-blue-600 text-white' : ''}
                    shadow-lg
                  `}
                >
                  {key === 'Space' ? '' : key === 'Backspace' ? '⌫' : key === 'Enter' ? '↵' : key}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
