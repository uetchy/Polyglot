//
//  AppDelegate.swift
//  Polyglot
//
//  Created by Yasuaki Uechi on 18/8/6.
//  Copyright © 2018 Yasuaki Uechi. All rights reserved.
//

import Cocoa
import Magnet
import KeyHolder

@NSApplicationMain
class AppDelegate: NSObject, NSApplicationDelegate {

  @IBOutlet weak var window: NSWindow!
  @IBOutlet weak var recordView: RecordView!

  func applicationDidFinishLaunching(_ aNotification: Notification) {
    // Insert code here to initialize your application
    recordView.tintColor = NSColor(red: 0.164, green: 0.517, blue: 0.823, alpha: 1)
    let keyCombo = KeyCombo(doubledCocoaModifiers: .command)
    recordView.keyCombo = keyCombo
    let hotKey = HotKey(identifier: "PolyglotHotkey", keyCombo: keyCombo!, target: self, action: #selector(AppDelegate.hotkeyCalled))
    hotKey.register()
    recordView.didChange = { keyCombo in
      guard let keyCombo = keyCombo else { return } // Clear shortcut
      print("keyCode: \(keyCombo.keyCode)")
      print("modifiers: \(keyCombo.modifiers)")
      let ud = UserDefaults.standard
      ud.set(keyCombo.keyCode, forKey: "keyCode")
    }
  }

  func applicationWillTerminate(_ aNotification: Notification) {
    // Insert code here to tear down your application
    HotKeyCenter.shared.unregisterAll()
  }
  
  @objc func hotkeyCalled() {
    print("HotKey called!!!!")
  }


}
