import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { NoyaAPI } from 'noya-api';
import { Size } from 'noya-geometry';
import React, { memo } from 'react';
import { ViewType } from '../ayon/types';

const AyonDynamic = dynamic(() => import('./Ayon').then((mod) => mod.Ayon), {
  ssr: false,
});

const DSEditorDynamic = dynamic(
  () => import('../dseditor/DSEditor').then((mod) => mod.DSEditor),
  { ssr: false },
);

type Props = {
  initialFile: NoyaAPI.File | NoyaAPI.SharedFile;
  nameOverride?: string;
  viewType: ViewType;
  uploadAsset?: (file: ArrayBuffer) => Promise<string>;
  onChangeName?: (name: string) => void;
  onChangeDocument?: (document: NoyaAPI.Document) => void;
  downloadFile?: (type: NoyaAPI.ExportFormat, size: Size, name: string) => void;
};

export const ProjectEditor = memo(function ProjectEditor({
  initialFile,
  nameOverride,
  ...props
}: Props) {
  const { query } = useRouter();

  switch (initialFile.data.type) {
    case 'io.noya.ayon':
      return (
        <AyonDynamic
          name={nameOverride ?? initialFile.data.name}
          initialDocument={initialFile.data.document}
          padding={props.viewType === 'preview' ? 0 : 20}
          fileId={initialFile.id}
          canvasRendererType="svg"
          {...props}
        />
      );
    case 'io.noya.ds':
      return (
        <DSEditorDynamic
          name={nameOverride ?? initialFile.data.name}
          initialDocument={initialFile.data.document}
          initialComponentId={query.component as string | undefined}
          {...props}
        />
      );
    default:
      return null;
  }
});
