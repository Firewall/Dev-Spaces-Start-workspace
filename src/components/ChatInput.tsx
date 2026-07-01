import { useState, useRef, useEffect } from 'react'
import { Button } from '@patternfly/react-core'
import { PaperPlaneIcon } from '@patternfly/react-icons'

interface ChatInputProps {
  onSend: (content: string) => void
  isStreaming: boolean
}

export function ChatInput({ onSend, isStreaming }: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 150) + 'px'
  }, [value])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleSend() {
    const trimmed = value.trim()
    if (!trimmed || isStreaming) return
    onSend(trimmed)
    setValue('')
  }

  return (
    <div style={{
      padding: '12px 24px 16px',
      borderTop: '1px solid var(--pf-t--global--border--color--default)',
      background: 'var(--pf-t--global--background--color--primary--default)',
    }}>
      <div style={{ position: 'relative' }}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isStreaming ? 'Waiting for response...' : 'Send a message...'}
          disabled={isStreaming}
          rows={1}
          style={{
            width: '100%',
            resize: 'none',
            border: '1px solid var(--pf-t--global--border--color--default)',
            borderRadius: 12,
            padding: '12px 48px 12px 16px',
            fontSize: 14,
            fontFamily: 'inherit',
            lineHeight: 1.5,
            background: 'var(--pf-t--global--background--color--secondary--default)',
            color: 'var(--pf-t--global--text--color--regular)',
            outline: 'none',
            boxSizing: 'border-box',
            opacity: isStreaming ? 0.6 : 1,
          }}
        />
        <Button
          variant="plain"
          onClick={handleSend}
          isDisabled={!value.trim() || isStreaming}
          style={{
            position: 'absolute',
            right: 8,
            bottom: 6,
            padding: 6,
            color: value.trim() && !isStreaming
              ? 'var(--pf-t--global--color--brand--default)'
              : 'var(--pf-t--global--text--color--subtle)',
          }}
          icon={<PaperPlaneIcon />}
        />
      </div>
    </div>
  )
}
