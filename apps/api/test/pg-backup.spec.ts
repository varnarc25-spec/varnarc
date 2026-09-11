import { describe, expect, it } from 'vitest';
import { poolerHostToDirect, summarizeDumpConnection } from '../../packages/database/src/pg-backup';
import { sqlLiteral, sortTablesByForeignKeys } from '../../packages/database/src/pg-logical-dump';

describe('poolerHostToDirect', () => {
  it('rewrites a PgBouncer-style pooler host and drops channel_binding', () => {
    const input =
      'postgresql://u:p@db-pooler.example.com/varnarc_db?sslmode=require&channel_binding=require';
    const next = poolerHostToDirect(input);
    expect(next).toContain('db.example.com');
    expect(next).not.toContain('-pooler.');
    expect(next).not.toContain('channel_binding');
  });
});

describe('summarizeDumpConnection', () => {
  it('masks host and never returns a password', () => {
    const summary = summarizeDumpConnection(
      'postgresql://owner:secret@postgres.internal/varnarc_db?sslmode=disable',
    );
    expect(summary.configured).toBe(true);
    expect(summary.providerHint).toBe('postgres');
    expect(summary.database).toBe('varnarc_db');
    expect(JSON.stringify(summary)).not.toContain('secret');
    expect(summary.host).toContain('***');
  });
});

describe('sqlLiteral', () => {
  it('encodes SQL-safe values', () => {
    expect(sqlLiteral(null)).toBe('NULL');
    expect(sqlLiteral(true)).toBe('TRUE');
    expect(sqlLiteral("O'Brien")).toBe("'O''Brien'");
  });
});

describe('sortTablesByForeignKeys', () => {
  it('puts referenced tables first', () => {
    expect(
      sortTablesByForeignKeys(['child', 'parent'], [{ table: 'child', references: 'parent' }]),
    ).toEqual(['parent', 'child']);
  });
});
