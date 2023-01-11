import { Button, Heading2, ListView, Spacer, Stack } from 'noya-designsystem';
import { DashboardIcon, PlusIcon } from 'noya-icons';
import { createSketchFile } from 'noya-state';
import React, { useEffect, useState } from 'react';
import { noyaAPI, NoyaAPI } from '../utils/api';

export function Projects() {
  const [files, setFiles] = useState<NoyaAPI.FileList>([]);

  useEffect(() => {
    noyaAPI.files.list().then(setFiles);
  }, []);

  const [hovered, setHovered] = useState<string | undefined>();

  return (
    <Stack.V flex="1">
      <Stack.H alignItems="center">
        <Heading2>Projects</Heading2>
        <Spacer.Horizontal />
        <Button
          onClick={() => {
            const data = createSketchFile();

            noyaAPI.files.create(data).then((id) => {
              window.location.reload();
            });
          }}
        >
          <PlusIcon />
          <Spacer.Horizontal size={8} />
          New Project
        </Button>
      </Stack.H>
      <Spacer.Vertical size={44} />
      <Stack.V margin={'0 -12px'}>
        <ListView.Root>
          {files.map((file) => {
            return (
              <ListView.Row
                key={file.id}
                hovered={hovered === file.id}
                menuItems={[
                  {
                    title: 'Delete',
                    value: 'delete',
                  } as const,
                ]}
                onSelectMenuItem={(value) => {
                  switch (value) {
                    case 'delete':
                      noyaAPI.files.delete(file.id);
                      return;
                  }
                }}
                onHoverChange={(hovered) => {
                  setHovered(hovered ? file.id : undefined);
                }}
              >
                <Stack.H padding={'8px 0'} alignItems="center">
                  <DashboardIcon />
                  <Spacer.Horizontal size={10} />
                  <ListView.RowTitle>Hello</ListView.RowTitle>
                </Stack.H>
              </ListView.Row>
            );
          })}
        </ListView.Root>
      </Stack.V>
    </Stack.V>
  );
}
