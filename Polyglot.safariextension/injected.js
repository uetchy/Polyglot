safari.self.addEventListener('message', handleMessage, false);
document.addEventListener('onmouseup', handleMouseUp, false);

// Get selected text and dispatch to global script
function handleMessage(msg) {
  if (msg.name === 'getSelectedText') {
    var sel = window.getSelection().toString();
    safari.self.tab.dispatchMessage('finishedGetSelectedText', sel);
  } else if (msg.name === 'showPanel') {
    showPanel(msg);
  }
}

function handleMouseUp(e) {

}

// Show panel with given text
function showPanel(msg) {
  var translations = msg.message;
  var coords = getSelectionCoords();
  console.log(coords.x + ", " + coords.y);
  var el = document.createElement('div');
  for (var t of translations) {
    el.innerHTML += t.translatedText + '\n';
  }
  el.style.position = 'absolute';
  el.style.padding = '20px';
  el.style.background = '#EFEFEF';
  el.style.borderRadius = '6px';
  el.style.minWidth = '200px';
  el.style.minHeight = '100px';
  el.style.left = coords.x + 'px';
  el.style.top = (coords.y + document.body.scrollTop) + 'px';
  document.body.insertBefore(el, document.body.firstChild);
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
