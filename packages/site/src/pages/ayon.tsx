import dynamic from 'next/dynamic';
import React from 'react';

const App = dynamic(() => import('../components/Ayon'), { ssr: false });

export default function Test(): JSX.Element {
  return <App />;
}
