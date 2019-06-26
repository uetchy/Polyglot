//
//  Translator.swift
//  PolyglotSafariExtension
//
//  Created by Yasuaki Uechi on 2019/06/26.
//  Copyright © 2019 Yasuaki Uechi. All rights reserved.
//

import Alamofire
import Foundation

func googleTranslate(_ text: String, targetLanguage: String, completionHandler: @escaping (String) -> Void) {
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
    .validate(statusCode: 200 ..< 300)
    .responseJSON { response in
      NSLog("Response JSON")

      guard let json = response.result.value as? NSArray,
        let textArray = json[0] as? NSArray else {
        return
      }

      let sentenceArray = textArray.compactMap { (item) -> String in
        guard let item = item as? NSArray,
          let text = item[0] as? String else {
          return ""
        }
        return text
      }

      let sentence = sentenceArray.joined(separator: "\n")

      completionHandler(sentence)
    }
}