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
    let sources = Constants.getLanguages().map { $0.value }
    let targets = Constants.getLanguages().map { $0.value }
    sourceLanguagePopup.addItem(withTitle: "Automatic")
    sourceLanguagePopup.addItems(withTitles: sources)
    targetLanguagePopup.addItems(withTitles: targets)
    sourceLanguagePopup.target = self
    targetLanguagePopup.target = self
    sourceLanguagePopup.action = #selector(popupSelected(item:))
    targetLanguagePopup.action = #selector(popupSelected(item:))

    // Restore settings
    let settings = getSettingsInstance()
    let sourceLanguage = settings.string(forKey: "sourceLanguage") ?? "auto"
    let targetLanguage = settings.string(forKey: "targetLanguage") ?? "en"
    NSLog(sourceLanguage)
    sourceLanguagePopup.setTitle(sourceLanguage == "auto" ? "Automatic" : Constants.LANGUAGES[sourceLanguage]!)
    targetLanguagePopup.setTitle(Constants.LANGUAGES[targetLanguage]!)
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
    let sourceIndex = sourceLanguagePopup.indexOfSelectedItem
    let targetIndex = targetLanguagePopup.indexOfSelectedItem

    let sourceLanguage = sourceIndex == 0 ? "auto" : Constants.getLanguages()[sourceIndex - 1].key
    let targetLanguage = Constants.getLanguages()[targetIndex].key

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