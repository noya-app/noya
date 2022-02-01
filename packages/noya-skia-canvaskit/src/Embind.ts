import { EmbindEnum, EmbindEnumEntity } from 'canvaskit';

// Copied from svgkit
export class JSEmbindObject {
  _isDeleted = false;
  clone() {
    return this;
  }
  delete() {
    this._isDeleted = false;
  }
  deleteAfter() {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }
  isAliasOf(other: any) {
    return this === other;
  }
  isDeleted() {
    return this._isDeleted;
  }
}

function createEnumEntity(value: number): EmbindEnumEntity {
  return { value };
}

function createEnum<K extends string>(
  caseNames: K[],
): EmbindEnum & Record<K, EmbindEnumEntity> {
  const entries = caseNames.map(
    (name, index) => [name, createEnumEntity(index)] as const,
  );
  const cases = Object.fromEntries(entries) as Record<K, EmbindEnumEntity>;

  return {
    ...cases,
    values: Object.values(cases),
  };
}

export const Embind = {
  createEnumEntity,
  createEnum,
};
