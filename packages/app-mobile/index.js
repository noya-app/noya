import { AppRegistry } from 'react-native';
import 'fastestsmallesttextencoderdecoder';

import { name as appName } from './app.json';
// eslint-disable-next-line
import App from './src/App';

// eslint-disable-next-line
if (__DEV__) {
  require('react-native-performance-flipper-reporter').setupDefaultFlipperReporter();
}

AppRegistry.registerComponent(appName, () => App);
