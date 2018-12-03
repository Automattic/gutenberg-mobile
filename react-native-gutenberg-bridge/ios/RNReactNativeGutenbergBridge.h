#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import "GutenbergBridgeDelegate.h"

NS_ASSUME_NONNULL_BEGIN

extern NSString * const RequestHTMLMessageName;
extern NSString * const ToggleHTMLModeMessageName;
extern NSString * const UpdateHTMLMessageName;

@interface RNReactNativeGutenbergBridge : RCTEventEmitter <RCTBridgeModule>
@property (nonatomic, weak, nullable) id<GutenbergBridgeDelegate> delegate;
@end

NS_ASSUME_NONNULL_END
