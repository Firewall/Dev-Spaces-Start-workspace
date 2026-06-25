import { useState } from 'react'
import { AngleRightIcon, AngleDownIcon } from '@patternfly/react-icons'
import type { ChatMessage as ChatMessageType, ToolCall } from './agentSpaceV2Types'

interface ChatMessageProps {
  message: ChatMessageType
}

function renderMarkdown(text: string) {
  const blocks: { type: string; content: string }[] = []
  const lines = text.split('\n')
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith('```')) {
      const lang = line.slice(3).trim()
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      i++
      blocks.push({ type: 'code', content: (lang ? lang + '\n' : '') + codeLines.join('\n') })
      continue
    }

    if (line.startsWith('## ')) {
      blocks.push({ type: 'h2', content: line.slice(3) })
      i++
      continue
    }

    if (line.startsWith('# ')) {
      blocks.push({ type: 'h1', content: line.slice(2) })
      i++
      continue
    }

    if (line.trim() === '') {
      i++
      continue
    }

    blocks.push({ type: 'text', content: line })
    i++
  }

  return blocks.map((block, idx) => {
    if (block.type === 'code') {
      const parts = block.content.split('\n')
      const hasLang = parts[0] && !parts[0].includes(' ') && parts[0].length < 20
      const code = hasLang ? parts.slice(1).join('\n') : block.content
      return (
        <pre key={idx} style={{
          background: '#1e1e1e',
          color: '#d4d4d4',
          padding: '12px 16px',
          borderRadius: 8,
          overflow: 'auto',
          fontSize: 13,
          fontFamily: 'monospace',
          margin: '8px 0',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}>
          {hasLang && (
            <div style={{ color: '#888', fontSize: 11, marginBottom: 4 }}>{parts[0]}</div>
          )}
          <code>{code}</code>
        </pre>
      )
    }

    if (block.type === 'h1') {
      return <div key={idx} style={{ fontWeight: 700, fontSize: 16, margin: '8px 0 4px' }}>{renderInline(block.content)}</div>
    }

    if (block.type === 'h2') {
      return <div key={idx} style={{ fontWeight: 700, fontSize: 14, margin: '8px 0 4px' }}>{renderInline(block.content)}</div>
    }

    if (block.content.startsWith('- ')) {
      return (
        <div key={idx} style={{ display: 'flex', gap: 6, margin: '2px 0', paddingLeft: 4 }}>
          <span>•</span>
          <span>{renderInline(block.content.slice(2))}</span>
        </div>
      )
    }

    return <div key={idx} style={{ margin: '4px 0', lineHeight: 1.5 }}>{renderInline(block.content)}</div>
  })
}

function renderInline(text: string) {
  const parts: (string | JSX.Element)[] = []
  const regex = /(\*\*.*?\*\*)|(`[^`]+`)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    if (match[1]) {
      parts.push(<strong key={match.index}>{match[1].slice(2, -2)}</strong>)
    } else if (match[2]) {
      parts.push(
        <code key={match.index} style={{
          background: 'rgba(127,127,127,0.15)',
          padding: '1px 5px',
          borderRadius: 3,
          fontSize: '0.9em',
          fontFamily: 'monospace',
        }}>{match[2].slice(1, -1)}</code>
      )
    }
    lastIndex = regex.lastIndex
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }
  return parts
}

function ThinkingBlock({ thinking }: { thinking: string }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div style={{
      margin: '4px 0 8px',
      borderRadius: 8,
      border: '1px solid var(--pf-t--global--border--color--default)',
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          width: '100%',
          padding: '6px 10px',
          border: 'none',
          background: 'rgba(127,127,127,0.08)',
          color: 'var(--pf-t--global--text--color--subtle)',
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        {expanded ? <AngleDownIcon style={{ fontSize: 12 }} /> : <AngleRightIcon style={{ fontSize: 12 }} />}
        Thinking
      </button>
      {expanded && (
        <div style={{
          padding: '8px 12px',
          fontSize: 13,
          color: 'var(--pf-t--global--text--color--subtle)',
          lineHeight: 1.5,
          fontStyle: 'italic',
          whiteSpace: 'pre-wrap',
        }}>
          {thinking}
        </div>
      )}
    </div>
  )
}

function ToolCallBlock({ toolCall }: { toolCall: ToolCall }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div style={{
      margin: '3px 0',
      borderRadius: 6,
      border: '1px solid var(--pf-t--global--border--color--default)',
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          width: '100%',
          padding: '5px 10px',
          border: 'none',
          background: 'rgba(127,127,127,0.05)',
          color: 'var(--pf-t--global--text--color--regular)',
          fontSize: 12,
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        {expanded ? <AngleDownIcon style={{ fontSize: 11 }} /> : <AngleRightIcon style={{ fontSize: 11 }} />}
        <code style={{
          fontFamily: 'monospace',
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--pf-t--global--color--brand--default)',
        }}>{toolCall.name}</code>
        <span style={{ color: 'var(--pf-t--global--text--color--subtle)', fontFamily: 'monospace', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {toolCall.input}
        </span>
      </button>
      {expanded && (
        <div style={{ padding: '6px 10px', fontSize: 12, fontFamily: 'monospace', lineHeight: 1.5 }}>
          <div style={{ color: 'var(--pf-t--global--text--color--subtle)', marginBottom: 2 }}>Input:</div>
          <pre style={{
            background: '#1e1e1e', color: '#d4d4d4', padding: '6px 10px',
            borderRadius: 4, fontSize: 11, margin: '0 0 6px', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          }}>{toolCall.input}</pre>
          {toolCall.output && (
            <>
              <div style={{ color: 'var(--pf-t--global--text--color--subtle)', marginBottom: 2 }}>Output:</div>
              <pre style={{
                background: '#1e1e1e', color: '#d4d4d4', padding: '6px 10px',
                borderRadius: 4, fontSize: 11, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              }}>{toolCall.output}</pre>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      padding: '4px 24px',
    }}>
      <div style={{
        maxWidth: '70%',
        padding: '10px 16px',
        borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        background: isUser
          ? 'var(--pf-t--global--color--brand--default)'
          : 'var(--pf-t--global--background--color--secondary--default)',
        color: isUser
          ? '#ffffff'
          : 'var(--pf-t--global--text--color--regular)',
        fontSize: 14,
        lineHeight: 1.5,
        wordBreak: 'break-word',
      }}>
        {!isUser && message.thinking && <ThinkingBlock thinking={message.thinking} />}
        {!isUser && message.toolCalls && message.toolCalls.length > 0 && (
          <div style={{ margin: '0 0 8px' }}>
            {message.toolCalls.map(tc => <ToolCallBlock key={tc.id} toolCall={tc} />)}
          </div>
        )}
        {isUser ? message.content : renderMarkdown(message.content)}
        {message.isStreaming && (
          <>
            <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
            <span style={{ animation: 'blink 1s step-end infinite', fontWeight: 700 }}>|</span>
          </>
        )}
        <div style={{
          fontSize: 11,
          opacity: 0.6,
          marginTop: 4,
          textAlign: isUser ? 'right' : 'left',
        }}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  )
}
