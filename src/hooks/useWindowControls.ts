import { useState, useEffect, useCallback, useRef } from 'react'
import { getCurrentWindow } from '@tauri-apps/api/window'

function isTauriContext(): boolean {
  return typeof window !== 'undefined' &&
    !!(window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__
}

export function useWindowControls() {
  const [isMaximized, setIsMaximized] = useState(false)
  const isMaximizedRef = useRef(isMaximized)
  // eslint-disable-next-line react-hooks/refs
  isMaximizedRef.current = isMaximized

  useEffect(() => {
    if (!isTauriContext()) return
    const win = getCurrentWindow()
    win.isMaximized().then(setIsMaximized).catch(() => {})
    let unlisten: (() => void) | null = null
    win.onResized(() => {
      win.isMaximized().then(setIsMaximized).catch(() => {})
    }).then(fn => { unlisten = fn }).catch(() => {})
    return () => { unlisten?.() }
  }, [])

  const minimize = useCallback(() => {
    if (!isTauriContext()) return
    getCurrentWindow().minimize().catch(() => {})
  }, [])

  const toggleMaximize = useCallback(() => {
    if (!isTauriContext()) return
    const win = getCurrentWindow()
    if (isMaximizedRef.current) {
      win.unmaximize().catch(() => {})
    } else {
      win.maximize().catch(() => {})
    }
  }, [])

  const close = useCallback(() => {
    if (!isTauriContext()) return
    getCurrentWindow().close().catch(() => {})
  }, [])

  return { isMaximized, minimize, toggleMaximize, close }
}
