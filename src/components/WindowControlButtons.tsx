import { Minus, ArrowsOut, ArrowsIn, X } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { useWindowControls } from '../hooks/useWindowControls'

function isLinux(): boolean {
  return (window as unknown as { __TAURI_INTERNALS__?: { platform?: string } })
    .__TAURI_INTERNALS__?.platform === 'linux'
}

export function WindowControlButtons() {
  const { minimize, toggleMaximize, isMaximized, close } = useWindowControls()

  if (!isLinux()) return null

  return (
    <div className="flex items-center gap-0.5">
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 text-muted-foreground hover:bg-accent hover:text-foreground"
        onClick={minimize}
        aria-label="Minimize window"
        title="Minimize (Alt+F9)"
      >
        <Minus size={14} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 text-muted-foreground hover:bg-accent hover:text-foreground"
        onClick={toggleMaximize}
        aria-label={isMaximized ? 'Restore window' : 'Maximize window'}
        title={isMaximized ? 'Restore (Alt+F10)' : 'Maximize (Alt+F10)'}
      >
        {isMaximized ? <ArrowsIn size={14} /> : <ArrowsOut size={14} />}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
        onClick={close}
        aria-label="Close window"
        title="Close (Alt+F4)"
      >
        <X size={14} />
      </Button>
    </div>
  )
}
