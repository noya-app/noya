//
//  KeyCommandRegistry.swift
//  noyamobile
//
//  Created by Devin Abbott on 5/4/22.
//
import Foundation
import React
import UIKit

enum Modifiers: String, CaseIterable {
  case shift = "Shift"
  case meta = "Meta"
  case ctrl = "Ctrl"
  case alt = "Alt"
}

enum SpecialKeys: String, CaseIterable {
  case escape = "Escape"
  case end = "End"
  case delete = "Delete"
  case home = "Home"
  case pageUp = "PageUp"
  case pageDown = "PageDown"
  case arrowUp = "ArrowUp"
  case arrowDown = "ArrowDown"
  case arrowLeft = "ArrowLeft"
  case arrowRight = "ArrowRight"
}

@objc
protocol KeyCommandable {
  func onKeyCommand(_ sender: AnyObject) -> Void
}

func parseKeyName(key: String) -> String {
  // Desired shortcutk key is same as separator
  if Modifiers.from(string: key) != nil {
    return "-"
  }

  if let specialKey = SpecialKeys.from(string: key) {
    switch specialKey {
      case SpecialKeys.escape:
        return UIKeyCommand.inputEscape
      case SpecialKeys.end:
        return UIKeyCommand.inputEnd
      case SpecialKeys.delete:
        if #available(iOS 15.0, *) {
          return UIKeyCommand.inputDelete
        }

        return key
      case SpecialKeys.home:
        return UIKeyCommand.inputHome
      case SpecialKeys.pageUp:
        return UIKeyCommand.inputPageUp
      case SpecialKeys.pageDown:
        return UIKeyCommand.inputPageDown
      case SpecialKeys.arrowUp:
        return UIKeyCommand.inputUpArrow
      case SpecialKeys.arrowDown:
        return UIKeyCommand.inputDownArrow
      case SpecialKeys.arrowLeft:
        return UIKeyCommand.inputLeftArrow
      case SpecialKeys.arrowRight:
        return UIKeyCommand.inputRightArrow
    }
  }

  return key
}

@objc(KeyCommandRegistry)
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
