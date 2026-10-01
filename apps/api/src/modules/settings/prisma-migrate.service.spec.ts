import { describe, expect, it } from 'vitest';
import {
  listMigrationFolders,
  resolvePrismaCli,
  resolvePrismaSchemaPath,
} from './prisma-migrate.service';
import { chmodSync, existsSync, mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

describe('resolvePrismaSchemaPath', () => {
  it('prefers PRISMA_SCHEMA_PATH when the file exists', () => {
    const dir = mkdtempSync(join(tmpdir(), 'prisma-schema-'));
    const schema = join(dir, 'schema.prisma');
    writeFileSync(schema, 'generator client {}\n');
    expect(resolvePrismaSchemaPath('/nope', { PRISMA_SCHEMA_PATH: schema })).toBe(schema);
  });

  it('returns null when nothing exists', () => {
    expect(resolvePrismaSchemaPath('/tmp/does-not-exist-varnarc', {})).toBeNull();
  });
});

describe('resolvePrismaCli', () => {
  it('finds prisma at the monorepo root relative to apps/api cwd', () => {
    const root = mkdtempSync(join(tmpdir(), 'prisma-cli-'));
    const apiCwd = join(root, 'apps', 'api');
    mkdirSync(join(root, 'node_modules/.bin'), { recursive: true });
    mkdirSync(apiCwd, { recursive: true });
    const shim = join(root, 'node_modules/.bin/prisma');
    writeFileSync(shim, '#!/bin/sh\n');
    chmodSync(shim, 0o755);
    expect(resolvePrismaCli(apiCwd)).toEqual({ command: shim, args: [] });
  });

  it('returns null when prisma is missing', () => {
    expect(resolvePrismaCli(join(tmpdir(), 'no-prisma-here'))).toBeNull();
  });
});

describe('listMigrationFolders', () => {
  it('lists migration directories next to the schema', () => {
    const dir = mkdtempSync(join(tmpdir(), 'prisma-mig-'));
    const schema = join(dir, 'schema.prisma');
    writeFileSync(schema, '');
    mkdirSync(join(dir, 'migrations', '20240101000000_init'), { recursive: true });
    mkdirSync(join(dir, 'migrations', '20240201000000_next'), { recursive: true });
    const names = listMigrationFolders(schema);
    expect(names).toEqual(['20240101000000_init', '20240201000000_next']);
    expect(existsSync(join(dir, 'migrations'))).toBe(true);
  });
});
