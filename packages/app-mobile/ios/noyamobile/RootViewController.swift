//
//  RootViewController.swift
//  noyamobile
//
//  Created by Michał Sęk on 11/05/2022.
//

import Foundation
import UIKit

class RootViewController: UIViewController {
  override func pressesBegan(_ presses: Set<UIPress>, with event: UIPressesEvent?) {
    for press in presses {
      guard let key = press.key else { continue }

      KeyEventEmitter.onKeyDown(nativeKeyCode: key.keyCode.rawValue as NSNumber)
    }
    
    super.pressesBegan(presses, with: event)
  }
  
  override func pressesEnded(_ presses: Set<UIPress>, with event: UIPressesEvent?) {
    for press in presses {
      guard let key = press.key else { continue }
      
      KeyEventEmitter.onKeyUp(nativeKeyCode: key.keyCode.rawValue as NSNumber)
    }
    
    
    super.pressesEnded(presses, with: event)
  }
  
  override func pressesCancelled(_ presses: Set<UIPress>, with event: UIPressesEvent?) {
    for press in presses {
      guard let key = press.key else { continue }
      
      KeyEventEmitter.onKeyUp(nativeKeyCode: key.keyCode.rawValue as NSNumber)
    }
    
    super.pressesCancelled(presses, with: event)
  }
}
