import { Small, Spacer, Stack, useDesignSystemTheme } from 'noya-designsystem';
import React, { useEffect, useState } from 'react';
import { noyaAPI, NoyaAPI } from '../utils/api';

export function Toolbar() {
  const theme = useDesignSystemTheme();
  const [session, setSession] = useState<NoyaAPI.Session | undefined>();

  useEffect(() => {
    noyaAPI.auth.session().then(setSession);
  }, []);

  return (
    <Stack.H
      background={theme.colors.sidebar.background}
      flex={`0 0 ${theme.sizes.toolbar.height}px`}
      alignItems="center"
      padding={'0 20px'}
    >
      <Spacer.Horizontal />
      <Small color="text">{session?.user.name ?? session?.user.email}</Small>
    </Stack.H>
  );
}