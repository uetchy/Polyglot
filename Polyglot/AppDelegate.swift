import AXSwift
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

  var settings = UserDefaults(suiteName: GROUP_ID)!

  func applicationDidFinishLaunching(_: Notification) {
    setupPopupButtons()
    setupKeyComboView()
    setupInstantCheckbox()

//    guard AXSwift.checkIsProcessTrusted(prompt: true) else {
//      print("Not trusted as an AX process; please authorize and re-launch")
//      //      NSApp.terminate(self)
//      return
//    }
    // Check that we have permission
    guard UIElement.isProcessTrusted(withPrompt: true) else {
      NSLog("No accessibility API permission, exiting")
//      NSRunningApplication.current.terminate()
      return
    }
    // https://stackoverflow.com/questions/6544311/how-to-get-global-screen-coordinates-of-currently-selected-text-via-accessibilit
    // https://github.com/tmandry/AXSwift/blob/dbf34341fd9a5892a5f8a646699c82308ae40c42/Sources/UIElement.swift#L169
    if let application = NSWorkspace.shared.frontmostApplication {
      NSLog("localizedName: \(String(describing: application.localizedName)), processIdentifier: \(application.processIdentifier)")
      let uiApp = Application(application)!
      NSLog("windows: \(String(describing: try! uiApp.windows()))")
      NSLog("attributes: \(try! uiApp.attributes())")
      NSLog("at 0,0: \(String(describing: try! uiApp.elementAtPosition(0, 0)))")
      if let bundleIdentifier = application.bundleIdentifier {
        NSLog("bundleIdentifier: \(bundleIdentifier)")
        let windows = try! Application.allForBundleID(bundleIdentifier).first!.windows()
        NSLog("windows: \(String(describing: windows))")
      }
    }
  }

  func applicationShouldTerminateAfterLastWindowClosed(_: NSApplication) -> Bool {
    return true
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

  func setupInstantCheckbox() {
    // Restore settings
    let isChecked: NSControl.StateValue = settings.bool(forKey: SettingsKey.InstantTranslation) ? .on : .off
    instantTranslation.state = isChecked
    instantTranslation.action = #selector(instantCheckboxChanged)
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
    let isChecked = instantTranslation.state == NSControl.StateValue.on ? true : false
    settings.set(isChecked, forKey: SettingsKey.InstantTranslation)
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
}
