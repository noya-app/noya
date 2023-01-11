import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { NoyaAPI } from 'noya-api';
import {
  DesignSystemConfigurationProvider,
  lightTheme,
} from 'noya-designsystem';
import { getCurrentPlatform } from 'noya-keymap';
import React, { useEffect } from 'react';
import { noyaAPI } from '../../utils/api';

const Ayon = dynamic(() => import('../../components/Ayon'), { ssr: false });

const platform =
  typeof navigator !== 'undefined' ? getCurrentPlatform(navigator) : 'key';

export default function Project(): JSX.Element {
  const {
    query: { id },
  } = useRouter();

  const [file, setFile] = React.useState<NoyaAPI.File | undefined>();

  useEffect(() => {
    if (typeof id !== 'string') return;

    noyaAPI.files.read(id).then(setFile);
  }, [id]);

  if (!file) return <div>Loading...</div>;

  return (
    <DesignSystemConfigurationProvider platform={platform} theme={lightTheme}>
      <Ayon file={file} />
    </DesignSystemConfigurationProvider>
  );
}
