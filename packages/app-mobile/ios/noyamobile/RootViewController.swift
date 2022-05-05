//
//  RootViewController.swift
//  noyamobile
//
//  Created by Devin Abbott on 5/4/22.
//
import Foundation
import UIKit

@objc
class RootViewController: UIViewController, KeyCommandable {
  override var keyCommands: [UIKeyCommand] {
    return KeyCommandRegistry.allCommands()
  }

  func onKeyCommand(keyCommand: UIKeyCommand) {
    KeyCommandRegistry.onKeyCommand(keyCommand: keyCommand)
  }
}
