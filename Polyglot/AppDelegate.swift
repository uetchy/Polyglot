import Cocoa
import KeyHolder
import Magnet

let LANGUAGES = [
  "af": "Afrikaans",
  "sq": "Albanian",
  "ar": "Arabic",
  "hy": "Armenian",
  "az": "Azerbaijani",
  "eu": "Basque",
  "be": "Belarusian",
  "bn": "Bengali",
  "bs": "Bosnian",
  "bg": "Bulgarian",
  "ca": "Catalan",
  "ceb": "Cebuano",
  "ny": "Chichewa",
  "zh-CN": "Chinese Simplified",
  "zh-TW": "Chinese Traditional",
  "hr": "Croatian",
  "cs": "Czech",
  "da": "Danish",
  "nl": "Dutch",
  "en": "English",
  "eo": "Esperanto",
  "et": "Estonian",
  "tl": "Filipino",
  "fi": "Finnish",
  "fr": "French",
  "gl": "Galician",
  "ka": "Georgian",
  "de": "German",
  "el": "Greek",
  "gu": "Gujarati",
  "ht": "Haitian Creole",
  "ha": "Hausa",
  "iw": "Hebrew",
  "hi": "Hindi",
  "hmn": "Hmong",
  "hu": "Hungarian",
  "is": "Icelandic",
  "ig": "Igbo",
  "id": "Indonesian",
  "ga": "Irish",
  "it": "Italian",
  "ja": "Japanese",
  "jw": "Javanese",
  "kn": "Kannada",
  "kk": "Kazakh",
  "km": "Khmer",
  "ko": "Korean",
  "lo": "Lao",
  "la": "Latin",
  "lv": "Latvian",
  "lt": "Lithuanian",
  "mk": "Macedonian",
  "mg": "Malagasy",
  "ms": "Malay",
  "ml": "Malayalam",
  "mt": "Maltese",
  "mi": "Maori",
  "mr": "Marathi",
  "mn": "Mongolian",
  "my": "Myanmar (Burmese)",
  "ne": "Nepali",
  "no": "Norwegian",
  "fa": "Persian",
  "pl": "Polish",
  "pt": "Portuguese",
  "ma": "Punjabi",
  "ro": "Romanian",
  "ru": "Russian",
  "sr": "Serbian",
  "st": "Sesotho",
  "si": "Sinhala",
  "sk": "Slovak",
  "sl": "Slovenian",
  "so": "Somali",
  "es": "Spanish",
  "su": "Sudanese",
  "sw": "Swahili",
  "sv": "Swedish",
  "tg": "Tajik",
  "ta": "Tamil",
  "te": "Telugu",
  "th": "Thai",
  "tr": "Turkish",
  "uk": "Ukrainian",
  "ur": "Urdu",
  "uz": "Uzbek",
  "vi": "Vietnamese",
  "cy": "Welsh",
  "yi": "Yiddish",
  "yo": "Yoruba",
  "zu": "Zulu",
]

@NSApplicationMain
class AppDelegate: NSObject, NSApplicationDelegate {
  @IBOutlet var window: NSWindow!
  @IBOutlet var recordView: RecordView!
  @IBOutlet var sourceLanguagePopup: NSPopUpButton!
  @IBOutlet var targetLanguagePopup: NSPopUpButton!

  func applicationDidFinishLaunching(_: Notification) {
    // Insert code here to initialize your application
    recordView.tintColor = NSColor(red: 0.164, green: 0.517, blue: 0.823, alpha: 1)

    let keyCombo = KeyCombo(doubledCocoaModifiers: .command)

    recordView.keyCombo = keyCombo
    let hotKey = HotKey(identifier: "PolyglotHotkey", keyCombo: keyCombo!, target: self, action: #selector(AppDelegate.hotkeyCalled))
    hotKey.register()

    recordView.didChange = keyCombDidChange

    sourceLanguagePopup.didChangeValue = popupSelected
  }

  func keyCombDidChange(keyCombo: KeyCombo?) {
    // NOTE:
    // cmd   = 256
    // shift = 512
    // alt   = 2048
    // ctrl  = 4096
    // cmd+shift = 768
    guard let keyCombo = keyCombo else { return } // Clear shortcut
    guard let keyCode = UnicodeScalar(keyCombo.characters) else { return }
    print("keyCode: \(keyCode.value)")
    print("modifiers: \(keyCombo.modifiers)")

    // save keycombo
    let settings = getSettingsInstance()
    settings.set(keyCode.value, forKey: "keyCode")
    settings.set(keyCombo.modifiers, forKey: "modifiers")
    settings.synchronize()
  }

  func popupSelected(item _: NSMenuItem) {
    let sourceLanguage = sourceLanguagePopup.title
    let targetLanguage = targetLanguagePopup.title

    // save language option
    let settings = getSettingsInstance()
    settings.set(sourceLanguage, forKey: "sourceLanguage")
    settings.set(targetLanguage, forKey: "targetLanguage")
    settings.synchronize()
  }

  func getSettingsInstance() -> UserDefaults {
    return UserDefaults(suiteName: "group.io.uechi.Polyglot")!
  }

  func applicationWillTerminate(_: Notification) {
    // Insert code here to tear down your application
    HotKeyCenter.shared.unregisterAll()
  }

  @objc func hotkeyCalled() {
    print("HotKey called!!!!")
  }
}