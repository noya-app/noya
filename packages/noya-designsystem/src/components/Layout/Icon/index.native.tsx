import React from 'react';
import { createIconSetFromIcoMoon } from 'react-native-vector-icons';

import icoMoonConfig from 'app-mobile/assets/fonts/icomoon/selection.json';

const Icon = createIconSetFromIcoMoon(icoMoonConfig, 'icomoon', 'icomoon.ttf');

export default React.memo(Icon);
