import Sketch from 'noya-file-format';
import { applyOverrides, Layers, Overrides } from 'noya-state';
import { isExternalUrl } from 'noya-utils';
import { Blocks } from '../blocks/blocks';
import {
  iconSymbolId,
  imageSymbolId,
  writeSymbolId,
} from '../blocks/symbolIds';
import { parseBlock } from '../parse';
import { GenerateResolver } from './GenerateResolver';
import { IconResolver } from './IconResolver';
import { RedirectResolver } from './RedirectResolver';

const redirectResolver = new RedirectResolver();
const generateResolver = new GenerateResolver();
const iconResolver = new IconResolver();

export function clearResolverCache(key: string) {
  redirectResolver.clearCache(key);
  // generateResolver.clearCache();
  // iconResolver.clearCache();
}

type Subscription = () => void;

export function resolveLayer({
  cachePrefix,
  layer,
  onResolve,
  onResolveOverride,
}: {
  cachePrefix?: string;
  layer: Sketch.SymbolInstance;
  onResolve: (data: Sketch.ResolvedBlockData | undefined) => void;
  onResolveOverride: (
    overrideName: string,
    data: Sketch.ResolvedBlockData | undefined,
  ) => void;
}): Subscription[] {
  const {
    blockText,
    resolvedBlockData,
    frame,
    symbolID,
    do_objectID: layerId,
  } = layer;

  if (typeof blockText !== 'string') return [];

  const blockDefinition = Blocks[symbolID];

  if (!blockDefinition) return [];

  const { content: originalText } = parseBlock(
    blockText,
    blockDefinition.parser,
  );

  // Already resolved
  if (resolvedBlockData && resolvedBlockData.originalText === originalText) {
    return [];
  }

  const subscriptions: Subscription[] = [];

  const cacheKey = cachePrefix ? `${cachePrefix}@${layerId}` : layerId;

  if (symbolID === imageSymbolId && !isExternalUrl(blockText)) {
    const width = frame.width === 0 ? 512 : frame.width;
    const height = frame.height === 0 ? 512 : frame.height;

    const unsplashUrl = `https://source.unsplash.com/${width}x${height}?${encodeURIComponent(
      originalText,
    )}&buster=${encodeURIComponent(cacheKey)}`;

    subscriptions.push(
      redirectResolver.addListener(cacheKey, unsplashUrl, (resolvedText) => {
        onResolve({
          originalText,
          resolvedText,
          symbolID,
          resolvedAt: new Date().toISOString(),
        });
      }),
    );

    redirectResolver.resolve(cacheKey, unsplashUrl);
  } else if (symbolID === writeSymbolId) {
    onResolve(undefined);

    subscriptions.push(
      generateResolver.addListener(cacheKey, originalText, (resolvedText) => {
        onResolve({
          originalText,
          resolvedText,
          symbolID,
          resolvedAt: new Date().toISOString(),
        });
      }),
    );

    generateResolver.resolve(cacheKey, originalText);
  } else if (symbolID === iconSymbolId) {
    subscriptions.push(
      iconResolver.addListener(cacheKey, originalText, (resolvedText) => {
        onResolve({
          originalText,
          resolvedText,
          symbolID,
          resolvedAt: new Date().toISOString(),
        });
      }),
    );

    iconResolver.resolve(cacheKey, originalText);
  }

  const master = applyOverrides({
    overrideValues: layer.overrideValues,
    symbolMaster: blockDefinition.symbol,
  });

  master.layers.filter(Layers.isSymbolInstance).forEach((child) => {
    subscriptions.push(
      ...resolveLayer({
        cachePrefix: cachePrefix ? `${cachePrefix}/${layerId}` : layerId,
        layer: child,
        onResolve: (data) => {
          const overrideName = Overrides.encodeName(
            [child.do_objectID],
            'resolvedBlockData',
          );
          onResolveOverride(overrideName, data);
        },
        onResolveOverride,
      }),
    );
  });

  return subscriptions;
}
