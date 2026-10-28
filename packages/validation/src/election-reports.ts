import { z } from 'zod';
import { paginationQuerySchema } from './common';

/** Official index these rows were copied from. */
export const ELECTION_REPORT_SOURCE_URL = 'https://www.eci.gov.in/statistical-reports';

export const electionReportSectionSchema = z.enum([
  'LOK_SABHA',
  'STATE_ASSEMBLY',
  'BYE_ELECTION',
  'FORMER_STATE',
  'REFERENCE',
]);

export type ElectionReportSection = z.infer<typeof electionReportSectionSchema>;

export const ELECTION_REPORT_SECTION_LABELS: Record<ElectionReportSection, string> = {
  LOK_SABHA: 'Lok Sabha',
  STATE_ASSEMBLY: 'State legislative assembly',
  BYE_ELECTION: 'Bye election',
  FORMER_STATE: 'Former state',
  REFERENCE: 'Reference',
};

const optionalQueryString = z.preprocess(
  (value) => (value === '' || value === null ? undefined : value),
  z.string().trim().min(1).max(160).optional(),
);

export const electionReportListQuerySchema = paginationQuerySchema.extend({
  section: z.preprocess(
    (value) => (value === '' || value === null ? undefined : value),
    electionReportSectionSchema.optional(),
  ),
  jurisdiction: optionalQueryString,
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
});

export type ElectionReportListQuery = z.infer<typeof electionReportListQuerySchema>;

export type ElectionReportSeedRow = {
  seedKey: string;
  section: ElectionReportSection;
  jurisdiction: string | null;
  label: string;
  url: string | null;
  sortOrder: number;
};

type LinkPair = [label: string, url: string | null];
type LinkGroup = { jurisdiction: string | null; links: LinkPair[] };

function slug(value: string): string {
  const base = value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base.slice(0, 96) || 'item';
}

function buildRows(section: ElectionReportSection, groups: LinkGroup[]): ElectionReportSeedRow[] {
  const used = new Set<string>();
  const rows: ElectionReportSeedRow[] = [];
  let sortOrder = 0;
  for (const group of groups) {
    for (const [label, url] of group.links) {
      const base = [
        section.toLowerCase().replaceAll('_', '-'),
        group.jurisdiction ? slug(group.jurisdiction) : 'all',
        slug(label),
      ].join('/');
      let seedKey = base;
      let suffix = 2;
      while (used.has(seedKey)) {
        seedKey = `${base}-${suffix}`;
        suffix += 1;
      }
      used.add(seedKey);
      rows.push({
        seedKey,
        section,
        jurisdiction: group.jurisdiction,
        label,
        url,
        sortOrder,
      });
      sortOrder += 1;
    }
  }
  return rows;
}

function group(jurisdiction: string | null, links: LinkPair[]): LinkGroup {
  return { jurisdiction, links };
}

const LOK_SABHA = buildRows('LOK_SABHA', [
  group(null, [
    ['2024', 'https://www.eci.gov.in/general-election-to-loksabha-2024-statistical-reports'],
    [
      '2019 (Including Vellore PC)',
      'https://old.eci.gov.in/files/category/1551-general-election-2019-including-vellore-pc/',
    ],
    [
      '2019 (Excluding Vellore PC)',
      'https://old.eci.gov.in/files/category/1359-general-election-2019-excluding-vellore-pc/',
    ],
    ['2014', 'https://old.eci.gov.in/files/category/97-general-election-2014/'],
    ['2009 Vol I, II, III', 'https://old.eci.gov.in/files/category/98-general-election-2009/'],
    [
      '2004 Vol I, II, III',
      'https://old.eci.gov.in/files/file/4126-general-election-2004-vol-i-ii-iii/',
    ],
    [
      '1999 Vol I, II, III',
      'https://old.eci.gov.in/files/file/4125-general-election-1999-vol-i-ii-iii/',
    ],
    ['1998 Vol I, II', 'https://old.eci.gov.in/files/file/4124-general-election-1998-vol-i-ii/'],
    ['1996 Vol I, II', 'https://old.eci.gov.in/files/file/4123-general-election-1996-vol-i-ii/'],
    ['1992 Vol I, II', 'https://old.eci.gov.in/files/file/4122-general-election-1992-vol-i-ii/'],
    ['1991 Vol I, II', 'https://old.eci.gov.in/files/file/4121-general-election-1991-vol-i-ii/'],
    ['1989 Vol I, II', 'https://old.eci.gov.in/files/file/4120-general-election-1989-vol-i-ii/'],
    ['1985 Vol I, II', 'https://old.eci.gov.in/files/file/4119-general-election-1985-vol-i-ii/'],
    ['1984 Vol I, II', 'https://old.eci.gov.in/files/file/4118-general-election-1984-vol-i-ii/'],
    ['1980 Vol I, II', 'https://old.eci.gov.in/files/file/4117-general-election-1980-vol-i-ii/'],
    ['1977 Vol I, II', 'https://old.eci.gov.in/files/file/4116-general-election-1977-vol-i-ii/'],
    ['1971 Vol I, II', 'https://old.eci.gov.in/files/file/4115-general-election-1971-vol-i-ii/'],
    ['1967 Vol I, II', 'https://old.eci.gov.in/files/file/4114-general-election-1967-vol-i-ii/'],
    ['1962 Vol I, II', 'https://old.eci.gov.in/files/file/4113-general-election-1962-vol-i-ii/'],
    ['1957 Vol I, II', 'https://old.eci.gov.in/files/file/4112-general-election-1957-vol-i-ii/'],
    ['1951 Vol I, II', 'https://old.eci.gov.in/files/file/4111-general-election-1951-vol-i-ii/'],
  ]),
]);

const STATE_ASSEMBLY = buildRows('STATE_ASSEMBLY', [
  group('Andhra Pradesh', [
    ['2024', 'https://www.eci.gov.in/statistical-report/ae/2024/2'],
    [
      '2019',
      'https://old.eci.gov.in/files/file/11673-andhra-pradesh-legislative-assembly-election-2019/',
    ],
    ['2014', 'https://old.eci.gov.in/files/file/4055-andhra-pradesh-2014/'],
    ['2009', 'https://old.eci.gov.in/files/file/4054-andhra-pradesh-2009/'],
    ['2004', 'https://old.eci.gov.in/files/file/4053-andhra-pradesh-2004/'],
    ['1999', 'https://old.eci.gov.in/files/file/4052-andhra-pradesh-1999/'],
    ['1994', 'https://old.eci.gov.in/files/file/4051-andhra-pradesh-1994/'],
    ['1989', 'https://old.eci.gov.in/files/file/4050-andhra-pradesh-1989/'],
    ['1985', 'https://old.eci.gov.in/files/file/4049-andhra-pradesh-1985/'],
    ['1983', 'https://old.eci.gov.in/files/file/4048-andhra-pradesh-1983/'],
    ['1978', 'https://old.eci.gov.in/files/file/4047-andhra-pradesh-1978/'],
    ['1972', 'https://old.eci.gov.in/files/file/4046-andhra-pradesh-1972/'],
    ['1967', 'https://old.eci.gov.in/files/file/4045-andhra-pradesh-1967/'],
    ['1962', 'https://old.eci.gov.in/files/file/4044-andhra-pradesh-1962/'],
    ['1957', 'https://old.eci.gov.in/files/file/4043-andhra-pradesh-1957/'],
    ['1955', 'https://old.eci.gov.in/files/file/4042-andhra-pradesh-1955/'],
  ]),
  group('Arunachal Pradesh', [
    ['2024', 'https://www.eci.gov.in/statistical-report/ae/2024/3'],
    [
      '2019',
      'https://old.eci.gov.in/files/file/11675-arunachal-pradesh-legislative-assembly-election-2019/',
    ],
    ['2014', 'https://old.eci.gov.in/files/file/4040-arunachal-pradesh-2014/'],
    ['2009', 'https://old.eci.gov.in/files/file/4039-arunachal-pradesh-2009/'],
    ['2004', 'https://old.eci.gov.in/files/file/4038-arunachal-pradesh-2004/'],
    ['1999', 'https://old.eci.gov.in/files/file/4036-arunachal-pradesh-1999/'],
    ['1995', 'https://old.eci.gov.in/files/file/4035-arunachal-pradesh-1995/'],
    ['1990', 'https://old.eci.gov.in/files/file/4032-arunachal-pradesh-1990/'],
    ['1984', 'https://old.eci.gov.in/files/file/4030-arunachal-pradesh-1984/'],
    ['1980', 'https://old.eci.gov.in/files/file/4028-arunachal-pradesh-1980/'],
    ['1978', 'https://old.eci.gov.in/files/file/4025-arunachal-pradesh-1978/'],
  ]),
  group('Assam', [
    ['2026', 'https://www.eci.gov.in/statistical-report/ae/2026/23'],
    ['2021', 'https://old.eci.gov.in/files/file/13620-assam-general-legislative-election-2021/'],
    ['2016', 'https://old.eci.gov.in/files/file/4017-assam-general-legislative-election-2016/'],
    ['2011', 'https://old.eci.gov.in/files/file/4010-assam-2011/'],
    ['2006', 'https://old.eci.gov.in/files/file/4009-assam-2006/'],
    ['2001', 'https://old.eci.gov.in/files/file/4007-assam-2001/'],
    ['1996', 'https://old.eci.gov.in/files/file/4004-assam-1996/'],
    ['1991', 'https://old.eci.gov.in/files/file/4003-assam-1991/'],
    ['1985', 'https://old.eci.gov.in/files/file/4000-assam-1985/'],
    ['1983', 'https://old.eci.gov.in/files/file/3998-assam-1983/'],
    ['1978', 'https://old.eci.gov.in/files/file/3996-assam-1978/'],
    ['1972', 'https://old.eci.gov.in/files/file/3995-assam-1972/'],
    ['1967', 'https://old.eci.gov.in/files/file/3994-assam-1967/'],
    ['1962', 'https://old.eci.gov.in/files/file/3992-assam-1962/'],
    ['1957', 'https://old.eci.gov.in/files/file/3991-assam-1957/'],
    ['1951', 'https://old.eci.gov.in/files/file/3989-assam-general-legislative-election-1951/'],
  ]),
  group('Bihar', [
    ['2025', 'https://www.eci.gov.in/statistical-report/ae/2025/16'],
    ['2020', 'https://old.eci.gov.in/files/file/12787-bihar-legislative-election-2020/'],
    ['2015', 'https://old.eci.gov.in/files/file/3904-bihar-2015/'],
    ['2010', 'https://old.eci.gov.in/files/file/3903-bihar-2010/'],
    ['2005', 'https://old.eci.gov.in/files/file/3901-bihar-2005/'],
    ['2000', 'https://old.eci.gov.in/files/file/3900-bihar-2000/'],
    ['1995', 'https://old.eci.gov.in/files/file/3899-bihar-1995/'],
    ['1990', 'https://old.eci.gov.in/files/file/3897-bihar-1990/'],
    ['1985', 'https://old.eci.gov.in/files/file/3896-bihar-1985/'],
    ['1980', 'https://old.eci.gov.in/files/file/3894-bihar-1980/'],
    ['1977', 'https://old.eci.gov.in/files/file/3893-bihar-1977/'],
    ['1972', 'https://old.eci.gov.in/files/file/3892-bihar-1972/'],
    ['1969', 'https://old.eci.gov.in/files/file/3890-bihar-1969/'],
    ['1967', 'https://old.eci.gov.in/files/file/3889-bihar-1967/'],
    ['1962', 'https://old.eci.gov.in/files/file/3888-bihar-1962/'],
    ['1957', 'https://old.eci.gov.in/files/file/3887-bihar-1957/'],
    ['1951', 'https://old.eci.gov.in/files/file/3886-bihar-1951/'],
  ]),
  group('Chhattisgarh', [
    ['2023', 'https://www.eci.gov.in/chhattisgarh-legislative-election-2023-statistical-report'],
    [
      '2018',
      'https://old.eci.gov.in/files/file/9643-statistical-data-of-general-election-to-chhatisgarh-assembly-2018/',
    ],
    ['2013', 'https://old.eci.gov.in/files/file/3884-chhattisgarh-2013/'],
    ['2008', 'https://old.eci.gov.in/files/file/3883-chhattisgarh-2008/'],
    ['2003', 'https://old.eci.gov.in/files/file/3882-chhattisgarh-2003/'],
  ]),
  group('Delhi', [
    ['2025', 'https://www.eci.gov.in/statistical-report/ae/2025/10'],
    ['2020', 'https://old.eci.gov.in/files/file/12027-general-legislative-election-2020/'],
    ['2015', 'https://old.eci.gov.in/files/file/3878-delhi-2015/'],
    ['2013', 'https://old.eci.gov.in/files/file/3877-delhi-2013/'],
    ['2008', 'https://old.eci.gov.in/files/file/3876-delhi-2008/'],
    ['2003', 'https://old.eci.gov.in/files/file/3875-delhi-2003/'],
    ['1998', 'https://old.eci.gov.in/files/file/3873-delhi-1998/'],
    ['1993', 'https://old.eci.gov.in/files/file/3872-delhi-1993/'],
    ['1983', 'https://old.eci.gov.in/files/file/3871-delhi-1983/'],
    ['1977', 'https://old.eci.gov.in/files/file/3868-delhi-1977/'],
    ['1972', 'https://old.eci.gov.in/files/file/3867-delhi-1972/'],
    ['1951', 'https://old.eci.gov.in/files/file/3865-delhi-1951/'],
  ]),
  group('Goa', [
    ['2022', 'https://old.eci.gov.in/files/file/14168-goa-general-legislative-election-2022/'],
    ['2017', 'https://old.eci.gov.in/files/file/3862-goa-general-legislative-election-2017/'],
    ['2012', 'https://old.eci.gov.in/files/file/3856-goa-2012/'],
    ['2007', 'https://old.eci.gov.in/files/file/3855-goa-2007/'],
    ['2002', 'https://old.eci.gov.in/files/file/3853-goa-2002/'],
    ['1999', 'https://old.eci.gov.in/files/file/3852-goa-1999/'],
    ['1994', 'https://old.eci.gov.in/files/file/3850-goa-1994/'],
    ['1989', 'https://old.eci.gov.in/files/file/3849-goa-1989/'],
    ['1984', 'https://old.eci.gov.in/files/file/3847-goa-1984/'],
    ['1980', 'https://old.eci.gov.in/files/file/3845-goa-1980/'],
    ['1977', 'https://old.eci.gov.in/files/file/3844-goa-1977/'],
    ['1972', 'https://old.eci.gov.in/files/file/3843-goa-1972/'],
    ['1967', 'https://old.eci.gov.in/files/file/3842-goa-1967/'],
  ]),
  group('Gujarat', [
    ['2022', 'https://old.eci.gov.in/files/file/14750-gujarat-general-legislative-election-2022/'],
    ['2017', 'https://old.eci.gov.in/files/file/3841-gujarat-general-legislative-election-2017/'],
    ['2012', 'https://old.eci.gov.in/files/file/3840-gujarat-2012/'],
    ['2007', 'https://old.eci.gov.in/files/file/3839-gujarat-2007/'],
    ['2002', 'https://old.eci.gov.in/files/file/3838-gujarat-2002/'],
    ['1998', 'https://old.eci.gov.in/files/file/3837-gujarat-1998/'],
    ['1995', 'https://old.eci.gov.in/files/file/3836-gujarat-1995/'],
    ['1990', 'https://old.eci.gov.in/files/file/3835-gujarat-1990/'],
    ['1985', 'https://old.eci.gov.in/files/file/3834-gujarat-1985/'],
    ['1980', 'https://old.eci.gov.in/files/file/3832-gujarat-1980/'],
    ['1975', 'https://old.eci.gov.in/files/file/3831-gujarat-1975/'],
    ['1972', 'https://old.eci.gov.in/files/file/3830-gujarat-1972/'],
    ['1967', 'https://old.eci.gov.in/files/file/3829-gujarat-1967/'],
    ['1962', 'https://old.eci.gov.in/files/file/3828-gujarat-1962/'],
  ]),
  group('Haryana', [
    ['2024', 'https://www.eci.gov.in/statistical-report/ae/2024/6'],
    ['2019', 'https://old.eci.gov.in/files/file/11697-haryana-legislative-assembly-election-2019/'],
    ['2014', 'https://old.eci.gov.in/files/file/3827-haryana-2014/'],
    ['2009', 'https://old.eci.gov.in/files/file/3826-haryana-2009/'],
    ['2005', 'https://old.eci.gov.in/files/file/3825-haryana-2005/'],
    ['2000', 'https://old.eci.gov.in/files/file/3824-haryana-2000/'],
    ['1996', 'https://old.eci.gov.in/files/file/3823-haryana-1996/'],
    ['1991', 'https://old.eci.gov.in/files/file/3822-haryana-1991/'],
    ['1987', 'https://old.eci.gov.in/files/file/3821-haryana-1987/'],
    ['1982', 'https://old.eci.gov.in/files/file/3820-haryana-1982/'],
    ['1977', 'https://old.eci.gov.in/files/file/3819-haryana-1977/'],
    ['1972', 'https://old.eci.gov.in/files/file/3818-haryana-1972/'],
    ['1968', 'https://old.eci.gov.in/files/file/3817-haryana1968/'],
    ['1967', 'https://old.eci.gov.in/files/file/3816-haryana-1967/'],
  ]),
  group('Himachal Pradesh', [
    [
      '2022',
      'https://old.eci.gov.in/files/file/14751-himachal-pradesh-general-legislative-election-2022/',
    ],
    [
      '2017',
      'https://old.eci.gov.in/files/file/3815-himachal-pradesh-general-legislative-election-2017/',
    ],
    ['2012', 'https://old.eci.gov.in/files/file/3812-himachal-pradesh-2012/'],
    ['2007', 'https://old.eci.gov.in/files/file/3811-himachal-pradesh-2007/'],
    ['2003', 'https://old.eci.gov.in/files/file/3810-himachal-pradesh-2003/'],
    ['1998', 'https://old.eci.gov.in/files/file/3809-himachal-pradesh-1998/'],
    ['1993', 'https://old.eci.gov.in/files/file/3808-himachal-pradesh-1993/'],
    ['1990', 'https://old.eci.gov.in/files/file/3807-himachal-pradesh-1990/'],
    ['1985', 'https://old.eci.gov.in/files/file/3806-himachal-pradesh-1985/'],
    ['1982', 'https://old.eci.gov.in/files/file/3805-himachal-pradesh-1982/'],
    ['1977', 'https://old.eci.gov.in/files/file/3803-himachal-pradesh-1977/'],
    ['1972', 'https://old.eci.gov.in/files/file/3802-himachal-pradesh-1972/'],
    ['1967', 'https://old.eci.gov.in/files/file/3801-himachal-pradesh-1967/'],
    ['1951', 'https://old.eci.gov.in/files/file/3799-himachal-pradesh-1951/'],
  ]),
  group('Jammu & Kashmir', [
    ['2024', 'https://www.eci.gov.in/statistical-report/ae/2024/7'],
    ['2014', 'https://old.eci.gov.in/files/file/3797-jammu-kashmir-2014/'],
    ['2008', 'https://old.eci.gov.in/files/file/3796-jammu-kashmir-2008/'],
    ['2002', 'https://old.eci.gov.in/files/file/3795-jammu-kashmir-2002/'],
    ['1996', 'https://old.eci.gov.in/files/file/3794-jammu-kashmir-1996/'],
    ['1987', 'https://old.eci.gov.in/files/file/3793-jammu-kashmir-1987/'],
    ['1983', 'https://old.eci.gov.in/files/file/3792-jammu-kashmir-1983/'],
    ['1977', 'https://old.eci.gov.in/files/file/3791-jammu-kashmir-1977/'],
    ['1972', 'https://old.eci.gov.in/files/file/3790-jammu-kashmir-1972/'],
    ['1967', 'https://old.eci.gov.in/files/file/3789-jammu-kashmir-1967/'],
    ['1962', 'https://old.eci.gov.in/files/file/3788-jammu-kashmir-1962/'],
  ]),
  group('Jharkhand', [
    ['2024', 'https://www.eci.gov.in/statistical-report/ae/2024/9'],
    [
      '2019',
      'https://old.eci.gov.in/files/file/11813-jharkhand-legislative-assembly-election-2019/',
    ],
    ['2014', 'https://old.eci.gov.in/files/file/3787-jharkhand-2014/'],
    ['2009', 'https://old.eci.gov.in/files/file/3786-jharkhand-2009/'],
    ['2005', 'https://old.eci.gov.in/files/file/3785-jharkhand-2005/'],
  ]),
  group('Karnataka', [
    ['2023', 'https://old.eci.gov.in/files/file/15163-karnataka-2023/'],
    ['2018', 'https://old.eci.gov.in/files/file/6933-karnataka-2018/'],
    ['2013', 'https://old.eci.gov.in/files/file/3784-karnataka-2013/'],
    ['2008', 'https://old.eci.gov.in/files/file/3783-karnataka-2008/'],
    ['2004', 'https://old.eci.gov.in/files/file/3782-karnataka-2004/'],
    ['1999', 'https://old.eci.gov.in/files/file/3781-karnataka-1999/'],
    ['1994', 'https://old.eci.gov.in/files/file/3780-karnataka-1994/'],
    ['1989', 'https://old.eci.gov.in/files/file/3779-karnataka-1989/'],
    ['1985', 'https://old.eci.gov.in/files/file/3778-karnataka-1985/'],
    ['1983', 'https://old.eci.gov.in/files/file/3777-karnataka-1983/'],
    ['1978', 'https://old.eci.gov.in/files/file/3776-karnataka-1978/'],
    ['1972', 'https://old.eci.gov.in/files/file/3775-karnataka-1972/'],
    ['1967', 'https://old.eci.gov.in/files/file/3774-karnataka-1967/'],
    ['1962', 'https://old.eci.gov.in/files/file/3773-karnataka-1962/'],
    ['1957', 'https://old.eci.gov.in/files/file/3772-karnataka-1957/'],
  ]),
  group('Kerala', [
    ['2026', 'https://www.eci.gov.in/statistical-report/ae/2026/24'],
    ['2021', 'https://old.eci.gov.in/files/file/13827-kerala-general-legislative-election-2021/'],
    ['2016', 'https://old.eci.gov.in/files/file/3767-kerala-general-legislative-election-2016/'],
    ['2011', 'https://old.eci.gov.in/files/file/3763-kerala-2011/'],
    ['2006', 'https://old.eci.gov.in/files/file/3762-kerala-2006/'],
    ['2001', 'https://old.eci.gov.in/files/file/3760-kerala-2001/'],
    ['1996', 'https://old.eci.gov.in/files/file/3759-kerala-1996/'],
    ['1991', 'https://old.eci.gov.in/files/file/3758-kerala-1991/'],
    ['1987', 'https://old.eci.gov.in/files/file/3756-kerala-1987/'],
    ['1982', 'https://old.eci.gov.in/files/file/3755-kerala-1982/'],
    ['1980', 'https://old.eci.gov.in/files/file/3754-kerala-1980/'],
    ['1977', 'https://old.eci.gov.in/files/file/3753-kerala-1977/'],
    ['1970', 'https://old.eci.gov.in/files/file/3752-kerala-1970/'],
    ['1967', 'https://old.eci.gov.in/files/file/3751-kerala-1967/'],
    ['1965', 'https://old.eci.gov.in/files/file/3749-kerala-1965/'],
    ['1960', 'https://old.eci.gov.in/files/file/3748-kerala-1960/'],
    ['1957', 'https://old.eci.gov.in/files/file/3746-kerala-1957/'],
  ]),
  group('Madhya Pradesh', [
    ['2023', 'https://www.eci.gov.in/mp-legislative-election-2023-statistical-report'],
    [
      '2018',
      'https://old.eci.gov.in/files/file/9685-madhya-pradesh-legislative-election-2018-statistical-report/',
    ],
    ['2013', 'https://old.eci.gov.in/files/file/3740-madhya-pradesh-2013/'],
    ['2008', 'https://old.eci.gov.in/files/file/3739-madhya-pradesh-2008/'],
    ['2003', 'https://old.eci.gov.in/files/file/3738-madhya-pradesh-2003/'],
    ['1998', 'https://old.eci.gov.in/files/file/3737-madhya-pradesh-1998/'],
    ['1993', 'https://old.eci.gov.in/files/file/3736-madhya-pradesh-1993/'],
    ['1990', 'https://old.eci.gov.in/files/file/3735-madhya-pradesh-1990/'],
    ['1985', 'https://old.eci.gov.in/files/file/3734-madhya-pradesh-1985/'],
    ['1980', 'https://old.eci.gov.in/files/file/3733-madhya-pradesh-1980/'],
    ['1977', 'https://old.eci.gov.in/files/file/3732-madhya-pradesh-1977/'],
    ['1972', 'https://old.eci.gov.in/files/file/3731-madhya-pradesh-1972/'],
    ['1967', 'https://old.eci.gov.in/files/file/3730-madhya-pradesh-1967/'],
    ['1962', 'https://old.eci.gov.in/files/file/3729-madhya-pradesh-1962/'],
    ['1957', 'https://old.eci.gov.in/files/file/3728-madhya-pradesh-1957/'],
    ['1951', 'https://old.eci.gov.in/files/file/3727-madhya-pradesh-1951/'],
  ]),
  group('Maharashtra', [
    ['2024', 'https://www.eci.gov.in/statistical-report/ae/2024/8'],
    [
      '2019',
      'https://old.eci.gov.in/files/file/11699-maharashtra-legislative-assembly-election-2019/',
    ],
    ['2014', 'https://old.eci.gov.in/files/file/3726-maharashtra-2014/'],
    ['2009', 'https://old.eci.gov.in/files/file/3724-maharashtra-2009/'],
    ['2004', 'https://old.eci.gov.in/files/file/3723-maharashtra-2004/'],
    ['1999', 'https://old.eci.gov.in/files/file/3722-maharashtra-1999/'],
    ['1995', 'https://old.eci.gov.in/files/file/3721-maharashtra-1995/'],
    ['1990', 'https://old.eci.gov.in/files/file/3720-maharashtra-1990/'],
    ['1985', 'https://old.eci.gov.in/files/file/3719-maharashtra-1985/'],
    ['1980', 'https://old.eci.gov.in/files/file/3718-maharashtra-1980/'],
    ['1978', 'https://old.eci.gov.in/files/file/3717-maharashtra-1978/'],
    ['1972', 'https://old.eci.gov.in/files/file/3716-maharashtra-1972/'],
    ['1967', 'https://old.eci.gov.in/files/file/3715-maharashtra-1967/'],
    ['1962', 'https://old.eci.gov.in/files/file/3714-maharashtra-1962/'],
  ]),
  group('Manipur', [
    ['2022', 'https://old.eci.gov.in/files/file/14166-manipur-general-legislative-election-2022/'],
    ['2017', 'https://old.eci.gov.in/files/file/3713-manipur-general-legislative-election-2017/'],
    ['2012', 'https://old.eci.gov.in/files/file/3712-manipur-2012/'],
    ['2007', 'https://old.eci.gov.in/files/file/3711-manipur-2007/'],
    ['2002', 'https://old.eci.gov.in/files/file/3710-manipur-2002/'],
    ['2000', 'https://old.eci.gov.in/files/file/3709-manipur-2000/'],
    ['1995', 'https://old.eci.gov.in/files/file/3708-manipur-1995/'],
    ['1990', 'https://old.eci.gov.in/files/file/3707-manipur-1990/'],
    ['1984', 'https://old.eci.gov.in/files/file/3706-manipur-1984/'],
    ['1980', 'https://old.eci.gov.in/files/file/3705-manipur-1980/'],
    ['1974', 'https://old.eci.gov.in/files/file/3704-manipur-1974/'],
    ['1972', 'https://old.eci.gov.in/files/file/3703-manipur-1972/'],
    ['1967', 'https://old.eci.gov.in/files/file/3702-manipur-1967/'],
  ]),
  group('Meghalaya', [
    [
      '2023 (Including AC-23)',
      'https://old.eci.gov.in/files/file/15053-meghalaya-general-legislative-election-2023-including-ac-23/',
    ],
    ['2023 (Excluding AC-23)', 'https://old.eci.gov.in/files/file/14873-meghalayaexcluding-ac-23/'],
    ['2018', 'https://old.eci.gov.in/files/file/3694-meghalaya-general-legislative-election-2018/'],
    ['2013', 'https://old.eci.gov.in/files/file/3690-meghalaya-2013/'],
    ['2008', 'https://old.eci.gov.in/files/file/3688-meghalaya-2008/'],
    ['2003', 'https://old.eci.gov.in/files/file/3687-meghalaya-2003/'],
    ['1998', 'https://old.eci.gov.in/files/file/3686-meghalaya-1998/'],
    ['1993', 'https://old.eci.gov.in/files/file/3684-meghalaya-1993/'],
    ['1988', 'https://old.eci.gov.in/files/file/3674-meghalaya-1988/'],
    ['1983', 'https://old.eci.gov.in/files/file/3672-meghalaya-1983/'],
    ['1978', 'https://old.eci.gov.in/files/file/3670-meghalaya-1978/'],
    ['1972', 'https://old.eci.gov.in/files/file/3669-meghalaya-1972/'],
  ]),
  group('Mizoram', [
    ['2023', 'https://www.eci.gov.in/mizoram-legislative-election-2023-statistical-report'],
    [
      '2018',
      'https://old.eci.gov.in/files/file/9687-mizoram-legislative-election-2018-statistical-report/',
    ],
    ['2013', 'https://old.eci.gov.in/files/file/3667-mizoram-2013/'],
    ['2008', 'https://old.eci.gov.in/files/file/3666-mizoram-2008/'],
    ['2003', 'https://old.eci.gov.in/files/file/3664-mizoram-2003/'],
    ['1998', 'https://old.eci.gov.in/files/file/3663-mizoram-1998/'],
    ['1993', 'https://old.eci.gov.in/files/file/3662-mizoram-1993/'],
    ['1989', 'https://old.eci.gov.in/files/file/3661-mizoram-1989/'],
    ['1987', 'https://old.eci.gov.in/files/file/3659-mizoram-1987/'],
    ['1984', 'https://old.eci.gov.in/files/file/3658-mizoram-1984/'],
    ['1979', 'https://old.eci.gov.in/files/file/3657-mizoram-1979/'],
    ['1978', 'https://old.eci.gov.in/files/file/3655-mizoram-1978/'],
    ['1972', 'https://old.eci.gov.in/files/file/3654-mizoram-1972/'],
  ]),
  group('Nagaland', [
    ['2023', 'https://old.eci.gov.in/files/file/14874-nagaland-general-legislative-election-2023/'],
    ['2018', 'https://old.eci.gov.in/files/file/3652-nagaland-general-legislative-election-2018/'],
    ['2013', 'https://old.eci.gov.in/files/file/3646-nagaland-2013/'],
    ['2008', 'https://old.eci.gov.in/files/file/3644-nagaland-2008/'],
    ['2003', 'https://old.eci.gov.in/files/file/3642-nagaland-2003/'],
    ['1998', 'https://old.eci.gov.in/files/file/3640-nagaland-1998/'],
    ['1993', 'https://old.eci.gov.in/files/file/3639-nagaland-1993/'],
    ['1989', 'https://old.eci.gov.in/files/file/3638-nagaland-1989/'],
    ['1987', 'https://old.eci.gov.in/files/file/3637-nagaland-1987/'],
    ['1982', 'https://old.eci.gov.in/files/file/3636-nagaland-1982/'],
    ['1977', 'https://old.eci.gov.in/files/file/3635-nagaland-1977/'],
    ['1974', 'https://old.eci.gov.in/files/file/3634-nagaland-1974/'],
    ['1969', 'https://old.eci.gov.in/files/file/3633-nagaland-1969/'],
    ['1964', 'https://old.eci.gov.in/files/file/3632-nagaland-1964/'],
  ]),
  group('Odisha', [
    ['2024', 'https://www.eci.gov.in/statistical-report/ae/2024/4'],
    ['2019', 'https://old.eci.gov.in/files/file/11679-odisha-legislative-assembly-election-2019/'],
    ['2014', 'https://old.eci.gov.in/files/file/3631-orissa-2014/'],
    ['2009', 'https://old.eci.gov.in/files/file/3630-orissa-2009/'],
    ['2004', 'https://old.eci.gov.in/files/file/3629-orissa-2004/'],
    ['2000', 'https://old.eci.gov.in/files/file/3628-orissa-2000/'],
    ['1995', 'https://old.eci.gov.in/files/file/3627-orissa-1995/'],
    ['1990', 'https://old.eci.gov.in/files/file/3626-orissa-1990/'],
    ['1985', 'https://old.eci.gov.in/files/file/3625-orissa-1985/'],
    ['1980', 'https://old.eci.gov.in/files/file/3624-orissa-1980/'],
    ['1977', 'https://old.eci.gov.in/files/file/3623-orissa-1977/'],
    ['1974', 'https://old.eci.gov.in/files/file/3622-orissa-1974/'],
    ['1971', 'https://old.eci.gov.in/files/file/3621-orissa-1971/'],
    ['1967', 'https://old.eci.gov.in/files/file/3620-orissa-1967/'],
    ['1961', 'https://old.eci.gov.in/files/file/3619-orissa-1961/'],
    ['1957', 'https://old.eci.gov.in/files/file/3618-orissa-1957/'],
    ['1951', 'https://old.eci.gov.in/files/file/3617-orissa-1951/'],
  ]),
  group('Punjab', [
    ['2022', 'https://old.eci.gov.in/files/file/14165-punjab-general-legislative-election-2022/'],
    ['2017', 'https://old.eci.gov.in/files/file/3614-punjab-general-legislative-election-2017/'],
    ['2012', 'https://old.eci.gov.in/files/file/3455-punjab-2012/'],
    ['2007', 'https://old.eci.gov.in/files/file/3454-punjab-2007/'],
    ['2002', 'https://old.eci.gov.in/files/file/3453-punjab-2002/'],
    ['1997', 'https://old.eci.gov.in/files/file/3452-punjab-1997/'],
    ['1992', 'https://old.eci.gov.in/files/file/3451-punjab-1992/'],
    ['1985', 'https://old.eci.gov.in/files/file/3450-punjab-1985/'],
    ['1980', 'https://old.eci.gov.in/files/file/3449-punjab-1980/'],
    ['1977', 'https://old.eci.gov.in/files/file/3448-punjab-1977/'],
    ['1972', 'https://old.eci.gov.in/files/file/3447-punjab-1972/'],
    ['1969', 'https://old.eci.gov.in/files/file/3446-punjab-1969/'],
    ['1967', 'https://old.eci.gov.in/files/file/3445-punjab-1967/'],
    ['1962', 'https://old.eci.gov.in/files/file/3444-punjab-1962/'],
    ['1957', 'https://old.eci.gov.in/files/file/3443-punjab-1957/'],
    ['1951', 'https://old.eci.gov.in/files/file/3442-punjab-1951/'],
  ]),
  group('Puducherry', [
    ['2026', 'https://www.eci.gov.in/statistical-report/ae/2026/25'],
    [
      '2021',
      'https://old.eci.gov.in/files/file/13417-puducherry-general-legislative-election-2021/',
    ],
    [
      '2016',
      'https://old.eci.gov.in/files/file/3474-puducherry-general-legislative-election-2016/',
    ],
    ['2011', 'https://old.eci.gov.in/files/file/3438-puducherry-2011/'],
    ['2006', 'https://old.eci.gov.in/files/file/3437-puducherry-2006/'],
    ['2001', 'https://old.eci.gov.in/files/file/3436-puducherry-2001/'],
    ['1996', 'https://old.eci.gov.in/files/file/3434-puducherry-1996/'],
    ['1991', 'https://old.eci.gov.in/files/file/3433-puducherry-1991/'],
    ['1990', 'https://old.eci.gov.in/files/file/3431-puducherry-1990/'],
    ['1985', 'https://old.eci.gov.in/files/file/3430-puducherry-1985/'],
    ['1980', 'https://old.eci.gov.in/files/file/3428-puducherry-1980/'],
    ['1977', 'https://old.eci.gov.in/files/file/3426-puducherry-1977/'],
    ['1974', 'https://old.eci.gov.in/files/file/3425-puducherry-1974/'],
    ['1969', 'https://old.eci.gov.in/files/file/3423-puducherry-1969/'],
    ['1964', 'https://old.eci.gov.in/files/file/3421-puducherry-1964/'],
  ]),
  group('Rajasthan', [
    [
      '2023 (Including AC-03)',
      'https://www.eci.gov.in/rajasthan-legislative-election-2023-including-statistical-report',
    ],
    [
      '2023 (Excluding AC-03)',
      'https://www.eci.gov.in/rajasthan-legislative-election-2023-statistical-report',
    ],
    ['2018', 'https://old.eci.gov.in/files/file/9645-statistical-data-of-rajasthan-la-2018/'],
    ['2013', 'https://old.eci.gov.in/files/file/3411-rajasthan-2013/'],
    ['2008', 'https://old.eci.gov.in/files/file/3407-rajasthan-2008/'],
    ['2003', 'https://old.eci.gov.in/files/file/3403-rajasthan-2003/'],
    ['1998', 'https://old.eci.gov.in/files/file/3400-rajasthan-1998/'],
    ['1993', 'https://old.eci.gov.in/files/file/3394-rajasthan-1993/'],
    ['1990', 'https://old.eci.gov.in/files/file/3392-rajasthan-1990/'],
    ['1985', 'https://old.eci.gov.in/files/file/3389-rajasthan-1985/'],
    ['1980', 'https://old.eci.gov.in/files/file/3387-rajasthan-1980/'],
    ['1977', 'https://old.eci.gov.in/files/file/3385-rajasthan-1977/'],
    ['1972', 'https://old.eci.gov.in/files/file/3383-rajasthan-1972/'],
    ['1967', 'https://old.eci.gov.in/files/file/3382-rajasthan-1967/'],
    ['1962', 'https://old.eci.gov.in/files/file/3380-rajasthan-1962/'],
    ['1957', 'https://old.eci.gov.in/files/file/3379-rajasthan-1957/'],
    ['1951', 'https://old.eci.gov.in/files/file/3378-rajasthan-1951/'],
  ]),
  group('Sikkim', [
    ['2024', 'https://www.eci.gov.in/statistical-report/ae/2024/5'],
    ['2019', 'https://old.eci.gov.in/files/file/11677-sikkim-legislative-assembly-election-2019/'],
    ['2014', 'https://old.eci.gov.in/files/file/3365-sikkim-2014/'],
    ['2009', 'https://old.eci.gov.in/files/file/3364-sikkim-2009/'],
    ['2004', 'https://old.eci.gov.in/files/file/3363-sikkim-2004/'],
    ['1999', 'https://old.eci.gov.in/files/file/3361-sikkim-1999/'],
    ['1994', 'https://old.eci.gov.in/files/file/3360-sikkim-1994/'],
    ['1989', 'https://old.eci.gov.in/files/file/3358-sikkim-1989/'],
    ['1985', 'https://old.eci.gov.in/files/file/3356-sikkim-1985/'],
    ['1979', 'https://old.eci.gov.in/files/file/3354-sikkim-1979/'],
  ]),
  group('Tamil Nadu', [
    ['2026', 'https://www.eci.gov.in/statistical-report/ae/2026/26'],
    [
      '2021',
      'https://old.eci.gov.in/files/file/13680-tamil-nadu-general-legislative-election-2021/',
    ],
    [
      '2016',
      'https://old.eci.gov.in/files/file/3473-tamil-nadu-general-legislative-election-2016/',
    ],
    ['2011', 'https://old.eci.gov.in/files/file/3340-tamil-nadu-2011/'],
    ['2006', 'https://old.eci.gov.in/files/file/3339-tamil-nadu-2006/'],
    ['2001', 'https://old.eci.gov.in/files/file/3338-tamil-nadu-2001/'],
    ['1996', 'https://old.eci.gov.in/files/file/3336-tamil-nadu-1996/'],
    ['1991', 'https://old.eci.gov.in/files/file/3335-tamil-nadu-1991/'],
    ['1989', 'https://old.eci.gov.in/files/file/3333-tamil-nadu-1989/'],
    ['1984', 'https://old.eci.gov.in/files/file/3331-tamil-nadu-1984/'],
    ['1980', 'https://old.eci.gov.in/files/file/3328-tamil-nadu-1980/'],
    ['1977', 'https://old.eci.gov.in/files/file/3327-tamil-nadu-1977/'],
    ['1971', 'https://old.eci.gov.in/files/file/3326-tamil-nadu-1971/'],
    ['1967', 'https://old.eci.gov.in/files/file/3325-tamil-nadu-1967/'],
  ]),
  group('Telangana', [
    ['2023', 'https://www.eci.gov.in/telangana-legislative-election-2023-statistical-report'],
    [
      '2018',
      'https://old.eci.gov.in/files/file/9691-telangana-general-legislative-election-2018-statistical-report/',
    ],
  ]),
  group('Tripura', [
    ['2023', 'https://old.eci.gov.in/files/file/14875-tripura-general-legislative-election-2023/'],
    ['2018', 'https://old.eci.gov.in/files/file/3472-tripura-general-legislative-election-2018/'],
    ['2013', 'https://old.eci.gov.in/files/file/3313-tripura-2013/'],
    ['2008', 'https://old.eci.gov.in/files/file/3309-tripura-2008/'],
    ['2003', 'https://old.eci.gov.in/files/file/3306-tripura-2003/'],
    ['1998', 'https://old.eci.gov.in/files/file/3302-tripura-1998/'],
    ['1993', 'https://old.eci.gov.in/files/file/3299-tripura-1993/'],
    ['1988', 'https://old.eci.gov.in/files/file/3296-tripura-1988/'],
    ['1983', 'https://old.eci.gov.in/files/file/3292-tripura-1983/'],
    ['1977', 'https://old.eci.gov.in/files/file/3288-tripura-1977/'],
    ['1972', 'https://old.eci.gov.in/files/file/3284-tripura-1972/'],
    ['1967', 'https://old.eci.gov.in/files/file/3278-tripura-1967/'],
  ]),
  group('Uttar Pradesh', [
    [
      '2022',
      'https://old.eci.gov.in/files/file/14185-uttar-pradesh-general-legislative-election-2022/',
    ],
    [
      '2017',
      'https://old.eci.gov.in/files/file/3471-uttar-pradesh-general-legislative-election-2017/',
    ],
    ['2012', 'https://old.eci.gov.in/files/file/3262-uttar-pradesh-2012/'],
    ['2007', 'https://old.eci.gov.in/files/file/3261-uttar-pradesh-2007/'],
    ['2002', 'https://old.eci.gov.in/files/file/3260-uttar-pradesh-2002/'],
    ['1996', 'https://old.eci.gov.in/files/file/3259-uttar-pradesh-1996/'],
    ['1993', 'https://old.eci.gov.in/files/file/3258-uttar-pradesh-1993/'],
    ['1991', 'https://old.eci.gov.in/files/file/3257-uttar-pradesh-1991/'],
    ['1989', 'https://old.eci.gov.in/files/file/3256-uttar-pradesh-1989/'],
    ['1985', 'https://old.eci.gov.in/files/file/3255-uttar-pradesh-1985/'],
    ['1980', 'https://old.eci.gov.in/files/file/3254-uttar-pradesh-1980/'],
    ['1977', 'https://old.eci.gov.in/files/file/3253-uttar-pradesh-1977/'],
    ['1974', 'https://old.eci.gov.in/files/file/3249-uttar-pradesh-1974/'],
    ['1969', 'https://old.eci.gov.in/files/file/3247-uttar-pradesh-1969/'],
    ['1967', 'https://old.eci.gov.in/files/file/3246-uttar-pradesh-1967/'],
    ['1962', 'https://old.eci.gov.in/files/file/3244-uttar-pradesh-1962/'],
    ['1957', 'https://old.eci.gov.in/files/file/3242-uttar-pradesh-1957/'],
    ['1951', 'https://old.eci.gov.in/files/file/3241-uttar-pradesh-1951/'],
  ]),
  group('Uttarakhand', [
    [
      '2022',
      'https://old.eci.gov.in/files/file/14169-uttarakhand-general-legislative-election-2022/',
    ],
    [
      '2017',
      'https://old.eci.gov.in/files/file/3470-uttarakhand-general-legislative-election-2017/',
    ],
    ['2012', 'https://old.eci.gov.in/files/file/3231-uttarakhand%092012/'],
    ['2007', 'https://old.eci.gov.in/files/file/3228-uttarakhand-2007/'],
    ['2002', 'https://old.eci.gov.in/files/file/3226-uttarakhand%092002/'],
  ]),
  group('West Bengal', [
    ['2026 (Including AC-144)', 'https://www.eci.gov.in/statistical-report/ae/2026/28'],
    ['2026 (Excluding AC-144)', 'https://www.eci.gov.in/statistical-report/ae/2026/27'],
    [
      '2021 (Including AC 56 & 58)',
      'https://old.eci.gov.in/files/file/14106-west-bengal-general-legislative-election-2021-including-ac-56-58/',
    ],
    [
      '2021 (Excluding AC 56 & 58)',
      'https://old.eci.gov.in/files/file/13605-west-bengal-general-legislative-election-2021-excluding-ac-56-58/',
    ],
    [
      '2016',
      'https://old.eci.gov.in/files/file/3469-west-bengal-general-legislative-election-2016/',
    ],
    ['2011', 'https://old.eci.gov.in/files/file/3195-west-bengal-2011/'],
    ['2006', 'https://old.eci.gov.in/files/file/3194-west-bengal-2006/'],
    ['2001', 'https://old.eci.gov.in/files/file/3193-west-bengal-2001/'],
    ['1996', 'https://old.eci.gov.in/files/file/3192-west-bengal-1996/'],
    ['1991', 'https://old.eci.gov.in/files/file/3191-west-bengal-1991/'],
    ['1987', 'https://old.eci.gov.in/files/file/3190-west-bengal-1987/'],
    ['1982', 'https://old.eci.gov.in/files/file/3189-west-bengal-1982/'],
    ['1977', 'https://old.eci.gov.in/files/file/3188-west-bengal-1977/'],
    ['1972', 'https://old.eci.gov.in/files/file/3187-west-bengal-1972/'],
    [
      '1971',
      'https://old.eci.gov.in/files/file/3186-west-bengal-general-legislative-election-1971/',
    ],
    [
      '1969',
      'https://old.eci.gov.in/files/file/3185-west-bengal-general-legislative-election-1969/',
    ],
    ['1967', 'https://old.eci.gov.in/files/file/3184-west-bengal-1967/'],
    ['1962', 'https://old.eci.gov.in/files/file/3183-west-bengal-1962/'],
    ['1957', 'https://old.eci.gov.in/files/file/3182-west-bengal-1957/'],
    [
      '1951',
      'https://old.eci.gov.in/files/file/3181-west-bengal-general-legislative-election-1951/',
    ],
  ]),
]);

const BYE_ELECTION = buildRows('BYE_ELECTION', [
  group(null, [
    [
      'September-October 2026 (L.A. & P.C.)',
      'https://www.eci.gov.in/statistical-report/be/2026/38',
    ],
    ['July-August 2026 (LA)', 'https://www.eci.gov.in/statistical-report/be/2026/37'],
    ['March-May 2026 (LA)', 'https://www.eci.gov.in/statistical-report/be/2026/17'],
    ['October-November 2025 (LA)', 'https://www.eci.gov.in/statistical-report/be/2025/14'],
    ['May-June 2025 (LA)', 'https://www.eci.gov.in/statistical-report/be/2025/13'],
    ['Jan-Feb 2025 (LA)', 'https://www.eci.gov.in/statistical-report/be/2025/12'],
    [
      'July-December 2024 (L.A. & P.C.)',
      'https://old.eci.gov.in/files/file/15622-bye-elections-july-to-dec-2024/',
    ],
    [
      'Jan-June 2024 (L.A.)',
      'https://old.eci.gov.in/files/file/15621-bye-elections-2024-jan-to-june2024/',
    ],
    [
      'July-December 2023 (L.A. & P.C.)',
      'https://old.eci.gov.in/files/file/15610-bye-elections-2023-july-to-december2023/',
    ],
    [
      'Jan-June 2023 (L.A. & P.C.)',
      'https://old.eci.gov.in/files/file/15328-bye-elections-2023-jan-to-june2023/',
    ],
    [
      'July-December 2022 (L.A. & P.C.)',
      'https://old.eci.gov.in/files/file/14777-bye-elections-2022-july-to-december-2022parliamentary-and-assemblies/',
    ],
    [
      'January-June 2022 (L.A. & P.C.)',
      'https://old.eci.gov.in/files/file/14395-bye-elections-2022-parliamentary-and-assemblies/',
    ],
    [
      'July-December 2021 (L.A. & P.C.)',
      'https://old.eci.gov.in/files/file/13971-bye-elections-2021-parliamentary-and-assemblies/',
    ],
    [
      'January-June 2021 (L.A. & P.C.)',
      'https://old.eci.gov.in/files/file/13640-bye-elections-2021-parliamentary-and-assemblies/',
    ],
    [
      'Year 2020 (L.A. & P.C.)',
      'https://old.eci.gov.in/files/file/12753-bye-elections-2020-parliamentary-and-assemblies/',
    ],
    [
      'July-Dec 2019 (L.A. & P.C.)',
      'https://old.eci.gov.in/files/file/11871-bye-elections-july-2019-to-december-2019/',
    ],
    [
      'Jan-June 2019 (L.A. & P.C.)',
      'https://old.eci.gov.in/files/file/11835-bye-election-results-from-jan-to-june2019/',
    ],
    [
      'July-Dec 2018 (L.A. & P.C.)',
      'https://old.eci.gov.in/files/file/9899-bye-election-results-july-2018-dec-2018/',
    ],
    [
      'Jan-June 2018 (L.A. & P.C.)',
      'https://old.eci.gov.in/ByeElection/2018/ByeElection(Jan-June2018).xlsx',
    ],
    [
      'Jan-Dec 2017 (L.A. & P.C.)',
      'https://old.eci.gov.in/ByeElection/2017/ByeElectionJan-Dec2017.xlsx',
    ],
    [
      'July-Dec 2016 (L.A. & P.C.)',
      'https://old.eci.gov.in/ByeElection/2016/Bye-electionPCAC_July-Dec2016.xlsx',
    ],
    [
      'Jan-June 2016 (L.A. & P.C.)',
      'https://old.eci.gov.in/ByeElection/2016/Bye-electionPCAC_Jan-June2016.xlsx',
    ],
    [
      'June-Dec 2015 (L.A. & P.C.)',
      'https://old.eci.gov.in/ByeElection/2015/Bye-election%20PC%20and%20AC,%20June%20to%20Dec,%202015.xlsx',
    ],
    [
      'Jan-Apr 2015 (L.A. & P.C.)',
      'https://old.eci.gov.in/ByeElection/2015/Bye%20Election%20%20PC%20&%20AC,%20Jan-April,%20%202015.xlsx',
    ],
    ['2014 (L.A.)', 'https://old.eci.gov.in/ByeElection/2014/Bye%20Election%20LA%202014.xls'],
    ['2014 (P.C.)', 'https://old.eci.gov.in/ByeElection/2014/Bye-Election%20PC%202014.xlsx'],
    ['Jan-Dec 2009', 'https://old.eci.gov.in/ByeElection/2009-10/ByeElec_2009.xls'],
    ['Jan-Dec 2009', 'https://old.eci.gov.in/ByeElection/2009-10/Bye-election-2009.xls'],
    ['Jan-Dec 2010', 'https://old.eci.gov.in/ByeElection/2009-10/Bye-Election%20-2010.xls'],
    ['Jan 2010', null],
    ['November 2010', null],
    ['Jan-Dec 2011', 'https://old.eci.gov.in/ByeElection/2011-12/jan-dec-2011.xls'],
    ['June 2007', 'https://old.eci.gov.in/ByeElection/ByeeleJune07/index.htm'],
    ['Jul-Sep 2007', 'https://old.eci.gov.in/ByeElection/ByeJuneAug2007/index.htm'],
    ['Oct-Dec 2007', 'https://old.eci.gov.in/ByeElection/ByeOctdec2007/index.html'],
    ['2007-08', 'https://old.eci.gov.in/ByeElection/07to08/bye07_08.htm'],
    ['Dec 2009', null],
    ['Apr-May 2007', 'https://old.eci.gov.in/ByeElection/Byeaprilmay2007/index.htm'],
    ['Feb-Mar 2007', 'https://old.eci.gov.in/ByeElection/ByeFebMar2007/index.htm'],
    ['Dec 2006', 'https://old.eci.gov.in/ByeElection/ByeDec2006/index.htm'],
    ['Oct 2006', 'https://old.eci.gov.in/ByeElection/ByeOct2006/index.htm'],
    ['Apr-May 2006', 'https://old.eci.gov.in/ByeElection/ByeAprMay2006/index.htm'],
    ['Feb-Mar 2006', 'https://old.eci.gov.in/ByeElection/ByeFeb2006/index.htm'],
    ['Jan 2006', 'https://old.eci.gov.in/ByeElection/ByeJan2006/index.htm'],
    ['Dec 2005', 'https://old.eci.gov.in/ByeElection/ByeDec2005/index.htm'],
    ['Nov 2005', 'https://old.eci.gov.in/ByeElection/ByeNov2005/index.htm'],
    ['Sep 2005', 'https://old.eci.gov.in/ByeElection/ByeSep2005/index.htm'],
    ['June 2005', 'https://old.eci.gov.in/ByeElection/ByeJun2005/index.htm'],
    ['Apr-May 2005', 'https://old.eci.gov.in/ByeElection/ByeApr2005/index.htm'],
    ['Jan-Feb 2005', 'https://old.eci.gov.in/ByeElection/ByeFeb2005/index.htm'],
    ['Oct 2004', 'https://old.eci.gov.in/ByeElection/ByeOct2004/index.htm'],
    ['April 2004', 'https://old.eci.gov.in/ByeElection/ByeApril2004/index.htm'],
    ['Jan 2004', 'https://old.eci.gov.in/ByeElection/ByeJan2004/index.htm'],
    ['Nov 2003', 'https://old.eci.gov.in/ByeElection/ByeNov2003/index.htm'],
    ['Sep 2003', 'https://old.eci.gov.in/ByeElection/ByeSep2003/index.htm'],
    ['June 2003', 'https://old.eci.gov.in/ByeElection/ByeJune2003/index.htm'],
    ['May 2003', 'https://old.eci.gov.in/ByeElection/ByeMay2003/index.htm'],
    ['Feb-March 2003', 'https://old.eci.gov.in/ByeElection/ByeFeb2003/index.htm'],
    ['Dec 2002', 'https://old.eci.gov.in/ByeElection/ByeDec2002/index.htm'],
    ['Aug 2002', 'https://old.eci.gov.in/ByeElection/ByeAug2002/index.htm'],
    ['July 2002', 'https://old.eci.gov.in/ByeElection/ByeJuly2002/index.htm'],
    ['May 2002', 'https://old.eci.gov.in/ByeElection/ByeMay2002/index.htm'],
    ['Feb 2002', 'https://old.eci.gov.in/ByeElection/ByeFeb2002/index.htm'],
    ['Sep 2001', 'https://old.eci.gov.in/ByeElection/ByeSept2001/index.htm'],
    ['May 2001', 'https://old.eci.gov.in/ByeElection/ByeMay2001/index.htm'],
    ['April 2001', 'https://old.eci.gov.in/ByeElection/ByeApril2001/index.htm'],
    ['Feb 2001', 'https://old.eci.gov.in/ByeElection/ByeFeb2001/index.html'],
    ['Sep 2000', 'https://old.eci.gov.in/ByeElection/ByeSep2000/index.htm'],
    ['May 2000', 'https://old.eci.gov.in/ByeElection/ByeMay2000/index.htm'],
    ['Feb 2000', 'https://old.eci.gov.in/ByeElection/ByeFeb2000/index.htm'],
    ['Sept-Oct 1999', 'https://old.eci.gov.in/ByeElection/ByeSept1999/index.htm'],
    ['Feb 1999', 'https://old.eci.gov.in/ByeElection/ByeFeb1999/index.htm'],
    ['Nov 1998', 'https://old.eci.gov.in/ByeElection/ByeFeb1998/Bye-nov1998.htm'],
    ['June 1998', 'https://old.eci.gov.in/ByeElection/ByeFeb1998/Bye-June1998.htm'],
    ['Feb 1998', 'https://old.eci.gov.in/ByeElection/ByeFeb1998/Bye-Feb1998.htm'],
    ['Feb 1997', 'https://old.eci.gov.in/ByeElection/ByeApril1997/index.htm'],
    ['Nov 1996', 'https://old.eci.gov.in/ByeElection/ByeNov1996/index.htm'],
    [
      'Details of bye elections 1952 to 1995',
      'https://old.eci.gov.in/files/file/2511-details-of-bye-elections-from-1952-to-1995/',
    ],
  ]),
]);

const FORMER_STATE = buildRows('FORMER_STATE', [
  group('Ajmer', [['1951', 'https://old.eci.gov.in/files/file/4110-ajmer-1951/']]),
  group('Bhopal', [['1951', 'https://old.eci.gov.in/files/file/4109-bhopal-1951/']]),
  group('Bombay', [
    ['1957', 'https://old.eci.gov.in/files/file/4108-bombay-1957/'],
    ['1951', 'https://old.eci.gov.in/files/file/4107-bombay-1951/'],
  ]),
  group('Coorg', [['1951', 'https://old.eci.gov.in/files/file/4106-coorg-1951/']]),
  group('Hyderabad', [['1951', 'https://old.eci.gov.in/files/file/4105-hyderabad-1951/']]),
  group('Madhya Bharat', [['1951', 'https://old.eci.gov.in/files/file/4104-madhya-bharat-1951/']]),
  group('Madras', [
    ['1967', 'https://old.eci.gov.in/files/file/4103-madras-1967/'],
    ['1962', 'https://old.eci.gov.in/files/file/4102-madras-1962/'],
    ['1957', 'https://old.eci.gov.in/files/file/4101-madras-1957/'],
    ['1951', 'https://old.eci.gov.in/files/file/4100-madras-1951/'],
  ]),
  group('Mysore', [
    ['1967', 'https://old.eci.gov.in/files/file/4099-mysore-1967/'],
    ['1951', 'https://old.eci.gov.in/files/file/4098-mysore-1951/'],
  ]),
  group('Patiala & East Punjab States Union', [
    ['1954', 'https://old.eci.gov.in/files/file/4097-patiala-east-punjab-states-union-1954/'],
    ['1951', 'https://old.eci.gov.in/files/file/4096-patiala-east-punjab-states-union-1951/'],
  ]),
  group('Saurashtra', [['1951', 'https://old.eci.gov.in/files/file/4095-sourastra-1951/']]),
  group('Travancore-Cochin', [
    ['1954', 'https://old.eci.gov.in/files/file/4094-travancore-cochin-1954/'],
    ['1951', 'https://old.eci.gov.in/files/file/4093-travancore-cochin-1951/'],
  ]),
  group('Vindhya Pradesh', [
    ['1951', 'https://old.eci.gov.in/files/file/4092-vindhya-pradesh-1951/'],
  ]),
]);

const REFERENCE = buildRows('REFERENCE', [
  group(null, [
    ['Full Statistical Report (One Page)', 'https://old.eci.gov.in/past-elections-statistics/'],
  ]),
]);

export const ELECTION_STATISTICAL_REPORTS: ElectionReportSeedRow[] = [
  ...LOK_SABHA,
  ...STATE_ASSEMBLY,
  ...BYE_ELECTION,
  ...FORMER_STATE,
  ...REFERENCE,
];

function electionStateToken(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** State names mentioned in a heading or file title, longest name first. */
export function electionStatesMentioned(text: string, names: readonly string[]): string[] {
  let scratch = ` ${electionStateToken(text)} `;
  const ordered = [...names].sort((left, right) => right.length - left.length);
  const found: string[] = [];
  for (const name of ordered) {
    const token = ` ${electionStateToken(name)} `;
    if (token === '  ' || !scratch.includes(token)) continue;
    found.push(name);
    scratch = scratch.split(token).join(' ');
  }
  return found;
}

/**
 * Pick the state a report file belongs to.
 * A file title wins when it names one state. Otherwise the page heading is used when it names one state.
 */
export function electionStateFromHeading(
  title: string,
  pageHeading: string,
  fallback: string | null,
  names: readonly string[],
): string | null {
  const fromTitle = electionStatesMentioned(title, names);
  if (fromTitle.length === 1) return fromTitle[0] ?? null;
  const fromPage = electionStatesMentioned(pageHeading, names);
  if (fromPage.length === 1) return fromPage[0] ?? null;
  if (fallback && names.includes(fallback)) return fallback;
  return null;
}
