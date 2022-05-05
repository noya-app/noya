//
//  KeyCommandRegistry.swift
//  noyamobile
//
//  Created by Devin Abbott on 5/4/22.
//

import Foundation
import React

@objc
protocol KeyCommandable {
  func onKeyCommand(keyCommand: UIKeyCommand) -> Void
}

@objc(KeyCommandRegistry)
class KeyCommandRegistry: RCTEventEmitter {
  
  var commandMap: [String: UIKeyCommand] = [:]
  
  @objc
  func registerCommand(_ options: NSDictionary) {
    guard let command = options["command"] as? String else { return }
    
    let parts = command.split(separator: "-")
    let key = String(parts.last ?? "")
    let hasCommand = parts.contains("command")
    let hasShift = parts.contains("shift")
    let hasControl = parts.contains("control")
    
    if #available(iOS 13.0, *) {
      var flags = UIKeyModifierFlags()
      
      if (hasCommand) { flags.insert(.command) }
      if (hasShift) { flags.insert(.shift) }
      if (hasControl) { flags.insert(.control) }
      
      let keyCommand = UIKeyCommand(
        action: #selector(KeyCommandable.onKeyCommand(keyCommand:)),
        input: key,
        modifierFlags: flags
      )
      
      if let title = options["title"] as? String {
        keyCommand.title = title
      }
      
      if #available(iOS 15.0, *) {
        if let priority = options["priority"] as? String {
          keyCommand.wantsPriorityOverSystemBehavior = priority == "system"
        }
      }
      
      commandMap[command] = keyCommand
    }
  }
  
  @objc
  func unregisterCommand(_ options: NSDictionary) {
    guard let command = options["command"] as? String else { return }
    
    commandMap.removeValue(forKey: command)
  }
  
  // Overrides
  
  override func supportedEvents() -> [String]! {
    return ["onKeyCommand"]
  }
  
  override class func requiresMainQueueSetup() -> Bool {
    return true
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
    KeyCommandRegistry.instances.forEach { instance in
      instance.commandMap.forEach { command, value in
        guard value === keyCommand else { return }
        instance.sendEvent(withName: "onKeyCommand", body: ["command": command])
      }
    }
  }
}
