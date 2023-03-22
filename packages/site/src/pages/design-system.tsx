import { GetServerSidePropsContext } from 'next';
import React from 'react';
import { blockMetadata } from '../ayon/blocks/blockMetadata';
import { avatarSymbolId } from '../ayon/blocks/symbolIds';
import { DesignSystemExplorer } from '../docs/DesignSystemExplorer';

const blockInstances = Object.entries(blockMetadata);

blockInstances.unshift([
  avatarSymbolId,
  {
    name: 'Avatar with name',
    category: 'element',
    preferredBlockText: 'Devin Abbott',
    preferredSize: {
      width: 36,
      height: 36,
    },
  },
]);

export default function DesignSystem({
  designSystemId,
}: {
  designSystemId: string;
}) {
  return (
    <DesignSystemExplorer
      blockInstances={blockInstances}
      designSystemId={designSystemId}
    />
  );
}

export function getServerSideProps(context: GetServerSidePropsContext) {
  return {
    props: {
      designSystemId: context.query.id ?? 'chakra',
    },
  };
}
