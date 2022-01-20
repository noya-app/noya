import 'react-native-gesture-handler';
import '@shopify/react-native-skia';
import React, { useEffect } from 'react';
import { decode, encode } from 'base-64';
import {
  SafeAreaView,
  StatusBar,
  useColorScheme,
  View,
  Text,
} from 'react-native';

if (!global.btoa) {
  global.btoa = encode;
}

if (!global.atob) {
  global.atob = decode;
}

// eslint-disable-next-line
import { createInitialWorkspaceState, createSketchFile } from 'noya-state';

// eslint-disable-next-line
import { Theme } from './constants';

const App = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const backgroundStyle = {
    flex: 1,
    backgroundColor: Theme[colorScheme ?? 'light'].backgroundColor,
  };

  useEffect(() => {
    // eslint-disable-next-line
    console.log('before effects!');

    const sketchFile = createSketchFile();

    // eslint-disable-next-line
    console.log({ sketchFile });

    const workspaceState = createInitialWorkspaceState(sketchFile);

    // eslint-disable-next-line
    console.log({ workspaceState });

    // eslint-disable-next-line
    console.log('after effects!');
  }, []);

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text
          style={{
            fontSize: 24,
            color: Theme[colorScheme ?? 'light'].textColor,
          }}
        >
          It's working!
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default App;
