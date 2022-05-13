//
//  KeyEventEmitter.swift
//  noyamobile
//
//  Created by Michał Sęk on 13/05/2022.
//

import Foundation
import React
import UIKit

@objc(KeyEventEmitter)
class KeyEventEmitter: RCTEventEmitter {
  private static var instances: [KeyEventEmitter] = []
  
  private func addToInstances() {
    KeyEventEmitter.instances.append(self)
  }

  private func removeFromInstances() {
    KeyEventEmitter.instances.removeAll { $0 == self }
  }
  
  //Overrides
  override class func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  override func supportedEvents() -> [String]! {
    return ["onKeyDown", "onKeyUp"]
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

  static func onKeyDown(nativeKeyCode: NSNumber) {
    KeyEventEmitter.instances.forEach({ instance in
      instance.sendEvent(withName: "onKeyDown", body: ["nativeKeyCode": nativeKeyCode])
    })
  }
  
  static func onKeyUp(nativeKeyCode: NSNumber) {
    KeyEventEmitter.instances.forEach({ instance in
      instance.sendEvent(withName: "onKeyUp", body: ["nativeKeyCode": nativeKeyCode])
    })
  }
}
