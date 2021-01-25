import Alamofire
import Foundation

func googleTranslate(_ text: String, sourceLanguage: String, targetLanguage: String, completionHandler: @escaping (NSDictionary) -> Void, errorHandler: @escaping (String) -> Void) {
  let endpoint: String = "https://translate.googleapis.com/translate_a/single?dt=t&dt=ss&dt=rm"
  let params: Alamofire.Parameters = [
    "client": "gtx",
    "dj": 1,
    "ie": "UTF-8",
    "oe": "UTF-8",
    "sl": sourceLanguage,
    "tl": targetLanguage,
    "q": text,
  ]

  AF.request(endpoint, parameters: params)
    .validate(statusCode: 200 ..< 300)
    .responseJSON { response in
      switch response.result {
      case let .success(result):
        guard let json = result as? NSDictionary,
              let sentences = json["sentences"] as? NSArray
        else {
          return errorHandler("Illegal JSON response")
        }

        let result: NSMutableDictionary = [:]

        // Translation
        result["translation"] = sentences.compactMap { (item) -> String? in
          guard let item = item as? NSDictionary,
                let text = item["trans"] as? String
          else {
            return nil
          }
          return text
        }.compactMap { $0 }.joined(separator: "")

        // Transliteration
        result["transliteration"] = sentences.compactMap { (item) -> String? in
          guard let item = item as? NSDictionary,
                let text = item["translit"] as? String
          else {
            return nil
          }
          return text
        }.compactMap { $0 }.joined(separator: "")

        // Source Transliteration
        result["sourceTransliteration"] = sentences.compactMap { (item) -> String? in
          guard let item = item as? NSDictionary,
                let text = item["src_translit"] as? String
          else {
            return nil
          }
          return text
        }.compactMap { $0 }.joined(separator: "")

        // Dictionary
        if let dict = json["dict"] as? NSArray {
          print(dict)
          result["dictionary"] = dict
        }

        // Synonyms
        if let synsets = json["synsets"] as? NSArray {
          print(synsets)
          result["synonyms"] = synsets
        }

        completionHandler(result as NSDictionary)
      case let .failure(error):
        let errorMessage = error.localizedDescription
        NSLog(errorMessage)
        if let statusCode = response.response?.statusCode, statusCode == 429 {
          return errorHandler("The API rate limit has been exceeded. Please try again later.")
        }
        return errorHandler(errorMessage)
      }
    }
}
