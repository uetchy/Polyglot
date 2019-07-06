import Cocoa
import KeyHolder
import Magnet

struct SettingsKey {
  static let KeyCode = "keyCode"
  static let KeyCodeUnicode = "keyCodeUnicode"
  static let Modifiers = "modifiers"
  static let SourceLanguage = "sourceLanguage"
  static let TargetLanguage = "targetLanguage"
}

@NSApplicationMain
class AppDelegate: NSObject, NSApplicationDelegate {
  @IBOutlet var window: NSWindow!
  @IBOutlet var recordView: RecordView!
  @IBOutlet var sourceLanguagePopup: NSPopUpButton!
  @IBOutlet var targetLanguagePopup: NSPopUpButton!
  @IBOutlet var instantTranslation: NSButton!

  lazy var settings = getSettingsInstance()
    
  func applicationDidFinishLaunching(_: Notification) {
    setupPopupButtons()
    setupKeyComboView()
    setupInstantCheckbox()
  }

  func setupPopupButtons() {
    let languages = Constants.getLanguages().map { $0.value }
    sourceLanguagePopup.addItem(withTitle: "Automatic")
    sourceLanguagePopup.addItems(withTitles: languages)
    targetLanguagePopup.addItems(withTitles: languages)
    sourceLanguagePopup.target = self
    targetLanguagePopup.target = self
    sourceLanguagePopup.action = #selector(popupSelected(item:))
    targetLanguagePopup.action = #selector(popupSelected(item:))

    // Restore settings
    let settings = getSettingsInstance()
    let sourceLanguage = settings.string(forKey: SettingsKey.SourceLanguage) ?? "auto"
    let targetLanguage = settings.string(forKey: SettingsKey.TargetLanguage) ?? "en"
    sourceLanguagePopup.setTitle(sourceLanguage == "auto" ? "Automatic" : Constants.LANGUAGES[sourceLanguage] ?? "Automatic")
    targetLanguagePopup.setTitle(Constants.LANGUAGES[targetLanguage] ?? "English")
  }

  func setupKeyComboView() {
    recordView.tintColor = NSColor(red: 0.164, green: 0.517, blue: 0.823, alpha: 1)
    recordView.didChange = keyCombDidChange

    // Restore settings
    let settings = getSettingsInstance()
    let keyCode = settings.integer(forKey: SettingsKey.KeyCode)
    let modifiers = settings.integer(forKey: SettingsKey.Modifiers)
    print(keyCode)
    let keyCombo = KeyCombo(keyCode: keyCode, carbonModifiers: modifiers)
    recordView.keyCombo = keyCombo
  }

  func setupInstantCheckbox() {
    // Restore settings
    let isChecked: NSControl.StateValue = settings.bool(forKey: "instantTranslation") ? .on : .off
    self.instantTranslation.state = isChecked
    self.instantTranslation.action = #selector(instantCheckboxChanged)
  }

  // NOTE: cmd = 256, shift = 512, alt = 2048, ctrl = 4096
  func keyCombDidChange(keyCombo: KeyCombo?) {
    guard let keyCombo = keyCombo else { return }
    guard let keyCode = UnicodeScalar(keyCombo.characters) else { return }
    print("keyCode: \(keyCode.value)")
    print("modifiers: \(keyCombo.modifiers)")

    // save keycombo
    settings.set(keyCode.value, forKey: SettingsKey.KeyCodeUnicode)
    settings.set(keyCombo.keyCode, forKey: SettingsKey.KeyCode)
    settings.set(keyCombo.modifiers, forKey: SettingsKey.Modifiers)
    settings.synchronize()
  }

  @objc func instantCheckboxChanged() {
    // save instant checkbox setting
    let isChecked = self.instantTranslation.state == NSControl.StateValue.on ? true : false
    settings.set(isChecked, forKey: "instantTranslation")
    settings.synchronize()
  }

    
  @objc func popupSelected(item _: NSMenuItem) {
    let sourceIndex = sourceLanguagePopup.indexOfSelectedItem
    let targetIndex = targetLanguagePopup.indexOfSelectedItem

    let sourceLanguage = sourceIndex == 0 ? "auto" : Constants.getLanguages()[sourceIndex - 1].key
    let targetLanguage = Constants.getLanguages()[targetIndex].key

    // save language option
    settings.set(sourceLanguage, forKey: SettingsKey.SourceLanguage)
    settings.set(targetLanguage, forKey: SettingsKey.TargetLanguage)
    settings.synchronize()
  }

  func getSettingsInstance() -> UserDefaults {
    return UserDefaults(suiteName: "group.io.uechi.Polyglot")!
  }

  func applicationWillTerminate(_: Notification) {
    HotKeyCenter.shared.unregisterAll()
  }
}
