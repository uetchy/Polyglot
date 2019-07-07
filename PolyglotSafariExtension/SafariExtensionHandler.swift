
import SafariServices

struct RequestType {
  static let SendSettings = "settingsReceived"
  static let SendTranslation = "translated"
  static let PerformTranslation = "performTranslation"
}

struct SettingsKey {
  static let KeyCode = "keyCode"
  static let KeyCodeUnicode = "keyCodeUnicode"
  static let Modifiers = "modifiers"
  static let SourceLanguage = "sourceLanguage"
  static let TargetLanguage = "targetLanguage"
  static let InstantTranslation = "instantTranslation"
}

class SafariExtensionHandler: SFSafariExtensionHandler {
  var ud = UserDefaults(suiteName: "58XDWHK3JX.io.uechi.Polyglot")!

  override func messageReceived(withName messageName: String, from page: SFSafariPage, userInfo: [String: Any]?) {
    page.getPropertiesWithCompletionHandler { properties in
      switch messageName {
      case "getSettings":
        self.getSettingsHandler(page: page)
      case "translate":
        self.translateHandler(page: page, text: userInfo?["text"] as? String ?? "", targetLanguage: "en")
      default:
        NSLog("messageReceived:(\(messageName)) from a script injected into (\(String(describing: properties?.url))) with userInfo (\(userInfo ?? [:]))")
      }
    }
  }

  // returns the settings
  func getSettingsHandler(page: SFSafariPage) {
    let keyCodeUnicode = ud.integer(forKey: SettingsKey.KeyCodeUnicode)
    let modifiers = ud.integer(forKey: SettingsKey.Modifiers)
    let instantTranslation = ud.bool(forKey: SettingsKey.InstantTranslation)
    let settings = [
      SettingsKey.KeyCodeUnicode: keyCodeUnicode,
      SettingsKey.Modifiers: modifiers,
      SettingsKey.InstantTranslation: instantTranslation,
    ] as [String: Any]

    page.dispatchMessageToScript(withName: RequestType.SendSettings, userInfo: settings)
  }

  // called when translation kicked off
  func translateHandler(page: SFSafariPage, text: String, targetLanguage _: String) {
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
        page?.dispatchMessageToScript(withName: RequestType.PerformTranslation, userInfo: [:])
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
