import { formatDistance, parseISO } from 'date-fns';
import { useRouter } from 'next/router';
import {
  Button,
  Heading2,
  ListView,
  Small,
  Spacer,
  Stack,
} from 'noya-designsystem';
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
  const [selected, setSelected] = useState<string | undefined>();
  const [renaming, setRenaming] = useState<string | undefined>();

  return (
    <Stack.V flex="1">
      <Stack.H alignItems="center">
        <Heading2>Projects</Heading2>
        <Spacer.Horizontal />
        <Button
          onClick={() => {
            const design = createAyonFile();

            noyaAPI.files.create({ name: 'Untitled', design }).then((id) => {
              push(`/projects/${id}`);
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
                selected={selected === file.id}
                menuItems={[
                  {
                    title: 'Delete',
                    value: 'delete',
                  } as const,
                  {
                    title: 'Rename',
                    value: 'rename',
                  } as const,
                ]}
                onSelectMenuItem={(value) => {
                  switch (value) {
                    case 'delete':
                      noyaAPI.files.delete(file.id).then(() => {
                        window.location.reload();
                      });
                      return;
                    case 'rename':
                      setRenaming(file.id);
                      return;
                  }
                }}
                onHoverChange={(hovered) => {
                  setHovered(hovered ? file.id : undefined);
                }}
                onPress={() => {
                  push(`/projects/${file.id}`);
                }}
                onMenuOpenChange={(open) => {
                  setSelected(open ? file.id : undefined);
                }}
              >
                <Stack.H padding={'8px 0'} alignItems="center" flex="1">
                  <DashboardIcon />
                  <Spacer.Horizontal size={10} />
                  {renaming === file.id ? (
                    <ListView.EditableRowTitle
                      value={file.data.name ?? 'Bad Format'}
                      autoFocus
                      onSubmitEditing={(value) => {
                        setRenaming(undefined);

                        if (value === file.data.name) return;

                        noyaAPI.files.update(file.id, {
                          ...file.data,
                          name: value,
                        });
                      }}
                    />
                  ) : (
                    <ListView.RowTitle>
                      {file.data.name ?? 'Bad Format'}
                    </ListView.RowTitle>
                  )}
                  <Spacer.Horizontal size={10} />
                  <Small color="textMuted">
                    {formatDistance(parseISO(file.updatedAt), new Date(), {
                      addSuffix: true,
                    })}
                  </Small>
                </Stack.H>
              </ListView.Row>
            );
          })}
        </ListView.Root>
      </Stack.V>
    </Stack.V>
  );
}
