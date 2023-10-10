import Sketch from 'noya-file-format';
import React from 'react';
import { InspectorSection } from '../../../components/InspectorSection';
import { AyonPageSizeInspectorRow } from './AyonPageSizeInspectorRow';

interface Props {
  selectedArtboards: Sketch.Artboard[];
}

export const AyonPageInspector = function AyonPageInspector({
  selectedArtboards,
}: Props) {
  return (
    <>
      <InspectorSection title="Page" titleTextStyle="heading3">
        <AyonPageSizeInspectorRow artboard={selectedArtboards[0]} />
      </InspectorSection>
    </>
  );
};
