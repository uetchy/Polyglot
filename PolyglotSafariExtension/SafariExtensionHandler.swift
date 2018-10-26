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
      case "translate":
        self.translateHandler(userInfo?["text"] as! String, targetLanguage: "ja")
      default:
        NSLog("The extension received a message (\(messageName)) from a script injected into (\(String(describing: properties?.url))) with userInfo (\(userInfo ?? [:]))")
      }
    }
  }
  
  override func toolbarItemClicked(in window: SFSafariWindow) {
    // This method will be called when your toolbar item is clicked.
    NSLog("The extension's toolbar item was clicked")
  }
  
  override func validateToolbarItem(in window: SFSafariWindow, validationHandler: @escaping ((Bool, String) -> Void)) {
    // This is called when Safari's state changed in some way that would require the extension's toolbar item to be validated again.
    validationHandler(true, "")
  }
  
  override func popoverViewController() -> SFSafariExtensionViewController {
    return SafariExtensionViewController.shared
  }
  
  func translateHandler(_ text: String, targetLanguage: String) {
    googleTranslate(text: text, targetLanguage: targetLanguage) { translatedText in
      NSLog("translated \(translatedText)")
    }
  }
  
  func googleTranslate(text: String, targetLanguage: String, completionHandler: @escaping (String) -> ()) {
    let endpoint: String = "http://translate.googleapis.com/translate_a/single"
    let parameters: Alamofire.Parameters = [
      "client": "gtx",
      "sl": "auto",
      "tl": targetLanguage,
      "dt": "t",
      "q": text,
    ]
    Alamofire.request(endpoint, parameters: parameters)
      .responseString { response in
        guard let value = response.result.value else {
          return
        }
        let purified = value.replacingOccurrences(of: ",,", with: ",null,")
        do {
          let jsonResponse = try JSONSerialization.jsonObject(with: value.data(using: String.Encoding.utf8)!, options: [])
          if let objs = jsonResponse as? NSArray {
            print(objs[0])
          }
//          print(jsonResponse[0] as String)
        } catch let parsingError {
          print("Error", parsingError)
        }
        completionHandler(purified)
      }
//
//    try {
//      const response = await fetch(endpoint)
//      const body = await response.text()
//      const data = JSON.parse(
//        body.replace(/,,/g, ',null,').replace(/,,/g, ',null,')
//      )
//      const translatedText = data[0].map(sentence => sentence[0]).join('<br/>')
//      return translatedText
//    } catch (err) {
//      Promise.reject(err)
//    }
  }
  
}
