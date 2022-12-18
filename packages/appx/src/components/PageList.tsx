import { Button, TreeView } from 'noya-designsystem';
import React from 'react';
import { z } from 'zod';

export const pageSchema = z.object({
  id: z.string(),
  type: z.string(),
  name: z.string(),
});

export type Page = z.infer<typeof pageSchema>;

interface Props {
  pages: Page[];
  onAddPage: () => void;
  onSelectPage: (id: string) => void;
}

export function PageList({ pages, onAddPage, onSelectPage }: Props) {
  return (
    <>
      <Button onClick={onAddPage}>Add Page</Button>
      <TreeView.Root
        data={pages}
        keyExtractor={(page) => page.id}
        renderItem={(page: Page, index, { isDragging }) => {
          return (
            <TreeView.Row
              id={page.id}
              key={page.id}
              onPress={() => onSelectPage(page.id)}
              onDoubleClick={() => {}}
            >
              {page.name}
            </TreeView.Row>
          );
        }}
      />
    </>
  );
}
