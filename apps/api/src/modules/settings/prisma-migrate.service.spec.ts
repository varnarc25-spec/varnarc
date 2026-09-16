import { describe, expect, it } from 'vitest';
import { listMigrationFolders, resolvePrismaSchemaPath } from './prisma-migrate.service';
import { existsSync, mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
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
