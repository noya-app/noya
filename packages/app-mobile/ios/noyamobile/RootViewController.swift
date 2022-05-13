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
    super.pressesBegan(presses, with: event)
    
    print("[RootViewController.pressesBegan]")
    for press in presses {
      guard let key = press.key else { continue }
      print("pressesBegan", key.keyCode.rawValue)
    }
  }
  
  override func pressesEnded(_ presses: Set<UIPress>, with event: UIPressesEvent?) {
    super.pressesEnded(presses, with: event)
  }
}
