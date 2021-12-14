import { Draft } from 'immer';
import { ApplicationState } from 'noya-state';
import {
  ComponentLayer,
  ElementLayer,
  ElementTree,
  getComponentLayer,
  TypescriptEnvironment,
} from 'noya-typescript';
import { isDeepEqual } from 'noya-utils';
import { IndexPath } from 'tree-visit';
import { SourceFile } from 'typescript';

export type ComponentElementPath = {
  layerId: string;
  indexPath: IndexPath;
};

export type ObjectPath = {
  layerId: string;
  indexPath?: IndexPath;
};

export function parseObjectId(objectId: string) {
  const [layerId, elementId] = objectId.split('#');

  const indexPath = elementId ? elementId.split(':').map(Number) : undefined;

  return { layerId, ...(indexPath && { indexPath }) };
}

export function createObjectId(layerId: string, indexPath?: number[]) {
  return indexPath ? `${layerId}#${indexPath.join(':')}` : layerId;
}

export const getSelectedComponentElements = (
  state: Draft<ApplicationState>,
): ComponentElementPath[] => {
  return state.selectedLayerIds
    .map(parseObjectId)
    .filter(
      (objectPath): objectPath is ComponentElementPath =>
        !!objectPath.indexPath,
    );
};

export function getSourceFileForId(
  environment: TypescriptEnvironment,
  layerId: string,
): SourceFile | undefined {
  return environment.environment.getSourceFile(`${layerId}.tsx`);
}

export function getComponentLayerForId(
  environment: TypescriptEnvironment,
  layerId: string,
): ComponentLayer | undefined {
  const sourceFile = getSourceFileForId(environment, layerId);

  if (!sourceFile) return;

  return getComponentLayer(sourceFile);
}

export function getElementLayerForObjectPath(
  environment: TypescriptEnvironment,
  objectPath: ObjectPath,
): ElementLayer | undefined {
  const componentLayer = getComponentLayerForId(
    environment,
    objectPath.layerId,
  );

  if (!componentLayer || !objectPath.indexPath) return;

  return getElementLayerForComponentLayer(componentLayer, objectPath.indexPath);
}

export function getElementLayerForComponentLayer(
  componentLayer: ComponentLayer,
  indexPath: IndexPath,
): ElementLayer | undefined {
  return ElementTree.find(componentLayer.element, (element) =>
    isDeepEqual(element.indexPath, indexPath),
  );
}

export function getElementLayerForId(
  environment: TypescriptEnvironment,
  objectId: string,
): ElementLayer | undefined {
  return getElementLayerForObjectPath(environment, parseObjectId(objectId));
}

export function getEditableElementLayer(
  environment: TypescriptEnvironment,
  objectPath: ObjectPath,
): { elementLayer: ElementLayer; sourceFile: SourceFile } | undefined {
  if (!objectPath.indexPath) return;

  const sourceFile = getSourceFileForId(environment, objectPath.layerId);

  if (!sourceFile) return;

  const componentLayer = getComponentLayer(sourceFile);

  if (!componentLayer) return;

  const elementLayer = getElementLayerForComponentLayer(
    componentLayer,
    objectPath.indexPath,
  );

  if (!elementLayer) return;

  return { elementLayer, sourceFile };
}
