import { getEventCode } from './keymap'

const PANEL_ID = 'polyglot__panel'
let settings = {}
let isPanelOpen = false

// Only initialize in a top-level page
if (window.top === window) {
  setup()
}

function setup() {
  window.addEventListener('keypress', handleKeypress, false)
  window.addEventListener('mouseup', handleMouseUp, false)
  window.addEventListener('click', handleClick, false)

  safari.self.addEventListener('message', handleMessage, false)
  safari.self.tab.dispatchMessage('getSettings')
}

// Get selected text and return to global script
function handleMessage(msg) {
  const { name, message } = msg
  if (name === 'settingsReceived') {
    settings = message
  } else if (name === 'getSelectedText') {
    getSelectedText()
  } else if (name === 'showPanel') {
    showPanel(message)
  } else if (name === 'updatePanel') {
    updatePanel(message)
  }
}

function getPanel() {
  return document.getElementById(PANEL_ID)
}

function removePanel() {
  getPanel().remove()
  isPanelOpen = false
}

// Show panel with given text
function showPanel(content) {
  if (isPanelOpen) {
    removePanel()
  }

  const bounds = getSelectionBoundingRect()
  if (bounds === null) {
    return false
  }

  const el = document.createElement('div')
  el.innerHTML = content
  el.id = PANEL_ID
  el.style.left = bounds.left + 'px'
  el.style.top = bounds.bottom + 'px'
  document.body.insertBefore(el, document.body.firstChild)
  isPanelOpen = true
}

function updatePanel(content) {
  const panel = getPanel()
  if (panel) {
    panel.innerHTML = content
  }
}

function handleMouseUp(e) {
  const panel = getPanel()

  if (isPanelOpen && !isDescendant(panel, e.target)) {
    removePanel()
  }
}

function handleKeypress(e) {
  // Check if shortcut key is properly configured
  if (settings.keyValue === '') {
    return
  }

  const { keyValue } = settings
  const keyCode = getEventCode(keyValue.charAt(0))
  const verifier = [
    settings.useMetaKey ? e.metaKey : true, // applyMeta
    settings.useShiftKey ? e.shiftKey : true, // applyShift
    settings.useCtrlKey ? e.ctrlKey : true, // applyCtrl
    settings.useAltKey ? e.altKey : true, // applyAlt
    keyCode ? keyCode === e.code : keyValue.charCodeAt(0) === e.keyCode, // applyKey
  ]

  if (verifier.every(v => v)) {
    e.preventDefault()
    getSelectedText()
  }
}

function handleClick(e) {
  if (!settings.instantTranslation || e.target.id === PANEL_ID) {
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
  const selectedText = window.getSelection().toString()
  if (selectedText && selectedText !== '\n') {
    safari.self.tab.dispatchMessage('finishedGetSelectedText', selectedText)
  }
}

// Return selection coords
function getSelectionBoundingRect() {
  const rect = {
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  }

  const sel = document.getSelection()
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

  return sel.rangeCount ? rect : null
}

function isDescendant(parent, child) {
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
