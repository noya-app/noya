import {
  asyncIterableToString,
  findAndParseJSONObject,
  useNoyaClientOrFallback,
} from 'noya-api';
import {
  LayoutHierarchy,
  LayoutNode,
  LayoutNodeAttributes,
  layoutNode,
} from 'noya-compiler';
import {
  ActivityIndicator,
  Button,
  GridView,
  Heading2,
  Spacer,
  Stack,
  useDesignSystemTheme,
} from 'noya-designsystem';
import { Rect, Size } from 'noya-geometry';
import { RocketIcon } from 'noya-icons';
import { upperFirst } from 'noya-utils';
import React, {
  ReactElement,
  memo,
  useCallback,
  useReducer,
  useRef,
} from 'react';
import { withOptions } from 'tree-visit';
import { z } from 'zod';
import { AutoResizingTextArea } from '../ayon/components/inspector/DescriptionTextArea';
import { AppLayout } from './AppLayout';

type MeasuredLayoutItem = {
  name: string;
  rect: Rect; // Percentage between 0 and 1
  children: MeasuredLayoutItem[];
};

export type FlattenedLayoutItem = Omit<MeasuredLayoutItem, 'children'> & {
  componentNames: string[];
};

type Props = {
  pageSize: Size;
  description?: string;
  onGenerate?: (generated: {
    description: string;
    layoutItems: FlattenedLayoutItem[];
  }) => void;
};

type InternalState = {
  description: string;
  layout: string;
  step: 'describe' | 'layout' | 'generate';
};

type Action =
  | {
      type: 'setDescription';
      description: string;
    }
  | {
      type: 'setLayout';
      layout: string;
    }
  | {
      type: 'submit';
    };

const layoutParentStyle: LayoutNodeAttributes['style'] = {
  flex: '1',
  display: 'flex',
  flexDirection: 'row',
  padding: '4px',
  gap: '4px',
};

const layoutNodeStyle: LayoutNodeAttributes['style'] = {
  background: 'white',
};

const possibleLayouts: LayoutNode[] = [
  layoutNode('Left Sidebar Layout', { style: layoutParentStyle }, [
    layoutNode('Left Sidebar', {
      style: { ...layoutNodeStyle, flex: '1' },
    }),
    layoutNode('Right Content Area', {
      style: { ...layoutNodeStyle, flex: '3' },
    }),
  ]),
  layoutNode(
    'Left Sidebar with Top Bar Layout',
    { style: { ...layoutParentStyle, flexDirection: 'column' } },
    [
      layoutNode('Top Bar', {
        style: { ...layoutNodeStyle, flex: '1' },
      }),
      layoutNode(
        'Content',
        { style: { ...layoutParentStyle, padding: '0', flex: '4' } },
        [
          layoutNode('Left Sidebar', {
            style: { ...layoutNodeStyle, flex: '1' },
          }),
          layoutNode('Right Content Area', {
            style: { ...layoutNodeStyle, flex: '3' },
          }),
        ],
      ),
    ],
  ),
  layoutNode(
    'Left and Right Sidebar with Top Bar Layout',
    { style: { ...layoutParentStyle, flexDirection: 'column' } },
    [
      layoutNode('Top Bar', {
        style: { ...layoutNodeStyle, flex: '1' },
      }),
      layoutNode(
        'Content',
        { style: { ...layoutParentStyle, padding: '0', flex: '4' } },
        [
          layoutNode('Left Sidebar', {
            style: { ...layoutNodeStyle, flex: '1' },
          }),
          layoutNode('Right Content Area', {
            style: { ...layoutNodeStyle, flex: '3' },
          }),
          layoutNode('Right Sidebar', {
            style: { ...layoutNodeStyle, flex: '1' },
          }),
        ],
      ),
    ],
  ),
  layoutNode(
    'Vertical Stack Layout',
    { style: { ...layoutParentStyle, flexDirection: 'column' } },
    [
      layoutNode('Top Content Area', {
        style: { ...layoutNodeStyle, flex: '1' },
      }),
      layoutNode('Middle Content Area', {
        style: { ...layoutNodeStyle, flex: '1' },
      }),
      layoutNode('Bottom Content Area', {
        style: { ...layoutNodeStyle, flex: '1' },
      }),
    ],
  ),
];

const MeasuredHierarchy = withOptions<MeasuredLayoutItem>({
  getChildren: (node) => node.children ?? [],
});

function measureLayout(root: LayoutNode) {
  let measuredLayout = LayoutHierarchy.map<MeasuredLayoutItem>(
    root,
    (node, transformedChildren): MeasuredLayoutItem => {
      if (typeof node === 'string') throw new Error('Impossible');

      let direction =
        node.attributes.style?.flexDirection === 'row'
          ? 'horizontal'
          : 'vertical';

      // Adjust children dimensions by using their flex values
      const flexValues = node.children.map((child) =>
        parseInt((child as LayoutNode).attributes.style?.flex ?? '1'),
      );

      const properties =
        direction === 'horizontal'
          ? ({ size: 'width', offset: 'x' } as const)
          : ({ size: 'height', offset: 'y' } as const);

      for (let i = 0; i < transformedChildren.length; i++) {
        const child = transformedChildren[i];

        child.rect[properties.size] =
          flexValues[i] / flexValues.reduce((a, b) => a + b, 0);

        child.rect[properties.offset] = transformedChildren
          .slice(0, i)
          .reduce((a, b) => a + b.rect[properties.size], 0);
      }

      return {
        name: node.tag,
        rect: { x: 0, y: 0, width: 1, height: 1 },
        children: transformedChildren,
      };
    },
  );

  // Adjust children size and offset according to parent
  measuredLayout = MeasuredHierarchy.map<MeasuredLayoutItem>(
    measuredLayout,
    (node, transformedChildren) => {
      const result = { ...node, children: transformedChildren };

      const { rect } = node;

      return MeasuredHierarchy.map(
        result,
        (node, transformedChildren, indexPath) => {
          if (indexPath.length === 0) {
            return { ...node, children: transformedChildren };
          }

          return {
            ...node,
            children: transformedChildren,
            rect: {
              x: node.rect.x + rect.x * node.rect.width,
              y: node.rect.y + rect.y * node.rect.height,
              width: rect.width * node.rect.width,
              height: rect.height * node.rect.height,
            },
          };
        },
      );
    },
  );

  const flattened = MeasuredHierarchy.flatMap<FlattenedLayoutItem>(
    measuredLayout,
    (node): FlattenedLayoutItem[] => {
      const { children, ...rest } = node;
      if (children.length > 0) return [];
      return [{ ...rest, componentNames: [] }];
    },
  );

  return flattened;
}

function renderLayoutNode(root: LayoutNode): ReactElement | null {
  return LayoutHierarchy.map<ReactElement | null>(
    root,
    (node, transformedChildren) => {
      if (typeof node === 'string') return null;

      return (
        <div key={node.tag} style={node.attributes.style}>
          {transformedChildren}
        </div>
      );
    },
  );
}

function createPrompt(description: string, layout: LayoutNode, pageSize: Size) {
  function describeLayout(node: LayoutNode): string {
    const layoutItems = measureLayout(node);

    const pageRect = (rect: Rect) => ({
      x: rect.x * pageSize.width,
      y: rect.y * pageSize.height,
      width: rect.width * pageSize.width,
      height: rect.height * pageSize.height,
    });

    return layoutItems
      .map(
        (child, index) =>
          `${index + 1}) ${child.name} ${JSON.stringify(pageRect(child.rect))}`,
      )
      .join('\n');
  }

  function createExampleResponse(node: LayoutNode): string {
    return JSON.stringify({
      [(node.children[0] as LayoutNode).tag]: [
        'User Details Row',
        'Navigation Menu',
        'Search Bar',
      ],
      '...': '...',
    });
  }

  const prompt = [
    `I'm creating a webpage with description:`,
    `\`\`\`\n${description}\n\`\`\``,
    `My layout has the following areas:`,
    describeLayout(layout),
    `Respond ONLY with a list 3 names of possible components that could fill the entire space of each layout area (for example, Navigation Bar with Logo is more likely to fill a top bar space than Logo), in JSON format, e.g. ${createExampleResponse(
      layout,
    )}`,
  ].join('\n\n');

  return prompt;
}

export const PageSetup = memo(function PageSetup({
  pageSize,
  description: initialDescription,
  onGenerate,
}: Props) {
  const client = useNoyaClientOrFallback();

  const theme = useDesignSystemTheme();

  const [{ description, layout, step }, dispatch] = useReducer(
    (state: InternalState, action: Action): InternalState => {
      switch (action.type) {
        case 'setDescription':
          return { ...state, description: action.description };
        case 'setLayout':
          return { ...state, layout: action.layout };
        case 'submit': {
          switch (state.step) {
            case 'describe':
              return { ...state, step: 'layout' };
            case 'layout':
              return { ...state, step: 'generate' };
            case 'generate':
              return state;
          }
        }
      }
    },
    {
      description: initialDescription ?? '',
      layout: '',
      step: 'describe',
    },
  );

  const handleGenerate = useCallback(() => {
    async function main() {
      const inputLayout = possibleLayouts.find((node) => node.tag === layout);

      if (!inputLayout) return;

      const prompt = createPrompt(description, inputLayout, pageSize);

      console.info('Prompt: ' + prompt);

      const iterator = await client.networkClient.generate.fromPrompt(prompt);
      const result = await asyncIterableToString(iterator);
      const json = findAndParseJSONObject(result);

      // const json = {
      //   'left sidebar layout': {
      //     'left sidebar': [
      //       'latest news',
      //       'trending topics',
      //       'currency converter',
      //     ],
      //     'right content area': [
      //       'daily articles',
      //       'video updates',
      //       'investment insights',
      //     ],
      //   },
      //   'left sidebar with top bar layout': {
      //     'top bar': [
      //       'login/signup button',
      //       'website logo',
      //       'notifications icon',
      //     ],
      //     'left sidebar': [
      //       'market stats',
      //       'top cryptocurrencies',
      //       'investment advice',
      //     ],
      //     'right content area': [
      //       'feature articles',
      //       'interviews with experts',
      //       'crypto market analysis',
      //     ],
      //   },
      // };

      console.info('JSON', json);

      const schema = z.record(z.array(z.string()));
      const parsed = schema.safeParse(json);

      // debugger;

      if (!parsed.success) {
        console.error(parsed.error);
        return;
      }

      const selectedLayout = possibleLayouts.find(
        (node) => node.tag.toLowerCase() === layout.toLowerCase(),
      );

      if (!selectedLayout) return;

      // const componentNamesIndex = Object.keys(parsed.data).findIndex(
      //   (key) => key.toLowerCase() === selectedLayout?.tag.toLowerCase(),
      // );

      // if (componentNamesIndex === -1) return;

      // const componentNamesMap = Object.values(parsed.data)[componentNamesIndex];

      // Convert keys to lowercase
      const componentNamesMapLowercase: Record<string, string[]> =
        Object.fromEntries(
          Object.entries(parsed.data).map(([key, value]) => [
            key.toLowerCase(),
            value,
          ]),
        );

      const layoutItems = measureLayout(selectedLayout);

      // Assign component names
      for (let i = 0; i < layoutItems.length; i++) {
        let names =
          componentNamesMapLowercase[layoutItems[i].name.toLowerCase()];

        // Title case
        names = names.map((name) => name.split(' ').map(upperFirst).join(' '));

        layoutItems[i].componentNames = names;
      }

      console.info('Layout', {
        selectedLayout,
        componentNamesMapLowercase,
        layoutItems,
      });

      onGenerate?.({
        description,
        layoutItems,
      });
    }

    main();
  }, [client, description, layout, onGenerate, pageSize]);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  return (
    <AppLayout>
      <Heading2 color="text">Describe the page</Heading2>
      <Spacer.Vertical size={18} />
      <AutoResizingTextArea
        ref={textareaRef}
        autoFocus
        disabled={step === 'generate'}
        value={description}
        placeholder="Description..."
        onChangeText={(value) =>
          dispatch({ type: 'setDescription', description: value })
        }
        onKeyDown={(event: React.KeyboardEvent) => {
          if (event.key === 'Enter') {
            event.stopPropagation();
            event.preventDefault();

            if (step === 'describe') {
              dispatch({ type: 'submit' });
            }

            textareaRef.current?.blur();
          } else if (event.key === 'Escape') {
            textareaRef.current?.blur();
          }
        }}
        style={{
          width: '100%',
          padding: '18px 24px',
          ...theme.textStyles.heading3,
        }}
      />
      {step === 'describe' && (
        <>
          <Spacer.Vertical size={24} />
          <Stack.H>
            <Button size="large">Skip & Start from Scratch</Button>
            <Spacer.Horizontal />
            <Button
              disabled={description.trim().length === 0}
              variant="primary"
              size="large"
              onClick={() => {
                dispatch({ type: 'submit' });
              }}
            >
              Next
            </Button>
          </Stack.H>
        </>
      )}
      {step !== 'describe' && (
        <>
          <Spacer.Vertical size={36} />
          <Heading2 color="text">Select the page layout</Heading2>
          <Spacer.Vertical size={18} />
          <Stack.V flex="1">
            <GridView.Root
              scrollable={false}
              size="small"
              textPosition="overlay"
              bordered
              disabled={step === 'generate'}
            >
              <GridView.Section padding={0}>
                {possibleLayouts.map((layoutNode, index) => {
                  const selected = layout === layoutNode.tag;
                  return (
                    <GridView.Item
                      key={layoutNode.tag}
                      id={layoutNode.tag.replace(' ', '-').toLowerCase()}
                      onPress={() => {
                        if (step !== 'layout') return;
                        dispatch({ type: 'setLayout', layout: layoutNode.tag });
                      }}
                      selected={selected}
                    >
                      <Stack.V
                        display="flex"
                        background={
                          selected ? theme.colors.primaryLight : '#D9D9D9'
                        }
                        width="100%"
                        height="100%"
                      >
                        {renderLayoutNode(layoutNode)}
                      </Stack.V>
                    </GridView.Item>
                  );
                })}
              </GridView.Section>
            </GridView.Root>
          </Stack.V>
          <Spacer.Vertical size={36} />
          <Stack.H>
            <Button disabled={step === 'generate'} size="large">
              Skip & Start from Scratch
            </Button>
            <Spacer.Horizontal />
            <Button
              disabled={!layout || step === 'generate'}
              variant="primary"
              size="large"
              onClick={() => {
                dispatch({ type: 'submit' });

                if (step === 'layout') {
                  handleGenerate();
                }
              }}
            >
              Generate Template
              <Spacer.Horizontal inline size={6} />
              {step === 'generate' ? (
                <ActivityIndicator
                  size={15}
                  color={'white'}
                  trackColor="rgba(255,255,255,0.2)"
                />
              ) : (
                <RocketIcon />
              )}
            </Button>
          </Stack.H>
        </>
      )}
    </AppLayout>
  );
});
