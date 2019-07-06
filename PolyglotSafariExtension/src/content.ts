interface ReceivedSettings {
  keyCode?: number
  modifiers?: number
  instantTranslation?: boolean
}

interface Settings {
  keyCode: number
  modifiers: Modifiers
  instantTranslation: boolean
}

interface Modifiers {
  ctrl: boolean
  alt: boolean
  shift: boolean
  cmd: boolean
}

interface BoundingRect {
  left: number
  top: number
  right: number
  bottom: number
  width: number
  height: number
}

const PANEL_ID = 'polyglot__panel'

enum RequestMessageType {
  REQUEST_SETTINGS = 'getSettings',
  TRANSLATE = 'translate',
}

enum ResponseMessageType {
  SETTINGS_RECEIVED = 'settingsReceived',
  TRANSLATION_RECEIVED = 'translated',
}

let isPanelOpen = false
let settings: Settings = {
  keyCode: 0,
  modifiers: { ctrl: false, alt: false, shift: false, cmd: false },
  instantTranslation: false,
}

function setup(): void {
  console.debug('Polyglot: loaded')

  // handle messages from App Extension
  safari.self.addEventListener('message', handleMessage, false)

  // handle js events in active page
  window.addEventListener('mouseup', handleMouseUp, false)
  window.addEventListener('keypress', handleKeypress, false)
  window.addEventListener('click', handleClick, false)

  // fetch global settings from App Extension
  safari.extension.dispatchMessage(RequestMessageType.REQUEST_SETTINGS)
}

// Get selected text and return to global script
function handleMessage(msg: SafariExtensionMessageEvent): void {
  switch (msg.name) {
    case ResponseMessageType.SETTINGS_RECEIVED:
      settingsHandler(msg.message)
      break
    case ResponseMessageType.TRANSLATION_RECEIVED:
      translationHandler(msg.message)
      break
    default:
  }
}

function settingsHandler(message: ReceivedSettings): void {
  settings = {
    keyCode: message.keyCode!,
    modifiers: divideModifiers(message.modifiers!),
    instantTranslation: message.instantTranslation!,
  }
  console.debug(settings)
}

function translationHandler(text: string): void {
  showPanel(text)
}

function handleMouseUp(e: MouseEvent): void {
  const panel = document.getElementById(PANEL_ID)

  // if clicked on outside of panel, remove panel
  if (panel && isPanelOpen && !isDescendant(panel, <HTMLElement>e.target)) {
    removePanel()
  }
}

function handleKeypress(e: KeyboardEvent): void {
  // Check if shortcut key is properly configured
  const { keyCode } = settings
  if (keyCode === undefined) return

  const isValidModifiers = checkModifiers(settings.modifiers, e)
  const isValidKeyCode = keyCode === e.keyCode
  console.debug(isValidModifiers, isValidKeyCode)

  if (isValidModifiers && isValidKeyCode) {
    console.debug('go')
    e.preventDefault()
    const selectedText = getSelectedText()
    console.debug(selectedText)
    if (selectedText) {
      safari.extension.dispatchMessage(RequestMessageType.TRANSLATE, {
        selectedText,
      })
    }
  }
}

// handle click event for instant translation
function handleClick(e: MouseEvent): void {
  if (
    !settings.instantTranslation ||
    (<HTMLDivElement>e.target).id === PANEL_ID
  ) {
    return
  }

  if (document.activeElement) {
    const activeElement = document.activeElement.tagName.toLowerCase()
    if (activeElement === 'textarea' || activeElement === 'input') {
      return
    }
  }
  getSelectedText()
}

function divideModifiers(modifiers: number): Modifiers {
  // cmd   = 256
  // shift = 512
  // alt   = 2048
  // ctrl  = 4096
  const modifierMaps = {
    ctrl: false,
    alt: false,
    shift: false,
    cmd: false,
  }

  let cur = modifiers
  while (cur !== 0) {
    if (cur >= 4096) {
      modifierMaps.ctrl = true
      cur %= 4096
    } else if (cur >= 2048) {
      modifierMaps.alt = true
      cur %= 2048
    } else if (cur >= 512) {
      modifierMaps.shift = true
      cur %= 512
    } else {
      modifierMaps.cmd = true
      cur %= 256
    }
  }

  return modifierMaps
}

function checkModifiers(mod: Modifiers, e: KeyboardEvent): boolean {
  return mod.ctrl
    ? e.ctrlKey
    : true && mod.alt
    ? e.altKey
    : true && mod.shift
    ? e.shiftKey
    : true && mod.cmd
    ? e.metaKey
    : true
}

function getSelectedText(): string | undefined {
  const selection = window.getSelection()
  if (!selection) return undefined

  const selectedText = selection.toString()

  if (selectedText && selectedText !== '\n') {
    return selectedText
  }
}

function removePanel() {
  const panel = document.getElementById(PANEL_ID)
  if (panel) {
    panel.remove()
    isPanelOpen = false
  }
}

// Show panel with given text
function showPanel(content: string): void {
  if (isPanelOpen) {
    removePanel()
  }

  const bounds = getSelectionBoundingRect()
  if (bounds === undefined) return

  const el = document.createElement('div')
  el.innerHTML = content
  el.id = PANEL_ID
  el.style.left = bounds.left + 'px'
  el.style.top = bounds.bottom + 'px'
  document.body.insertBefore(el, document.body.firstChild)
  isPanelOpen = true
}

function updatePanel(content: string): void {
  const el = document.getElementById(PANEL_ID)
  if (el) {
    el.innerHTML = content
  }
}

// Return selection coords
function getSelectionBoundingRect(): BoundingRect | undefined {
  const rect = {
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    width: 0,
    height: 0,
  }

  const sel = document.getSelection()
  if (!sel || sel.rangeCount === 0) return undefined

  for (let i = 0; i < sel.rangeCount; ++i) {
    const _rect = sel.getRangeAt(i).getBoundingClientRect()
    if (rect.left < _rect.left) {
      rect.left = _rect.left
    }
    if (rect.top < _rect.top) {
      rect.top = _rect.top
    }
    if (rect.right < _rect.right) {
      rect.right = _rect.right
    }
    if (rect.bottom < _rect.bottom) {
      rect.bottom = _rect.bottom
    }
  }
  rect.width = rect.right - rect.left
  rect.height = rect.bottom - rect.top
  rect.left += window.pageXOffset
  rect.top += window.pageYOffset
  rect.right += window.pageXOffset
  rect.bottom += window.pageYOffset

  return rect
}

function isDescendant(parent: HTMLElement, child: HTMLElement) {
  if (parent === child) {
    return true
  }
  let node = child.parentNode
  while (node !== null) {
    if (node === parent) {
      return true
    }
    node = node.parentNode
  }
  return false
}

// Only active in a top-level page
if (window.top === window) {
  setup()
}
