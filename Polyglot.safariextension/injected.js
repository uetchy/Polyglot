safari.self.addEventListener('message', handleMessage, false);

function handleMessage(msg) {
  if (msg.name === 'getSelectedText') {
    var sel = window.getSelection().toString();
    safari.self.tab.dispatchMessage('finishedGetSelectedText', sel);
  }
}
