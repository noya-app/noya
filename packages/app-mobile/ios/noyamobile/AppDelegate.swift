//
//  AppDelegate.swift
//  noyamobile
//
//  Created by Michał Sęk on 06/05/2022.
//

import Foundation
import UIKit

@available(iOS 13.0, *)
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

//    if #available(iOS 13.0, *) {
      rootView.backgroundColor = UIColor.systemBackground
//    } else {
//      rootView.backgroundColor = UIColor.white
//    }

    self.window = UIWindow(frame: UIScreen.main.bounds)
    let rootViewController = RootViewController()

    rootViewController.view = rootView

    self.window!.rootViewController = rootViewController
    self.window!.makeKeyAndVisible()

    return true
  }


  func applicationWillResignActive(_ application: UIApplication) {
      // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
      // Use this method to pause ongoing tasks, disable timers, and throttle down OpenGL ES frame rates. Games should use this method to pause the game.
  }

  func applicationDidEnterBackground(_ application: UIApplication) {
      // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
      // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
  }

  func applicationWillEnterForeground(_ application: UIApplication) {
      // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
  }

  func applicationDidBecomeActive(_ application: UIApplication) {
      // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
  }

  func applicationWillTerminate(_ application: UIApplication) {
      // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
  }
  
  @available(iOS 13.0, *)
  @objc func onKeyCommand(_ sender: AnyObject) {
    if let keyCommand = sender as? UIKeyCommand {
      KeyCommandRegistry.onKeyCommand(keyCommand: keyCommand)
    }
  }

  @available(iOS 13.0, *)
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

@available(iOS 13.0, *)
extension AppDelegate: RCTBridgeDelegate {
  func sourceURL(for bridge: RCTBridge!) -> URL! {
    #if DEBUG
      return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index", fallbackResource:nil)
    #else
      return Bundle.main.url(forResource:"main", withExtension:"jsbundle")
    #endif
  }
}
