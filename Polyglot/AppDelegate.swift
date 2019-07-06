import Cocoa
import KeyHolder
import Magnet

@NSApplicationMain
class AppDelegate: NSObject, NSApplicationDelegate {
  @IBOutlet var window: NSWindow!
  @IBOutlet var recordView: RecordView!
  @IBOutlet var sourceLanguagePopup: NSPopUpButton!
  @IBOutlet var targetLanguagePopup: NSPopUpButton!

  func applicationDidFinishLaunching(_: Notification) {
    // Insert code here to initialize your application
    setPopup()
    setupRecordView()
  }

  func setPopup() {
    let languages = [String](Constants.LANGUAGES.values).sorted()
    sourceLanguagePopup.addItem(withTitle: "Automatic")
    sourceLanguagePopup.addItems(withTitles: languages)
    targetLanguagePopup.addItems(withTitles: languages)
    sourceLanguagePopup.target = self
    targetLanguagePopup.target = self
    sourceLanguagePopup.action = #selector(popupSelected(item:))
    targetLanguagePopup.action = #selector(popupSelected(item:))
    let settings = getSettingsInstance()
    sourceLanguagePopup.setTitle(settings.string(forKey: "sourceLanguage") ?? "Automatic")
    targetLanguagePopup.setTitle(settings.string(forKey: "targetLanguage") ?? "English")
  }

  func setupRecordView() {
    recordView.tintColor = NSColor(red: 0.164, green: 0.517, blue: 0.823, alpha: 1)
    let keyCombo = KeyCombo(doubledCocoaModifiers: .command)

    recordView.keyCombo = keyCombo
    let hotKey = HotKey(identifier: "PolyglotHotkey", keyCombo: keyCombo!, target: self, action: #selector(AppDelegate.hotkeyCalled))
    hotKey.register()

    recordView.didChange = keyCombDidChange
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

  @objc func popupSelected(item _: NSMenuItem) {
    let sourceLanguage = sourceLanguagePopup.titleOfSelectedItem ?? "Automatic"
    let targetLanguage = targetLanguagePopup.titleOfSelectedItem ?? "English"

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
