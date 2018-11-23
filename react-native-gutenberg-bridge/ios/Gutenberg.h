#import <UIKit/UIKit.h>
#import "GutenbergBridgeDelegate.h"

NS_ASSUME_NONNULL_BEGIN

@interface Gutenberg : NSObject

@property (nonatomic, weak, nullable) id<GutenbergBridgeDelegate> delegate;
@property (nonatomic, strong, readonly) UIView* rootView;

- (instancetype)initWithProps:(nullable NSDictionary<NSString *, id> *)props NS_DESIGNATED_INITIALIZER;

/**
 * Invalidates the gutenberg bridge.
 * Call this on dealloc (or deinit) to avoid retain cycles.
 */
- (void)invalidate;

#pragma mark - Messages

- (void)requestHTML;

- (void)toggleHTMLMode;

@end

NS_ASSUME_NONNULL_END
