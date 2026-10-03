import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '@varnarc/auth';
import {
  createHrDepartmentSchema,
  createHrEmployeeSchema,
  createHrLeaveSchema,
  updateHrEmployeeSchema,
  updateHrLeaveSchema,
  type CreateHrDepartmentInput,
  type CreateHrEmployeeInput,
  type CreateHrLeaveInput,
  type UpdateHrEmployeeInput,
  type UpdateHrLeaveInput,
} from '@varnarc/validation';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { ok } from '../../common/utils/response';
import { HrService } from './hr.service';

@ApiTags('hr')
@ApiBearerAuth()
@Controller('hr')
export class HrController {
  constructor(private readonly hr: HrService) {}

  @Get('summary')
  @RequirePermissions(PERMISSIONS.HR_VIEW)
  @ApiOperation({ summary: 'HR dashboard counts' })
  async summary() {
    return ok(await this.hr.summary());
  }

  @Get('departments')
  @RequirePermissions(PERMISSIONS.HR_VIEW)
  async departments() {
    return ok(await this.hr.listDepartments());
  }

  @Post('departments')
  @RequirePermissions(PERMISSIONS.HR_CREATE)
  async createDepartment(
    @Body(new ZodValidationPipe(createHrDepartmentSchema)) body: CreateHrDepartmentInput,
  ) {
    return ok(await this.hr.createDepartment(body));
  }

  @Get('employees')
  @RequirePermissions(PERMISSIONS.HR_VIEW)
  async employees() {
    return ok(await this.hr.listEmployees());
  }

  @Post('employees')
  @RequirePermissions(PERMISSIONS.HR_CREATE)
  async createEmployee(
    @Body(new ZodValidationPipe(createHrEmployeeSchema)) body: CreateHrEmployeeInput,
  ) {
    return ok(await this.hr.createEmployee(body));
  }

  @Put('employees/:id')
  @RequirePermissions(PERMISSIONS.HR_EDIT)
  async updateEmployee(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateHrEmployeeSchema)) body: UpdateHrEmployeeInput,
  ) {
    return ok(await this.hr.updateEmployee(id, body));
  }

  @Delete('employees/:id')
  @RequirePermissions(PERMISSIONS.HR_DELETE)
  async deleteEmployee(@Param('id', ParseUUIDPipe) id: string) {
    await this.hr.deleteEmployee(id);
    return ok({ id });
  }

  @Get('leave')
  @RequirePermissions(PERMISSIONS.HR_VIEW)
  async leave() {
    return ok(await this.hr.listLeave());
  }

  @Post('leave')
  @RequirePermissions(PERMISSIONS.HR_CREATE)
  async createLeave(@Body(new ZodValidationPipe(createHrLeaveSchema)) body: CreateHrLeaveInput) {
    return ok(await this.hr.createLeave(body));
  }

  @Put('leave/:id')
  @RequirePermissions(PERMISSIONS.HR_EDIT)
  async updateLeave(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateHrLeaveSchema)) body: UpdateHrLeaveInput,
  ) {
    return ok(await this.hr.updateLeave(id, body));
  }
}
