//
//  CaseIterableExtension.swift
//  noyamobile
//
//  Created by Michał Sęk on 26/05/2022.
//

extension CaseIterable {
  static func from(string: String) -> Self? {
    return Self.allCases.first { string == "\($0)" }
  }
  func toString() -> String { "\(self)" }
}
