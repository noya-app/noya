import { exec } from 'child_process';
import http from 'http';
// import { sleep } from 'noya-utils';
import path from 'path';
// import webpack from 'webpack';

jest.setTimeout(60000);

const root = path.join(__dirname, '../..');
// const webpackConfig = require('../../webpack.config.js');

// function compile(env: unknown) {
//   return new Promise<void>((resolve, reject) => {
//     webpack(webpackConfig(env), (error, stats) => {
//       if (error) {
//         reject(error);
//         // } else if (stats?.hasErrors()) {
//         //   reject(
//         //     stats.toString({
//         //       chunks: false, // Makes the build much quieter
//         //       colors: true, // Shows colors in the console
//         //     }),
//         //   );
//       } else {
//         resolve();
//       }
//     });
//   });
// }

function makeGraphQLQuery({ query }: { query: string }) {
  return new Promise<unknown>((resolve, reject) => {
    const options: http.RequestOptions = {
      host: '127.0.0.1',
      port: 4000,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    };

    const request = http.request(options, (response) => {
      response.resume();
      response.setEncoding('utf8');
      let data = '';
      response.on('error', reject);
      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', () => {
        resolve(JSON.parse(data));
      });
    });

    request.write(JSON.stringify({ query }));
    request.end();
  });
}

test('server runs', async () => {
  // await compile({ production: true });

  const process = exec('npm run dev', { cwd: root });

  // await sleep(10000);

  const data = await makeGraphQLQuery({ query: '{ colors { id } }' });

  process.kill();

  expect(data).toEqual({
    data: {
      colors: [
        { id: 'BA7A5955-2101-4391-80C6-5A9BA60F9CE1' },
        { id: 'F4C0E2B3-16AD-4032-A858-E418083E5718' },
      ],
    },
  });
});
