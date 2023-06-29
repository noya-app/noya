import Sketch from 'noya-file-format';
import { applyOverrides, Layers, Overrides } from 'noya-state';
import { encodeQueryParameters, isExternalUrl } from 'noya-utils';
import { Blocks } from '../blocks/blocks';
import {
  iconSymbolId,
  imageSymbolId,
  writeSymbolId,
} from '../blocks/symbolIds';
import { parseBlock } from '../parse';
import { GenerateResolver } from './GenerateResolver';
import { IconResolver } from './IconResolver';
import { Attribution, RandomImageResolver } from './RandomImageResolver';

// const redirectResolver = new RedirectResolver();
const generateResolver = new GenerateResolver();
const iconResolver = new IconResolver();
const randomImageResolver = new RandomImageResolver();

export function clearResolverCache(key: string) {
  randomImageResolver.clearCache(key);
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
  onResolve: (
    data: Sketch.ResolvedBlockData | undefined,
    attribution?: Attribution,
  ) => void;
  onResolveOverride: (
    overrideName: string,
    data: Sketch.ResolvedBlockData | undefined,
    attribution?: Attribution,
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
    { placeholder: blockDefinition.placeholderText },
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

    const terms = originalText
      .split(' ')
      .map((term) => term.trim())
      .join(',');

    // http://localhost:31112/api/images/random?query=hat&width=10&height=20
    const query = encodeQueryParameters({
      query: terms,
      width,
      height,
      buster: cacheKey,
    });

    subscriptions.push(
      randomImageResolver.addListener(cacheKey, query, (response) => {
        onResolve(
          {
            originalText,
            resolvedText: response.url,
            symbolID,
            resolvedAt: new Date().toISOString(),
          },
          response,
        );
      }),
    );

    randomImageResolver.resolve(cacheKey, query);
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
        onResolve: (data, attribution) => {
          const overrideName = Overrides.encodeName(
            [child.do_objectID],
            'resolvedBlockData',
          );
          onResolveOverride(overrideName, data, attribution);
        },
        onResolveOverride,
      }),
    );
  });

  return subscriptions;
}
