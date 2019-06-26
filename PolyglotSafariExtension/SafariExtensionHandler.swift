
import SafariServices

class SafariExtensionHandler: SFSafariExtensionHandler {
  // This method will be called when a content script provided by your extension calls safari.extension.dispatchMessage("message").
  override func messageReceived(withName messageName: String, from page: SFSafariPage, userInfo: [String: Any]?) {
    page.getPropertiesWithCompletionHandler { properties in
      switch messageName {
      case "getSettings":
        NSLog("messageReceived:getSettings")
        self.getSettingsHandler(page: page)
      case "translate":
        NSLog("messageReceived:translate")
        self.translateHandler(userInfo?["text"] as? String ?? "", targetLanguage: "ja")
      default:
        NSLog("messageReceived:(\(messageName)) from a script injected into (\(String(describing: properties?.url))) with userInfo (\(userInfo ?? [:]))")
      }
    }
  }

  // returns the settings
  func getSettingsHandler(page: SFSafariPage) {
    NSLog("getSettingsHandler")
    guard let ud = UserDefaults(suiteName: "group.io.uechi.Polyglot") else { return }

    let keyCode = ud.integer(forKey: "keyCode")
    let settings = [
      "keyCode": keyCode,
    ]

    page.dispatchMessageToScript(withName: "settingsReceived", userInfo: settings)
  }

  // called when translation kicked off
  func translateHandler(_ text: String, targetLanguage: String) {
    NSLog("translateHandler")

    googleTranslate(text, targetLanguage: targetLanguage) { translatedText in
      NSLog("translated \(translatedText)")
    }
  }

  // This method will be called when your toolbar item is clicked.
  override func toolbarItemClicked(in window: SFSafariWindow) {
    NSLog("toolbarItemClicked")

    window.getActiveTab { tab in
      tab?.getActivePage(completionHandler: { page in
        page?.dispatchMessageToScript(withName: "getSelectedText", userInfo: [:])
      })
    }
  }

  // This is called when Safari's state changed in some way that would require the extension's toolbar item to be validated again.
  override func validateToolbarItem(in _: SFSafariWindow, validationHandler: @escaping ((Bool, String) -> Void)) {
    NSLog("validateToolbarItem")

    validationHandler(true, "")
  }

  // called when popover shown
  override func popoverViewController() -> SFSafariExtensionViewController {
    NSLog("popoverViewController")

    return SafariExtensionViewController.shared
  }
}