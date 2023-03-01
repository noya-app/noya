import { NoyaAPI, NoyaAPIProvider } from 'noya-api';
import React, { useEffect, useState } from 'react';
import { networkClientThatThrows } from '../utils/noyaClient';
import { Analytics } from './Analytics';

export function OptionalNoyaAPIProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [client, setClient] = useState<NoyaAPI.Client | undefined>();

  useEffect(() => {
    async function main() {
      try {
        if (!networkClientThatThrows) return;
        await networkClientThatThrows.auth.session();
        setClient(
          new NoyaAPI.Client({ networkClient: networkClientThatThrows }),
        );
      } catch {
        // Ignore
      }
    }

    main();
  }, []);

  if (client) {
    return (
      <NoyaAPIProvider value={client}>
        <Analytics>{children}</Analytics>
      </NoyaAPIProvider>
    );
  } else {
    return <>{children}</>;
  }
}
