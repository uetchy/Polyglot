import Cocoa
import KeyHolder
import Magnet

@NSApplicationMain
class AppDelegate: NSObject, NSApplicationDelegate {
  @IBOutlet var window: NSWindow!
  @IBOutlet var recordView: RecordView!
  @IBOutlet var sourceLanguagePopup: NSPopUpButton!
  @IBOutlet var targetLanguagePopup: NSPopUpButton!
  @IBOutlet var instantTranslation: NSButton!

  lazy var settings = getSettingsInstance()
    
  func applicationDidFinishLaunching(_: Notification) {
    // Insert code here to initialize your application
    setupPopupViews()
    setupRecordView()
    setupInstantCheckbox()
  }

  func setupPopupViews() {
    let languages = Constants.getLanguages().map { $0.value }
    sourceLanguagePopup.addItem(withTitle: "Automatic")
    sourceLanguagePopup.addItems(withTitles: languages)
    targetLanguagePopup.addItems(withTitles: languages)
    sourceLanguagePopup.target = self
    targetLanguagePopup.target = self
    sourceLanguagePopup.action = #selector(popupSelected(item:))
    targetLanguagePopup.action = #selector(popupSelected(item:))

    // Restore settings
    let sourceLanguage = settings.string(forKey: "sourceLanguage") ?? "auto"
    let targetLanguage = settings.string(forKey: "targetLanguage") ?? "en"
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

    func setupInstantCheckbox() {
      // Restore settings
      let isChecked: NSControl.StateValue = settings.bool(forKey: "instantTranslation") ? .on : .off
      self.instantTranslation.state = isChecked
      self.instantTranslation.action = #selector(instantCheckboxChanged)
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
    settings.set(keyCode.value, forKey: "keyCode")
    settings.set(keyCombo.modifiers, forKey: "modifiers")
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
