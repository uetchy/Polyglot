import Cocoa
import KeyHolder
import Magnet

struct SettingsKey {
  static let KeyCode = "keyCode"
  static let KeyCodeUnicode = "keyCodeUnicode"
  static let Modifiers = "modifiers"
  static let SourceLanguage = "sourceLanguage"
  static let TargetLanguage = "targetLanguage"
  static let InstantTranslation = "instantTranslation"
  static let ConfirmInstantTranslation = "confirmInstantTranslation"
}

let DEFAULT_SOURCE = ("auto", "Auto Detect")
let DEFAULT_TARGET = ("en", "English")
let GROUP_ID = "58XDWHK3JX.io.uechi.Polyglot"

@NSApplicationMain
class AppDelegate: NSObject, NSApplicationDelegate {
  @IBOutlet var window: NSWindow!
  @IBOutlet var recordView: RecordView! {
    didSet {
      if #available(OSX 10.14, *) {
        recordView.tintColor = .controlAccentColor
        recordView.backgroundColor = .controlBackgroundColor
        recordView.borderColor = .controlShadowColor
      }
    }
  }

  @IBOutlet var sourceLanguagePopup: NSPopUpButton!
  @IBOutlet var targetLanguagePopup: NSPopUpButton!
  @IBOutlet var instantTranslation: NSButton!
  @IBOutlet var confirmInstantTranslation: NSButton!

  var settings = UserDefaults(suiteName: GROUP_ID)!

  func applicationDidFinishLaunching(_: Notification) {
    setupPopupButtons()
    setupKeyComboView()
    setupInstantCheckboxes()
  }

  func setupPopupButtons() {
    let sourceLanguages = Constants.getSourceLabels()
    let targetLanguages = Constants.getTargetLabels()
    sourceLanguagePopup.addItems(withTitles: sourceLanguages)
    targetLanguagePopup.addItems(withTitles: targetLanguages)

    sourceLanguagePopup.target = self
    targetLanguagePopup.target = self
    sourceLanguagePopup.action = #selector(sourcePopupSelected(item:))
    targetLanguagePopup.action = #selector(targetPopupSelected(item:))

    // Restore settings
    let sourceLanguage = settings.string(forKey: SettingsKey.SourceLanguage) ?? DEFAULT_SOURCE.0
    let targetLanguage = settings.string(forKey: SettingsKey.TargetLanguage) ?? DEFAULT_TARGET.0
    sourceLanguagePopup.setTitle(Constants.findSourceLabel(sourceLanguage) ?? DEFAULT_SOURCE.1)
    targetLanguagePopup.setTitle(Constants.findTargetLabel(targetLanguage) ?? DEFAULT_TARGET.1)
  }

  func setupKeyComboView() {
    recordView.tintColor = NSColor(red: 0.164, green: 0.517, blue: 0.823, alpha: 1)
    recordView.didChange = keyCombDidChange

    // Restore settings
    let keyCode = settings.integer(forKey: SettingsKey.KeyCode)
    let modifiers = settings.integer(forKey: SettingsKey.Modifiers)
    let keyCombo = KeyCombo(QWERTYKeyCode: keyCode, carbonModifiers: modifiers)
    recordView.keyCombo = keyCombo
  }

  func setupInstantCheckboxes() {
    // Restore settings
    var isChecked = settings.bool(forKey: SettingsKey.InstantTranslation)
    instantTranslation.state = isChecked ? .on : .off
    instantTranslation.action = #selector(instantCheckboxChanged)

    confirmInstantTranslation.isEnabled = isChecked
    isChecked = settings.bool(forKey: SettingsKey.ConfirmInstantTranslation)
    confirmInstantTranslation.state = isChecked ? .on : .off
    confirmInstantTranslation.action = #selector(instantCheckboxChanged)
  }

  // NOTE: cmd = 256, shift = 512, alt = 2048, ctrl = 4096
  func keyCombDidChange(keyCombo: KeyCombo?) {
    guard let keyCombo = keyCombo else { return }
    guard let keyCode = UnicodeScalar(keyCombo.characters) else { return }

    // save keycombo
    settings.set(keyCode.value, forKey: SettingsKey.KeyCodeUnicode)
    settings.set(keyCombo.QWERTYKeyCode, forKey: SettingsKey.KeyCode)
    settings.set(keyCombo.modifiers, forKey: SettingsKey.Modifiers)
    settings.synchronize()
  }

  @objc func instantCheckboxChanged() {
    // save instant checkbox setting
    var isChecked = instantTranslation.state == NSControl.StateValue.on ? true : false
    settings.set(isChecked, forKey: SettingsKey.InstantTranslation)

    confirmInstantTranslation.isEnabled = isChecked
    if !isChecked {
      confirmInstantTranslation.state = .off
    }
    isChecked = confirmInstantTranslation.state == NSControl.StateValue.on ? true : false
    settings.set(isChecked, forKey: SettingsKey.ConfirmInstantTranslation)
    settings.synchronize()
  }

  @objc func sourcePopupSelected(item _: NSMenuItem) {
    let index = sourceLanguagePopup.indexOfSelectedItem
    let sourceLanguage = Constants.findSourceKey(index)

    // save language option
    settings.set(sourceLanguage, forKey: SettingsKey.SourceLanguage)
    settings.synchronize()
  }

  @objc func targetPopupSelected(item _: NSMenuItem) {
    let index = targetLanguagePopup.indexOfSelectedItem
    let targetLanguage = Constants.findTargetKey(index)

    // save language option
    settings.set(targetLanguage, forKey: SettingsKey.TargetLanguage)
    settings.synchronize()
  }

  func applicationShouldTerminateAfterLastWindowClosed(_: NSApplication) -> Bool {
    return true
  }
}
