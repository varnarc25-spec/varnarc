import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const require = createRequire(join(process.cwd(), 'package.json'));
const nextBin = require.resolve('next/dist/bin/next');
const args = ['build'];

if (process.env.DOCKER_BUILD === '1') {
  console.log('[build] DOCKER_BUILD=1 — compile only (no static page generation)');
  args.push('--experimental-build-mode=compile');
}

const result = spawnSync(process.execPath, [nextBin, ...args], {
  stdio: 'inherit',
  env: process.env,
});
process.exit(result.status ?? 1);
