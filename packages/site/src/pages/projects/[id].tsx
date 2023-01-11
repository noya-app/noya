import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { noyaAPI, NoyaAPI } from '../../utils/api';

const Ayon = dynamic(() => import('../../components/Ayon'), { ssr: false });

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

  return <Ayon file={file} />;
}
