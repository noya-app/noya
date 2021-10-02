import { useDraggable } from '@dnd-kit/core';
import { GridView } from 'noya-designsystem';
import { memo } from 'react';
import styled from 'styled-components';
import template1 from '../assets/bitmapTemplate1.png';
import shades from '../assets/shades.png';

const TemplateItem = styled.div({
  flex: '1 1 0%',
  background: 'rgba(0,0,0,0.3)',
  display: 'flex',
  justifyContent: 'center',
});

type BitmapTemplate = {
  id: string;
  url: string;
  title: string;
  replacesContents: boolean;
};

export const bitmapTemplates: BitmapTemplate[] = [
  { id: 'template1', url: template1, title: 'Boxes', replacesContents: true },
  { id: 'template2', url: shades, title: 'Shades', replacesContents: false },
];

export function DraggableBitmapTemplateItem({
  id,
  url,
}: {
  id: string;
  url: string;
}) {
  const { attributes, isDragging, listeners, setNodeRef } = useDraggable({
    id,
  });

  return (
    <div
      id={id}
      ref={setNodeRef}
      style={{
        width: '120px',
        height: '120px',
        opacity: isDragging ? 0.5 : undefined,
        background: `center / cover url("${url}")`,
      }}
      {...attributes}
      {...listeners}
    />
  );
}

export const BitmapTemplates = memo(function BitmapTemplates() {
  // const [state, dispatch] = useApplicationState();

  return (
    <GridView.Root variant="small">
      <GridView.SectionHeader title={'Templates'} />
      <GridView.Section>
        {bitmapTemplates.map((template) => (
          <GridView.Item
            key={template.id}
            id={`grid-item-${template.id}`}
            title={template.title}
            selected={false}
            layout="fill"
          >
            <TemplateItem>
              <DraggableBitmapTemplateItem
                id={template.id}
                url={template.url}
              />
            </TemplateItem>
          </GridView.Item>
        ))}
      </GridView.Section>
    </GridView.Root>
  );
});
