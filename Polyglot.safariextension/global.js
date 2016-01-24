console.log("main.js");

safari.application.addEventListener('command', performCommand, false);
safari.application.addEventListener('message', handleMessage, false);

function performCommand(event) {
  if (event.command === 'contextMenuTranslate') {
    safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('getSelectedText');
  }
}

function handleMessage(msg) {
  // if (window == window.top)
  if (msg.name === 'finishedGetSelectedText') {
    console.log(msg.message);
  }
}

// safari.application.addEventListener("popover", popoverHandler, true);
//
// function popoverHandler(event){
//     apiUserName = safari.extension.settings.apiUserName;
//     apiPassword = safari.extension.settings.apiPassword;
//
//     $('#add-style').remove();
//     if (safari.extension.settings.ConohaMode){
//          $('head link:last').after('<link id="add-style" rel="stylesheet" href="panel_conoha-mode.css">');
//     }else{
//         $('body').css("background-color","#FFFFFF");
//     }
//     showLoading();
//     GetAllServers();
// };
