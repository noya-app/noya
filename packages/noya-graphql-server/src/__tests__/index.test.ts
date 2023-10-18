import { execSync, fork } from 'child_process';
import http from 'http';
import path from 'path';

jest.setTimeout(90000);

const root = path.join(__dirname, '../..');

const port = 4041;

function makeGraphQLQuery({ query }: { query: string }) {
  return new Promise<unknown>((resolve, reject) => {
    const options: http.RequestOptions = {
      host: 'localhost',
      port,
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
  execSync('npm run build --scripts-prepend-node-path', {
    cwd: root,
  });

  const child = fork(path.join(root, 'build', 'bundle.js'), {
    cwd: root,
    env: { ...process.env, PORT: port.toString() },
  });

  await new Promise<void>((resolve) => {
    child.on('message', (message) => {
      if (message === 'ready') {
        resolve();
      }
    });
  });

  const data = await makeGraphQLQuery({ query: '{ colors { id } }' });

  child.kill();

  expect(data).toEqual({
    data: {
      colors: [
        { id: 'BA7A5955-2101-4391-80C6-5A9BA60F9CE1' },
        { id: 'F4C0E2B3-16AD-4032-A858-E418083E5718' },
      ],
    },
  });
});
