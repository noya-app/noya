// Initialize global configurations
import 'react-native-gesture-handler';
import '@shopify/react-native-skia';
import '../utils/prepareGlobals';
import '../utils/patchFileReader';

// Lib imports
import React, { Suspense } from 'react';
import styled from 'styled-components';
import {
  View,
  Platform,
  StatusBar,
  SafeAreaView,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';

// Local imports
import { getCurrentPlatform } from 'noya-keymap';
import { CanvasKitNative } from 'noya-native-canvaskit';
import { DesignSystemConfigurationProvider } from 'noya-ui';
import { CanvasKitProvider, FontManagerProvider } from 'noya-renderer';
import { darkTheme, lightTheme } from 'noya-designsystem';
import AppContent from './AppContent';

const App: React.FC<{}> = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const AppLoader = (
    <ContentContainer>
      <AppSpinner size="large" />
    </ContentContainer>
  );

  return (
    <DesignSystemConfigurationProvider
      platform={
        Platform.OS === 'web' ? getCurrentPlatform(navigator) : Platform.OS
      }
      // @ts-ignore
      theme={isDarkMode ? darkTheme : lightTheme}
    >
      <Suspense fallback={AppLoader}>
        {/* @ts-ignore */}
        <CanvasKitProvider CanvasKit={CanvasKitNative}>
          <FontManagerProvider>
            <AppWrapper>
              <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
              />
              <AppContent />
            </AppWrapper>
          </FontManagerProvider>
        </CanvasKitProvider>
      </Suspense>
    </DesignSystemConfigurationProvider>
  );
};

export default App;

const AppWrapper = styled(SafeAreaView)((_props) => ({
  flex: 1,
}));

const ContentContainer = styled(View)((p) => ({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: p.theme.colors.sidebar.background,
}));

const AppSpinner = styled(ActivityIndicator)((p) => ({
  color: p.theme.colors.text,
}));
