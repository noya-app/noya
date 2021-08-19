import { execSync, exec } from 'child_process';
import { sleep } from 'noya-utils';
import path from 'path';
import webpack from 'webpack';

jest.setTimeout(60000);

const root = path.join(__dirname, '../..');
const webpackConfig = require('../../webpack.config.js');

async function compile(env: unknown) {
  return new Promise<void>((resolve, reject) => {
    webpack(webpackConfig(env), (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

test('server runs', async () => {
  await compile({ production: true });

  const process = exec('npm run start', { cwd: root });

  await sleep(1000);

  const response = execSync(
    `curl --silent -X POST -H "Content-Type: application/json" --data '{ "query": "{ colors { id } }" }' http://localhost:4000/`,
  );

  process.kill();

  const data = JSON.parse(response.toString('utf8'));

  expect(data).toEqual({
    data: {
      colors: [
        { id: 'BA7A5955-2101-4391-80C6-5A9BA60F9CE1' },
        { id: 'F4C0E2B3-16AD-4032-A858-E418083E5718' },
      ],
    },
  });
});
