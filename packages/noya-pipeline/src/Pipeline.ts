import { ObjectCache } from './ObjectCache';
import { error, Result, success } from './Result';

export interface IPipelineNode {
  id: string;
  name: string;
}

type Schema = Zod.ZodTypeAny;

export interface IPipelineSource extends IPipelineNode {
  outputs: { [outputId: string]: Schema };
  getOutput: (outputId: string) => unknown | Promise<unknown>;
}

type ResultCallback<T> = (value: Result<T>) => void;

export class Pipeline {
  nodes: Record<string, IPipelineNode> = {};
  outputCache = new ObjectCache<Result<any>>();
  subscriptions = new ObjectCache<ResultCallback<any>[]>();
  lastEmitted = new Map<ResultCallback<any>, Result<any>>();

  registerSourceNode(node: IPipelineSource) {
    this.nodes[node.id] = node;

    return {
      invalidate: (keys?: string[]) => this.invalidateOutput(node.id, keys),
    };
  }

  invalidateOutput = async (nodeId: string, keys?: string[]) => {
    const node = this.getSourceNode(nodeId);

    if (node.type === 'error') throw node.error;

    const allKeys = keys ?? Object.keys(node.value.outputs);

    await Promise.all(
      allKeys.map((key) => {
        this.outputCache.delete(node.value.id, key);

        // const subscriptions = this.subscriptions.get(node.value.id, key) ?? [];

        // subscriptions.forEach((callback) => {
        //   this.lastEmitted.delete(callback);
        // });

        return this._emit(node.value.id, key);
      }),
    );
  };

  getSourceNode(nodeId: string): Result<IPipelineSource> {
    const node = this.nodes[nodeId];

    if (!node) return error(new Error(`Invalid node id: ${nodeId}`));

    return success(node as IPipelineSource);
  }

  getOutputSchema(nodeId: string, outputId: string): Result<Schema> {
    const node = this.getSourceNode(nodeId);

    if (node.type === 'error') return node;

    const registeredOutput = node.value.outputs[outputId];

    if (!registeredOutput)
      return error(new Error(`Invalid output id: ${outputId}`));

    return success(registeredOutput);
  }

  async _getOutput(nodeId: string, outputId: string) {
    const node = this.getSourceNode(nodeId);

    if (node.type === 'error') return node;

    const schema = this.getOutputSchema(nodeId, outputId);

    if (schema.type === 'error') return schema;

    const output = await node.value.getOutput(outputId);

    const parsed = schema.value.safeParse(output);

    return parsed.success
      ? success(output)
      : error(new Error(parsed.error.message));
  }

  async _updateCache(nodeId: string, outputId: string) {
    const output = await this._getOutput(nodeId, outputId);

    this.outputCache.set(nodeId, outputId, output);
  }

  subscribe<T>(nodeId: string, outputId: string, callback: ResultCallback<T>) {
    const subscriptions: ResultCallback<T>[] =
      this.subscriptions.get(nodeId, outputId) ?? [];

    this.subscriptions.set(nodeId, outputId, [...subscriptions, callback]);

    const promise = this._emit(nodeId, outputId);

    return {
      unsubscribe: () => this.unsubscribe(nodeId, outputId, callback),
      done: promise,
    };
  }

  unsubscribe<T>(
    nodeId: string,
    outputId: string,
    callback: ResultCallback<T>,
  ) {
    const subscriptions: ResultCallback<T>[] =
      this.subscriptions.get(nodeId, outputId) ?? [];

    this.subscriptions.set(
      nodeId,
      outputId,
      subscriptions.filter((x) => x !== callback),
    );
  }

  async _emit<T>(nodeId: string, outputId: string) {
    const subscriptions: ResultCallback<T>[] =
      this.subscriptions.get(nodeId, outputId) ?? [];

    let cached = this.outputCache.get(nodeId, outputId);

    if (!cached) {
      await this._updateCache(nodeId, outputId);
    }

    cached = this.outputCache.get(nodeId, outputId);

    if (!cached) {
      throw new Error(
        `Cache didn't update. Aborting pipeline to avoid infinite loop ${nodeId} ${outputId}`,
      );
    }

    const value = cached;

    subscriptions.forEach((callback) => {
      if (this.lastEmitted.get(callback) === value) return;

      this.lastEmitted.set(callback, value);

      callback(value);
    });
  }
}
