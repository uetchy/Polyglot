//
//  SafariExtensionHandler.swift
//  PolyglotSafariExtension
//
//  Created by Yasuaki Uechi on 18/8/6.
//  Copyright © 2018 Yasuaki Uechi. All rights reserved.
//

import SafariServices
import Alamofire

class SafariExtensionHandler: SFSafariExtensionHandler {
  
  override func messageReceived(withName messageName: String, from page: SFSafariPage, userInfo: [String : Any]?) {
    // This method will be called when a content script provided by your extension calls safari.extension.dispatchMessage("message").
    page.getPropertiesWithCompletionHandler { properties in
      switch messageName {
      case "getSettings":
        NSLog("getSettings")
        self.getSettingsHandler(page: page)
      case "translate":
        self.translateHandler(userInfo?["text"] as? String ?? "", targetLanguage: "ja")
      default:
        NSLog("The extension received a message (\(messageName)) from a script injected into (\(String(describing: properties?.url))) with userInfo (\(userInfo ?? [:]))")
      }
    }
  }
  
  override func toolbarItemClicked(in window: SFSafariWindow) {
    // This method will be called when your toolbar item is clicked.
    NSLog("The extension's toolbar item was clicked")
    window.getActiveTab { (tab) in
      tab?.getActivePage(completionHandler: { (page) in
        page?.dispatchMessageToScript(withName: "getSelectedText", userInfo: [:])
      })
    }
  }
  
  override func validateToolbarItem(in window: SFSafariWindow, validationHandler: @escaping ((Bool, String) -> Void)) {
    // This is called when Safari's state changed in some way that would require the extension's toolbar item to be validated again.
    validationHandler(true, "")
  }
  
  override func popoverViewController() -> SFSafariExtensionViewController {
    return SafariExtensionViewController.shared
  }
  
  func getSettingsHandler(page: SFSafariPage) {
    let ud = UserDefaults.standard
    let keyCode = ud.string(forKey: "keyCode")
    let settings = [
      "keyCode": keyCode ?? ""
    ]
    page.dispatchMessageToScript(withName: "settingsReceived", userInfo: settings)
  }
  
  func translateHandler(_ text: String, targetLanguage: String) {
    googleTranslate(text, targetLanguage: targetLanguage) { translatedText in
      NSLog("translated \(translatedText)")
    }
  }
  
  func googleTranslate(_ text: String, targetLanguage: String, completionHandler: @escaping (String) -> ()) {
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
