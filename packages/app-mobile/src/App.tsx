// Initialize global configurations
import 'react-native-gesture-handler';
import '@shopify/react-native-skia';
import './utils/prepareGlobals';

// Lib imports
import React from 'react';
import styled, { ThemeProvider } from 'styled-components/native';
import { StatusBar, SafeAreaView, useColorScheme } from 'react-native';

// Local imports
// import { CanvasKitProvider } from 'noya-renderer';
// import useAppState from './hooks/useAppState';
import { darkTheme, lightTheme } from './constants';

const Contents = () => {
  // const appState = useAppState();

  return (
    <ContentContainer>
      <Placeholder>It's working!</Placeholder>
    </ContentContainer>
  );
};

const App = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <AppWrapper>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <Contents />
      </AppWrapper>
    </ThemeProvider>
  );
};

export default App;

const AppWrapper = styled(SafeAreaView)((_props) => ({
  flex: 1,
}));

const ContentContainer = styled.View((p) => ({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: p.theme.colors.neutralBackground,
}));

const Placeholder = styled.Text((p) => ({
  fontSize: 24,
  color: p.theme.colors.text,
}));
