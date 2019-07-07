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

interface ReceivedSettings {
  keyCode: number
  modifiers: number
  instantTranslation: boolean
}

interface ReceivedTranslation {
  text: string
}

enum RequestMessageType {
  RequestSettings = 'getSettings',
  Translate = 'translate',
}

enum ResponseMessageType {
  SettingsReceived = 'settingsReceived',
  TranslationReceived = 'translated',
  PerformTranslation = 'performTranslation',
}

const PANEL_ID = 'polyglot__panel'
const INDICATOR = `<div class="polyglot__loader">Loading</div>`

let isPanelOpen = false
let settings: Settings

function setup(): void {
  console.debug('Polyglot: loaded')

  // handle messages from App Extension
  safari.self.addEventListener('message', handleMessage, false)

  // handle js events in active page
  window.addEventListener('mouseup', handleMouseUp, false)
  window.addEventListener('keypress', handleKeypress, false)
  window.addEventListener('click', handleClick, false)

  // fetch global settings from App Extension
  safari.extension.dispatchMessage(RequestMessageType.RequestSettings)
}

// Get selected text and return to global script
function handleMessage(msg: SafariExtensionMessageEvent): void {
  switch (msg.name) {
    case ResponseMessageType.SettingsReceived:
      settingsHandler(msg.message)
      break
    case ResponseMessageType.TranslationReceived:
      translationHandler(msg.message)
      break
    case ResponseMessageType.PerformTranslation:
      performTranslation()
      break
    default:
  }
}

function settingsHandler(received: ReceivedSettings): void {
  settings = {
    keyCode: received.keyCode || 0,
    modifiers: received.modifiers
      ? divideModifiers(received.modifiers)
      : { ctrl: false, alt: false, shift: false, cmd: false },
    instantTranslation: received.instantTranslation || false,
  }
  console.debug(settings)
}

function translationHandler(message: ReceivedTranslation): void {
  showPanel(message.text)
}

function handleMouseUp(e: MouseEvent): void {
  const panel = document.getElementById(PANEL_ID)

  // if clicked on outside of panel, remove panel
  if (panel && isPanelOpen && !isDescendant(panel, <HTMLElement>e.target)) {
    removePanel()
  }
}

function handleKeypress(keyboardEvent: KeyboardEvent): void {
  // Check if shortcut key is properly configured
  const { keyCode } = settings
  if (keyCode === undefined) return

  const isValidModifiers = checkModifiers(settings.modifiers, keyboardEvent)
  const isValidKeyCode = keyCode === keyboardEvent.keyCode

  if (isValidModifiers && isValidKeyCode) {
    keyboardEvent.preventDefault()
    performTranslation()
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

  performTranslation()
}

function performTranslation() {
  showPanel(INDICATOR)
  const selectedText = getSelectedText()
  if (selectedText) {
    safari.extension.dispatchMessage(RequestMessageType.Translate, {
      text: selectedText,
    })
  }
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

function checkModifiers(modifiers: Modifiers, e: KeyboardEvent): boolean {
  return modifiers.ctrl
    ? e.ctrlKey
    : true && modifiers.alt
    ? e.altKey
    : true && modifiers.shift
    ? e.shiftKey
    : true && modifiers.cmd
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
    isPanelOpen = false
    panel.remove()
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
