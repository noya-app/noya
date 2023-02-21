import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { NoyaAPI, useNoyaBilling, useNoyaClient, useNoyaFiles } from 'noya-api';
import {
  Button,
  DesignSystemConfigurationProvider,
  Divider,
  lightTheme,
  Spacer,
  Stack,
  useDesignSystemTheme,
} from 'noya-designsystem';
import { Size } from 'noya-geometry';
import { StarFilledIcon } from 'noya-icons';
import { getCurrentPlatform } from 'noya-keymap';
import { amplitude } from 'noya-log';
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
import { UpgradeDialog } from '../../components/UpgradeDialog';
import { OnboardingProvider } from '../../contexts/OnboardingContext';
import {
  ProjectContextValue,
  ProjectProvider,
} from '../../contexts/ProjectContext';
import { downloadUrl } from '../../utils/download';

const Ayon = dynamic(() => import('../../components/Ayon'), { ssr: false });

function FileTitle({ id }: { id: string }) {
  const { files } = useNoyaFiles();
  const cachedFile = files.find((file) => file.id === id);

  if (!cachedFile) return null;

  return <ProjectTitle>{cachedFile.data.name}</ProjectTitle>;
}

function FileEditor({ fileId }: { fileId: string }) {
  const router = useRouter();
  const client = useNoyaClient();
  const { files } = useNoyaFiles();
  const cachedFile = files.find((file) => file.id === fileId);

  // The Ayon component is a controlled component that manages its own state
  const [initialFile, setInitialFile] = useState<NoyaAPI.File | undefined>();

  useEffect(() => {
    // Load the latest version of this file from the server
    client.files.read(fileId).then(setInitialFile);
  }, [client, fileId]);

  const updateFileDocumentDebounced = useMemo(
    () => debounce(client.files.updateFileDocument, 250, { maxWait: 1000 }),
    [client],
  );

  const updateName = useCallback(
    async (newName: string) => {
      if (!newName) return;

      client.files.updateFileName(fileId, newName);
    },
    [client.files, fileId],
  );

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (window.noyaPageWillReload) return;

      if (!updateFileDocumentDebounced.pending()) return;

      updateFileDocumentDebounced.flush();

      const message = "Your edits haven't finished syncing. Are you sure?";

      event.preventDefault();
      event.returnValue = message;
      return message;
    };

    window.addEventListener('beforeunload', handler, { capture: true });

    return () => {
      window.removeEventListener('beforeunload', handler, { capture: true });
    };
  }, [updateFileDocumentDebounced]);

  const uploadAsset = async (file: ArrayBuffer) => {
    const assetId = await client.assets.create(file, fileId);

    return client.assets.url(assetId);
  };

  const downloadFile = useCallback(
    async (format: NoyaAPI.ExportFormat, size: Size, name: string) => {
      const url = client.files.download.url(fileId, format, size);
      downloadUrl(url, name);
    },
    [fileId, client.files.download],
  );

  const duplicateFile = useCallback(() => {
    updateFileDocumentDebounced.flush();

    router.push(`/projects/${fileId}/duplicate`);
  }, [fileId, router, updateFileDocumentDebounced]);

  const onChangeDocument = useCallback(
    (document: NoyaAPI.FileData['document']) =>
      updateFileDocumentDebounced(fileId, document),
    [fileId, updateFileDocumentDebounced],
  );

  if (!initialFile || !cachedFile) return null;

  return (
    <Ayon
      fileId={fileId}
      canvasRendererType="svg"
      padding={20}
      uploadAsset={uploadAsset}
      name={cachedFile.data.name}
      initialDocument={initialFile.data.document}
      onChangeDocument={onChangeDocument}
      onChangeName={updateName}
      onDuplicate={duplicateFile}
      downloadFile={downloadFile}
    />
  );
}

function Content({ fileId }: { fileId: string }) {
  const { files } = useNoyaFiles();
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

  const theme = useDesignSystemTheme();
  const [leftToolbar, setLeftToolbar] = useState<ReactNode>(null);
  const [rightToolbar, setRightToolbar] = useState<ReactNode>(null);
  const [centerToolbar, setCenterToolbar] = useState<ReactNode>(null);

  const project: ProjectContextValue = useMemo(
    () => ({ setLeftToolbar, setCenterToolbar, setRightToolbar }),
    [],
  );

  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  return (
    <OnboardingProvider>
      <ProjectProvider value={project}>
        <Stack.V flex="1" background={theme.colors.canvas.background}>
          <Toolbar
            right={rightToolbar}
            left={
              overageItem ? (
                <>
                  <SubscriptionUsageMeterSmall
                    item={overageItem}
                    onClick={() => {
                      setShowUpgradeDialog(true);
                    }}
                  />
                  {leftToolbar}
                </>
              ) : (
                leftToolbar
              )
            }
            subscribeButton={
              <Button
                onClick={() => {
                  setShowUpgradeDialog(true);
                }}
              >
                Get Noya Pro
                <Spacer.Horizontal inline size={4} />
                <StarFilledIcon color="#fec422" />
              </Button>
            }
          >
            {centerToolbar || <FileTitle id={fileId} />}
          </Toolbar>
          <Divider variant="strong" />
          <FileEditor fileId={fileId} />
        </Stack.V>
        {showUpgradeDialog && (
          <UpgradeDialog
            showUpgradeDialog={showUpgradeDialog}
            setShowUpgradeDialog={setShowUpgradeDialog}
            availableProducts={availableProducts}
          />
        )}
      </ProjectProvider>
    </OnboardingProvider>
  );
}

const platform =
  typeof navigator !== 'undefined' ? getCurrentPlatform(navigator) : 'key';

export default function Project(): JSX.Element {
  const { query } = useRouter();
  const id = query.id as string | undefined;

  useEffect(() => {
    amplitude.logEvent('Project - Opened');
  }, []);

  if (!id) return <></>;

  return (
    <DesignSystemConfigurationProvider platform={platform} theme={lightTheme}>
      <Content fileId={id} />
    </DesignSystemConfigurationProvider>
  );
}
