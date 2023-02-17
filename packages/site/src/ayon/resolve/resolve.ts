import Sketch from 'noya-file-format';
import { applyOverrides, Layers, Overrides } from 'noya-state';
import { isExternalUrl } from 'noya-utils';
import { Blocks } from '../blocks';
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
  layer,
  onResolve,
  onResolveOverride,
}: {
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

  if (symbolID === imageSymbolId && !isExternalUrl(blockText)) {
    const width = frame.width === 0 ? 512 : frame.width;
    const height = frame.height === 0 ? 512 : frame.height;

    const unsplashUrl = `https://source.unsplash.com/${width}x${height}?${encodeURIComponent(
      originalText,
    )}`;

    // console.log('resolve nested', {
    //   blockText,
    //   resolvedBlockData,
    //   frame,
    //   symbolID,
    //   layerId,
    // });

    subscriptions.push(
      redirectResolver.addListener(layerId, unsplashUrl, (resolvedText) => {
        // console.log('resolve nested', resolvedText);

        onResolve({
          originalText,
          resolvedText,
          symbolID,
          resolvedAt: new Date().toISOString(),
        });
      }),
    );

    redirectResolver.resolve(layerId, unsplashUrl);
  } else if (symbolID === writeSymbolId) {
    onResolve(undefined);

    subscriptions.push(
      generateResolver.addListener(layerId, originalText, (resolvedText) => {
        onResolve({
          originalText,
          resolvedText,
          symbolID,
          resolvedAt: new Date().toISOString(),
        });
      }),
    );

    generateResolver.resolve(layerId, originalText);
  } else if (symbolID === iconSymbolId) {
    subscriptions.push(
      iconResolver.addListener(layerId, originalText, (resolvedText) => {
        onResolve({
          originalText,
          resolvedText,
          symbolID,
          resolvedAt: new Date().toISOString(),
        });
      }),
    );

    iconResolver.resolve(layerId, originalText);
  }

  const master = applyOverrides({
    overrideValues: layer.overrideValues,
    symbolMaster: blockDefinition.symbol,
  });

  master.layers.filter(Layers.isSymbolInstance).forEach((child) => {
    subscriptions.push(
      ...resolveLayer({
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
