import Alamofire
import Foundation

func googleTranslate(_ text: String, sourceLanguage: String?, targetLanguage: String, completionHandler: @escaping (String) -> Void) {
  let endpoint: String = "https://translate.googleapis.com/translate_a/single"
  let params: Alamofire.Parameters = [
    "client": "gtx",
    "sl": sourceLanguage ?? "auto",
    "tl": targetLanguage,
    "dt": "t",
    "dj": 1,
    "ie": "UTF-8",
    "oe": "UTF-8",
    "q": text,
  ]

  Alamofire.request(endpoint, method: .get, parameters: params)
    .validate(statusCode: 200 ..< 300)
    .responseJSON { response in
      if response.result.error != nil {
        NSLog(response.result.error?.localizedDescription ?? "")
        return
      }

      guard let json = response.result.value as? NSDictionary,
        let sentences = json["sentences"] as? NSArray else {
        return
      }

      let sentenceArray = sentences.compactMap { (item) -> String? in
        guard let item = item as? NSDictionary,
          let text = item["trans"] as? String else {
          return nil
        }
        return text
      }.compactMap { $0 }

      let sentence = sentenceArray.joined(separator: "")

      completionHandler(sentence)
    }
}
