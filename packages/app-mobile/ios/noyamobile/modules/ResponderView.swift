//
//  ResponderView.swift
//  noyamobile
//
//  Created by Michał Sęk on 04/05/2022.
//

import UIKit

struct RCTKeyCommand {
  var input: String
  var title: String
  var modifiers: [String]
}

class ResponderViewController: UIViewController {
  private var rctKeyCommands: [RCTKeyCommand] = []

  override func viewDidLoad() {
    if #available(iOS 13.0, *) {
      addKeyCommand(UIKeyCommand(
        title: "DoSomething!",
        action: #selector(didInvokeKeyEvent),
        input: "r"
      ))
    } else {
      // Fallback on earlier versions
    }
  }
  
  @objc
  func setKeyCommands() {
//    self.rctKeyCommands = commands;
  }

  @objc
  func didInvokeKeyEvent() {
    
  }
}

class ResponderView: UIView {
  private var isPresented: Bool;
  private var responderViewController: ResponderViewController;
  
  override init(frame: CGRect) {
    self.isPresented = false;
    self.responderViewController = ResponderViewController();
    super.init(frame: frame)
  }
  
  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }
  
  override func didMoveToWindow() {
    if (!self.isPresented && self.window != nil) {
      self.reactViewController().present(self.responderViewController, animated: true)
      self.isPresented = true
    }
  }
}
