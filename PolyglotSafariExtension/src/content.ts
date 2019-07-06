interface Settings {
  keyCode?: number
  modifiers?: number
  sourceLanguage?: string
  targetLanguage?: string
  instantTranslation?: boolean
}

interface KeyMaps {
  ctrl: boolean
  alt: boolean
  shift: boolean
  cmd: boolean
}

let settings: Settings = {}
let isPanelOpen = false
const PANEL_ID = 'polyglot__panel'

// Only active in a top-level page
if (window.top === window) {
  console.debug('Polyglot loaded')

  // handle messages from App Extension
  safari.self.addEventListener('message', handleMessage, false)

  // handle js events in active page
  window.addEventListener('mouseup', handleMouseUp, false)
  window.addEventListener('keypress', handleKeypress, false)
  window.addEventListener('click', handleClick, false)

  // fetch global settings from App Extension
  safari.extension.dispatchMessage('getSettings')
}

// Get selected text and return to global script
function handleMessage(msg: SafariExtensionMessageEvent) {
  console.log('got message:', msg)
  const name = msg.name
  if (name === 'settingsReceived') {
    settings = msg.message
  } else if (name === 'getSelectedText') {
    getSelectedText()
  } else if (name === 'showPanel') {
    showPanel(msg.message)
  } else if (name === 'updatePanel') {
    updatePanel(msg.message)
  }
}

function divideModifiers(modifiers: number): KeyMaps {
  // cmd   = 256
  // shift = 512
  // alt   = 2048
  // ctrl  = 4096
  // cmd+shift = 768
  // cmd+alt   = 2304
  // cmd+shift+alt = 2816

  const keyMaps = {
    ctrl: false,
    alt: false,
    shift: false,
    cmd: false,
  }

  let cur = modifiers
  while (cur !== 0) {
    if (cur >= 4096) {
      keyMaps.ctrl = true
      cur %= 4096
    } else if (cur >= 2048) {
      keyMaps.alt = true
      cur %= 2048
    } else if (cur >= 512) {
      keyMaps.shift = true
      cur %= 512
    } else {
      keyMaps.cmd = true
      cur %= 256
    }
  }

  return keyMaps
}

function handleMouseUp(e: MouseEvent) {
  const panel = document.getElementById(PANEL_ID)

  // if clicked on outside of panel, remove panel
  if (panel && isPanelOpen && !isDescendant(panel, <HTMLElement>e.target)) {
    removePanel()
  }
}

function handleKeypress(e: KeyboardEvent) {
  console.log('kp')

  // Check if shortcut key is properly configured
  const { keyCode } = settings
  if (keyCode === undefined) return
  console.log(keyCode, e.keyCode)

  console.log(divideModifiers(settings.modifiers!))

  // const applyMeta = settings.useMetaKey ? e.metaKey : true
  // const applyShift = settings.useShiftKey ? e.shiftKey : true
  // const applyCtrl = settings.useCtrlKey ? e.ctrlKey : true
  // const applyAlt = settings.useAltKey ? e.altKey : true
  // const applyKey = keyCode === e.code
  const applyKey = keyCode === e.keyCode
  console.log('kp:', keyCode, e.keyCode, applyKey, e.ctrlKey)

  if (e.ctrlKey && applyKey) {
    console.log('go')
    e.preventDefault()
    getSelectedText()
  }
}

function handleClick(e: MouseEvent) {
  if (
    !settings.instantTranslation ||
    (<HTMLDivElement>e.target).id === PANEL_ID
  ) {
    return
  }
  if (document.activeElement) {
    const activeEl = document.activeElement.tagName.toLowerCase()
    if (activeEl === 'textarea' || activeEl === 'input') {
      return
    }
  }
  getSelectedText()
}

function getSelectedText() {
  const selection = window.getSelection()
  if (!selection) return undefined

  const selectedText = selection.toString()
  if (selectedText && selectedText !== '\n') {
    safari.extension.dispatchMessage('finishedGetSelectedText', {
      selectedText,
    })
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

function updatePanel(content: string) {
  const el = document.getElementById(PANEL_ID)
  if (el) {
    el.innerHTML = content
  }
}

// Return selection coords
function getSelectionBoundingRect() {
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
