import {
  Button,
  CompletionItem,
  DesignSystemConfigurationProvider,
  Divider,
  DropdownMenu,
  ExtractMenuItemType,
  IconButton,
  Spacer,
  Stack,
  createSectionedMenu,
  darkTheme,
  lightTheme,
  useDesignSystemTheme,
} from '@noya-app/noya-designsystem';
import { Size } from '@noya-app/noya-geometry';
import { StarFilledIcon } from '@noya-app/noya-icons';
import {
  getCurrentPlatform,
  useKeyboardShortcuts,
} from '@noya-app/noya-keymap';
import { debounce } from '@noya-app/noya-utils';
import { useRouter } from 'next/router';
import { NoyaAPI, useNoyaBilling, useNoyaClient, useNoyaFiles } from 'noya-api';
import { amplitude } from 'noya-log';
import React, {
  ReactNode,
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import {
  BreadcrumbLink,
  BreadcrumbSlash,
  BreadcrumbText,
} from '../../components/Breadcrumbs';
import { CommandPalette } from '../../components/CommandPalette';
import { Debugger } from '../../components/Debugger';
import { EditableText, IEditableText } from '../../components/EditableText';
import { ProjectEditor } from '../../components/ProjectEditor';
import { ProjectTypeIcon } from '../../components/ProjectTypeIcon';
import { ShareProjectButton } from '../../components/ShareMenu';
import {
  SubscriptionUsageMeterSmall,
  getSubscriptionOverage,
  usageMeterThreshold,
} from '../../components/Subscription';
import { Toolbar } from '../../components/Toolbar';
import { UpgradeDialog } from '../../components/UpgradeDialog';
import { OnboardingProvider } from '../../contexts/OnboardingContext';
import {
  ProjectContextValue,
  ProjectProvider,
} from '../../contexts/ProjectContext';
import {
  useIsSubscribed,
  useOnboardingUpsell,
} from '../../hooks/useOnboardingUpsellExperiment';
import { usePersistentState } from '../../utils/clientStorage';
import { downloadUrl } from '../../utils/download';

const FileTitle = memo(
  forwardRef(function FileTitle(
    { fileId, href }: { fileId: string; href: string },
    forwardedRef: React.ForwardedRef<IEditableText>,
  ) {
    const client = useNoyaClient();
    const { files } = useNoyaFiles();
    const cachedFile = files.find((file) => file.id === fileId);
    const handleChange = useCallback(
      (value: string) => client.files.updateFileName(fileId, value),
      [client.files, fileId],
    );

    if (!cachedFile) return null;

    return (
      <Stack.H lineHeight="1" alignItems="center" justifyContent="center">
        <ProjectTypeIcon type={cachedFile.data.type} />
        <Spacer.Horizontal size={6} />
        <Stack.H position="relative">
          <EditableText
            ref={forwardedRef}
            value={cachedFile.data.name}
            placeholder="Untitled"
            onChange={handleChange}
            href={href}
          />
        </Stack.H>
      </Stack.H>
    );
  }),
);

type IFileEditor = {
  duplicateFile: () => void;
};

const FileEditor = memo(
  forwardRef(function FileEditor(
    { fileId }: { fileId: string },
    forwardedRef: React.ForwardedRef<IFileEditor>,
  ) {
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
        // if (!newName) return;

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

    useImperativeHandle(forwardedRef, () => ({
      duplicateFile,
    }));

    if (!initialFile || !cachedFile) return null;

    return (
      <ProjectEditor
        nameOverride={cachedFile.data.name}
        onChangeName={updateName}
        initialFile={initialFile}
        onChangeDocument={onChangeDocument}
        uploadAsset={uploadAsset}
        downloadFile={downloadFile}
        viewType="editable"
      />
    );
  }),
);

const Content = memo(function Content({ fileId }: { fileId: string }) {
  const theme = useDesignSystemTheme();
  const [leftToolbar, setLeftToolbar] = useState<ReactNode>(null);
  const [rightToolbar, setRightToolbar] = useState<ReactNode>(null);
  const [centerToolbar, setCenterToolbar] = useState<ReactNode>(null);
  const [projectPath, setProjectPath] = useState<string | undefined>(undefined);
  const [commandPaletteItems, setCommandPaletteItems] = useState<
    CompletionItem[]
  >([]);
  const [commandPaletteHandler, setCommandPaletteHandler] = useState<
    ((item: CompletionItem) => void) | undefined
  >(undefined);

  const project: ProjectContextValue = useMemo(
    () => ({
      setLeftToolbar,
      setCenterToolbar,
      setRightToolbar,
      setProjectPath,
      setCommandPalette: (items, handler) => {
        setCommandPaletteItems(items);
        setCommandPaletteHandler(() => handler);
      },
    }),
    [],
  );

  const handleSelectCommandPaletteItem = useCallback(
    (item: CompletionItem) => {
      setShowCommandPalette(false);
      commandPaletteHandler?.(item);
    },
    [commandPaletteHandler],
  );

  const fileNameRef = React.useRef<IEditableText>(null);
  const fileEditorRef = React.useRef<IFileEditor>(null);
  const fileMenu = useMemo(
    () =>
      createSectionedMenu([
        { value: 'rename', title: 'Rename' },
        { value: 'duplicate', title: 'Duplicate Project' },
      ]),
    [],
  );

  const willRenameRef = React.useRef(false);

  const handleSelect = useCallback(
    (value: ExtractMenuItemType<(typeof fileMenu)[number]>) => {
      switch (value) {
        case 'rename':
          willRenameRef.current = true;
          fileNameRef.current?.startEditing();
          break;
        case 'duplicate':
          fileEditorRef.current?.duplicateFile();
          break;
      }
    },
    [fileEditorRef],
  );

  const [showCommandPalette, setShowCommandPalette] = useState(false);

  useKeyboardShortcuts({
    'Mod-shift-p': () => {
      setShowCommandPalette(!showCommandPalette);
    },
  });

  return (
    <OnboardingProvider>
      <ProjectProvider value={project}>
        <Stack.V flex="1" background={theme.colors.canvas.background}>
          <Toolbar
            right={rightToolbar || <ShareProjectButton fileId={fileId} />}
            left={
              leftToolbar
              // billing.hasOverage ? (
              //   <>
              //     {billing.usageMeter}
              //     {leftToolbar}
              //   </>
              // ) : (
              //   leftToolbar
              // )
            }
            // subscribeButton={billing.subscribeButton}
          >
            {centerToolbar || (
              <Stack.H gap="4px" alignItems="center">
                <BreadcrumbLink href="/">All Projects</BreadcrumbLink>
                <BreadcrumbSlash />
                <FileTitle
                  ref={fileNameRef}
                  fileId={fileId}
                  href={`/projects/${fileId}`}
                />
                <DropdownMenu
                  items={fileMenu}
                  onSelect={handleSelect}
                  onCloseAutoFocus={(event) => {
                    if (!willRenameRef.current) return;

                    event.preventDefault();
                    willRenameRef.current = false;
                  }}
                >
                  <IconButton iconName="CaretDownIcon" />
                </DropdownMenu>
                {projectPath && (
                  <Stack.H gap="4px" alignItems="center" margin="0 0 0 -4px">
                    <BreadcrumbSlash />
                    <BreadcrumbText>{projectPath}</BreadcrumbText>
                  </Stack.H>
                )}
              </Stack.H>
            )}
          </Toolbar>
          <Divider variant="strong" />
          <FileEditor ref={fileEditorRef} fileId={fileId} />
        </Stack.V>
        <CommandPalette
          items={commandPaletteItems}
          showCommandPalette={showCommandPalette}
          setShowCommandPalette={setShowCommandPalette}
          onSelect={handleSelectCommandPaletteItem}
        />
        {/* {billing.upgradeDialog} */}
      </ProjectProvider>
    </OnboardingProvider>
  );
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function useBilling() {
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

  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  const isSubscribed = useIsSubscribed();

  useOnboardingUpsell({
    onShow: () => setShowUpgradeDialog(true),
  });

  return {
    hasOverage: !!overageItem,
    upgradeDialog: showUpgradeDialog && (
      <UpgradeDialog
        showUpgradeDialog={showUpgradeDialog}
        setShowUpgradeDialog={setShowUpgradeDialog}
        availableProducts={availableProducts}
      />
    ),
    usageMeter: (
      <SubscriptionUsageMeterSmall
        item={overageItem}
        onClick={() => {
          setShowUpgradeDialog(true);
        }}
      />
    ),
    subscribeButton: !isSubscribed && (
      <Button
        onClick={() => {
          setShowUpgradeDialog(true);
        }}
      >
        Get Noya Pro
        <Spacer.Horizontal inline size={6} />
        <StarFilledIcon color="#fec422" />
      </Button>
    ),
  };
}

const platform =
  typeof navigator !== 'undefined' ? getCurrentPlatform(navigator) : 'key';

export default memo(function Project(): JSX.Element {
  const { query } = useRouter();
  const id = query.id as string | undefined;

  useEffect(() => {
    amplitude.logEvent('Project - Opened');
  }, []);

  const [colorScheme] = usePersistentState<'light' | 'dark'>(
    'noyaPrefersColorScheme',
  );
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  if (!id) return <></>;

  return (
    <DesignSystemConfigurationProvider platform={platform} theme={theme}>
      <Content fileId={id} />
      <Debugger />
    </DesignSystemConfigurationProvider>
  );
});
