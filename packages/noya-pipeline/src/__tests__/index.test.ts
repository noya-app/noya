import { z } from 'zod';
import { IPipelineSource, Pipeline } from '../Pipeline';
import { Result } from '../Result';

test('runs a pipeline', async () => {
  const p = new Pipeline();

  let colorToGenerate = '#FF0000';

  const sourceNode: IPipelineSource = {
    id: 'node1',
    name: 'Generate color',
    outputs: {
      color: z.string(),
    },
    getOutput(outputId) {
      if (outputId !== 'color') return;
      return colorToGenerate;
    },
  };

  const source = p.registerSourceNode(sourceNode);

  let value: string | undefined;

  const handle = p.subscribe('node1', 'color', (result: Result<string>) => {
    if (result.type === 'error') return;
    value = result.value;
  });

  await handle.done;

  expect(value).toEqual('#FF0000');

  colorToGenerate = '#00FF00';

  await source.invalidate();

  expect(value).toEqual('#00FF00');

  let value2: string | undefined;

  const handle2 = p.subscribe('node1', 'color', (result: Result<string>) => {
    if (result.type === 'error') return;
    value2 = result.value;
  });

  await handle2.done;

  expect(value2).toEqual('#00FF00');
});
