import {
  closestCenter,
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import produce from 'immer';
import {
  useApplicationState,
  useDispatch,
  useSelector,
} from 'noya-app-state-context';
import {
  darkTheme,
  DesignSystemConfigurationProvider,
  Divider,
  InputField,
  lightTheme,
  ScrollArea,
  Spacer,
} from 'noya-designsystem';
import { doubleClickToolbar } from 'noya-embedded';
import { Point } from 'noya-geometry';
import { MagnifyingGlassIcon } from 'noya-icons';
import { useCanvasKit } from 'noya-renderer';
import { getIsEditingBitmap, Selectors, WorkspaceTab } from 'noya-state';
import { memo, ReactNode, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { AutoSizer } from '../components/AutoSizer';
import { DialogProvider } from '../contexts/DialogContext';
import { useEnvironmentParameter } from '../hooks/useEnvironmentParameters';
import useSystemColorScheme from '../hooks/useSystemColorScheme';
import {
  bitmapTemplates,
  BitmapTemplates,
  DraggableBitmapTemplateItem,
} from './BitmapTemplates';
import Canvas from './Canvas';
import Inspector from './Inspector';
import LayerList from './LayerList';
import Menubar from './Menubar';
import PageList from './PageList';
import PagesGrid from './PagesGrid';
import ThemeGroups from './ThemeGroups';
import ThemeInspector from './ThemeInspector';
import ThemeToolbar from './ThemeToolbar';
import ThemeWindow from './ThemeWindow';
import Toolbar from './Toolbar';

const BACKDROP_FILTER = 'blur(10px)';

const LeftSidebar = styled.div(({ theme }) => ({
  flex: `0 0 ${theme.sizes.sidebarWidth}px`,
  maxWidth: `${theme.sizes.sidebarWidth}px`,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.colors.sidebar.background,
  color: theme.colors.textMuted,
  WebkitBackdropFilter: BACKDROP_FILTER,
  backdropFilter: BACKDROP_FILTER,
}));

const LeftSidebarBorderedContent = styled.div(({ theme }) => ({
  flex: '1 1 0',
  borderRight: `1px solid ${theme.colors.dividerStrong}`,
  display: 'flex',
  flexDirection: 'column',
}));

const RightSidebar = styled.div(({ theme }) => ({
  flex: `0 0 ${theme.sizes.sidebarWidth}px`,
  maxWidth: `${theme.sizes.sidebarWidth}px`,
  borderLeft: `1px solid ${theme.colors.dividerStrong}`,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.colors.sidebar.background,
  color: theme.colors.textMuted,
  WebkitBackdropFilter: BACKDROP_FILTER,
  backdropFilter: BACKDROP_FILTER,
}));

const MainView = styled.main(({ theme }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'column',
}));

const ContentArea = styled.div(({ theme }) => ({
  flex: '1',
  display: 'flex',
}));

const FilterContainer = styled.div(({ theme }) => ({
  minHeight: '32px',
  marginLeft: '8px',
  marginRight: '8px',
  display: 'flex',
}));

const ToolbarContainer = styled.header(({ theme }) => ({
  minHeight: `${theme.sizes.toolbar.height}px`,
  display: 'flex',
  borderBottom: `1px solid ${theme.colors.dividerStrong}`,
  alignItems: 'center',
  backgroundColor: theme.colors.sidebar.background,
  color: theme.colors.textMuted,
  WebkitBackdropFilter: BACKDROP_FILTER,
  backdropFilter: BACKDROP_FILTER,
  WebkitAppRegion: 'drag',
}));

const MenubarContainer = styled.header<{ showApplicationMenu: boolean }>(
  ({ theme, showApplicationMenu }) => ({
    minHeight: `${
      theme.sizes.toolbar.height - (showApplicationMenu ? 8 : 0)
    }px`,
    display: 'flex',
    flexDirection: 'column',
    borderBottom: `1px solid ${
      showApplicationMenu ? 'transparent' : theme.colors.dividerStrong
    }`,
    borderRight: `1px solid ${
      showApplicationMenu ? theme.colors.dividerStrong : 'transparent'
    }`,
    alignItems: 'stretch',
    justifyContent: 'center',
    color: theme.colors.textMuted,
    background: showApplicationMenu ? 'rgba(255,255,255,0.02)' : 'none',
    WebkitAppRegion: 'drag',
  }),
);

function useTabElement(elementMap: Record<WorkspaceTab, ReactNode>) {
  const currentTab = useSelector(Selectors.getCurrentTab);

  return elementMap[currentTab];
}

interface Props {
  isEditingBitmap: boolean;
}

// class CustomSensor extends PointerSensor {

// }

const WorkspaceContent = memo(function WorkspaceContent({
  isEditingBitmap,
}: Props) {
  const CanvasKit = useCanvasKit();
  const dispatch = useDispatch();
  const colorScheme = useSystemColorScheme();
  const [layersFilter, setLayersFilter] = useState('');
  const isElectron = useEnvironmentParameter('isElectron');
  const platform = useEnvironmentParameter('platform');
  const theme = useMemo(() => {
    const baseTheme = colorScheme === 'dark' ? darkTheme : lightTheme;

    return produce(baseTheme, (draft) => {
      if (!isElectron) return;

      draft.sizes.toolbar.height = 53;
      draft.sizes.toolbar.itemSeparator = 12;
    });
  }, [colorScheme, isElectron]);

  const tabElement = useTabElement({
    canvas: (
      <>
        <AutoSizer>
          {(size) => <LayerList size={size} filter={layersFilter} />}
        </AutoSizer>
        <FilterContainer>
          <InputField.Root labelPosition="start" labelSize={14}>
            <InputField.Input
              value={layersFilter}
              onChange={setLayersFilter}
              placeholder="Filter layers"
              type="search"
            />
            <InputField.Label>
              <MagnifyingGlassIcon />
            </InputField.Label>
          </InputField.Root>
        </FilterContainer>
        <Spacer.Vertical size={8} />
      </>
    ),
    pages: <Spacer.Vertical />,
    theme: <ThemeGroups />,
  });

  const [dragId, setDragId] = useState<string | undefined>();
  const [dragData, setDragData] = useState<
    | {
        initial: Point;
        current: Point;
      }
    | undefined
  >();
  const dragTemplate = bitmapTemplates.find(
    (template) => template.id === dragId,
  );
  const [templateImage, setTemplateImage] = useState<ArrayBuffer | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!dragTemplate) return;

    fetch(dragTemplate.url)
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => {
        // const image = CanvasKit.MakeImageFromEncoded(arrayBuffer);

        // if (!image) return;

        setTemplateImage(arrayBuffer);
      });
  }, [CanvasKit, dragTemplate]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
      onActivation({ event }: { event: PointerEvent }) {
        setDragData({
          initial: {
            x: event.pageX - event.offsetX,
            y: event.pageY - event.offsetY,
          },
          current: {
            x: 0,
            y: 0,
          },
        });
      },
    }),
  );

  return (
    <DesignSystemConfigurationProvider theme={theme} platform={platform}>
      <DialogProvider>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={(event) => {
            // console.log(JSON.stringify(event.active.rect.current));
            setDragId(event.active.id);
          }}
          onDragMove={(event) => {
            // console.log(dragData?.initial, event.delta);
            // console.log(JSON.stringify(event.over?.rect));
            // const currentRect = event.active.rect.current;
            // console.log(currentRect.translated);

            // console.log('hi', dragData, JSON.stringify(event.active.rect));

            if (!dragData) return;

            const current = {
              x: dragData.initial.x + event.delta.x - 260,
              y: dragData.initial.y + event.delta.y - 46,
            };

            // const current = {
            //   x:
            //     dragData.initial.x + event.delta.x - event.over.rect.offsetLeft,
            //   y: dragData.initial.y + event.delta.y - event.over.rect.offsetTop,
            // };

            // const current = {
            //   x: dragData.initial.x + event.delta.x,
            //   y: dragData.initial.y + event.delta.y,
            // };

            // console.log(current);

            setDragData({
              initial: dragData.initial,
              current,
            });

            if (!templateImage) return;

            dispatch('setDraggedBitmapTemplate', {
              image: templateImage,
              position: current,
            });
          }}
          onDragEnd={(event) => {
            if (templateImage && dragData && dragTemplate) {
              dispatch(
                'setPixelTemplate',
                dragData.current,
                templateImage,
                dragTemplate.replacesContents ? 'replace' : 'atop',
              );
            }

            setDragData(undefined);
            setDragId(undefined);
            dispatch('setDraggedBitmapTemplate', undefined);
          }}
        >
          <LeftSidebar>
            <MenubarContainer
              showApplicationMenu={isElectron}
              onDoubleClick={doubleClickToolbar}
            >
              <Menubar />
            </MenubarContainer>
            <LeftSidebarBorderedContent>
              {isEditingBitmap ? (
                <BitmapTemplates />
              ) : (
                <>
                  <PageList />
                  <Divider />
                  {tabElement}
                </>
              )}
            </LeftSidebarBorderedContent>
          </LeftSidebar>
          <MainView>
            <ToolbarContainer onDoubleClick={doubleClickToolbar}>
              {useTabElement({
                canvas: <Toolbar />,
                pages: null,
                theme: <ThemeToolbar />,
              })}
            </ToolbarContainer>
            <ContentArea>
              {useTabElement({
                canvas: <Canvas />,
                // canvas: <Canvas bitmapDragPosition={dragData?.current} />,
                pages: <PagesGrid />,
                theme: <ThemeWindow />,
              })}
              <RightSidebar>
                <ScrollArea>
                  {useTabElement({
                    canvas: <Inspector />,
                    pages: null,
                    theme: <ThemeInspector />,
                  })}
                </ScrollArea>
              </RightSidebar>
            </ContentArea>
          </MainView>
          <DragOverlay>
            {dragTemplate && dragData && dragData.current.x < -120 ? (
              <div
                style={{
                  width: '220px',
                  height: '120px',
                  display: 'flex',
                  alignItems: 'stretch',
                }}
              >
                <DraggableBitmapTemplateItem
                  id={'drag-template-overlay'}
                  url={dragTemplate.url}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </DialogProvider>
    </DesignSystemConfigurationProvider>
  );
});

export const Workspace = function Workspace() {
  const [state] = useApplicationState();

  return (
    <WorkspaceContent
      isEditingBitmap={getIsEditingBitmap(state.interactionState.type)}
    />
  );
};
