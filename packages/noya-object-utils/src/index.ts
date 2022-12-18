import { NoyaObject } from 'noya-backend-client';
import { withOptions } from 'tree-visit';
import { z } from 'zod';

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
  id?: string,
) {
  const self = parent.createChild(undefined, id, Object.entries(values));

  if ('children' in values && Array.isArray(values.children)) {
    values.children.forEach((childValue) => {
      createNoyaObject(self, childValue);
    });
  }

  return self;
}

export function createLinkedNode<T extends z.ZodTypeAny>(
  parent: NoyaObject,
  key: string,
  schema?: T,
) {
  const create = (id?: string) => {
    const child = createNoyaObject(
      parent,
      schema ? schema.parse(undefined) : {},
      id,
    );
    parent.set(key, child.id);
  };

  const linkedId = z.string().safeParse(parent.get(key));

  if (!linkedId.success) {
    create();
    return;
  }

  const child = parent.children.find((child) => child.id === linkedId.data);

  if (!child) {
    create(linkedId.data);
    return;
  }

  const serialized = serializeTree(child);

  if (schema) {
    const linkedData = schema.safeParse(serialized);

    if (!linkedData.success) {
      create(linkedId.data);
      return;
    }

    return linkedData.data;
  } else {
    return serialized;
  }
}
