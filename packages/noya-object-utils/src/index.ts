import { NoyaObject } from 'noya-backend-client';

import { withOptions } from 'tree-visit';

export const { visit } = withOptions({
  getChildren: (item: NoyaObject) => [...item.children],
});

export function serialize(
  object: NoyaObject,
): { id: string } & Record<PropertyKey, unknown> {
  const serialized = object.serialize();

  const { parentAndFractionalIndex, ...base } = Object.fromEntries(
    serialized.entries as any,
  );

  return {
    ...base,
    id: serialized.id,
  };
}

export function serializeTree(
  object: NoyaObject,
): { id: string } & Record<PropertyKey, unknown> {
  return {
    ...serialize(object),
    children: object.children.map(serializeTree),
  };
}

export function assign(
  object: NoyaObject,
  values: Record<PropertyKey, unknown>,
) {
  for (const [key, value] of Object.entries(values)) {
    if (
      key === 'id' ||
      key === 'parentAndFractionalIndex' ||
      key === 'children'
    )
      return;

    object.set(key, value);
  }
}

export function createNoyaObject<T extends Record<PropertyKey, unknown>>(
  parent: NoyaObject,
  values: Omit<T, 'id'>,
) {
  const self = parent.createChild();

  assign(self, values);

  if ('children' in values && Array.isArray(values.children)) {
    values.children.forEach((childValue) => {
      createNoyaObject(self, childValue);
    });
  }

  return self;
}
