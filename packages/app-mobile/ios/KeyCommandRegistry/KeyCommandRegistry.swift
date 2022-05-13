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
let SpecialKeys = ["Escape", "End", "Delete", "Home", "PageUp", "PageDown", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]

@objc
protocol KeyCommandable {
  @available(iOS 13.0, *)
  func onKeyCommand(_ sender: AnyObject) -> Void
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
    case "ArrowUp":
      return UIKeyCommand.inputUpArrow
    case "ArrowDown":
      return UIKeyCommand.inputDownArrow
    case "ArrowLeft":
      return UIKeyCommand.inputLeftArrow
    case "ArrowRight":
      return UIKeyCommand.inputRightArrow
    default:
      return key
  }
}

@objc(KeyCommandRegistry)
@available(iOS 13.0, *)
class KeyCommandRegistry: RCTEventEmitter {
  // Map of commands grouped in menu names
  var menuKeyCommands: [String: [String: UIKeyCommand]] = [:]
  var keyCommands: [String: UIKeyCommand] = [:]

  func rebuildCommands() {
    DispatchQueue.main.async {
      UIMenuSystem.main.setNeedsRebuild()
    }
  }
  
  func buildKeyCommand(_ options: NSDictionary) {
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
      action: #selector(KeyCommandable.onKeyCommand(_:)),
      input: key,
      modifierFlags: flags,
      propertyList: ["id": baseCommand]
    )

    if #available(iOS 15.0, *) {
      if let priority = options["priority"] as? String {
        keyCommand.wantsPriorityOverSystemBehavior = priority == "system"
      }
    }

    if let menuName = options["menuName"] as? String {
      if (menuKeyCommands[menuName] == nil) {
        menuKeyCommands[menuName] = [:]
      }

      menuKeyCommands[menuName]![baseCommand] = keyCommand
    } else {
      keyCommands[baseCommand] = keyCommand
    }
  }
  
  func removeCommand(_ option: Any) {
    guard let command = option as? String else { return }
    
    for var (_, commands) in menuKeyCommands {
      commands.removeValue(forKey: command)
    }

    // Remove given command from menu-less commands
    self.keyCommands.removeValue(forKey: command)
  }
  
  @objc
  func registerCommands(_ commands: NSArray) {
    for command in commands {
      if (command is NSDictionary) {
        buildKeyCommand(command as! NSDictionary)
      }
    }
    
    rebuildCommands()
  }
  
  @objc
  func unregisterCommands(_ commands: NSArray) {
    for command in commands {
      removeCommand(command)
    }
    
    rebuildCommands()
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

  // Everytime the React Native bridge reloads, it instantiates a new instance of this KeyCommandRegistry.
  // We assume that key commands should affect every active instance, though in our case there should only
  // ever be one instance.
  private static var instances: [KeyCommandRegistry] = []

  // API
  static func allMenuCommands() -> [String: [UIKeyCommand]] {
    var commands: [String: [UIKeyCommand]] = [:]

    instances.forEach { instance in
      instance.menuKeyCommands.forEach({ (key, value) in
        if (commands[key] == nil) {
          commands[key] = []
        }

        commands[key]?.append(contentsOf: value.values)
      })
    }

    return commands
  }
  
  static func allMenulessCommands() -> [UIKeyCommand] {
    var commands: [UIKeyCommand] = []
    
    instances.forEach({ instance in
      commands.append(contentsOf: instance.keyCommands.values)
    })
    
    return commands
  }

  static func onKeyCommand(keyCommand: UIKeyCommand) {
    KeyCommandRegistry.instances.forEach({ instance in
      // Search in commands without assigned menu
      instance.keyCommands.forEach({ (commandName, command) in
        guard command == keyCommand else { return }
        
        instance.sendEvent(withName: "onKeyCommand", body: ["command": commandName])
      })

      // Search in commands grouped into menus
      instance.menuKeyCommands.values.forEach({ commandList in
        commandList.forEach({ (commandName, command) in
          guard command == keyCommand else { return }

          instance.sendEvent(withName: "onKeyCommand", body: ["command": commandName])
        })
      })
    })
  }
}
