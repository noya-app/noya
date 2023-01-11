import { useRouter } from 'next/router';
import { Button, Heading2, ListView, Spacer, Stack } from 'noya-designsystem';
import { DashboardIcon, PlusIcon } from 'noya-icons';
import React, { useEffect, useState } from 'react';
import { createAyonFile } from '../ayon/createAyonFile';
import { noyaAPI, NoyaAPI } from '../utils/api';

export function Projects() {
  const { push } = useRouter();
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
            const design = createAyonFile();

            noyaAPI.files.create({ name: 'Test', design }).then((id) => {
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
                onPress={() => {
                  push(`/projects/${file.id}`);
                }}
              >
                <Stack.H padding={'8px 0'} alignItems="center">
                  <DashboardIcon />
                  <Spacer.Horizontal size={10} />
                  <ListView.RowTitle>
                    {file.data.name ?? 'Bad Format'}
                  </ListView.RowTitle>
                </Stack.H>
              </ListView.Row>
            );
          })}
        </ListView.Root>
      </Stack.V>
    </Stack.V>
  );
}
