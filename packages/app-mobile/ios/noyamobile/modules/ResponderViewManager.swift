//
//  ResponderViewManager.swift
//  noyamobile
//
//  Created by Michał Sęk on 04/05/2022.
//

@objc(ResponderViewManager)
class ResponderViewManager: RCTViewManager {
  override func view() -> UIView! {
    return ResponderView();
  }

  override static func requiresMainQueueSetup() -> Bool {
    return false
  }

  func setKeyCommands(){

  }
}
