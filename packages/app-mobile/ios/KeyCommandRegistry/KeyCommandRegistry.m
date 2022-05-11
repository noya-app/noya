//
//  KeyCommandRegistry.m
//  noyamobile
//
//  Created by Devin Abbott on 5/4/22.
//

#import "React/RCTViewManager.h"
#import "React/RCTEventEmitter.h"

@interface RCT_EXTERN_MODULE(KeyCommandRegistry, RCTEventEmitter)

RCT_EXTERN_METHOD(registerCommands: (NSArray *)commands)
RCT_EXTERN_METHOD(unregisterCommands: (NSArray *)commands)

@end
