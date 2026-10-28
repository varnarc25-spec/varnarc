import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Repositories } from '@varnarc/database';
import {
  ELECTION_REPORT_SECTION_LABELS,
  electionReportSectionSchema,
  type ElectionReportListQuery,
  type ElectionReportSection,
} from '@varnarc/validation';
import { REPOS } from '../../database/database.module';

@Injectable()
export class ElectionReportsService {
  constructor(@Inject(REPOS) private readonly repos: Repositories) {}

  async list(query: ElectionReportListQuery) {
    const [page, facets] = await Promise.all([
      this.repos.electionReports.list(query),
      this.repos.electionReports.facets(),
    ]);
    const sectionOrder = electionReportSectionSchema.options;
    const counts = new Map(facets.sections.map((row) => [row.section, row.count]));
    return {
      items: page.items.map((row) => ({
        id: row.id,
        section: row.section,
        sectionLabel: ELECTION_REPORT_SECTION_LABELS[row.section],
        jurisdiction: row.jurisdiction,
        label: row.label,
        url: row.url,
        hasFile: Boolean(row.url),
        sortOrder: row.sortOrder,
        sourceUrl: row.sourceUrl,
        pageHeading: row.pageHeading,
        stateName: row.state?.name ?? row.jurisdiction,
        fileCount: row._count.files,
      })),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total: page.total,
        pageCount: Math.max(1, Math.ceil(page.total / query.pageSize)),
        sections: sectionOrder.map((section: ElectionReportSection) => ({
          section,
          label: ELECTION_REPORT_SECTION_LABELS[section],
          count: counts.get(section) ?? 0,
        })),
        jurisdictions: facets.jurisdictions,
      },
    };
  }

  async get(id: string) {
    const row = await this.repos.electionReports.findById(id);
    if (!row) throw new NotFoundException('Election report not found.');
    return {
      id: row.id,
      section: row.section,
      sectionLabel: ELECTION_REPORT_SECTION_LABELS[row.section],
      jurisdiction: row.jurisdiction,
      stateName: row.state?.name ?? row.jurisdiction,
      pageHeading: row.pageHeading,
      label: row.label,
      url: row.url,
      sourceUrl: row.sourceUrl,
      files: row.files.map((file) => ({
        id: file.id,
        title: file.title,
        pageHeading: file.pageHeading,
        stateName: file.state?.name ?? null,
        pdfUrl: file.pdfUrl,
        pdfSize: file.pdfSize,
        xlsxUrl: file.xlsxUrl,
        xlsxSize: file.xlsxSize,
      })),
    };
  }

  async listStates() {
    const rows = await this.repos.electionReports.listStates();
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      reportCount: row._count.reports,
      fileCount: row._count.files,
    }));
  }
}
