import { renderHook, act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useWindowControls } from './useWindowControls'

const minimize = vi.fn().mockResolvedValue(undefined)
const maximize = vi.fn().mockResolvedValue(undefined)
const unmaximize = vi.fn().mockResolvedValue(undefined)
const close = vi.fn().mockResolvedValue(undefined)
const isMaximized = vi.fn().mockResolvedValue(false)

type ResizeCallback = () => void
let capturedResizeCallback: ResizeCallback | null = null
const onResized = vi.fn((cb: ResizeCallback) => {
  capturedResizeCallback = cb
  return Promise.resolve(() => { capturedResizeCallback = null })
})

vi.mock('@tauri-apps/api/window', () => ({
  getCurrentWindow: () => ({ minimize, maximize, unmaximize, close, isMaximized, onResized }),
}))

function setTauriPlatform(platform: string | null) {
  if (platform === null) {
    delete (window as unknown as Record<string, unknown>).__TAURI_INTERNALS__
  } else {
    ;(window as unknown as Record<string, unknown>).__TAURI_INTERNALS__ = { platform }
  }
}

describe('useWindowControls', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    capturedResizeCallback = null
    setTauriPlatform('linux')
  })

  it('returns isMaximized as false initially', async () => {
    isMaximized.mockResolvedValue(false)
    const { result } = renderHook(() => useWindowControls())
    await act(async () => {})
    expect(result.current.isMaximized).toBe(false)
  })

  it('reads initial maximized state from Tauri on mount', async () => {
    isMaximized.mockResolvedValue(true)
    const { result } = renderHook(() => useWindowControls())
    await act(async () => {})
    expect(result.current.isMaximized).toBe(true)
  })

  it('updates isMaximized reactively when a resize event fires', async () => {
    isMaximized.mockResolvedValueOnce(false).mockResolvedValueOnce(true)
    const { result } = renderHook(() => useWindowControls())
    await act(async () => {})
    expect(result.current.isMaximized).toBe(false)

    await act(async () => { capturedResizeCallback?.() })
    await act(async () => {})
    expect(result.current.isMaximized).toBe(true)
  })

  it('calls Tauri minimize() when minimize is invoked', async () => {
    const { result } = renderHook(() => useWindowControls())
    await act(async () => { result.current.minimize() })
    expect(minimize).toHaveBeenCalledOnce()
  })

  it('calls Tauri maximize() when toggleMaximize is invoked and window is not maximized', async () => {
    isMaximized.mockResolvedValue(false)
    const { result } = renderHook(() => useWindowControls())
    await act(async () => {})
    await act(async () => { result.current.toggleMaximize() })
    expect(maximize).toHaveBeenCalledOnce()
    expect(unmaximize).not.toHaveBeenCalled()
  })

  it('calls Tauri unmaximize() when toggleMaximize is invoked and window is maximized', async () => {
    isMaximized.mockResolvedValue(true)
    const { result } = renderHook(() => useWindowControls())
    await act(async () => {})
    await act(async () => { result.current.toggleMaximize() })
    expect(unmaximize).toHaveBeenCalledOnce()
    expect(maximize).not.toHaveBeenCalled()
  })

  it('calls Tauri close() when close is invoked', async () => {
    const { result } = renderHook(() => useWindowControls())
    await act(async () => { result.current.close() })
    expect(close).toHaveBeenCalledOnce()
  })

  it('is a no-op in browser mode (no __TAURI_INTERNALS__)', async () => {
    setTauriPlatform(null)
    const { result } = renderHook(() => useWindowControls())
    await act(async () => {
      result.current.minimize()
      result.current.toggleMaximize()
      result.current.close()
    })
    expect(minimize).not.toHaveBeenCalled()
    expect(maximize).not.toHaveBeenCalled()
    expect(unmaximize).not.toHaveBeenCalled()
    expect(close).not.toHaveBeenCalled()
    expect(result.current.isMaximized).toBe(false)
  })

  it('cleans up the resize listener on unmount', async () => {
    const { unmount } = renderHook(() => useWindowControls())
    await act(async () => {})
    expect(capturedResizeCallback).not.toBeNull()
    unmount()
    await act(async () => {})
    expect(capturedResizeCallback).toBeNull()
  })
})
