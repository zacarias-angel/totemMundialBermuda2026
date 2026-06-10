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
          target.inputMode = 'none'
          inputRef.current = target
          setFocused(true)
        }
      }
    }
    const onBlur = (e: FocusEvent) => {
      const related = e.relatedTarget as HTMLElement | null
      if (related && related.closest('[data-totem-keyboard]')) return
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

  const closeKeyboard = () => {
    inputRef.current?.blur()
    inputRef.current = null
    setFocused(false)
  }

  if (!focused) return null

  const currentKeys = isNumbers ? numberKeys : keys

  return (
    <div
      data-totem-keyboard
      className="fixed top-[5vh] left-0 right-0 z-50 bg-zinc-900/95 backdrop-blur-md border-b border-white/10 px-3 py-3 select-none shadow-2xl"
    >
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs text-gray-500 uppercase tracking-wider">
          {inputRef.current?.placeholder || 'Teclado virtual'}
        </span>
        <button
          onClick={closeKeyboard}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-700 hover:bg-zinc-600 text-white text-lg font-bold active:scale-90 transition-transform"
          aria-label="Cerrar teclado"
        >
          ✕
        </button>
      </div>

      <div className="flex flex-col gap-1.5 max-w-xl mx-auto">
        {currentKeys.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-1.5">
            {row.map((key) => {
              const isSpecial = key === 'Shift' || key === 'Backspace' || key === 'Enter' || key === '123' || key === 'ABC'
              const isSpace = key === ' '
              const isEnter = key === 'Enter'
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
                    ${isSpace ? 'w-32' : ''}
                    ${isEnter ? 'px-8 bg-blue-600 hover:bg-blue-500 text-base' : ''}
                    ${!isSpace && !isEnter && isSpecial ? 'px-4' : ''}
                    ${!isSpace && !isEnter && !isSpecial ? 'w-10' : ''}
                    h-12 text-lg
                    ${isSpecial && !isEnter ? 'bg-zinc-700 hover:bg-zinc-600' : ''}
                    ${!isSpecial && !isEnter ? 'bg-zinc-800 hover:bg-zinc-700' : ''}
                    ${key === 'Shift' && isShift ? 'bg-blue-600 text-white' : ''}
                    shadow-lg
                  `}
                >
                  {key === 'Space' ? '' : key === 'Backspace' ? '⌫' : key === 'Enter' ? '↵  OK' : key}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
