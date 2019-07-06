
import SafariServices

struct RequestType {
  static let SendSettings = "settingsReceived"
  static let SendTranslation = "translated"
  static let InvokeTranslation = "invokeTranslation"
}

struct SettingsKey {
  static let KeyCode = "keyCode"
  static let KeyCodeUnicode = "keyCodeUnicode"
  static let Modifiers = "modifiers"
  static let SourceLanguage = "sourceLanguage"
  static let TargetLanguage = "targetLanguage"
}

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
        self.translateHandler(page: page, text: userInfo?["text"] as? String ?? "", targetLanguage: "ja")
      default:
        NSLog("messageReceived:(\(messageName)) from a script injected into (\(String(describing: properties?.url))) with userInfo (\(userInfo ?? [:]))")
      }
    }
  }

  // returns the settings
  func getSettingsHandler(page: SFSafariPage) {
    print("getSettingsHandler")
    guard let ud = UserDefaults(suiteName: "group.io.uechi.Polyglot") else { return }
    let keyCode = ud.integer(forKey: SettingsKey.KeyCodeUnicode)
    let modifiers = ud.integer(forKey: SettingsKey.Modifiers)
    let settings = [
      "keyCode": keyCode,
      "modifiers": modifiers,
    ] as [String: Int]

    page.dispatchMessageToScript(withName: RequestType.SendSettings, userInfo: settings)
  }

  // called when translation kicked off
  func translateHandler(page: SFSafariPage, text: String, targetLanguage _: String) {
    guard let ud = UserDefaults(suiteName: "group.io.uechi.Polyglot") else { return }
    let sourceLanguage = ud.string(forKey: SettingsKey.SourceLanguage) ?? "auto"
    let targetLanguage = ud.string(forKey: SettingsKey.TargetLanguage) ?? "en"

    googleTranslate(text, sourceLanguage: sourceLanguage, targetLanguage: targetLanguage) { translatedText in
      page.dispatchMessageToScript(withName: RequestType.SendTranslation, userInfo: ["text": translatedText])
    }
  }

  // This method will be called when your toolbar item is clicked.
  override func toolbarItemClicked(in window: SFSafariWindow) {
    print("toolbarItemClicked")
    window.getActiveTab { tab in
      tab?.getActivePage(completionHandler: { page in
        page?.dispatchMessageToScript(withName: RequestType.InvokeTranslation, userInfo: [:])
      })
    }
  }

  // This is called when Safari's state changed in some way that would require the extension's toolbar item to be validated again.
  override func validateToolbarItem(in _: SFSafariWindow, validationHandler: @escaping ((Bool, String) -> Void)) {
    print("validateToolbarItem")
    validationHandler(true, "")
  }

  // called when popover shown
  override func popoverViewController() -> SFSafariExtensionViewController {
    print("popoverViewController")
    return SafariExtensionViewController.shared
  }
}