import { Sketch } from '@noya-app/noya-file-format';
import { GridView, Spacer, Stack, lightTheme } from 'noya-designsystem';
import { DesktopIcon, LaptopIcon, MobileIcon } from 'noya-icons';
import { DimensionInput, InspectorPrimitives } from 'noya-inspector';
import React from 'react';
import { useAyonDispatch } from '../../state/ayonState';

export const sizeList = [
  {
    name: 'Desktop',
    width: 1440,
    height: 900,
    icon: <DesktopIcon width={30} height={30} />,
  },
  {
    name: 'Laptop',
    width: 1280,
    height: 720,
    icon: <LaptopIcon width={30} height={30} />,
  },
  {
    name: 'Tablet',
    width: 1024,
    height: 768,
    icon: <MobileIcon width={30} height={30} transform="rotate(270)" />,
  },
  {
    name: 'Mobile',
    width: 390,
    height: 844,
    icon: <MobileIcon width={30} height={30} />,
  },
];

export function AyonPageSizeInspectorRow({
  artboard,
}: {
  artboard: Sketch.AnyLayer;
}) {
  const dispatch = useAyonDispatch();

  return (
    <>
      <Stack.V flex="1">
        <GridView.Root
          scrollable={false}
          size="xs"
          textPosition="overlay"
          bordered
        >
          <GridView.Section padding={0}>
            {sizeList.map(({ name, width, height, icon }, index) => {
              return (
                <GridView.Item
                  key={index}
                  id={name}
                  title={name}
                  subtitle={`${width}×${height}`}
                  onClick={() => {
                    dispatch('batch', [
                      [
                        'setLayerWidth',
                        artboard.do_objectID,
                        width,
                        'replace',
                        'scale',
                      ],
                      [
                        'setLayerHeight',
                        artboard.do_objectID,
                        height,
                        'replace',
                        'translate',
                      ],
                      [
                        'zoomToFit*',
                        { type: 'layer', value: artboard.do_objectID },
                        { padding: 20, max: 1, position: 'top' },
                      ],
                    ]);
                  }}
                  selected={
                    width === artboard.frame.width &&
                    height === artboard.frame.height
                  }
                >
                  <Stack.V
                    tabIndex={-1}
                    background={'white'}
                    width="100%"
                    height="100%"
                    color={lightTheme.colors.icon}
                    alignItems="center"
                    justifyContent="center"
                  >
                    {icon}
                  </Stack.V>
                </GridView.Item>
              );
            })}
          </GridView.Section>
        </GridView.Root>
      </Stack.V>
      <InspectorPrimitives.Row>
        <DimensionInput
          value={artboard.frame.width}
          onSetValue={(value, mode) => {
            dispatch('setLayerWidth', artboard.do_objectID, value, mode);
            dispatch(
              'zoomToFit*',
              { type: 'layer', value: artboard.do_objectID },
              { padding: 20, max: 1, position: 'top' },
            );
          }}
          label="W"
        />
        <Spacer.Horizontal size={16} />
        <DimensionInput
          value={artboard.frame.height}
          onSetValue={(value, mode) => {
            dispatch('setLayerHeight', artboard.do_objectID, value, mode);
            dispatch(
              'zoomToFit*',
              { type: 'layer', value: artboard.do_objectID },
              { padding: 20, max: 1, position: 'top' },
            );
          }}
          label="H"
        />
      </InspectorPrimitives.Row>
    </>
  );
}
