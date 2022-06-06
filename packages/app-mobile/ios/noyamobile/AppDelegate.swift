//
//  AppDelegate.swift
//  noyamobile
//
//  Created by Michał Sęk on 06/05/2022.
//

import Foundation
import UIKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate, KeyCommandable {
  var window: UIWindow?
  override var keyCommands: [UIKeyCommand] {
    return KeyCommandRegistry.allMenulessCommands()
  }

  @objc
  func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    let bridge = RCTBridge(delegate: self, launchOptions: launchOptions)!
    let rootView = RCTRootView(bridge: bridge, moduleName: "noyamobile", initialProperties: nil)

    rootView.backgroundColor = UIColor.systemBackground

    self.window = UIWindow(frame: UIScreen.main.bounds)
    let rootViewController = RootViewController()

    rootViewController.view = rootView

    self.window!.rootViewController = rootViewController
    self.window!.makeKeyAndVisible()

    return true
  }

  @objc func onKeyCommand(_ sender: AnyObject) {
    if let keyCommand = sender as? UIKeyCommand {
      KeyCommandRegistry.onKeyCommand(keyCommand: keyCommand)
    }
  }

  override func buildMenu(with builder: UIMenuBuilder) {
    super.buildMenu(with: builder)

    guard builder.system == .main else { return }

    builder.remove(menu: .file)
    builder.remove(menu: .edit)
    builder.remove(menu: .format)
    builder.remove(menu: .view)
    builder.remove(menu: .window)
    builder.remove(menu: .help)

    let commands = KeyCommandRegistry.allMenuCommands()
    let menuNames = commands.keys.sorted { $0 < $1 }

    // Helper variable to insert the menus in correct order
    var prevMenuIdentifier: UIMenu.Identifier = .application

    menuNames.forEach({ menuName in
      let commandList = commands[menuName]!
      let menuIdentifier = UIMenu.Identifier("noyamobile.menusystem.\(menuName)")

      let menu = UIMenu(
        title: menuName,
        image: nil,
        identifier: menuIdentifier,
        options: [],
        children: commandList.sorted { $0.title < $1.title }
      )

      builder.insertSibling(menu, afterMenu: prevMenuIdentifier)
      prevMenuIdentifier = menuIdentifier
    })
  }
}

extension AppDelegate: RCTBridgeDelegate {
  func sourceURL(for bridge: RCTBridge!) -> URL! {
    #if DEBUG
      return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index", fallbackResource:nil)
    #else
      return Bundle.main.url(forResource:"main", withExtension:"jsbundle")
    #endif
  }
}
