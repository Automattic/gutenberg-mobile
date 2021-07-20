#!/bin/bash

set -euo pipefail

buildkite-agent artifact download bundle/android/App.js .
mkdir -p gutenberg/packages/react-native-bridge/android/react-native-bridge/build/assets
cp ./bundle/android/App.js ./gutenberg/packages/react-native-bridge/android/react-native-bridge/build/assets/index.android.bundle

pushd ./gutenberg/packages/react-native-aztec/android
./gradlew -PwillPublishReactNativeAztecBinary=true :prepareToPublishToS3 `prepare_to_publish_to_s3_params` :publish
PUBLISHED_AZTEC_VERSION=`cat ./build/published-version.txt`
echo "PUBLISHED_AZTEC_VERSION: $PUBLISHED_AZTEC_VERSION"
popd

pushd ./gutenberg/packages/react-native-bridge/android
./gradlew -PwillPublishReactNativeBridgeBinary=true -PreactNativeAztecVersion="$PUBLISHED_AZTEC_VERSION" :react-native-bridge:prepareToPublishToS3 `prepare_to_publish_to_s3_params` :react-native-bridge:publish
