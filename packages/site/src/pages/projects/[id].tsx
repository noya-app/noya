import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { NoyaAPI, useNoyaBilling, useNoyaClient, useNoyaFiles } from 'noya-api';
import {
  DesignSystemConfigurationProvider,
  Divider,
  lightTheme,
  Stack,
  useDesignSystemTheme,
} from 'noya-designsystem';
import { Size } from 'noya-geometry';
import { getCurrentPlatform } from 'noya-keymap';
import { amplitude } from 'noya-log';
import { SketchFile } from 'noya-sketch-file';
import { debounce } from 'noya-utils';
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ProjectTitle } from '../../components/ProjectTitle';
import {
  getSubscriptionOverage,
  SubscriptionUsageMeterSmall,
  usageMeterThreshold,
} from '../../components/Subscription';

import { Toolbar } from '../../components/Toolbar';
import {
  ProjectContextValue,
  ProjectProvider,
} from '../../contexts/ProjectContext';
import { downloadUrl } from '../../utils/download';

const Ayon = dynamic(() => import('../../components/Ayon'), { ssr: false });

function FileTitle({ id }: { id: string }) {
  const files = useNoyaFiles();
  const cachedFile = files.find((file) => file.id === id);

  if (!cachedFile) return null;

  return <ProjectTitle>{cachedFile.data.name}</ProjectTitle>;
}

function FileEditor({ id }: { id: string }) {
  const client = useNoyaClient();
  const files = useNoyaFiles();
  const cachedFile = files.find((file) => file.id === id);
  const fileProperties = useMemo(() => {
    if (!cachedFile) return undefined;
    const { document: design, ...rest } = cachedFile.data;
    return rest;
  }, [cachedFile]);

  // The Ayon component is a controlled component that manages its own state
  const [initialFile, setInitialFile] = useState<NoyaAPI.File | undefined>();

  useEffect(() => {
    // Load the latest version of this file from the server
    client.files.read(id).then(setInitialFile);
  }, [client, id]);

  const updateDebounced = useMemo(
    () => debounce(client.files.update, 250, { maxWait: 1000 }),
    [client],
  );

  const updateDocument = useCallback(
    (document: SketchFile) => {
      if (
        fileProperties?.name === undefined ||
        fileProperties.schemaVersion === undefined ||
        fileProperties.type === undefined
      )
        return;

      updateDebounced(id, {
        name: fileProperties.name,
        schemaVersion: fileProperties.schemaVersion,
        type: fileProperties.type,
        document,
      });
    },
    [
      id,
      updateDebounced,
      fileProperties?.name,
      fileProperties?.schemaVersion,
      fileProperties?.type,
    ],
  );

  const updateName = useCallback(
    async (newName: string) => {
      if (!cachedFile) return;

      if (!newName) return;

      const data = { ...cachedFile.data, name: newName };

      client.files.update(cachedFile.id, data);
    },
    [cachedFile, client.files],
  );

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (!updateDebounced.pending()) return;

      updateDebounced.flush();

      const message = "Your edits haven't finished syncing. Are you sure?";

      event.preventDefault();
      event.returnValue = message;
      return message;
    };

    window.addEventListener('beforeunload', handler, { capture: true });

    return () => {
      window.removeEventListener('beforeunload', handler, { capture: true });
    };
  }, [updateDebounced]);

  const uploadAsset = async (file: ArrayBuffer) => {
    const fileId = await client.assets.create(file, id);

    return client.assets.url(fileId);
  };

  const downloadFile = useCallback(
    async (format: NoyaAPI.ExportFormat, size: Size, name: string) => {
      const url = client.files.download.url(id, format, size);
      downloadUrl(url, name);
    },
    [id, client.files.download],
  );

  if (!initialFile || !cachedFile) return null;

  return (
    <Ayon
      fileId={id}
      canvasRendererType="svg"
      padding={20}
      uploadAsset={uploadAsset}
      name={cachedFile.data.name}
      initialDocument={initialFile.data.document}
      onChangeDocument={updateDocument}
      onChangeName={updateName}
      downloadFile={downloadFile}
    />
  );
}

function Content() {
  const { query } = useRouter();
  const files = useNoyaFiles();
  const { subscriptions, availableProducts } = useNoyaBilling();

  const overageItems = getSubscriptionOverage(
    files,
    subscriptions,
    availableProducts,
    usageMeterThreshold,
  );

  const overageItem = overageItems.sort(
    (a, b) => b.count / b.limit - a.count / a.limit,
  )[0];

  const id = query.id as string | undefined;
  const theme = useDesignSystemTheme();
  const [leftToolbar, setLeftToolbar] = useState<ReactNode>(null);
  const [rightToolbar, setRightToolbar] = useState<ReactNode>(null);
  const [centerToolbar, setCenterToolbar] = useState<ReactNode>(null);

  const project: ProjectContextValue = useMemo(
    () => ({ setLeftToolbar, setCenterToolbar, setRightToolbar }),
    [],
  );

  if (!id) return null;

  return (
    <ProjectProvider value={project}>
      <Stack.V flex="1" background={theme.colors.canvas.background}>
        <Toolbar
          right={rightToolbar}
          left={
            overageItem ? (
              <>
                <SubscriptionUsageMeterSmall item={overageItem} />
                {leftToolbar}
              </>
            ) : (
              leftToolbar
            )
          }
        >
          {centerToolbar || <FileTitle id={id} />}
        </Toolbar>
        <Divider variant="strong" />
        <FileEditor id={id} />
      </Stack.V>
    </ProjectProvider>
  );
}

const platform =
  typeof navigator !== 'undefined' ? getCurrentPlatform(navigator) : 'key';

export default function Project(): JSX.Element {
  useEffect(() => {
    amplitude.logEvent('Project - Opened');
  }, []);

  return (
    <DesignSystemConfigurationProvider platform={platform} theme={lightTheme}>
      <Content />
    </DesignSystemConfigurationProvider>
  );
}
