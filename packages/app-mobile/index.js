import { AppRegistry } from 'react-native';

import { setPlaform, PlatformName } from 'noya-utils';
import { name as appName } from './app.json';
// eslint-disable-next-line
import App from './src/App';

setPlaform(PlatformName.Native);
AppRegistry.registerComponent(appName, () => App);
