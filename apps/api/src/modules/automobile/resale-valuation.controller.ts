import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '@varnarc/auth';
import {
  updateResaleValuationConfigSchema,
  upsertResaleValuationConfigSchema,
  type UpdateResaleValuationConfigInput,
  type UpsertResaleValuationConfigInput,
} from '@varnarc/validation';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { ok } from '../../common/utils/response';
import { ResaleValuationService } from './resale-valuation.service';

@ApiTags('automobile')
@ApiBearerAuth()
@Controller('automobile/resale-valuation')
export class ResaleValuationController {
  constructor(private readonly valuation: ResaleValuationService) {}

  @Public()
  @Get('config')
  @ApiOperation({ summary: 'Active resale valuation overrides' })
  async publicConfig() {
    return ok(await this.valuation.listPublic());
  }

  @Get('admin/config')
  @RequirePermissions(PERMISSIONS.AUTOMOBILE_VIEW)
  @ApiOperation({ summary: 'List resale valuation config rows' })
  async adminList() {
    return ok(await this.valuation.listAdmin());
  }

  @Post('admin/config')
  @RequirePermissions(PERMISSIONS.AUTOMOBILE_CREATE)
  async create(
    @Body(new ZodValidationPipe(upsertResaleValuationConfigSchema))
    body: UpsertResaleValuationConfigInput,
  ) {
    return ok(await this.valuation.create(body));
  }

  @Put('admin/config/:id')
  @RequirePermissions(PERMISSIONS.AUTOMOBILE_EDIT)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateResaleValuationConfigSchema))
    body: UpdateResaleValuationConfigInput,
  ) {
    return ok(await this.valuation.update(id, body));
  }

  @Delete('admin/config/:id')
  @RequirePermissions(PERMISSIONS.AUTOMOBILE_DELETE)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return ok(await this.valuation.remove(id));
  }
}
