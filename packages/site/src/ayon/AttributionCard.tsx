import Link from 'next/link';
import React from 'react';
import { Attribution } from './resolve/RandomImageResolver';

function AttributionLink({ url, children }: { url: string; children: string }) {
  return (
    <Link href={url} passHref>
      <a
        style={{ textDecoration: 'underline' }}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    </Link>
  );
}

export function AttributionCard({ user, source }: Attribution) {
  return (
    <>
      Photo by <AttributionLink url={user.url}>{user.name}</AttributionLink> on{' '}
      <AttributionLink url={source.url}>{source.name}</AttributionLink>
    </>
  );
}
