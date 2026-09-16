import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import type { PrismaClient } from '@varnarc/database';
import { PRISMA } from '../../database/database.module';

export type PrismaMigrationRow = {
  name: string;
  finishedAt: string | null;
  rolledBack: boolean;
};

export function resolvePrismaSchemaPath(cwd = process.cwd(), env = process.env): string | null {
  const fromEnv = env.PRISMA_SCHEMA_PATH?.trim();
  const candidates = [
    fromEnv,
    join(cwd, 'packages/database/prisma/schema.prisma'),
    join(cwd, '../../packages/database/prisma/schema.prisma'),
  ].filter((p): p is string => Boolean(p));
  return candidates.find((path) => existsSync(path)) ?? null;
}

export function listMigrationFolders(schemaPath: string): string[] {
  const dir = join(schemaPath, '..', 'migrations');
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== 'migration_lock.toml')
    .map((entry) => entry.name)
    .sort();
}

@Injectable()
export class PrismaMigrateService {
  constructor(@Inject(PRISMA) private readonly db: PrismaClient) {}

  async status() {
    const schemaPath = resolvePrismaSchemaPath();
    const onDisk = schemaPath ? listMigrationFolders(schemaPath) : [];
    const applied = await this.appliedMigrations();
    const appliedNames = new Set(applied.filter((row) => !row.rolledBack).map((row) => row.name));
    const pending = onDisk.filter((name) => !appliedNames.has(name));
    return {
      schemaPath,
      prismaCliAvailable: Boolean(this.prismaBin()),
      applied,
      pending,
      onDiskCount: onDisk.length,
      pendingCount: pending.length,
    };
  }

  async deploy() {
    const schemaPath = resolvePrismaSchemaPath();
    if (!schemaPath) {
      throw new ServiceUnavailableException(
        'Prisma schema is not in this API image. Rebuild the api container.',
      );
    }
    const bin = this.prismaBin();
    if (!bin) {
      throw new ServiceUnavailableException('Prisma CLI is not installed in the API image.');
    }

    const { code, stdout, stderr } = await this.runPrisma([
      'migrate',
      'deploy',
      `--schema=${schemaPath}`,
    ]);
    if (code !== 0) {
      throw new ServiceUnavailableException(
        stderr.trim() || stdout.trim() || `prisma migrate deploy exited ${code}`,
      );
    }
    return {
      ok: true,
      output: [stdout, stderr].filter(Boolean).join('\n').trim(),
      ...(await this.status()),
    };
  }

  private prismaBin(): string | null {
    const local = join(process.cwd(), 'node_modules/.bin/prisma');
    if (existsSync(local)) return local;
    return null;
  }

  private appliedMigrations(): Promise<PrismaMigrationRow[]> {
    return this.db.$queryRaw<
      Array<{ migration_name: string; finished_at: Date | null; rolled_back_at: Date | null }>
    >`SELECT migration_name, finished_at, rolled_back_at FROM "_prisma_migrations" ORDER BY started_at ASC`
      .then((rows) =>
        rows.map((row) => ({
          name: row.migration_name,
          finishedAt: row.finished_at ? row.finished_at.toISOString() : null,
          rolledBack: Boolean(row.rolled_back_at),
        })),
      )
      .catch(() => []);
  }

  private runPrisma(args: string[]): Promise<{ code: number; stdout: string; stderr: string }> {
    const bin = this.prismaBin();
    if (!bin) {
      return Promise.resolve({ code: 127, stdout: '', stderr: 'prisma CLI missing' });
    }
    return new Promise((resolve) => {
      const child = spawn(bin, args, {
        env: process.env,
        cwd: process.cwd(),
      });
      let stdout = '';
      let stderr = '';
      child.stdout.on('data', (chunk: Buffer) => {
        stdout += chunk.toString();
      });
      child.stderr.on('data', (chunk: Buffer) => {
        stderr += chunk.toString();
      });
      child.on('error', (error) => {
        resolve({ code: 1, stdout, stderr: error.message });
      });
      child.on('close', (code) => {
        resolve({ code: code ?? 1, stdout, stderr });
      });
    });
  }
}
