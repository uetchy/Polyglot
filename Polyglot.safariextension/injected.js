// Only initialize in a top-level page
if (window.top === window) {
  safari.self.addEventListener('message', handleMessage, false);

  window.addEventListener('keydown', handleKeydown, false);
  window.addEventListener('mouseup', handleMouseUp, false);

  safari.self.tab.dispatchMessage('requestKeyboardShortcut');

  var isPanelOpen = false;
  var keyboardShortcut = null;
  var panelId = 'polyglot__panel';
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
  var panel = document.getElementById(panelId);

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
  var sel = window.getSelection().toString();
  safari.self.tab.dispatchMessage('finishedGetSelectedText', sel);
}

function removePanel() {
  var panel = document.getElementById(panelId);
  panel.remove();
  isPanelOpen = false;
}

// Show panel with given text
function showPanel(content) {
  if (isPanelOpen) {
    removePanel();
  }
  var coords = getSelectionCoords();
  var el = document.createElement('div');
  el.innerHTML = content;
  el.id = panelId;
  el.style.left = coords.x + 'px';
  el.style.top = (coords.y + document.body.scrollTop) + 'px';
  document.body.insertBefore(el, document.body.firstChild);
  isPanelOpen = true;
}

function updatePanel(content) {
  var el = document.getElementById(panelId);
  el.innerHTML = content;
}

// Return selection coords
function getSelectionCoords(win) {
  win = win || window;
  var doc = win.document;
  var x = 0,
    y = 0;
  var sel = win.getSelection();
  if (sel.rangeCount) {
    var range = sel.getRangeAt(0).cloneRange();
    if (range.getClientRects) {
      range.collapse(true);
      var rects = range.getClientRects();
      if (rects.length > 0) {
        var rect = rects[0];
      }
      x = rect.left;
      y = rect.bottom;
    }
  }
  return {
    x: x,
    y: y
  };
}

function isDescendant(parent, child) {
  if (parent === child) {
    return true;
  }
  var node = child.parentNode;
  while (node !== null) {
    if (node === parent) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
}
