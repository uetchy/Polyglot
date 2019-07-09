import Alamofire
import Foundation

func googleTranslate(_ text: String, sourceLanguage: String?, targetLanguage: String, completionHandler: @escaping (NSDictionary) -> Void) {
  let endpoint: String = "https://translate.googleapis.com/translate_a/single?dt=t&dt=ss"
  let params: Alamofire.Parameters = [
    "client": "gtx",
    "dj": 1,
    "ie": "UTF-8",
    "oe": "UTF-8",
    "sl": sourceLanguage ?? "auto",
    "tl": targetLanguage,
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

      let result: NSMutableDictionary = [:]

      // Translation
      result["translation"] = sentences.compactMap { (item) -> String? in
        guard let item = item as? NSDictionary,
          let text = item["trans"] as? String else {
          return nil
        }
        return text
      }.compactMap { $0 }.joined(separator: "")

      // Dictionary
      if let dict = json["dict"] as? NSArray {
        print(dict)
        result["dictionary"] = dict
      }

      // Dictionary
      if let synsets = json["synsets"] as? NSArray {
        print(synsets)
        result["synonyms"] = synsets
      }

      completionHandler(result as NSDictionary)
    }
}
