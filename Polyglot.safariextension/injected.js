// Only initialize in a top-level page
if (window.top === window) {
  safari.self.addEventListener('message', handleMessage, false);

  window.addEventListener('keydown', handleKeydown, false);
  window.addEventListener('mouseup', handleMouseUp, false);

  safari.self.tab.dispatchMessage('requestKeyboardShortcut');

  var isPanelOpen = false;
  var keyboardShortcut = null;
}

// Get selected text and return to global script
function handleMessage(msg) {
  switch (msg.name) {
    case 'keyboardShortcutReceived':
      console.log(msg);
      keyboardShortcut = parseInt(msg.message);
      break;
    case 'getSelectedText':
      getSelectedText();
      break;
    case 'showPanel':
      showPanel(msg.message);
      break;
  }
}

function handleMouseUp(e) {
  var panel = document.getElementById('polyglot__panel');
  if (isPanelOpen && e.target !== panel) {
    panel.remove();
    isPanelOpen = false;
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

// Show panel with given text
function showPanel(translations) {
  var coords = getSelectionCoords();
  var el = document.createElement('div');
  for (var t of translations) {
    el.innerHTML += t.translatedText + '\n';
  }
  el.id = 'polyglot__panel';
  el.style.left = coords.x + 'px';
  el.style.top = (coords.y + document.body.scrollTop) + 'px';
  el.style.position = 'absolute';
  el.style.padding = '20px';
  el.style.background = '#EFEFEF';
  el.style.borderRadius = '6px';
  el.style.minWidth = '200px';
  el.style.minHeight = '100px';
  el.style.zIndex = 9999;
  el.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.2)';
  document.body.insertBefore(el, document.body.firstChild);
  isPanelOpen = true;
}

// Return selection coords
function getSelectionCoords(win) {
  win = win || window;
  var doc = win.document;
  var x = 0,
    y = 0;
  sel = win.getSelection();
  if (sel.rangeCount) {
    range = sel.getRangeAt(0).cloneRange();
    if (range.getClientRects) {
      range.collapse(true);
      rects = range.getClientRects();
      if (rects.length > 0) {
        rect = rects[0];
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
