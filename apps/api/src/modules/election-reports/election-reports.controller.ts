import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '@varnarc/auth';
import { electionReportListQuerySchema, type ElectionReportListQuery } from '@varnarc/validation';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { ok, okPage } from '../../common/utils/response';
import { ElectionReportsService } from './election-reports.service';

@ApiTags('election-reports')
@Controller('election-reports')
export class ElectionReportsController {
  constructor(private readonly service: ElectionReportsService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.ELECTION_VIEW)
  async list(
    @Query(new ZodValidationPipe(electionReportListQuerySchema)) query: ElectionReportListQuery,
  ) {
    const result = await this.service.list(query);
    return okPage(result.items, result.meta);
  }

  @Get('states')
  @RequirePermissions(PERMISSIONS.ELECTION_VIEW)
  async states() {
    return ok(await this.service.listStates());
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.ELECTION_VIEW)
  async get(@Param('id', ParseUUIDPipe) id: string) {
    return ok(await this.service.get(id));
  }
}
