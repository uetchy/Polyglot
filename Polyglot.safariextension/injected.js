// Only initialize in a top-level page
if (window.top === window) {
  safari.self.addEventListener('message', handleMessage, false);

  window.addEventListener('keydown', handleKeydown, false);
  window.addEventListener('mouseup', handleMouseUp, false);

  var isPanelOpen = false;
  var keyboardShortcut = null;
  var PANEL_ID = 'polyglot__panel';

  safari.self.tab.dispatchMessage('requestKeyboardShortcut');
}

// Get selected text and return to global script
function handleMessage(msg) {
  switch (msg.name) {
    case 'keyboardShortcutReceived':
      keyboardShortcut = parseInt(msg.message);
      break;
    case 'getSelectedText':
      getSelectedText();
      break;
    case 'showPanel':
      showPanel(msg.message);
      break;
    case 'updatePanel':
      updatePanel(msg.message);
      break;
  }
}

function handleMouseUp(e) {
  let panel = document.getElementById(PANEL_ID);

  if (isPanelOpen && !isDescendant(panel, e.target)) {
    removePanel();
  }
}

function handleKeydown(e) {
  if (e.keyCode === keyboardShortcut) {
    e.preventDefault();
    getSelectedText();
  }
}

function getSelectedText() {
  let sel = window.getSelection().toString();
  safari.self.tab.dispatchMessage('finishedGetSelectedText', sel);
}

function removePanel() {
  let panel = document.getElementById(PANEL_ID);
  panel.remove();
  isPanelOpen = false;
}

// Show panel with given text
function showPanel(content) {
  if (isPanelOpen) {
    removePanel();
  }
  let bounds = getSelectionBoundingRect();
  if (bounds === null) {
    return false;
  }
  let el = document.createElement('div');
  el.innerHTML = content;
  el.id = PANEL_ID;
  el.style.left = bounds.left + 'px';
  el.style.top = bounds.bottom + 'px';
  document.body.insertBefore(el, document.body.firstChild);
  isPanelOpen = true;
}

function updatePanel(content) {
  let el = document.getElementById(PANEL_ID);
  el.innerHTML = content;
}

// Return selection coords
function getSelectionBoundingRect() {
  let rect = {
    left: 0,
    top: 0,
    right: 0,
    bottom: 0
  };

  let sel = document.getSelection();
  for (var i = 0; i < sel.rangeCount; ++i) {
    let _rect = sel.getRangeAt(i).getBoundingClientRect();
    if (rect.left < _rect.left) rect.left = _rect.left;
    if (rect.top < _rect.top) rect.top = _rect.top;
    if (rect.right < _rect.right) rect.right = _rect.right;
    if (rect.bottom < _rect.bottom) rect.bottom = _rect.bottom;
  }
  rect.width = rect.right - rect.left;
  rect.height = rect.bottom - rect.top;
  rect.left += window.pageXOffset;
  rect.top += window.pageYOffset;
  rect.right += window.pageXOffset;
  rect.bottom += window.pageYOffset;
  return sel.rangeCount ? rect : null;
};

function isDescendant(parent, child) {
  if (parent === child) {
    return true;
  }
  let node = child.parentNode;
  while (node !== null) {
    if (node === parent) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
}
