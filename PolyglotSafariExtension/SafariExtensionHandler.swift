import SafariServices
import Alamofire

class SafariExtensionHandler: SFSafariExtensionHandler {
  
  override func messageReceived(withName messageName: String, from page: SFSafariPage, userInfo: [String : Any]?) {
    // This method will be called when a content script provided by your extension calls safari.extension.dispatchMessage("message").
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
  
  override func toolbarItemClicked(in window: SFSafariWindow) {
    // This method will be called when your toolbar item is clicked.
    NSLog("toolbarItemClicked")
    window.getActiveTab { (tab) in
      tab?.getActivePage(completionHandler: { (page) in
        page?.dispatchMessageToScript(withName: "getSelectedText", userInfo: [:])
      })
    }
  }
  
  override func validateToolbarItem(in window: SFSafariWindow, validationHandler: @escaping ((Bool, String) -> Void)) {
    // This is called when Safari's state changed in some way that would require the extension's toolbar item to be validated again.
    NSLog("validateToolbarItem")
    validationHandler(true, "")
  }
  
  override func popoverViewController() -> SFSafariExtensionViewController {
    NSLog("popoverViewController")
    return SafariExtensionViewController.shared
  }
  
  func getSettingsHandler(page: SFSafariPage) {
    NSLog("getSettingsHandler")
    let ud = UserDefaults.init(suiteName: "group.io.uechi.Polyglot")!
    let keyCode = ud.integer(forKey: "keyCode")
    let settings = [
      "keyCode": keyCode
    ]
    page.dispatchMessageToScript(withName: "settingsReceived", userInfo: settings)
  }
  
  func translateHandler(_ text: String, targetLanguage: String) {
    NSLog("translateHandler")
    googleTranslate(text, targetLanguage: targetLanguage) { translatedText in
      NSLog("translated \(translatedText)")
    }
  }
  
  func googleTranslate(_ text: String, targetLanguage: String, completionHandler: @escaping (String) -> ()) {
    NSLog("googleTranslate")
    let endpoint: String = "https://translate.googleapis.com/translate_a/single"
    let params: Alamofire.Parameters = [
      "client": "gtx",
      "sl": "auto",
      "tl": targetLanguage,
      "dt": "t",
      "q": text,
    ]
    Alamofire.request(endpoint, method: .get, parameters: params)
      .validate(statusCode: 200..<300)
      .responseJSON { response in
        guard let json = response.result.value as? NSArray,
              let textArray = json[0] as? NSArray else {
          return
        }
        let sentenceArray = textArray.compactMap({ (item) -> String in
          guard let item = item as? NSArray,
                let text = item[0] as? String else {
            return ""
          }
          return text
        })
        let sentence = sentenceArray.joined(separator: "\n")
        completionHandler(sentence)
      }
  }
  
}
