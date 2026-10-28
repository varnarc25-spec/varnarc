import { describe, expect, it } from 'vitest';
import {
  ELECTION_STATISTICAL_REPORTS,
  electionReportListQuerySchema,
  electionStateFromHeading,
  electionStatesMentioned,
} from '../src/election-reports';

describe('election statistical report catalog', () => {
  it('keeps a unique seed key for every report', () => {
    const keys = ELECTION_STATISTICAL_REPORTS.map((row) => row.seedKey);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('stores the four ECI sections plus the one-page index', () => {
    const count = (section: string) =>
      ELECTION_STATISTICAL_REPORTS.filter((row) => row.section === section).length;
    expect(count('LOK_SABHA')).toBe(21);
    expect(count('STATE_ASSEMBLY')).toBeGreaterThan(300);
    expect(count('BYE_ELECTION')).toBeGreaterThan(70);
    expect(count('FORMER_STATE')).toBe(19);
    expect(count('REFERENCE')).toBe(1);
    const states = new Set(
      ELECTION_STATISTICAL_REPORTS.filter((row) => row.section === 'STATE_ASSEMBLY').map(
        (row) => row.jurisdiction,
      ),
    );
    expect(states.size).toBe(31);
  });

  it('marks only the three bye-election placeholders as missing files', () => {
    const missing = ELECTION_STATISTICAL_REPORTS.filter((row) => row.url === null).map(
      (row) => row.label,
    );
    expect(missing.sort()).toEqual(['Dec 2009', 'Jan 2010', 'November 2010']);
    for (const row of ELECTION_STATISTICAL_REPORTS) {
      if (!row.url) continue;
      expect(row.url.startsWith('https://')).toBe(true);
    }
  });

  it('maps a file heading to one state', () => {
    const names = ['Andhra Pradesh', 'Gujarat', 'Karnataka', 'West Bengal', 'Goa'];
    expect(electionStatesMentioned('Gujarat-111-Umreth', names)).toEqual(['Gujarat']);
    expect(
      electionStatesMentioned(
        'Andhra Pradesh Legislative Assembly Election, 2024 - Statistical Reports',
        names,
      ),
    ).toEqual(['Andhra Pradesh']);
    expect(
      electionStateFromHeading(
        'Karnataka-107-Davanagere south',
        'Bye-elections of Gujarat, Karnataka, Maharashtra',
        null,
        names,
      ),
    ).toBe('Karnataka');
    expect(
      electionStateFromHeading(
        '1 - Other Abbreviations And Description',
        'Andhra Pradesh Legislative Assembly Election, 2024 - Statistical Reports',
        null,
        names,
      ),
    ).toBe('Andhra Pradesh');
  });

  it('accepts empty admin filters', () => {
    const parsed = electionReportListQuerySchema.parse({
      section: '',
      jurisdiction: '',
      search: '',
      page: '2',
    });
    expect(parsed.section).toBeUndefined();
    expect(parsed.jurisdiction).toBeUndefined();
    expect(parsed.page).toBe(2);
    expect(parsed.pageSize).toBe(50);
  });
});
