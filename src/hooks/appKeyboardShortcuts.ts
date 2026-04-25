import { trackEvent } from '../lib/telemetry'
import {
  APP_COMMAND_IDS,
  executeAppCommand,
  findShortcutCommandIdForEvent,
  recordSuppressedShortcutCommand,
  type AppCommandId,
  type AppCommandHandlers,
} from './appCommandDispatcher'

export type KeyboardActions = Pick<
  AppCommandHandlers,
  | 'onQuickOpen'
  | 'onCommandPalette'
  | 'onSearch'
  | 'onCreateNote'
  | 'onSave'
  | 'onOpenSettings'
  | 'onDeleteNote'
  | 'onArchiveNote'
  | 'onSetViewMode'
  | 'onZoomIn'
  | 'onZoomOut'
  | 'onZoomReset'
  | 'onGoBack'
  | 'onGoForward'
  | 'onToggleAIChat'
  | 'onToggleRawEditor'
  | 'onToggleInspector'
  | 'onToggleFavorite'
  | 'onToggleOrganized'
  | 'onOpenInNewWindow'
  | 'onWindowMinimize'
  | 'onWindowMaximizeRestore'
  | 'onWindowClose'
  | 'activeTabPathRef'
  | 'multiSelectionCommandRef'
>

const TEXT_EDITING_KEYS = new Set(['Backspace', 'Delete'])
const TEXT_EDITING_BLOCKED_COMMANDS = new Set<AppCommandId>([
  APP_COMMAND_IDS.viewGoBack,
  APP_COMMAND_IDS.viewGoForward,
])

function isTextInputFocused(): boolean {
  const active = document.activeElement
  if (!(active instanceof HTMLElement)) return false
  if (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA') return true
  return active.isContentEditable || active.closest('[contenteditable="true"]') !== null
}

export function handleAppKeyboardEvent(actions: KeyboardActions, event: KeyboardEvent) {
  // KDE Linux window management shortcuts use Alt+F* which the combo system does not cover.
  if (event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
    if (event.key === 'F9')  { event.preventDefault(); actions.onWindowMinimize?.(); return }
    if (event.key === 'F10') { event.preventDefault(); actions.onWindowMaximizeRestore?.(); return }
    if (event.key === 'F4')  { event.preventDefault(); actions.onWindowClose?.(); return }
  }

  const commandId = findShortcutCommandIdForEvent(event)
  if (commandId === null) return

  const textInputFocused = isTextInputFocused()
  if (textInputFocused) {
    if (TEXT_EDITING_KEYS.has(event.key)) return
    if (TEXT_EDITING_BLOCKED_COMMANDS.has(commandId)) {
      recordSuppressedShortcutCommand(commandId, 'renderer-keyboard')
      return
    }
  }

  event.preventDefault()
  if (commandId === APP_COMMAND_IDS.editFindInVault) {
    trackEvent('search_used')
  }
  executeAppCommand(commandId, actions, 'renderer-keyboard')
}
