import { useCallback, useRef, useState } from 'react'

export type RightPanelView = 'context' | 'changes' | 'editor' | 'terminal'

export function useRightPanel() {
  const [activePanel, setActivePanel] = useState<RightPanelView | null>(null)
  const [panelWidth, setPanelWidth] = useState(560)
  const dragging = useRef(false)

  const toggle = useCallback((view: RightPanelView) => {
    setActivePanel(prev => prev === view ? null : view)
  }, [])

  const close = useCallback(() => setActivePanel(null), [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragging.current = true
    const startX = e.clientX
    const startWidth = panelWidth
    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return
      setPanelWidth(Math.max(300, Math.min(900, startWidth - (ev.clientX - startX))))
    }
    const onUp = () => {
      dragging.current = false
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [panelWidth])

  return { activePanel, panelWidth, toggle, close, handleMouseDown, dragging }
}
