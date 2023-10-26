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
import { RocketIcon } from 'noya-icons';
import React, { ReactElement, memo, useReducer, useRef } from 'react';
import { AutoResizingTextArea } from '../ayon/components/inspector/DescriptionTextArea';
import { AppLayout } from './AppLayout';

type Props = {
  description?: string;
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
    'Left Sidebar with Top Bar',
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
];

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

export const PageSetup = memo(function PageSetup({
  description: initialDescription,
}: Props) {
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
