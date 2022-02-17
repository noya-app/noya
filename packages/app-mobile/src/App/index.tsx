// Initialize global configurations
import 'react-native-gesture-handler';
import '@shopify/react-native-skia';
import '../utils/prepareGlobals';
import '../utils/patchFileReader';

// Lib imports
import React, { Suspense } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import {
  View,
  StatusBar,
  SafeAreaView,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';

// Local imports
import { CanvasKitProvider, FontManagerProvider } from 'noya-renderer';
import { SkiaCanvasKit } from 'noya-native-canvaskit';
import { darkTheme, lightTheme } from '../constants';
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
    // @ts-ignore
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <Suspense fallback={AppLoader}>
        {/* @ts-ignore */}
        <CanvasKitProvider CanvasKit={SkiaCanvasKit}>
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
    </ThemeProvider>
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
