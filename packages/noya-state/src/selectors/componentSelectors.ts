import { Draft } from 'immer';
import {
  createLayoutNode,
  Edge,
  FlexDirection,
  LayoutNode,
  LayoutProperties,
} from 'noya-layout';
import { ApplicationState, ElementFlexDirection } from 'noya-state';
import {
  ComponentLayer,
  ElementLayer,
  ElementTree,
  getAttributeValue,
  getComponentLayer,
  parseIntSafe,
  TypescriptEnvironment,
} from 'noya-typescript';
import { isDeepEqual } from 'noya-utils';
import { IndexPath } from 'tree-visit';
import { SourceFile } from 'typescript';

export type ElementLayerPath = {
  layerId: string;
  indexPath: IndexPath;
};

export type ObjectPath = {
  layerId: string;
  indexPath?: IndexPath;
};

export function isElementLayerId(objectId: string) {
  return objectId.includes('#');
}

export function parseObjectId(objectId: string) {
  const [layerId, elementId] = objectId.split('#');

  const indexPath = elementId ? elementId.split(':').map(Number) : undefined;

  return { layerId, ...(indexPath && { indexPath }) };
}

export function createObjectId(layerId: string, indexPath?: number[]): string;
export function createObjectId(objectPath: ObjectPath): string;
export function createObjectId(
  layerIdOrObjectPath: string | ObjectPath,
  indexPath?: number[],
): string {
  let layerId: string;

  if (typeof layerIdOrObjectPath === 'string') {
    layerId = layerIdOrObjectPath;
  } else {
    layerId = layerIdOrObjectPath.layerId;
    indexPath = layerIdOrObjectPath.indexPath;
  }

  return indexPath ? `${layerId}#${indexPath.join(':')}` : layerId;
}

export const getSelectedElementLayerPaths = (
  state: Draft<ApplicationState>,
): ElementLayerPath[] => {
  return state.selectedLayerIds
    .map(parseObjectId)
    .filter(
      (objectPath): objectPath is ElementLayerPath => !!objectPath.indexPath,
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

export const getSelectedElementLayers = (
  state: Draft<ApplicationState>,
  environment: TypescriptEnvironment,
): ElementLayer[] => {
  return state.selectedLayerIds.flatMap((id) => {
    const elementLayer = getElementLayerForId(environment, id);
    return elementLayer ? [elementLayer] : [];
  });
};

export function elementLayerToLayoutNode(
  elementLayer: ElementLayer,
): LayoutNode {
  const flexDirection =
    getAttributeValue<ElementFlexDirection>(
      elementLayer.attributes,
      'flexDirection',
    ) ?? 'column';

  const flexBasis =
    getAttributeValue(elementLayer.attributes, 'flexBasis') ?? 0;
  const flexGrow =
    parseIntSafe(getAttributeValue(elementLayer.attributes, 'flexGrow')) ?? 1;
  const flexShrink =
    parseIntSafe(getAttributeValue(elementLayer.attributes, 'flexShrink')) ?? 1;
  const paddingTop =
    parseIntSafe(getAttributeValue(elementLayer.attributes, 'paddingTop')) ?? 0;
  const paddingRight =
    parseIntSafe(getAttributeValue(elementLayer.attributes, 'paddingRight')) ??
    0;
  const paddingBottom =
    parseIntSafe(getAttributeValue(elementLayer.attributes, 'paddingBottom')) ??
    0;
  const paddingLeft =
    parseIntSafe(getAttributeValue(elementLayer.attributes, 'paddingLeft')) ??
    0;
  const borderWidth =
    parseIntSafe(getAttributeValue(elementLayer.attributes, 'borderWidth')) ??
    0;

  const properties: LayoutProperties = {
    flexDirection: FlexDirection[flexDirection],
    flexBasis,
    flexGrow,
    flexShrink,
    border: {
      [Edge.top]: borderWidth,
      [Edge.right]: borderWidth,
      [Edge.bottom]: borderWidth,
      [Edge.left]: borderWidth,
    },
    padding: {
      [Edge.top]: paddingTop,
      [Edge.right]: paddingRight,
      [Edge.bottom]: paddingBottom,
      [Edge.left]: paddingLeft,
    },
  };

  return createLayoutNode(
    properties,
    elementLayer.children.map(elementLayerToLayoutNode),
  );
}
