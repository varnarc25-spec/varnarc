import { PrismaClient } from '@prisma/client';
import { electionStateFromHeading } from '@varnarc/validation';

const prisma = new PrismaClient();
const ECI_ORIGIN = 'https://www.eci.gov.in';
const ECI_API = `${ECI_ORIGIN}/eci-backend/public/api/election-result?category_id=`;
const USER_AGENT = 'VarnarcElectionCatalog/1.0';

type FileDraft = {
  title: string;
  pageHeading: string;
  pdfUrl: string | null;
  pdfSize: string | null;
  xlsxUrl: string | null;
  xlsxSize: string | null;
};

type BundleItem = {
  pdf_Name?: string;
  link?: string;
  link2?: string;
  size1?: string;
  size2?: string;
  type1?: string;
  type2?: string;
};

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'state';
}

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)));
}

function stripTags(value: string): string {
  return decodeHtml(value.replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function absoluteEci(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${ECI_ORIGIN}${path.startsWith('/') ? '' : '/'}${path}`;
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,application/json' },
    signal: AbortSignal.timeout(25_000),
    redirect: 'follow',
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

function readJsArray(source: string, name: string): BundleItem[] {
  const token = `${name}=[`;
  const start = source.indexOf(token);
  if (start < 0) return [];
  let depth = 0;
  let quote = '';
  let escaped = false;
  for (let index = start + name.length + 1; index < source.length; index += 1) {
    const char = source[index] ?? '';
    if (quote) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) quote = '';
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === '[') depth += 1;
    if (char === ']') {
      depth -= 1;
      if (depth === 0) {
        const literal = source.slice(start + name.length + 1, index + 1);
        return Function(`"use strict"; return (${literal});`)() as BundleItem[];
      }
    }
  }
  return [];
}

function bundlePages(source: string): Map<string, { heading: string; items: BundleItem[] }> {
  const pages = new Map<string, { heading: string; items: BundleItem[] }>();
  const route = /path:"(\/[^"]*statistical[^"]*)",element:\(0,\w+\.jsx\)\((\w+)/g;
  let match: RegExpExecArray | null;
  while ((match = route.exec(source))) {
    const path = match[1];
    const component = match[2];
    if (!path || !component || path.includes(':')) continue;
    const functionStart = source.indexOf(`function ${component}(`);
    if (functionStart < 0) continue;
    const body = source.slice(functionStart, functionStart + 4000);
    const listName = body.match(/(\w+)\.map\(\(function/)?.[1];
    const heading =
      body.match(/children:"([^"]*Statistical Report[^"]*)"/)?.[1] ??
      body.match(/children:"([^"]{12,160})"/)?.[1] ??
      path;
    if (!listName) continue;
    pages.set(path, { heading, items: readJsArray(source, listName) });
  }
  return pages;
}

function fromBundle(items: BundleItem[], heading: string): FileDraft[] {
  return items
    .filter((item) => item.pdf_Name)
    .map((item) => {
      const linkIsSheet = /\.(xlsx?|csv)$/i.test(item.link ?? '');
      const sheetLink = item.link2 ?? '';
      const sheet =
        item.type2?.toUpperCase().includes('XLS') || /\.(xlsx?|csv)$/i.test(sheetLink)
          ? absoluteEci(sheetLink)
          : null;
      const pdf =
        item.type1?.toUpperCase() === 'XLSX' || linkIsSheet ? null : absoluteEci(item.link);
      return {
        title: item.pdf_Name ?? 'Report file',
        pageHeading: heading,
        pdfUrl: pdf,
        pdfSize: item.size1 ?? null,
        xlsxUrl: sheet,
        xlsxSize: item.size2 ?? null,
      };
    });
}

async function fromElectionApi(
  categoryId: string,
): Promise<{ heading: string; files: FileDraft[] }> {
  const payload = (await fetchText(`${ECI_API}${categoryId}`).then((body) => JSON.parse(body))) as {
    success?: boolean;
    title_headline?: string;
    index_name?: string;
    index_url?: string;
    results?: Array<{
      title?: string;
      pdf_zip_url?: string;
      xlsx_url?: string;
      pdf_record_size?: string;
      xls_record_size?: string;
    }>;
  };
  const heading = payload.title_headline || 'Statistical reports';
  const files: FileDraft[] = (payload.results ?? []).map((item) => ({
    title: item.title || 'Report file',
    pageHeading: heading,
    pdfUrl: item.pdf_zip_url || null,
    pdfSize: item.pdf_record_size || null,
    xlsxUrl: item.xlsx_url || null,
    xlsxSize: item.xls_record_size || null,
  }));
  if (payload.index_url) {
    files.push({
      title: payload.index_name || 'Index',
      pageHeading: heading,
      pdfUrl: payload.index_url,
      pdfSize: null,
      xlsxUrl: null,
      xlsxSize: null,
    });
  }
  return { heading, files };
}

function fromOldHtml(html: string, pageUrl: string): { heading: string; files: FileDraft[] } {
  const heading =
    stripTags(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? '') ||
    stripTags(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? '') ||
    'Statistical report';
  const list = html.match(/<ol class='ipsDataList[\s\S]*?<\/ol>/i)?.[0] ?? '';
  const files: FileDraft[] = [];
  const item =
    /href='(https:\/\/old\.eci\.gov\.in\/files\/file\/[^']+)'[^>]*title='More information about &quot;(.*?)&quot;'/g;
  let match: RegExpExecArray | null;
  while ((match = item.exec(list))) {
    files.push({
      title: decodeHtml(match[2] ?? 'Report file'),
      pageHeading: heading,
      pdfUrl: match[1] ?? null,
      pdfSize: null,
      xlsxUrl: null,
      xlsxSize: null,
    });
  }
  if (files.length) return { heading, files };
  const download = html.match(/href='([^']+\?do=download)'/i)?.[1];
  if (download || /\.(pdf|xlsx?|csv)$/i.test(pageUrl)) {
    return {
      heading,
      files: [
        {
          title: heading,
          pageHeading: heading,
          pdfUrl: download || pageUrl,
          pdfSize: null,
          xlsxUrl: null,
          xlsxSize: null,
        },
      ],
    };
  }
  return { heading, files: [] };
}

async function filesForUrl(
  url: string,
  bundle: Map<string, { heading: string; items: BundleItem[] }>,
): Promise<{ heading: string; files: FileDraft[]; note: string | null }> {
  const parsed = new URL(url);
  if (parsed.pathname === '/general-election-to-loksabha-2024-statistical-reports') {
    const page = await fromElectionApi('1');
    return { ...page, note: null };
  }
  const statistical = parsed.pathname.match(/\/statistical-report\/(?:ae|be|ge)\/\d+\/(\d+)\/?$/);
  if (statistical?.[1]) {
    const page = await fromElectionApi(statistical[1]);
    return { ...page, note: null };
  }
  const bundled = bundle.get(parsed.pathname);
  if (bundled) {
    return {
      heading: bundled.heading,
      files: fromBundle(bundled.items, bundled.heading),
      note: null,
    };
  }
  if (/\.(xlsx?|pdf|csv)$/i.test(parsed.pathname)) {
    return {
      heading: decodeURIComponent(parsed.pathname.split('/').pop() || 'Report file'),
      files: [
        {
          title: decodeURIComponent(parsed.pathname.split('/').pop() || 'Report file'),
          pageHeading: '',
          pdfUrl: /\.pdf$/i.test(parsed.pathname) ? url : null,
          pdfSize: null,
          xlsxUrl: /\.(xlsx?|csv)$/i.test(parsed.pathname) ? url : null,
          xlsxSize: null,
        },
      ],
      note: null,
    };
  }
  const html = await fetchText(url);
  if (html.includes('id="root"') && !html.includes('page-content')) {
    return { heading: '', files: [], note: 'Page is a script shell without a file list' };
  }
  const page = fromOldHtml(html, url);
  return { ...page, note: page.files.length ? null : 'No file list found' };
}

async function mapPool<T>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<void>,
) {
  let cursor = 0;
  async function run() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      const item = items[index];
      if (item === undefined) return;
      await worker(item, index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => run()));
}

async function main() {
  const reports = await prisma.electionStatisticalReport.findMany({
    where: { deletedAt: null, url: { not: null } },
    orderBy: { sortOrder: 'asc' },
  });
  const names = new Set(
    reports.map((report) => report.jurisdiction).filter((name): name is string => Boolean(name)),
  );
  for (const name of names) {
    await prisma.electionState.upsert({
      where: { name },
      update: { deletedAt: null },
      create: { name, slug: slugify(name) },
    });
  }

  const shell = await fetchText(`${ECI_ORIGIN}/statistical-reports`);
  const scriptPath = shell.match(/\/static\/js\/main\.[a-z0-9]+\.js/)?.[0];
  if (!scriptPath) throw new Error('Election Commission page script was not found');
  const bundleSource = await fetchText(`${ECI_ORIGIN}${scriptPath}`);
  const bundle = bundlePages(bundleSource);
  let stored = 0;
  let failed = 0;

  await mapPool(reports, 6, async (report, index) => {
    const url = report.url;
    if (!url || url.endsWith('#')) return;
    try {
      const page = await filesForUrl(url, bundle);
      const discovered = new Set<string>();
      for (const file of page.files) {
        const stateName = electionStateFromHeading(
          file.title,
          page.heading || file.pageHeading,
          report.jurisdiction,
          [...names],
        );
        if (stateName) discovered.add(stateName);
      }
      for (const name of discovered) {
        if (names.has(name)) continue;
        names.add(name);
        await prisma.electionState.upsert({
          where: { name },
          update: { deletedAt: null },
          create: { name, slug: slugify(name) },
        });
      }
      const states = await prisma.electionState.findMany({
        where: { name: { in: [...names] }, deletedAt: null },
        select: { id: true, name: true },
      });
      const stateIdByName = new Map(states.map((state) => [state.name, state.id]));
      const reportState = electionStateFromHeading('', page.heading, report.jurisdiction, [
        ...names,
      ]);
      const keys: string[] = [];
      for (const [sortOrder, file] of page.files.entries()) {
        const stateName = electionStateFromHeading(
          file.title,
          page.heading || file.pageHeading,
          report.jurisdiction,
          [...names],
        );
        const seedKey = `${report.seedKey}/${sortOrder}`;
        keys.push(seedKey);
        await prisma.electionStatisticalReportFile.upsert({
          where: { seedKey },
          update: {
            title: file.title,
            pageHeading: page.heading || file.pageHeading || report.label,
            pdfUrl: file.pdfUrl,
            pdfSize: file.pdfSize,
            xlsxUrl: file.xlsxUrl,
            xlsxSize: file.xlsxSize,
            sortOrder,
            stateId: stateName ? (stateIdByName.get(stateName) ?? null) : null,
            deletedAt: null,
          },
          create: {
            reportId: report.id,
            seedKey,
            title: file.title,
            pageHeading: page.heading || file.pageHeading || report.label,
            pdfUrl: file.pdfUrl,
            pdfSize: file.pdfSize,
            xlsxUrl: file.xlsxUrl,
            xlsxSize: file.xlsxSize,
            sortOrder,
            stateId: stateName ? (stateIdByName.get(stateName) ?? null) : null,
          },
        });
      }
      await prisma.electionStatisticalReportFile.updateMany({
        where: {
          reportId: report.id,
          deletedAt: null,
          seedKey: { notIn: keys.length ? keys : ['__none__'] },
        },
        data: { deletedAt: new Date() },
      });
      await prisma.electionStatisticalReport.update({
        where: { id: report.id },
        data: {
          pageHeading: page.heading || null,
          stateId: reportState ? (stateIdByName.get(reportState) ?? null) : null,
          filesFetchedAt: new Date(),
          filesFetchNote: page.note,
        },
      });
      stored += page.files.length;
      if ((index + 1) % 25 === 0) {
        console.warn(`Fetched ${index + 1}/${reports.length} pages, ${stored} files`);
      }
    } catch (error) {
      failed += 1;
      const message = error instanceof Error ? error.message : 'fetch failed';
      await prisma.electionStatisticalReport.update({
        where: { id: report.id },
        data: { filesFetchedAt: new Date(), filesFetchNote: message.slice(0, 240) },
      });
    }
  });

  const fileCount = await prisma.electionStatisticalReportFile.count({
    where: { deletedAt: null },
  });
  console.warn(
    `Election report files stored: ${fileCount}. Pages failed: ${failed}. Files written this run: ${stored}.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
