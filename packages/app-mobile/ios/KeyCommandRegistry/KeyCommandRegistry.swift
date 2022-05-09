//
//  KeyCommandRegistry.swift
//  noyamobile
//
//  Created by Devin Abbott on 5/4/22.
//
import Foundation
import React
import UIKit

let Modifiers = ["Shift", "Meta", "Ctrl", "Alt"]
let SpecialKeys = ["Escape", "End", "Delete", "Home", "PageUp", "PageDown", "UpArrow", "DownArrow", "LeftArrow", "RightArrow"]

@objc
protocol KeyCommandable {
  @available(iOS 13.0, *)
  func onKeyCommand(keyCommand: UIKeyCommand) -> Void
}

func parseKeyName(key: String) -> String {
  // Desired shortcutk key is same as separator
  if (Modifiers.contains(key)) {
    return "-"
  }
  
  if (!SpecialKeys.contains(key)) {
    return key
  }
    
  switch key {
    case "Escape":
      return UIKeyCommand.inputEscape
    case "End":
      if #available(iOS 13.4, *) {
        return UIKeyCommand.inputEnd
      }
      return key
    case "Delete":
      if #available(iOS 15.0, *) {
        return UIKeyCommand.inputDelete
      }
      
      return key
    case "Home":
      if #available(iOS 13.4, *) {
        return UIKeyCommand.inputHome
      }
      
      return key
    case "PageUp":
      return UIKeyCommand.inputPageUp
    case "PageDown":
      return UIKeyCommand.inputPageDown
    case "UpArrow":
      return UIKeyCommand.inputUpArrow
    case "DownArrow":
      return UIKeyCommand.inputDownArrow
    case "LeftArrow":
      return UIKeyCommand.inputLeftArrow
    case "RightArrow":
      return UIKeyCommand.inputRightArrow
    default:
      return key
  }
}

@objc(KeyCommandRegistry)
@available(iOS 13.0, *)
class KeyCommandRegistry: RCTEventEmitter {
  var commandMap: [String: UIKeyCommand] = [:]
  
  func rebuildCommands() {
    DispatchQueue.main.async {
      UIMenuSystem.main.setNeedsRebuild()
    }
  }

  @objc
  func registerCommand(_ options: NSDictionary) {
    guard let baseCommand = options["command"] as? String else { return }
    let parts = baseCommand.split(separator: "-")
    let key = parseKeyName(key: String(parts.last ?? ""))
    var flags = UIKeyModifierFlags()
    
    if (parts.contains("Meta")) {
      flags.insert(.command)
    }

    if (parts.contains("Shift")) {
      flags.insert(.shift)
    }

    if (parts.contains("Ctrl")) {
      flags.insert(.control)
    }

    if (parts.contains("Alt")) {
      flags.insert(.alternate)
    }
    
    let title = options["title"] as? String

    let keyCommand = UIKeyCommand(
      title: title ?? "",
      action: #selector(KeyCommandable.onKeyCommand(keyCommand:)),
      input: key,
      modifierFlags: flags
    )
    
    if #available(iOS 15.0, *) {
      if let priority = options["priority"] as? String {
        keyCommand.wantsPriorityOverSystemBehavior = priority == "system"
      }
    }
  
    commandMap[baseCommand] = keyCommand
    self.rebuildCommands()
  }

  @objc
  func unregisterCommand(_ options: NSDictionary) {
    guard let command = options["command"] as? String else { return }
    commandMap.removeValue(forKey: command)
    self.rebuildCommands()
  }

  // Overrides
  override class func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  override func supportedEvents() -> [String]! {
    return ["onKeyCommand"]
  }

  override func startObserving() {
    super.startObserving()
    addToInstances()
  }

  override func stopObserving() {
    super.stopObserving()
    removeFromInstances()
  }

  override func invalidate() {
    super.invalidate()
    removeFromInstances()
  }

  // Instances
  private func addToInstances() {
    KeyCommandRegistry.instances.append(self)
  }

  private func removeFromInstances() {
    KeyCommandRegistry.instances.removeAll { $0 == self }
  }

  /// Everytime the React Native bridge reloads, it instantiates a new instance of this KeyCommandRegistry.
  /// We assume that key commands should affect every active instance, though in our case there should only
  /// ever be one instance.
  private static var instances: [KeyCommandRegistry] = []

  // API
  static func allCommands() -> [UIKeyCommand] {
    var commands: [UIKeyCommand] = []

    instances.forEach { instance in
      commands.append(contentsOf: instance.commandMap.values)
    }

    return commands
  }

  static func onKeyCommand(keyCommand: UIKeyCommand) {
    print("[KeyCommandRegistry] calling onKeyCommand")
    KeyCommandRegistry.instances.forEach { instance in
      print("[KeyCommandRegistry].onKeyCommand instance", instance)
      instance.commandMap.forEach { command, value in
        print("[KeyCommandRegistry]", value, keyCommand)
        guard value == keyCommand else {
          print("fail!")
          return

        }
        print("[KeyCommandRegistry] instancee found!")
        instance.sendEvent(withName: "onKeyCommand", body: ["command": command])
      }
    }
  }
}
